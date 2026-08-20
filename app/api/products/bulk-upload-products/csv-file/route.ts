// app/api/products/bulk-upload-csv/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getIdTokenFromHeader, verifyIdToken } from "../../../../../lib/auth";
import connectDB from "../../../../../lib/db";
import Product from "../../../../models/Product";
import Category from "../../../../models/Category";
import User from "../../../../models/User";

interface BulkProductData {
  name: string;
  description: string;
  short_description?: string;
  brand?: string;
  manufacturer?: string;
  category_slug: string;
  price: number;
  compare_at_price?: number;
  cost_per_item?: number;
  currency?: string;
  sku: string;
  stock_quantity: number;
  low_stock_threshold?: number;
  track_inventory?: boolean;
  allow_backorder?: boolean;
  weight?: number;
  weight_unit?: string;
  requires_shipping?: boolean;
  is_fragile?: boolean;
  tags?: string;
  status?: string;
  is_featured?: string;
  is_trending?: string;
  is_on_sale?: string;
  is_bestseller?: string;
  is_visible?: string;
  visibility?: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
}

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

    const body = await request.json();
    const { products } = body as { products: BulkProductData[] };

    if (!products || !Array.isArray(products) || products.length === 0) {
      return NextResponse.json(
        { error: "No products provided" },
        { status: 400 }
      );
    }

    // Fetch all active categories for mapping
    const categories = await Category.find({ is_active: true });
    const categoryMap = new Map(categories.map((cat) => [cat.slug, cat._id]));

    const results = {
      success: [] as any[],
      failed: [] as any[],
      total: products.length,
    };

    const updatedCategories = new Set<string>();

    for (let i = 0; i < products.length; i++) {
      const productData = products[i];

      try {
        // Validate required fields
        if (
          !productData.name ||
          !productData.sku ||
          !productData.price ||
          !productData.category_slug
        ) {
          results.failed.push({
            row: i + 1,
            data: productData,
            error: "Missing required fields (name, sku, price, category_slug)",
          });
          continue;
        }

        // Find category
        const categoryId = categoryMap.get(productData.category_slug);
        if (!categoryId) {
          results.failed.push({
            row: i + 1,
            data: productData,
            error: `Category not found: ${productData.category_slug}`,
          });
          continue;
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
              .map((t) => t.trim())
              .filter(Boolean)
          : [];

        // Process meta keywords
        const metaKeywords = productData.meta_keywords
          ? productData.meta_keywords
              .split(",")
              .map((k) => k.trim())
              .filter(Boolean)
          : [];

        // Determine stock status
        const stockQty = productData.stock_quantity || 0;
        const lowThreshold = productData.low_stock_threshold || 10;
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

        // Create product object
        const product = new Product({
          // Basic Information
          name: productData.name,
          description: productData.description || "",
          short_description: productData.short_description,
          brand: productData.brand,
          manufacturer: productData.manufacturer,

          // Categorization
          category_id: categoryId,
          subcategory_ids: [],
          tags,

          // Pricing
          pricing: {
            price: productData.price,
            compare_at_price: productData.compare_at_price,
            cost_per_item: productData.cost_per_item,
            currency: productData.currency || "USD",
          },

          // Inventory
          inventory: {
            sku: productData.sku,
            stock_quantity: stockQty,
            low_stock_threshold: lowThreshold,
            track_inventory: productData.track_inventory !== false,
            allow_backorder: productData.allow_backorder === true,
            stock_status: stockStatus,
          },

          // Shipping
          shipping: {
            weight: productData.weight,
            weight_unit: productData.weight_unit || "kg",
            requires_shipping: productData.requires_shipping !== false,
            is_fragile: productData.is_fragile === true,
          },

          // SEO
          seo: {
            slug,
            meta_title: productData.meta_title || productData.name,
            meta_description:
              productData.meta_description || productData.short_description,
            meta_keywords: metaKeywords,
          },

          // Status & Visibility
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

          // Variants
          has_variants: false,
          variants: [],
          variant_attributes: [],

          // Media
          images: [],

          // Admin
          created_by: adminUser._id,
        });

        await product.save();

        // Track category for product count update
        updatedCategories.add(categoryId.toString());

        results.success.push({
          row: i + 1,
          sku: productData.sku,
          name: productData.name,
        });
      } catch (error: any) {
        results.failed.push({
          row: i + 1,
          data: productData,
          error: error.message || "Failed to create product",
        });
      }
    }

    // Update product counts for all affected categories
    for (const categoryId of updatedCategories) {
      try {
        const category = await Category.findById(categoryId);
        if (category) {
          await (category as any).updateProductCount();
        }
      } catch (error) {
        console.error(
          `Failed to update product count for category ${categoryId}:`,
          error
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: `Bulk upload completed: ${results.success.length} succeeded, ${results.failed.length} failed`,
      results,
    });
  } catch (error) {
    console.error("Bulk upload failed:", error);
    return NextResponse.json({ error: "Bulk upload failed" }, { status: 500 });
  }
}
