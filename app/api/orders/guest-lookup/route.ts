// app/api/orders/guest-lookup/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../../lib/db";
import Order from "../../../models/Order";
import User from "../../../models/User";
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
        { status: 400 }
      );
    }

    await connectDB();

    const cleanOrderNumber = orderNumber.trim().toUpperCase();
    const cleanEmail = email.trim().toLowerCase();

    // 1. Find the order by order number (whether placed as guest or registered user)
    const order: any = await Order.findOne({
      order_number: cleanOrderNumber,
    })
      .populate("user_id", "email name first_name last_name")
      .populate("has_active_return")
      .populate("return_status")
      .lean();

    if (!order) {
      return NextResponse.json(
        {
          error:
            "Order not found. Please check your order number and email address.",
        },
        { status: 404 }
      );
    }

    // 2. Verify email ownership against guest info or registered user account
    let emailMatches = false;

    // Check guest info email
    if (
      order.guest_info?.email &&
      order.guest_info.email.toLowerCase().trim() === cleanEmail
    ) {
      emailMatches = true;
    }

    // Check populated user_id email
    if (!emailMatches && order.user_id) {
      const userEmail = typeof order.user_id === "object" ? order.user_id.email : null;
      if (userEmail && userEmail.toLowerCase().trim() === cleanEmail) {
        emailMatches = true;
      } else {
        // Direct query fallback for user
        const accountUser: any = await (User as any).findById(order.user_id).lean();
        if (accountUser?.email && accountUser.email.toLowerCase().trim() === cleanEmail) {
          emailMatches = true;
        }
      }
    }

    if (!emailMatches) {
      return NextResponse.json(
        {
          error:
            "Order not found. Please check your order number and email address.",
        },
        { status: 404 }
      );
    }

    // 3. Format return flags
    order.has_active_return = !!order.has_active_return;
    if (order.has_active_return && order.return_status) {
      order.return_status = order.return_status.status || order.return_status;
    }

    const response = NextResponse.json({ order });

    // Attach guest session cookie if session_id is associated with the order
    if (order.session_id) {
      response.headers.set("Set-Cookie", createSessionCookie(order.session_id));
    }

    return response;
  } catch (error) {
    console.error("Order lookup failed:", error);
    return NextResponse.json(
      { error: "Failed to find order" },
      { status: 500 }
    );
  }
}
