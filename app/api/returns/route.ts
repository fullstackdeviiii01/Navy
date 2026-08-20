// app/api/returns/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getIdTokenFromHeader, verifyIdToken } from "../../../lib/auth";
import { getSessionIdFromRequest } from "../../../lib/auth/session";
import connectDB from "../../../lib/db";
import Return from "../../models/Return";
import Order from "../../models/Order";
import User from "../../models/User";
import { EmailService } from "../../../lib/services/emailService";

// POST - Create return request (User/Guest)
export async function POST(request: NextRequest) {
  console.log("🔵 [API DEBUG] === CREATE RETURN REQUEST ===");
  try {
    const token = getIdTokenFromHeader(request);
    let user = null;

    if (token) {
      const decodedToken = await verifyIdToken(token);
      if (decodedToken) {
        user = await (User as any).findOne({ uid: decodedToken.uid });
      }
    }

    await connectDB();
    console.log("✅ [API DEBUG] Database connected");

    const body = await request.json();
    const {
      order_id,
      items,
      return_reason,
      return_reason_details,
      bank_transfer_details,
    } = body;

    console.log(`🔵 [API DEBUG] Order ID: ${order_id}`);
    console.log(`🔵 [API DEBUG] Items count: ${items?.length || 0}`);
    console.log(`🔵 [API DEBUG] Return reason: ${return_reason}`);
    console.log(`🔵 [API DEBUG] Has bank details: ${!!bank_transfer_details}`);

    // Validate required fields
    if (!order_id || !items || items.length === 0 || !return_reason) {
      console.error("❌ [API DEBUG] Missing required fields");
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Find order
    const order = await Order.findById(order_id);
    console.log(`🔵 [API DEBUG] Order found: ${!!order}`);

    if (!order) {
      console.error("❌ [API DEBUG] Order not found");
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Verify ownership
    if (user) {
      if (
        order.order_type === "registered" &&
        (!order.user_id ||
          order.user_id.toString() !== user._id.toString())
      ) {
        console.error("❌ [API DEBUG] Order does not belong to user");
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }
    } else {
      // Guest user - verify session
      const sessionId = getSessionIdFromRequest(request);
      if (order.order_type !== "guest" || order.session_id !== sessionId) {
        console.error("❌ [API DEBUG] Guest order ownership mismatch");
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }
    }

    console.log(`🔵 [API DEBUG] Order ownership verified`);

    // Check if order is eligible for return
    const eligibleStatuses = ["delivered", "shipped"];
    if (!eligibleStatuses.includes(order.status)) {
      console.error(
        `❌ [API DEBUG] Order status not eligible: ${order.status}`
      );
      return NextResponse.json(
        { error: "Order is not eligible for return" },
        { status: 400 }
      );
    }

    // Check if within return window (30 days)
    const daysSinceOrder = Math.floor(
      (Date.now() - new Date(order.placed_at).getTime()) /
        (1000 * 60 * 60 * 24)
    );

    console.log(`🔵 [API DEBUG] Days since order: ${daysSinceOrder}`);

    if (daysSinceOrder > 30) {
      console.error("❌ [API DEBUG] Return window expired");
      return NextResponse.json(
        { error: "Return window has expired (30 days)" },
        { status: 400 }
      );
    }

    // Check for existing return
    const existingReturn = await (Return as any).findOne({
      order_id,
      status: { $nin: ["rejected"] },
    });

    if (existingReturn) {
      console.error("❌ [API DEBUG] Return already exists");
      return NextResponse.json(
        { error: "A return request already exists for this order" },
        { status: 400 }
      );
    }

    // Validate return items against order items and compute refund amount server-side
    const validatedItems: any[] = [];
    let refundAmount = 0;

    for (const requestItem of items) {
      const orderItem = order.items.find((oi: any) => {
        const productMatch = oi.product_id?.toString() === requestItem.product_id;
        const variantMatch = requestItem.variant_id
          ? oi.variant_id?.toString() === requestItem.variant_id
          : !oi.variant_id;
        return productMatch && variantMatch;
      });

      if (!orderItem) {
        return NextResponse.json(
          { error: `Item "${requestItem.product_name || requestItem.product_id}" is not part of this order` },
          { status: 400 }
        );
      }

      const qty = parseInt(String(requestItem.quantity), 10);
      if (isNaN(qty) || qty < 1 || qty > orderItem.quantity) {
        return NextResponse.json(
          { error: `Invalid quantity for "${orderItem.product_name}". Max returnable quantity: ${orderItem.quantity}` },
          { status: 400 }
        );
      }

      validatedItems.push({ ...requestItem, price: orderItem.price, quantity: qty });
      refundAmount += orderItem.price * qty;
    }

    console.log(
      `🔵 [API DEBUG] Validated refund amount: $${refundAmount.toFixed(2)}`
    );

    // ─── Determine refund method ──────────────────────────────────────────────
    // All orders use bank_transfer for refunds (only COD and Bank Transfer gateways remain)
    const refundMethod: "bank_transfer" = "bank_transfer";
    console.log(`🔵 [API DEBUG] Resolved refund method: ${refundMethod}`);
    // ─────────────────────────────────────────────────────────────────────────

    // Validate bank transfer details ONLY for COD orders
    if (refundMethod === "bank_transfer") {
      if (
        !bank_transfer_details ||
        !bank_transfer_details.account_holder_name ||
        !bank_transfer_details.account_number ||
        !bank_transfer_details.bank_name
      ) {
        console.error(
          "❌ [API DEBUG] Bank transfer details missing for COD order"
        );
        return NextResponse.json(
          {
            error:
              "Bank account details are required for Cash on Delivery order refunds",
          },
          { status: 400 }
        );
      }
    }

    // Create return request
    const returnData: any = {
      order_id,
      items: validatedItems,
      return_reason,
      return_reason_details,
      refund_amount: refundAmount,
      refund_method: refundMethod,
      refund_status: "pending",
    };

    if (user) {
      returnData.user_id = user._id;
    } else {
      returnData.guest_email = order.guest_info?.email;
    }

    if (refundMethod === "bank_transfer" && bank_transfer_details) {
      returnData.bank_transfer_details = bank_transfer_details;
    }

    console.log("🔵 [API DEBUG] Creating return request...");
    const returnRequest = await Return.create(returnData);
    console.log(`✅ [API DEBUG] Return created: ${returnRequest.rma_number}`);

    // Send email notification
    console.log("🔵 [API DEBUG] Sending email notification...");
    try {
      await EmailService.sendReturnRequestEmail(returnRequest, order);
      console.log("✅ [API DEBUG] Email sent successfully");
    } catch (emailError) {
      console.error("❌ [API DEBUG] Failed to send email:", emailError);
    }

    return NextResponse.json({
      success: true,
      message: "Return request submitted successfully",
      return: returnRequest,
    });
  } catch (error) {
    console.error("❌ [API DEBUG] Return creation failed:", error);
    return NextResponse.json(
      { error: "Failed to submit return request" },
      { status: 500 }
    );
  }
}

// GET - Get user's returns (User/Guest)
export async function GET(request: NextRequest) {
  try {
    const token = getIdTokenFromHeader(request);
    let user = null;

    if (token) {
      const decodedToken = await verifyIdToken(token);
      if (decodedToken) {
        user = await (User as any).findOne({ uid: decodedToken.uid });
      }
    }

    await connectDB();

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    let query: any = {};

    if (user) {
      query.user_id = user._id;
    } else {
      const sessionId = getSessionIdFromRequest(request);
      if (!sessionId) {
        return NextResponse.json(
          { error: "No session found" },
          { status: 401 }
        );
      }

      const orders = await Order.find({ session_id: sessionId }).select("_id");
      const orderIds = orders.map((o) => o._id);
      query.order_id = { $in: orderIds };
    }

    const returns = await Return.find(query)
      .populate("order_id", "order_number placed_at pricing")
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Return.countDocuments(query);

    return NextResponse.json({
      returns,
      pagination: {
        total,
        page,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Returns fetch failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch returns" },
      { status: 500 }
    );
  }
}