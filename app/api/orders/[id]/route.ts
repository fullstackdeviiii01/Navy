// app/api/orders/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getIdTokenFromHeader, verifyIdToken } from "../../../../lib/auth";
import connectDB from "../../../../lib/db";
import Order from "../../../models/Order";
import User from "../../../models/User";
import { getSessionIdFromRequest } from "../../../../lib/auth/session";
import "../../../models/Return";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const token = getIdTokenFromHeader(request);

    await connectDB();

    let user = null;
    if (token) {
      const decodedToken = await verifyIdToken(token);
      if (decodedToken) {
        user = await (User as any).findOne({ email: decodedToken.email });
      }
    }

    const { id } = await params;
    const url = new URL(request.url);
    const isAdmin = url.searchParams.get("admin") === "true";

    let order;

    if (isAdmin && user && user.role === "admin") {
      order = await Order.findById(id)
        .populate(
          "user_id",
          "name email customer_since order_count total_spent",
        )
        .populate("has_active_return")
        .populate("return_status")
        .lean();
    } else if (user) {
      // Regular authenticated users can only view their own orders
      order = await Order.findOne({ _id: id, user_id: user._id }).lean();
    } else {
      // Guest users can view orders by session_id
      const sessionId = getSessionIdFromRequest(request);
      if (!sessionId) {
        return NextResponse.json(
          { error: "No session found" },
          { status: 401 },
        );
      }
      order = await Order.findOne({
        _id: id,
        session_id: sessionId,
        order_type: "guest",
      }).lean();
    }

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error("Order fetch failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 },
    );
  }
}
