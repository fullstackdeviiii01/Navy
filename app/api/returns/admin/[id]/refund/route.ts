// app/api/returns/admin/[id]/refund/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getIdTokenFromHeader, verifyIdToken } from "../../../../../../lib/auth";
import connectDB from "../../../../../../lib/db";
import Return from "../../../../../models/Return";
import Order from "../../../../../models/Order";
import User from "../../../../../models/User";
import { RefundService } from "../../../../../../lib/services/refundService";
import { EmailService } from "../../../../../../lib/services/emailService";
import { Types } from "mongoose";

// POST - Process refund (Admin only)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log("🔵 [API DEBUG] === PROCESS REFUND ===");
  try {
    const token = getIdTokenFromHeader(request);
    if (!token) {
      console.error("❌ [API DEBUG] No token provided");
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const decodedToken = await verifyIdToken(token);
    if (!decodedToken) {
      console.error("❌ [API DEBUG] Invalid token");
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    await connectDB();
    console.log("✅ [API DEBUG] Database connected");

    const admin = await (User as any).findOne({ uid: decodedToken.uid });
    if (!admin || admin.role !== "admin") {
      console.error("❌ [API DEBUG] Unauthorized - Admin access required");
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    const { id } = await params;
    console.log(`🔵 [API DEBUG] Return ID: ${id}`);

    const returnRequest = await (Return as any).findById(id).populate("order_id");
    console.log(`🔵 [API DEBUG] Return found: ${!!returnRequest}`);
    
    if (!returnRequest) {
      console.error("❌ [API DEBUG] Return not found");
      return NextResponse.json({ error: "Return not found" }, { status: 404 });
    }

    console.log(`🔵 [API DEBUG] RMA: ${returnRequest.rma_number}`);
    console.log(`🔵 [API DEBUG] Current status: ${returnRequest.status}`);
    
    // Get order details safely
    let orderNumber = "Unknown";
    let orderCurrency = "USD";
    let orderId: string | Types.ObjectId = returnRequest.order_id;
    
    if (returnRequest.order_id) {
      if (typeof returnRequest.order_id === 'object' && returnRequest.order_id.order_number) {
        orderNumber = returnRequest.order_id.order_number;
        orderCurrency = returnRequest.order_id.pricing?.currency || "USD";
        orderId = returnRequest.order_id._id;
      } else if (returnRequest.order_id && returnRequest.order_id.toString) {
        orderNumber = `ObjectId(${returnRequest.order_id.toString()})`;
        orderId = returnRequest.order_id;
      }
    }
    
    console.log(`🔵 [API DEBUG] Order: ${orderNumber}`);
    console.log(`🔵 [API DEBUG] Refund amount: $${returnRequest.refund_amount.toFixed(2)}`);
    console.log(`🔵 [API DEBUG] Refund method: ${returnRequest.refund_method}`);

    // Check if return is approved
    if (returnRequest.status !== "approved") {
      console.error(`❌ [API DEBUG] Return must be approved first, current: ${returnRequest.status}`);
      return NextResponse.json(
        { error: "Return must be approved before processing refund" },
        { status: 400 }
      );
    }

    // Check if refund already processed
    if (returnRequest.refund_status === "completed") {
      console.error("❌ [API DEBUG] Refund already processed");
      return NextResponse.json(
        { error: "Refund already processed" },
        { status: 400 }
      );
    }

    // Process refund through payment gateway
    console.log("🔵 [API DEBUG] Processing refund through payment gateway...");
    const refundResult = await RefundService.processRefund(
      orderId.toString(),
      returnRequest._id.toString(),
      returnRequest.refund_amount,
      orderCurrency,
      returnRequest.return_reason,
      returnRequest.rma_number,
      admin._id.toString()
    );

    console.log(`🔵 [API DEBUG] Refund result: ${refundResult.success}`);
    if (!refundResult.success) {
      console.error(`❌ [API DEBUG] Refund processing failed: ${refundResult.error}`);
      return NextResponse.json(
        { error: refundResult.error || "Refund processing failed" },
        { status: 500 }
      );
    }

    console.log("✅ [API DEBUG] Refund processed successfully");
    
    // Update return status
    if (returnRequest.refund_method === "bank_transfer") {
      // For COD/Bank Transfer, mark as processing (admin will complete manually)
      returnRequest.refund_status = "processing";
      returnRequest.status = "approved"; // Keep as approved until admin confirms transfer
      console.log("🔵 [API DEBUG] Marked as processing (requires manual bank transfer)");
      
      // Update order
      console.log("🔵 [API DEBUG] Updating order with processing status...");
      await Order.findByIdAndUpdate(returnRequest.order_id, {
        return_status: "approved"
      });
    } else {
      // For Stripe/PayPal, mark as completed immediately
      returnRequest.refund_status = "completed";
      returnRequest.status = "refunded";
      returnRequest.refunded_at = new Date();
      console.log("🔵 [API DEBUG] Marked as completed (automatic refund)");
      
      // Update order
      console.log("🔵 [API DEBUG] Updating order with refunded status...");
      await Order.findByIdAndUpdate(returnRequest.order_id, {
        status: "refunded",
        payment_status: "refunded",
        return_status: "refunded"
      });
      console.log("✅ [API DEBUG] Order updated to refunded");
    }
    
    console.log("🔵 [API DEBUG] Saving updated return request...");
    await returnRequest.save();
    console.log("✅ [API DEBUG] Return request saved");

    // Get the order document for email
    let orderForEmail: any = null;
    if (returnRequest.order_id && typeof returnRequest.order_id === 'object' && returnRequest.order_id.order_number) {
      orderForEmail = returnRequest.order_id;
    } else {
      orderForEmail = await Order.findById(returnRequest.order_id);
    }

    // Send refund confirmation email
    console.log("🔵 [API DEBUG] Attempting to send refund confirmation email...");
    try {
      if (orderForEmail) {
        await EmailService.sendRefundConfirmationEmail(returnRequest, orderForEmail);
        console.log("✅ [API DEBUG] Refund confirmation email sent successfully");
      } else {
        console.error("❌ [API DEBUG] Cannot send email: Order not found for return");
      }
    } catch (emailError) {
      console.error("❌ [API DEBUG] Failed to send refund confirmation email:", emailError);
    }

    const message = returnRequest.refund_method === "bank_transfer" 
      ? "Refund marked as processing. Please complete the bank transfer manually."
      : "Refund processed successfully";

    return NextResponse.json({
      success: true,
      message,
      return: returnRequest,
      refund: refundResult.refund,
      requiresManualTransfer: returnRequest.refund_method === "bank_transfer",
    });
  } catch (error) {
    console.error("❌ [API DEBUG] Refund processing failed:", error);
    return NextResponse.json(
      { error: "Failed to process refund" },
      { status: 500 }
    );
  }
}