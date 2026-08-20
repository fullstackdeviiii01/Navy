// // app/api/orders/[id]/mark-paid/route.ts
// UPDATED — now issues invoice when COD payment is marked received
import { NextRequest, NextResponse } from "next/server";
import { getIdTokenFromHeader, verifyIdToken } from "../../../../../lib/firebase/auth";
import connectDB from "../../../../../lib/db";
import Order from "../../../../models/Order";
import Payment from "../../../../models/Payment";
import User from "../../../../models/User";
import { InvoiceService } from "../../../../../lib/services/invoiceService";

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

    const admin = await (User as any).findOne({ uid: decodedToken.uid });
    if (!admin || admin.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    const { id } = await params;

    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.payment_method !== "cod") {
      return NextResponse.json(
        { error: "Only COD orders can be manually marked as paid" },
        { status: 400 }
      );
    }

    if (order.status !== "delivered") {
      return NextResponse.json(
        { error: "Order must be delivered before marking as paid" },
        { status: 400 }
      );
    }

    if (order.payment_status === "paid") {
      return NextResponse.json(
        { error: "Order already marked as paid" },
        { status: 400 }
      );
    }

    // Update order
    order.payment_status = "paid";
    await order.save();

    // Update user stats
    if (order.user_id) {
      await (User as any).findByIdAndUpdate(order.user_id, {
        $inc: {
          order_count: 1,
          total_spent: order.pricing.total,
        },
        $set: { last_order_at: order.placed_at },
      });
    }

    // Update payment record
    await (Payment as any).findOneAndUpdate(
      { order_id: id },
      {
        status: "completed",
        completed_at: new Date(),
      }
    );

    // ── Issue invoice (COD payment now confirmed) ─────────────────────────
    try {
      await InvoiceService.issueForOrder(id);
    } catch (invoiceError) {
      // Non-fatal — log but don't fail the payment marking
      console.error("Failed to issue invoice after COD payment:", invoiceError);
    }

    return NextResponse.json({
      success: true,
      message: "Payment marked as received",
      order,
    });
  } catch (error) {
    console.error("Mark paid failed:", error);
    return NextResponse.json(
      { error: "Failed to mark payment as received" },
      { status: 500 }
    );
  }
}