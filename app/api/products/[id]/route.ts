// app/api/products/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getIdTokenFromHeader, verifyIdToken } from "../../../../lib/auth";
import connectDB from "../../../../lib/db";
import Product from "../../../models/Product";
import Category from "../../../models/Category";
import User from "../../../models/User";
import { deleteProductMedia } from "../../../../lib/media-deletion/fileUtils";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await connectDB();

    let product = null;

    // 1. Direct ObjectId or extracted -[24-hex-id] check
    const isExactObjectId = /^[0-9a-fA-F]{24}$/.test(id);
    const endingIdMatch = id.match(/-([0-9a-fA-F]{24})$/);
    const resolvedId = isExactObjectId ? id : endingIdMatch ? endingIdMatch[1] : null;

    if (resolvedId) {
      product = await (Product as any).findById(resolvedId)
        .populate("category_id")
        .populate("subcategory_ids")
        .populate("created_by", "name email")
        .populate("updated_by", "name email");
    }

    // 2. Slug check if not found by ID
    if (!product) {
      product = await (Product as any).findOne({ slug: id })
        .populate("category_id")
        .populate("subcategory_ids")
        .populate("created_by", "name email")
        .populate("updated_by", "name email");
    }

    // 3. Normalized slug check
    if (!product) {
      product = await (Product as any).findOne({ slug: id.toLowerCase().trim() })
        .populate("category_id")
        .populate("subcategory_ids")
        .populate("created_by", "name email")
        .populate("updated_by", "name email");
    }

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error("Product fetch failed:", error);
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    const token = getIdTokenFromHeader(request);
    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const decodedToken = await verifyIdToken(token);
    if (!decodedToken) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    await connectDB();

    const adminUser = await (User as any).findOne({ email: decodedToken.email });
    if (!adminUser || adminUser.role !== "admin") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const product = await (Product as any).findById(id);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const oldCategoryId = product.category_id ? product.category_id.toString() : null;
    const body = await request.json();
    const newCategoryId = body.category_id?.toString();

    // Sanitize & enforce non-negative stock and pricing
    if (body.inventory) {
      if (body.inventory.stock_quantity !== undefined) {
        body.inventory.stock_quantity = Math.max(0, parseInt(body.inventory.stock_quantity) || 0);
      }
      if (body.inventory.low_stock_threshold !== undefined) {
        body.inventory.low_stock_threshold = Math.max(0, parseInt(body.inventory.low_stock_threshold) || 0);
      }
    }

    if (body.pricing) {
      if (body.pricing.price !== undefined) {
        body.pricing.price = Math.max(0, parseFloat(body.pricing.price) || 0);
      }
      if (body.pricing.compare_at_price !== undefined && body.pricing.compare_at_price !== null) {
        body.pricing.compare_at_price = Math.max(0, parseFloat(body.pricing.compare_at_price) || 0);
      }
    }

    if (Array.isArray(body.variants)) {
      body.variants = body.variants.map((v: any) => ({
        ...v,
        sku: typeof v.sku === "string" ? v.sku.trim() : "",
        stockQuantity: Math.max(0, parseInt(v.stockQuantity) || 0),
        price: Math.max(0, parseFloat(v.price) || 0),
        lowStockThreshold: Math.max(0, parseInt(v.lowStockThreshold) || 10),
      }));
    }

    // ========== SKU Validation & Deduplication (excludes current product) ==========
    const rootSku = (body.sku || body.inventory?.sku || "").trim();
    if (rootSku) {
      const existingProductWithSku = await (Product as any).findOne({
        _id: { $ne: product._id },
        $or: [
          { sku: rootSku },
          { "inventory.sku": rootSku },
          { "variants.sku": rootSku },
        ],
      }).select("name sku inventory.sku variants.sku");

      if (existingProductWithSku) {
        return NextResponse.json(
          { error: `Product SKU "${rootSku}" is already in use by product "${existingProductWithSku.name}". Each SKU must be globally unique.` },
          { status: 400 }
        );
      }

      body.sku = rootSku;
      if (body.inventory) {
        body.inventory.sku = rootSku;
      }
    } else if (body.sku === "" || body.inventory?.sku === "") {
      body.sku = undefined;
      if (body.inventory) {
        body.inventory.sku = undefined;
      }
    }

    // If product has variants, validate variant SKUs
    if (body.hasVariants && Array.isArray(body.variants) && body.variants.length > 0) {
      const variantSkus = body.variants
        .map((v: any) => v.sku)
        .filter(Boolean);

      // Check for duplicate SKUs within the same product payload
      const payloadDups = variantSkus.filter((sku: string, idx: number) => variantSkus.indexOf(sku) !== idx);
      if (payloadDups.length > 0) {
        return NextResponse.json(
          { error: `Duplicate variant SKU "${payloadDups[0]}" found within this product. Every variant must have a unique SKU.` },
          { status: 400 }
        );
      }

      // Check for conflict with the root product SKU if both are set
      if (rootSku && variantSkus.includes(rootSku)) {
        return NextResponse.json(
          { error: `Variant SKU cannot be identical to product base SKU "${rootSku}". Please use distinct SKUs.` },
          { status: 400 }
        );
      }

      // Check for conflict with existing database products & variants (excluding current product)
      if (variantSkus.length > 0) {
        const dbConflict = await (Product as any).findOne({
          _id: { $ne: product._id },
          $or: [
            { sku: { $in: variantSkus } },
            { "inventory.sku": { $in: variantSkus } },
            { "variants.sku": { $in: variantSkus } },
          ],
        }).select("name sku inventory.sku variants.sku");

        if (dbConflict) {
          const conflictingSku = variantSkus.find((s: string) =>
            s === dbConflict.sku ||
            s === dbConflict.inventory?.sku ||
            dbConflict.variants?.some((v: any) => v.sku === s)
          );
          return NextResponse.json(
            { error: `Variant SKU "${conflictingSku}" is already in use by product "${dbConflict.name}". Each SKU must be globally unique.` },
            { status: 400 }
          );
        }
      }
    }

    body.updated_by = adminUser._id;
    product.set(body);

    // Also sanitize any existing variants on document
    if (Array.isArray(product.variants)) {
      product.variants.forEach((v: any) => {
        if (v.stockQuantity !== undefined && v.stockQuantity < 0) v.stockQuantity = 0;
        if (v.price !== undefined && v.price < 0) v.price = 0;
      });
    }

    product.markModified("variantOptions");
    product.markModified("variants");
    product.markModified("images");
    product.markModified("videos");
    product.markModified("attributes");
    
    if (product.hasVariants) {
      await product.syncVariantData();
    }

    await product.save();

    // Update product counts if category changed
    if (newCategoryId && oldCategoryId !== newCategoryId) {
      const oldCategory = await Category.findById(oldCategoryId);
      if (oldCategory) {
        await (oldCategory as any).updateProductCount();
      }
      
      const newCategory = await Category.findById(newCategoryId);
      if (newCategory) {
        await (newCategory as any).updateProductCount();
      }
    }

    return NextResponse.json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error: any) {
    console.error("Product update failed:", error);
    if (error.code === 11000) {
      return NextResponse.json(
        { error: "Product with this title or slug already exists" },
        { status: 400 }
      );
    }
    if (error.name === "ValidationError") {
      return NextResponse.json(
        { error: "Validation failed: " + Object.values(error.errors).map((e: any) => e.message).join(", ") },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error.message || "Failed to update product" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    const token = getIdTokenFromHeader(request);
    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const decodedToken = await verifyIdToken(token);
    if (!decodedToken) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    await connectDB();

    const adminUser = await (User as any).findOne({ email: decodedToken.email });
    if (!adminUser || adminUser.role !== "admin") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Find product first to get image/video URLs and category ID
    const product = await (Product as any).findById(id);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Capture category ID before deletion
    const categoryId = product.category_id;

    // Extract media URLs
    const imageUrls = product.images?.map((img: any) => img.url) || [];
    const videoUrls = product.videos?.map((video: any) => video.url) || [];

    // Delete product from database
    await (Product as any).findByIdAndDelete(id);

    // Delete associated media files
    const mediaResults = await deleteProductMedia(imageUrls, videoUrls);

    // Update category product count
    if (categoryId) {
      const category = await Category.findById(categoryId);
      if (category) {
        await (category as any).updateProductCount();
      }
    }

    return NextResponse.json({
      success: true,
      message: "Product and associated media deleted successfully",
      deletedMedia: mediaResults,
    });
  } catch (error) {
    console.error("Product deletion failed:", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}