// app/api/payment/gateways/active/route.js
import { NextResponse } from "next/server";
import connectDB from "../../../../../lib/db";
import PaymentGateway from "../../../../models/PaymentGateway";

// GET - Fetch active payment gateways (public)
export async function GET() {
  try {
    await connectDB();

    const gateways = await PaymentGateway.find({ is_enabled: true })
      .select(
        "name display_name is_test_mode " +
        "settings.currency settings.allow_all_orders settings.min_order_amount settings.max_order_amount settings.instructions " +
        "credentials.stripe_publishable_key credentials.paypal_client_id"
      )
      .lean();

    return NextResponse.json({ gateways });
  } catch (error) {
    console.error("Active gateways fetch failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch active gateways" },
      { status: 500 }
    );
  }
}