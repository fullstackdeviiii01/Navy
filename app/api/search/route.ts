// app/api/search/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../lib/db";
import Product from "../../models/Product";
import Category from "../../models/Category";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const url = new URL(request.url);
    const query = url.searchParams.get("q");
    const limit = parseInt(url.searchParams.get("limit") || "5");

    if (!query || query.trim().length < 2) {
      return NextResponse.json({
        products: [],
        categories: [],
      });
    }

    const searchRegex = new RegExp(query, "i");

    // Search categories
    const categories = await Category.find({
      $or: [
        { name: searchRegex },
        { description: searchRegex },
        { slug: searchRegex },
      ],
      is_active: true,
    })
      .select("name slug image_url product_count")
      .limit(limit)
      .lean();

    // Search products
    const products = await (Product as any)
      .find({
        $or: [
          { name: searchRegex },
          { description: searchRegex },
          { brand: searchRegex },
        ],
        status: "active",
        is_visible: true,
      })
      .select("_id name images pricing.price pricing.currency inventory.stock_status")
      .populate("category_id", "name slug")
      .limit(limit)
      .lean();

    return NextResponse.json({
      products,
      categories,
    });
  } catch (error) {
    console.error("Search failed:", error);
    return NextResponse.json(
      { error: "Search failed" },
      { status: 500 }
    );
  }
}