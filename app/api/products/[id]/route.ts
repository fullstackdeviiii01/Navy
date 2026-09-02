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

    const product = await (Product as any).findById(id)
      .populate("category_id")
      .populate("subcategory_ids")
      .populate("created_by", "name email")
      .populate("updated_by", "name email");

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
        stockQuantity: Math.max(0, parseInt(v.stockQuantity) || 0),
        price: Math.max(0, parseFloat(v.price) || 0),
        lowStockThreshold: Math.max(0, parseInt(v.lowStockThreshold) || 10),
      }));
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