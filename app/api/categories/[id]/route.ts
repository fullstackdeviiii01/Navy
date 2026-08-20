// app/api/categories/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getIdTokenFromHeader, verifyIdToken } from "../../../../lib/auth";
import connectDB from "../../../../lib/db";
import Category from "../../../models/Category";
import Product from "../../../models/Product";
import User from "../../../models/User";
import { deleteCategoryImage } from "../../../../lib/media-deletion/categoryFileUtils";

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

    const body = await request.json();
    
    // If image_url is being cleared or changed, delete the old image
    if (body.hasOwnProperty("image_url")) {
      const oldCategory = await Category.findById(id);
      if (oldCategory && oldCategory.image_url && oldCategory.image_url !== body.image_url) {
        await deleteCategoryImage(oldCategory.image_url);
      }
    }

    body.updated_by = adminUser._id;

    const category = await Category.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Category updated successfully",
      category,
    });
  } catch (error: any) {
    console.error("Category update failed:", error);
    if (error.code === 11000) {
      return NextResponse.json(
        { error: "Category with this slug already exists" },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
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

    // Check if category has products
    const productsCount = await Product.countDocuments({ category_id: id });
    if (productsCount > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete category with ${productsCount} products. Please reassign products first.`,
        },
        { status: 400 }
      );
    }

    // Get category to retrieve image URL before deletion
    const category = await Category.findById(id);

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    // Store image URL before deletion
    const imageUrl = category.image_url;

    // Delete the category from database
    await Category.findByIdAndDelete(id);

    // Delete the associated image if exists
    if (imageUrl) {
      await deleteCategoryImage(imageUrl);
    }

    return NextResponse.json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Category deletion failed:", error);
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}