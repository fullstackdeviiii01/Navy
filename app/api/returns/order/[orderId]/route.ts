// app/api/returns/order/[orderId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getIdTokenFromHeader, verifyIdToken } from "../../../../../lib/auth";
import { getSessionIdFromRequest } from "../../../../../lib/auth/session";
import connectDB from "../../../../../lib/db";
import Return from "../../../../models/Return";
import Order from "../../../../models/Order";
import User from "../../../../models/User";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const token = getIdTokenFromHeader(request);
    let user = null;

    if (token) {
      const decodedToken = await verifyIdToken(token);
      if (decodedToken) {
        user = await (User as any).findOne({ email: decodedToken.email });
      }
    }

    await connectDB();

    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Check ownership
    if (user) {
      const isOwner =
        (order.user_id && order.user_id.toString() === user._id.toString()) ||
        (order.guest_info?.email &&
          order.guest_info.email.toLowerCase() === user.email.toLowerCase()) ||
        user.role === "admin";
      if (!isOwner) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
    } else {
      const sessionId = getSessionIdFromRequest(request);
      if (order.order_type !== "guest" || order.session_id !== sessionId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const returnDoc = await (Return as any)
      .findOne({ order_id: orderId })
      .sort({ created_at: -1 })
      .lean();

    return NextResponse.json({ return: returnDoc || null });
  } catch (error: any) {
    console.error("Fetch return by order error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch return" },
      { status: 500 }
    );
  }
}
