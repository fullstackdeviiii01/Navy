import { NextRequest, NextResponse } from "next/server";
import { getIdTokenFromHeader, verifyIdToken } from "../../../../lib/auth";
import connectDB from "../../../../lib/db";
import SiteSettings from "../../../models/SiteSettings";
import User from "../../../models/User";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();

    const page = await (SiteSettings as any)
      .findOne({ _id: id, is_global_settings: { $ne: true } }) // Filter out global settings
      .populate("created_by", "name email")
      .populate("updated_by", "name email");

    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    return NextResponse.json({ page });
  } catch (error) {
    console.error("Page fetch failed:", error);
    return NextResponse.json({ error: "Failed to fetch page" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = getIdTokenFromHeader(request);
    if (!token) return NextResponse.json({ error: "No token provided" }, { status: 401 });

    const decodedToken = await verifyIdToken(token);
    if (!decodedToken) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    await connectDB();
    const adminUser = await (User as any).findOne({ email: decodedToken.email });
    if (!adminUser || adminUser.role !== "admin") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const body = await request.json();
    body.updated_by = adminUser._id;

    const page = await (SiteSettings as any).findOneAndUpdate(
      { _id: id, is_global_settings: { $ne: true } }, // Prevent updating global settings
      body,
      { new: true, runValidators: true }
    );

    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Page updated successfully", page });
  } catch (error: any) {
    console.error("Page update failed:", error);
    if (error.code === 11000) {
      return NextResponse.json({ error: "Page with this slug already exists" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update page" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = getIdTokenFromHeader(request);
    if (!token) return NextResponse.json({ error: "No token provided" }, { status: 401 });

    const decodedToken = await verifyIdToken(token);
    if (!decodedToken) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    await connectDB();
    const adminUser = await (User as any).findOne({ email: decodedToken.email });
    if (!adminUser || adminUser.role !== "admin") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const page = await (SiteSettings as any).findOneAndDelete({
      _id: id,
      is_global_settings: { $ne: true } // Prevent deleting global settings
    });

    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Page deleted successfully" });
  } catch (error) {
    console.error("Page deletion failed:", error);
    return NextResponse.json({ error: "Failed to delete page" }, { status: 500 });
  }
}