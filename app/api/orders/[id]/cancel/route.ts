
// app/api/orders/[id]/cancel/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getIdTokenFromHeader, verifyIdToken } from "../../../../../lib/firebase/auth";
import connectDB from "../../../../../lib/db";
import Order from "../../../../models/Order";
import User from "../../../../models/User";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = getIdTokenFromHeader(request);
    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const decodedToken = await verifyIdToken(token);
    if (!decodedToken) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    await connectDB();

    const user = await (User as any).findOne({ uid: decodedToken.uid });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { id } = await params;

    const order = await Order.findOne({ _id: id, user_id: user._id });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (!["pending", "confirmed"].includes(order.status)) {
      return NextResponse.json(
        { error: "Order cannot be cancelled" },
        { status: 400 }
      );
    }

    order.status = "cancelled";
    order.cancelled_at = new Date();
    await order.save();

    return NextResponse.json({
      success: true,
      message: "Order cancelled successfully",
      order,
    });
  } catch (error) {
    console.error("Order cancellation failed:", error);
    return NextResponse.json(
      { error: "Failed to cancel order" },
      { status: 500 }
    );
  }
}
