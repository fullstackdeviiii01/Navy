import { NextRequest, NextResponse } from "next/server";
import { getIdTokenFromHeader, verifyIdToken } from "../../../../../lib/auth";
import connectDB from "../../../../../lib/db";
import Category from "../../../../models/Category";
import User from "../../../../models/User";
import { ICategoryAttribute } from "../../../../models/Category";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();

    const category = await Category.findById(id).select("attributes");
    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    const attributes = category.attributes.sort((a, b) => a.sort_order - b.sort_order);

    return NextResponse.json({ attributes });
  } catch (error) {
    console.error("Failed to fetch category attributes:", error);
    return NextResponse.json(
      { error: "Failed to fetch attributes" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const body = await request.json();
    const category = await Category.findById(id);

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    const newAttribute: ICategoryAttribute = {
      name: body.name,
      label: body.label,
      type: body.type,
      required: body.required || false,
      options: body.options || [],
      placeholder: body.placeholder,
      description: body.description,
      sort_order: category.attributes.length,
    };

    category.attributes.push(newAttribute);
    category.updated_by = adminUser._id;
    await category.save();

    return NextResponse.json({
      success: true,
      attribute: category.attributes[category.attributes.length - 1],
    });
  } catch (error: any) {
    console.error("Failed to add attribute:", error);
    return NextResponse.json(
      { error: error.message || "Failed to add attribute" },
      { status: 500 }
    );
  }
}