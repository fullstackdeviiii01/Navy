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
        "name short_description description pricing images videos rating_average rating_count inventory badges unit_of_measure attributes hasVariants variants variantOptions variantPricing variantInventory", // ← Add variantPricing variantInventory
      )
      .sort({ created_at: -1 })
      .limit(12)
      .lean();

    const featuredProducts = await (Product as any)
      .find({
        status: "active",
        is_visible: true,
        "badges.is_featured": true,
      })
      .select(
        "name short_description description pricing images videos rating_average rating_count inventory badges unit_of_measure attributes hasVariants variants variantOptions variantPricing variantInventory", // ← Add variantPricing variantInventory
      )
      .sort({ rating_average: -1, purchase_count: -1 })
      .limit(12)
      .lean();

    const bestSellers = await (Product as any)
      .find({
        status: "active",
        is_visible: true,
        purchase_count: { $gt: 0 },
      })
      .select(
        "name short_description description pricing images videos rating_average rating_count inventory badges unit_of_measure attributes hasVariants variants variantOptions variantPricing variantInventory", // ← Add variantPricing variantInventory
      )
      .sort({ purchase_count: -1 })
      .limit(12)
      .lean();

    const trendingProducts = await (Product as any)
      .find({
        status: "active",
        is_visible: true,
        "badges.is_trending": true,
      })
      .select(
        "name short_description description pricing images videos rating_average rating_count inventory badges unit_of_measure attributes hasVariants variants variantOptions variantPricing variantInventory", // ← Add variantPricing variantInventory
      )
      .sort({ view_count: -1, rating_average: -1 })
      .limit(12)
      .lean();

    const onSaleProducts = await (Product as any)
      .find({
        status: "active",
        is_visible: true,
        "badges.is_on_sale": true,
      })
      .select(
        "name short_description description pricing images videos rating_average rating_count inventory badges unit_of_measure attributes hasVariants variants variantOptions variantPricing variantInventory", // ← Add variantPricing variantInventory
      )
      .sort({ created_at: -1 })
      .limit(12)
      .lean();

    return NextResponse.json({
      categories,
      newArrivals,
      featuredProducts,
      bestSellers,
      trendingProducts,
      onSaleProducts,
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
