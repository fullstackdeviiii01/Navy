// app/api/categories/[id]/products/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../../../lib/db";
import Product from "../../../../models/Product";
import Category from "../../../../models/Category";
import User from "../../../../models/User";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await connectDB();

    // Update product count
    const category = await Category.findById(id);
    if (category) {
      await (category as any).updateProductCount();
    }

    const products = await (Product as any).find({ category_id: id })
      .select(
        //  " inventory.sku pricing.price "
         "name status description pricing images rating_average rating_count inventory badges attributes hasVariants variants variantOptions variantPricing variantInventory",
      )
      .lean();

    return NextResponse.json({ 
      products,
      count: products.length 
    });
  } catch (error) {
    console.error("Products fetch failed:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}