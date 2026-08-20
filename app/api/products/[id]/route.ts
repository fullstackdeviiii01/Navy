// app/api/products/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getIdTokenFromHeader, verifyIdToken } from "../../../../lib/firebase/auth";
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

    const adminUser = await (User as any).findOne({ uid: decodedToken.uid });
    if (!adminUser || adminUser.role !== "admin") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Get the old product to check if category changed
    const oldProduct = await (Product as any).findById(id);
    if (!oldProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const oldCategoryId = oldProduct.category_id.toString();

    const body = await request.json();
    const newCategoryId = body.category_id?.toString();
    
    body.updated_by = adminUser._id;

    const product = await (Product as any).findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Update product counts if category changed
    if (newCategoryId && oldCategoryId !== newCategoryId) {
      // Update old category
      const oldCategory = await Category.findById(oldCategoryId);
      if (oldCategory) {
        await (oldCategory as any).updateProductCount();
      }
      
      // Update new category
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
        { error: "Product with this SKU or slug already exists" },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
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

    const adminUser = await (User as any).findOne({ uid: decodedToken.uid });
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
    
    console.log(`Deleted ${mediaResults.totalDeleted} media files, ${mediaResults.totalFailed} failed`);

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