// app/api/coupons/active/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../../lib/db";
import Coupon from "../../../models/Coupon";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const now = new Date();
    
    // Find all active coupons that are valid and should be shown on products
    const activeCoupons = await Coupon.find({
      is_active: true,
      show_on_products: true,
      valid_from: { $lte: now },
      valid_until: { $gte: now },
      $or: [
        { usage_limit: null },
        { $expr: { $lt: ["$used_count", "$usage_limit"] } }
      ]
    })
    .select('code discount_type discount_value max_discount applicable_to')
    .lean();

    // Convert ObjectIds to strings for client-side comparison
    const formattedCoupons = activeCoupons.map(coupon => ({
      ...coupon,
      applicable_to: {
        type: coupon.applicable_to.type,
        category_ids: coupon.applicable_to.category_ids?.map(id => id.toString()) || [],
        product_ids: coupon.applicable_to.product_ids?.map(id => id.toString()) || [],
      }
    }));

    return NextResponse.json({ coupons: formattedCoupons });
  } catch (error) {
    console.error("Active coupons fetch failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch active coupons" },
      { status: 500 }
    );
  }
}