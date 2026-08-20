// // app/api/orders/[id]/status/route.ts
// UPDATED — voids invoice when order is cancelled or refunded
import { NextRequest, NextResponse } from "next/server";
import { getIdTokenFromHeader, verifyIdToken } from "../../../../../lib/auth";
import connectDB from "../../../../../lib/db";
import Order from "../../../../models/Order";
import User from "../../../../models/User";
import Payment from "../../../../models/Payment";
import { EmailService } from "../../../../../lib/services/emailService";
import { InvoiceService } from "../../../../../lib/services/invoiceService";

export async function PUT(
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

    const user = await (User as any).findOne({ email: decodedToken.email });
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { status, tracking_number, carrier } = body;

    if (!status) {
      return NextResponse.json({ error: "Status is required" }, { status: 400 });
    }

    const validStatuses = [
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];

    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const order = await Order.findById(id).populate("user_id", "name email");
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const oldStatus = order.status;
    order.status = status;

    if (status === "confirmed" && !order.confirmed_at) {
      order.confirmed_at = new Date();
    } else if (status === "shipped" && !order.shipped_at) {
      order.shipped_at = new Date();
      if (tracking_number) order.tracking_number = tracking_number;
      if (carrier) order.carrier = carrier;
    } else if (status === "delivered" && !order.delivered_at) {
      order.delivered_at = new Date();
    } else if (status === "cancelled" && !order.cancelled_at) {
      order.cancelled_at = new Date();
    }

    await order.save();

    // Update payment record
    const paymentUpdate: any = {};

    if (status === "cancelled") {
      paymentUpdate.status = "cancelled";
    } else if (status === "delivered" && order.payment_method !== "cod") {
      paymentUpdate.status = "completed";
      paymentUpdate.completed_at = new Date();
    }

    if (Object.keys(paymentUpdate).length > 0) {
      await (Payment as any).findOneAndUpdate({ order_id: id }, paymentUpdate);
    }

    // ── Invoice lifecycle ────────────────────────────────────────────────────
    if (oldStatus !== status) {
      try {
        if (status === "cancelled" || status === "refunded") {
          // Void the invoice
          await InvoiceService.voidForOrder(id);
        }
      } catch (invoiceError) {
        console.error("Invoice lifecycle update failed:", invoiceError);
      }
    }

    // Send email notification
    if (oldStatus !== status) {
      try {
        await EmailService.sendOrderStatusUpdateEmail(order, status);
      } catch (emailError) {
        console.error("Failed to send status update email:", emailError);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    console.error("Order status update failed:", error);
    return NextResponse.json(
      { error: "Failed to update order status" },
      { status: 500 }
    );
  }
}