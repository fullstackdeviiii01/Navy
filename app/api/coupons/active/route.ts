// app/api/coupons/active/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../../lib/db";
import Coupon from "../../../models/Coupon";
import Category from "../../../models/Category";
import Product from "../../../models/Product";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Ensure models are registered in Mongoose
    const _c = Category;
    const _p = Product;

    const now = new Date();
    
    // Find all active coupons that are valid and should be shown on products
    const activeCoupons = await (Coupon as any).find({
      is_active: true,
      show_on_products: true,
      valid_from: { $lte: now },
      valid_until: { $gte: now },
      $or: [
        { usage_limit: null },
        { $expr: { $lt: ["$used_count", "$usage_limit"] } }
      ]
    })
    .populate("applicable_to.category_ids", "name slug")
    .populate("applicable_to.product_ids", "name seo.slug")
    .select("code description discount_type discount_value min_order_amount max_discount applicable_to")
    .lean();

    // Convert ObjectIds to strings and provide enriched category / product objects
    const formattedCoupons = activeCoupons.map((coupon: any) => {
      const rawCats = coupon.applicable_to?.category_ids || [];
      const rawProds = coupon.applicable_to?.product_ids || [];

      const categoryIds = rawCats.map((c: any) => (c._id ? c._id.toString() : c.toString()));
      const productIds = rawProds.map((p: any) => (p._id ? p._id.toString() : p.toString()));

      const categories = rawCats
        .filter((c: any) => c && typeof c === "object" && c.name)
        .map((c: any) => ({
          _id: c._id.toString(),
          name: c.name,
          slug: c.slug,
        }));

      const products = rawProds
        .filter((p: any) => p && typeof p === "object" && p.name)
        .map((p: any) => ({
          _id: p._id.toString(),
          name: p.name,
          slug: p.seo?.slug || p._id.toString(),
        }));

      return {
        _id: coupon._id?.toString(),
        code: coupon.code,
        description: coupon.description,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value,
        min_order_amount: coupon.min_order_amount || 0,
        max_discount: coupon.max_discount || null,
        applicable_to: {
          type: coupon.applicable_to?.type || "all",
          category_ids: categoryIds,
          product_ids: productIds,
          categories,
          products,
        },
      };
    });

    return NextResponse.json({ coupons: formattedCoupons });
  } catch (error) {
    console.error("Active coupons fetch failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch active coupons" },
      { status: 500 }
    );
  }
}