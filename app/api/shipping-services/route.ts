// app/api/shipping-services/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../lib/db";
import ShippingService from "../../models/ShippingService";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const services = await ShippingService.find({ is_active: true })
      .sort({ sort_order: 1, base_price: 1, created_at: -1 })
      .select(
        "name display_name description base_price currency estimated_days_min estimated_days_max"
      )
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