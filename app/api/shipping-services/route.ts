// app/api/shipping-services/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../lib/db";
import ShippingService from "../../models/ShippingService";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Clean up any accidental courier entries if any
    await ShippingService.deleteMany({
      $or: [{ name: "mp_express" }, { display_name: /M&P Express/i }],
    });

    const services = await ShippingService.find({
      is_active: true,
      name: { $ne: "mp_express" },
      display_name: { $not: /M&P Express/i },
    })
      .sort({ sort_order: 1, created_at: 1 })
      .lean();

    return NextResponse.json({ services });
  } catch (error) {
    console.error("Fetch active shipping services failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch shipping services" },
      { status: 500 }
    );
  }
}