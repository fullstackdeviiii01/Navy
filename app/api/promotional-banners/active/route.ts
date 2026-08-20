// app/api/promotional-banners/active/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../../lib/db";
import PromotionalBanner from "../../../models/PromotionalBanner";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const url = new URL(request.url);
    const targetPage = url.searchParams.get("target_page");
    const position = url.searchParams.get("position");

    if (!targetPage) {
      return NextResponse.json(
        { error: "target_page parameter is required" },
        { status: 400 }
      );
    }

    const now = new Date();
    const query: any = {
      target_page: targetPage,
      is_active: true,
      $or: [
        { display_from: { $exists: false } },
        { display_from: null },
        { display_from: { $lte: now } }
      ]
    };

    // Add position filter for categories/products pages
    if (position && (targetPage === "categories" || targetPage === "products")) {
      query.position = position;
    }

    // Add display_until check
    const banners = await (PromotionalBanner as any)
      .find(query)
      .sort({ sort_order: 1, created_at: -1 })
      .lean();

    // Filter out banners past their display_until date
    const activeBanners = banners.filter((banner: any) => {
      if (!banner.display_until) return true;
      return new Date(banner.display_until) >= now;
    });

    return NextResponse.json({
      success: true,
      banners: activeBanners,
      count: activeBanners.length
    });
  } catch (error) {
    console.error("Failed to fetch active banners:", error);
    return NextResponse.json(
      { error: "Failed to fetch active banners" },
      { status: 500 }
    );
  }
}