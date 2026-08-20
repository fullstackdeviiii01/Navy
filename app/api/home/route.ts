// app/api/home/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../lib/db";
import Product from "../../models/Product";
import Category from "../../models/Category";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const categories = await Category.find({ is_active: true })
      .sort({ sort_order: 1, name: 1 })
      .select("name slug image_url product_count")
      .limit(12)
      .lean();

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const newArrivals = await (Product as any)
      .find({
        status: "active",
        is_visible: true,
        created_at: { $gte: thirtyDaysAgo },
      })
      .select(
        "name description pricing images rating_average rating_count inventory attributes hasVariants variants variantOptions variantPricing variantInventory",
      )
      .sort({ created_at: -1 })
      .limit(12)
      .lean();

    const bestSellers = await (Product as any)
      .find({
        status: "active",
        is_visible: true,
        purchase_count: { $gt: 0 },
      })
      .select(
        "name description pricing images rating_average rating_count inventory attributes hasVariants variants variantOptions variantPricing variantInventory",
      )
      .sort({ purchase_count: -1 })
      .limit(12)
      .lean();

    return NextResponse.json({
      categories,
      newArrivals,
      bestSellers,
    });
  } catch (error) {
    console.error("Home data fetch failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch home page data" },
      { status: 500 },
    );
  }
}

export const dynamic = "force-dynamic";
