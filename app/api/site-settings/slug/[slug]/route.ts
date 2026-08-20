import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../../../lib/db";
import SiteSettings from "../../../../models/SiteSettings";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    await connectDB();

    const page = await (SiteSettings as any)
      .findOne({ 
        slug, 
        is_active: true,
        is_global_settings: { $ne: true }
      })
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