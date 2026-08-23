// app/api/returns/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getIdTokenFromHeader, verifyIdToken } from "../../../lib/auth";
import { getSessionIdFromRequest } from "../../../lib/auth/session";
import connectDB from "../../../lib/db";
import Return from "../../models/Return";
import Order from "../../models/Order";
import User from "../../models/User";
import { EmailService } from "../../../lib/services/emailService";

// POST - Customer submits return request (No bank details at this stage)
export async function POST(request: NextRequest) {
  try {
    const token = getIdTokenFromHeader(request);
    let user = null;

    if (token) {
      const decodedToken = await verifyIdToken(token);
      if (decodedToken) {
        user = await (User as any).findOne({ email: decodedToken.email });
      }
    }

    await connectDB();

    const body = await request.json();
    const {
      order_id,
      items,
      return_reason,
      return_reason_details,
      media_urls,
    } = body;

    // Validate required fields
    if (!order_id || !items || !Array.isArray(items) || items.length === 0 || !return_reason) {
      return NextResponse.json(
        { error: "Missing required return parameters (order_id, items, return_reason)" },
        { status: 400 }
      );
    }

    // Find target order
    const order = await Order.findById(order_id);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Verify ownership
    if (user) {
      const orderUserMatch =
        order.user_id && order.user_id.toString() === user._id.toString();
      const orderEmailMatch =
        order.guest_info?.email &&
        order.guest_info.email.toLowerCase() === user.email.toLowerCase();

      if (!orderUserMatch && !orderEmailMatch && user.role !== "admin") {
        return NextResponse.json({ error: "Unauthorized - Order does not belong to you" }, { status: 403 });
      }
    } else {
      const sessionId = getSessionIdFromRequest(request);
      if (order.order_type !== "guest" || order.session_id !== sessionId) {
        return NextResponse.json({ error: "Unauthorized session for guest order" }, { status: 401 });
      }
    }

    // Verify order eligibility (must be delivered or shipped)
    const eligibleStatuses = ["delivered", "shipped"];
    if (!eligibleStatuses.includes(order.status)) {
      return NextResponse.json(
        { error: `Order status '${order.status}' is not eligible for return. Only delivered orders can be returned.` },
        { status: 400 }
      );
    }

    // Verify within 30-day window
    const daysSinceOrder = Math.floor(
      (Date.now() - new Date(order.placed_at).getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysSinceOrder > 30) {
      return NextResponse.json(
        { error: "The 30-day return policy window for this order has expired." },
        { status: 400 }
      );
    }

    // Check for existing active return
    const existingReturn = await (Return as any).findOne({
      order_id,
      status: { $in: ["pending", "approved", "refunded"] },
    });
    if (existingReturn) {
      return NextResponse.json(
        { error: "An active return request is already on file for this order." },
        { status: 400 }
      );
    }

    // Strictly validate that returned items belong to the order and quantities do not exceed order quantities
    const validatedItems: any[] = [];
    let calculatedRefundAmount = 0;

    for (const reqItem of items) {
      const matchedOrderItem = order.items.find((oi: any) => {
        const prodMatch = oi.product_id?.toString() === reqItem.product_id;
        return prodMatch;
      });

      if (!matchedOrderItem) {
        return NextResponse.json(
          { error: `Item '${reqItem.product_name || reqItem.product_id}' was not found in your original order.` },
          { status: 400 }
        );
      }

      const qty = parseInt(String(reqItem.quantity), 10);
      if (isNaN(qty) || qty < 1 || qty > matchedOrderItem.quantity) {
        return NextResponse.json(
          {
            error: `Invalid return quantity for '${matchedOrderItem.product_name}'. Max available quantity to return: ${matchedOrderItem.quantity}`,
          },
          { status: 400 }
        );
      }

      validatedItems.push({
        product_id: matchedOrderItem.product_id,
        product_name: matchedOrderItem.product_name,
        product_image: matchedOrderItem.product_image || reqItem.product_image,
        variant_attributes: matchedOrderItem.variant_attributes,
        quantity: qty,
        price: matchedOrderItem.price,
      });

      calculatedRefundAmount += matchedOrderItem.price * qty;
    }

    // Create the Return record in "pending" status (Bank details will be collected AFTER approval)
    const returnDoc = await Return.create({
      order_id: order._id,
      user_id: user ? user._id : null,
      guest_email: !user ? order.guest_info?.email : undefined,
      items: validatedItems,
      refund_amount: calculatedRefundAmount,
      return_reason,
      return_reason_details: return_reason_details || "",
      media_urls: Array.isArray(media_urls) ? media_urls : [],
      status: "pending",
      requested_at: new Date(),
    });

    // Update order with active return status
    order.return_status = "pending";
    order.has_active_return = true;
    await order.save();

    // Trigger confirmation email
    try {
      await EmailService.sendReturnRequestEmail(returnDoc, order);
    } catch (emailErr) {
      console.error("Return confirmation email error:", emailErr);
    }

    return NextResponse.json({
      success: true,
      message: "Return request submitted successfully. Our concierge team will review your claim.",
      return: returnDoc,
    });
  } catch (error: any) {
    console.error("Return submission error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to submit return request" },
      { status: 500 }
    );
  }
}

// GET - List user's returns
export async function GET(request: NextRequest) {
  try {
    const token = getIdTokenFromHeader(request);
    let user = null;

    if (token) {
      const decodedToken = await verifyIdToken(token);
      if (decodedToken) {
        user = await (User as any).findOne({ email: decodedToken.email });
      }
    }

    await connectDB();

    let query: any = {};
    if (user) {
      query = {
        $or: [{ user_id: user._id }, { guest_email: user.email.toLowerCase() }],
      };
    } else {
      const sessionId = getSessionIdFromRequest(request);
      if (!sessionId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const guestOrders = await Order.find({
        session_id: sessionId,
        order_type: "guest",
      }).select("_id");
      const orderIds = guestOrders.map((o) => o._id);
      query = { order_id: { $in: orderIds } };
    }

    const returns = await (Return as any)
      .find(query)
      .populate("order_id", "order_number placed_at pricing status")
      .sort({ created_at: -1 })
      .lean();

    return NextResponse.json({ returns });
  } catch (error: any) {
    console.error("Returns fetch error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch returns" },
      { status: 500 }
    );
  }
}
