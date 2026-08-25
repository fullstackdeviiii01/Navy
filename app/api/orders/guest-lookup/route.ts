// app/api/orders/guest-lookup/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../../lib/db";
import Order from "../../../models/Order";
import "../../../models/Return";
import { createSessionCookie } from "../../../../lib/auth/session";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const orderNumber = url.searchParams.get("order_number");
    const email = url.searchParams.get("email");

    if (!orderNumber || !email) {
      return NextResponse.json(
        { error: "Order number and email are required" },
        { status: 400 },
      );
    }

    await connectDB();

    // Find guest order by order number and email
    const order = await Order.findOne({
      order_number: orderNumber.toUpperCase(),
      order_type: "guest",
      "guest_info.email": email.toLowerCase().trim(),
    })
      .populate("has_active_return")
      .populate("return_status")
      .lean();

    if (!order) {
      return NextResponse.json(
        {
          error:
            "Order not found. Please check your order number and email address.",
        },
        { status: 404 },
      );
    }

    (order as any).has_active_return = !!(order as any).has_active_return;
    if ((order as any).has_active_return && (order as any).return_status) {
      (order as any).return_status = (order as any).return_status.status;
    }

    const response = NextResponse.json({ order });

    // Attach guest session cookie if session_id is associated with the order
    if (order.session_id) {
      response.headers.set("Set-Cookie", createSessionCookie(order.session_id));
    }

    return response;
  } catch (error) {
    console.error("Guest order lookup failed:", error);
    return NextResponse.json(
      { error: "Failed to find order" },
      { status: 500 },
    );
  }
}
