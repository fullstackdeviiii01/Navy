// app/api/products/bulk-upload-excel/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getIdTokenFromHeader, verifyIdToken } from "../../../../../lib/firebase/auth";
import connectDB from "../../../../../lib/db";
import Product from "../../../../models/Product";
import Category from "../../../../models/Category";
import User from "../../../../models/User";
import ExcelJS from "exceljs";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { existsSync } from "fs";
import sharp from "sharp";

export async function POST(request: NextRequest) {
  try {
    const token = getIdTokenFromHeader(request);
    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const decodedToken = await verifyIdToken(token);
    if (!decodedToken) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    await connectDB();

    const adminUser = await (User as any).findOne({ uid: decodedToken.uid });
    if (!adminUser || adminUser.role !== "admin") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    const validTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error:
            "Invalid file type. Only Excel files (.xlsx, .xls) are allowed",
        },
        { status: 400 }
      );
    }

    // Parse Excel file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);

    const worksheet = workbook.getWorksheet(1);
    if (!worksheet) {
      return NextResponse.json(
        { error: "Excel file is empty or invalid" },
        { status: 400 }
      );
    }

    // Ensure upload directory exists
    const uploadDir = path.join(process.cwd(), "public", "products", "images");
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // STEP 1: Extract and save ALL images with DETAILED logging
    console.log("=== STARTING IMAGE EXTRACTION ===");
    const imageMap = new Map<number, string[]>();
    const images = worksheet.getImages();
    console.log(`Total images found in Excel: ${images.length}`);

    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      try {
        console.log(`Processing image ${i + 1}/${images.length}:`, {
          imageId: image.imageId,
          range: image.range,
        });

        const imageId =
          typeof image.imageId === "string"
            ? parseInt(image.imageId, 10)
            : image.imageId;
        const img = workbook.getImage(imageId);
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 15);
        const filename = `excel_${timestamp}_${i}_${randomString}.webp`; // Changed to .webp
        const filepath = path.join(uploadDir, filename);

        // Compress and convert to WebP
        const imageBuffer = Buffer.from(img.buffer);
        const compressedBuffer = await sharp(imageBuffer)
          .webp({ quality: 60 })
          .resize(1200, 1200, {
            fit: "inside",
            withoutEnlargement: true,
          })
          .toBuffer();

        await writeFile(filepath, compressedBuffer);
        const publicUrl = `/products/images/${filename}`;
        console.log(`✓ Saved image: ${filename}`);

        // Map image to row - FIXED: Correct offset-based row calculation
        const range = image.range as any;
        if (range && range.tl) {
          // Get the base row (0-indexed in Excel)
          let rawStartRow: number | null = null;

          if (typeof range.tl.nativeRow === "number") {
            rawStartRow = range.tl.nativeRow;
          } else if (typeof range.tl.row === "number") {
            rawStartRow = range.tl.row;
          }

          if (rawStartRow !== null) {
            const rowOffset = range.tl.nativeRowOff || 0;
            const rowHeight = 914400; // Standard Excel row height in EMUs

            // Calculate which row the image actually belongs to
            // If offset > 50% of row height, image belongs to next row
            const offsetFraction = rowOffset / rowHeight;

            // Convert 0-indexed Excel row to 1-indexed data row
            let dataRow = rawStartRow + 1; // Base conversion

            // If image starts in the lower half of a cell, it visually belongs to the next row
            if (offsetFraction > 0.5) {
              dataRow = dataRow + 1; // Move to next row
            }

            console.log(
              `  → Mapping to data row ${dataRow} (Excel row: ${rawStartRow}, offset: ${rowOffset}, fraction: ${offsetFraction.toFixed(
                2
              )})`
            );

            // Map to the calculated integer row
            if (!imageMap.has(dataRow)) {
              imageMap.set(dataRow, []);
            }
            imageMap.get(dataRow)!.push(publicUrl);
            console.log(`    • Added to row ${dataRow}`);
          } else {
            console.warn(
              `  ⚠ Could not determine row for image ${i + 1}, range:`,
              JSON.stringify(range, null, 2)
            );
          }
        } else {
          console.warn(`  ⚠ No range data for image ${i + 1}`);
        }
      } catch (error) {
        console.error(`✗ Failed to process image ${i + 1}:`, error);
        // Continue processing other images instead of failing
      }
    }

    console.log("=== IMAGE EXTRACTION COMPLETE ===");
    console.log(
      "Image map:",
      Array.from(imageMap.entries()).map(([row, urls]) => ({
        row,
        imageCount: urls.length,
      }))
    );

    // STEP 2: Fetch categories once
    const categories = await Category.find({ is_active: true });
    const categoryMap = new Map(categories.map((cat) => [cat.slug, cat._id]));
    console.log(`Loaded ${categories.length} categories`);

    // STEP 3: Parse all data rows with validation
    const headers: string[] = [];
    const rowsData: any[] = [];

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) {
        // Header row
        row.eachCell((cell) => {
          headers.push(cell.value?.toString().trim() || "");
        });
        console.log("Headers:", headers);
        return;
      }

      // Data rows start at row 2
      const productData: any = {
        rowNumber,
        _originalRowIndex: rowNumber, // Keep original for reference
      };
      let hasData = false;

      row.eachCell((cell, colNumber) => {
        const header = headers[colNumber - 1];
        if (header) {
          const value = cell.value?.toString().trim() || "";
          productData[header] = value;
          if (value) hasData = true;
        }
      });

      // Only include rows with actual data
      if (hasData) {
        rowsData.push(productData);
      } else {
        console.log(`Skipping empty row ${rowNumber}`);
      }
    });

    console.log(`Total data rows to process: ${rowsData.length}`);

    const results = {
      success: [] as any[],
      failed: [] as any[],
      total: rowsData.length,
    };

    const updatedCategories = new Set<string>();

    // STEP 4: Process each product with comprehensive error handling
    for (let i = 0; i < rowsData.length; i++) {
      const productData = rowsData[i];
      const rowNumber = productData.rowNumber;
      const originalIndex = productData._originalRowIndex;
      delete productData.rowNumber;
      delete productData._originalRowIndex;

      console.log(
        `\n--- Processing row ${rowNumber} (${i + 1}/${rowsData.length}) ---`
      );

      try {
        // Validate required fields
        const requiredFields = ["name", "sku", "price", "category_slug"];
        const missingFields = requiredFields.filter(
          (field) => !productData[field]
        );

        if (missingFields.length > 0) {
          const error = `Missing required fields: ${missingFields.join(", ")}`;
          console.error(`✗ Row ${rowNumber}: ${error}`);
          results.failed.push({
            row: rowNumber,
            data: productData,
            error,
          });
          continue;
        }

        // Find category
        const categoryId = categoryMap.get(productData.category_slug);
        if (!categoryId) {
          const error = `Category not found: ${productData.category_slug}`;
          console.error(`✗ Row ${rowNumber}: ${error}`);
          results.failed.push({
            row: rowNumber,
            data: productData,
            error,
          });
          continue;
        }

        // Get images for this row - SIMPLIFIED: Only check integer row numbers
        let rowImages: string[] = [];

        // Primary: Check exact row number
        if (imageMap.has(rowNumber)) {
          rowImages = [...imageMap.get(rowNumber)!];
          console.log(`Images for row ${rowNumber}: ${rowImages.length}`);
        } else {
          console.log(`Images for row ${rowNumber}: 0 (no images found)`);
        }

        // Generate unique slug
        const baseSlug = productData.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");
        const slug = `${baseSlug}-${Date.now()}-${Math.random()
          .toString(36)
          .substring(2, 7)}`;

        // Process tags
        const tags = productData.tags
          ? productData.tags
              .split(",")
              .map((t: string) => t.trim())
              .filter(Boolean)
          : [];

        // Process meta keywords
        const metaKeywords = productData.meta_keywords
          ? productData.meta_keywords
              .split(",")
              .map((k: string) => k.trim())
              .filter(Boolean)
          : [];

        // Determine stock status
        const stockQty = parseFloat(productData.stock_quantity) || 0;
        const lowThreshold = parseFloat(productData.low_stock_threshold) || 10;
        let stockStatus:
          | "in_stock"
          | "low_stock"
          | "out_of_stock"
          | "discontinued" = "in_stock";

        if (stockQty === 0) {
          stockStatus = "out_of_stock";
        } else if (stockQty <= lowThreshold) {
          stockStatus = "low_stock";
        }

        // Prepare images array
        const productImages = rowImages.map((url, index) => ({
          url,
          alt_text: `${productData.name} - Image ${index + 1}`,
          is_primary: index === 0,
          sort_order: index,
        }));

        // Create product object
        const productDoc = new Product({
          name: productData.name,
          description: productData.description || productData.name,
          short_description: productData.short_description,
          brand: productData.brand,
          manufacturer: productData.manufacturer,
          category_id: categoryId,
          subcategory_ids: [],
          tags,
          pricing: {
            price: parseFloat(productData.price),
            compare_at_price: productData.compare_at_price
              ? parseFloat(productData.compare_at_price)
              : undefined,
            cost_per_item: productData.cost_per_item
              ? parseFloat(productData.cost_per_item)
              : undefined,
            currency: productData.currency || "USD",
          },
          inventory: {
            sku: productData.sku,
            stock_quantity: stockQty,
            low_stock_threshold: lowThreshold,
            track_inventory: productData.track_inventory !== "false",
            allow_backorder: productData.allow_backorder === "true",
            stock_status: stockStatus,
          },
          shipping: {
            weight: productData.weight
              ? parseFloat(productData.weight)
              : undefined,
            weight_unit: productData.weight_unit || "kg",
            requires_shipping: productData.requires_shipping !== "false",
            is_fragile: productData.is_fragile === "true",
          },
          seo: {
            slug,
            meta_title: productData.meta_title || productData.name,
            meta_description:
              productData.meta_description || productData.short_description,
            meta_keywords: metaKeywords,
          },
          status: (productData.status as any) || "draft",
          badges: {
            is_featured:
              productData.is_featured === "true" ||
              productData.is_featured === "1",
            is_bestseller:
              productData.is_bestseller === "true" ||
              productData.is_bestseller === "1",
            is_on_sale:
              productData.is_on_sale === "true" ||
              productData.is_on_sale === "1",
            is_trending:
              productData.is_trending === "true" ||
              productData.is_trending === "1",
          },
          is_visible:
            productData.is_visible !== "false" &&
            productData.is_visible !== "0",
          visibility: (productData.visibility as any) || "public",
          unit_of_measure: productData.unit_of_measure,
          has_variants: false,
          variants: [],
          variant_attributes: [],
          images: productImages,
          created_by: adminUser._id,
        });

        await productDoc.save();
        updatedCategories.add(categoryId.toString());

        console.log(`✓ Row ${rowNumber}: Product created successfully`);
        results.success.push({
          row: rowNumber,
          sku: productData.sku,
          name: productData.name,
          imagesCount: productImages.length,
        });
      } catch (error: any) {
        console.error(`✗ Row ${rowNumber}: Failed -`, error.message);
        results.failed.push({
          row: rowNumber,
          data: productData,
          error: error.message || "Failed to create product",
        });
      }
    }

    // STEP 5: Update category product counts
    console.log("\n=== UPDATING CATEGORY COUNTS ===");
    for (const categoryId of updatedCategories) {
      try {
        const category = await Category.findById(categoryId);
        if (category) {
          await (category as any).updateProductCount();
          console.log(`✓ Updated count for category: ${categoryId}`);
        }
      } catch (error) {
        console.error(
          `✗ Failed to update count for category ${categoryId}:`,
          error
        );
      }
    }

    console.log("\n=== BULK UPLOAD COMPLETE ===");
    console.log(`Success: ${results.success.length}/${results.total}`);
    console.log(`Failed: ${results.failed.length}/${results.total}`);

    if (results.failed.length > 0) {
      console.log(
        "\nFailed rows:",
        results.failed.map((f) => ({
          row: f.row,
          error: f.error,
          name: f.data?.name,
        }))
      );
    }

    return NextResponse.json({
      success: true,
      message: `Excel bulk upload completed: ${results.success.length} succeeded, ${results.failed.length} failed`,
      results,
    });
  } catch (error: any) {
    console.error("Excel bulk upload failed:", error);
    return NextResponse.json(
      {
        error: "Excel bulk upload failed",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
