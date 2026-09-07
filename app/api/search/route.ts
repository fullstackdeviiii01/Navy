// app/api/search/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../lib/db";
import Product from "../../models/Product";
import Category from "../../models/Category";

// Escape regex special characters so user input is treated as literal text
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

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

    const trimmed = query.trim();

    // Split into individual words, escape each, filter empties
    const words = trimmed.split(/\s+/).filter((w) => w.length > 0);

    // Also create a single full-phrase regex for exact substring matches
    const fullPhraseRegex = new RegExp(escapeRegex(trimmed), "i");

    // Build per-word $and conditions: every word must appear in at least one field
    const wordConditions = words.map((word) => {
      const wordRegex = new RegExp(escapeRegex(word), "i");
      return {
        $or: [
          { name: wordRegex },
          { description: wordRegex },
          { brand: wordRegex },
        ],
      };
    });

    // Search categories (full phrase match)
    const categories = await Category.find({
      $or: [
        { name: fullPhraseRegex },
        { description: fullPhraseRegex },
        { slug: fullPhraseRegex },
      ],
      is_active: true,
    })
      .select("name slug image_url product_count")
      .limit(limit)
      .lean();

    // Search products: match if ALL words appear (across name/description/brand)
    const products = await (Product as any)
      .find({
        $and: [
          ...wordConditions,
          { status: "active" },
          { is_visible: true },
        ],
      })
      .select("_id name slug seo images pricing.price pricing.currency inventory.stock_status")
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