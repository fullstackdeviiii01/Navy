import { NextRequest, NextResponse } from "next/server";
import { getIdTokenFromHeader, verifyIdToken } from "../../../../../../lib/firebase/auth";
import connectDB from "../../../../../../lib/db";
import Category from "../../../../../models/Category";
import User from "../../../../../models/User";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; attrId: string }> }
) {
  try {
    const { id, attrId } = await params;
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
    const category = await Category.findById(id);

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    const attributeIndex = category.attributes.findIndex(
      (attr) => attr._id?.toString() === attrId
    );

    if (attributeIndex === -1) {
      return NextResponse.json(
        { error: "Attribute not found" },
        { status: 404 }
      );
    }

    category.attributes[attributeIndex] = {
      ...category.attributes[attributeIndex],
      name: body.name || category.attributes[attributeIndex].name,
      label: body.label || category.attributes[attributeIndex].label,
      type: body.type || category.attributes[attributeIndex].type,
      required: body.required !== undefined ? body.required : category.attributes[attributeIndex].required,
      options: body.options || category.attributes[attributeIndex].options,
      placeholder: body.placeholder || category.attributes[attributeIndex].placeholder,
      description: body.description || category.attributes[attributeIndex].description,
      sort_order: body.sort_order !== undefined ? body.sort_order : category.attributes[attributeIndex].sort_order,
    };

    category.updated_by = adminUser._id;
    await category.save();

    return NextResponse.json({
      success: true,
      attribute: category.attributes[attributeIndex],
    });
  } catch (error: any) {
    console.error("Failed to update attribute:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update attribute" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; attrId: string }> }
) {
  try {
    const { id, attrId } = await params;
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

    const category = await Category.findById(id);

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    const attributeIndex = category.attributes.findIndex(
      (attr) => attr._id?.toString() === attrId
    );

    if (attributeIndex === -1) {
      return NextResponse.json(
        { error: "Attribute not found" },
        { status: 404 }
      );
    }

    category.attributes.splice(attributeIndex, 1);

    category.attributes.forEach((attr, index) => {
      attr.sort_order = index;
    });

    category.updated_by = adminUser._id;
    await category.save();

    return NextResponse.json({
      success: true,
      message: "Attribute deleted successfully",
    });
  } catch (error: any) {
    console.error("Failed to delete attribute:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete attribute" },
      { status: 500 }
    );
  }
}