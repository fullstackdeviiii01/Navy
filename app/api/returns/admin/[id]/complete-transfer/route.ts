// // app/api/returns/admin/[id]/complete-transfer/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getIdTokenFromHeader, verifyIdToken } from "../../../../../../lib/auth";
import connectDB from "../../../../../../lib/db";
import Return from "../../../../../models/Return";
import Order from "../../../../../models/Order";
import User from "../../../../../models/User";
import Refund from "../../../../../models/Refund";

// POST - Mark bank transfer as completed (Admin only)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log("🔵 [API DEBUG] === COMPLETE BANK TRANSFER ===");
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

    const admin = await (User as any).findOne({ email: decodedToken.email });
    if (!admin || admin.role !== "admin") {
      console.error("❌ [API DEBUG] Unauthorized - Admin access required");
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    const { id } = await params;
    console.log(`🔵 [API DEBUG] Return ID: ${id}`);

    const returnRequest = await (Return as any).findById(id);
    
    if (!returnRequest) {
      console.error("❌ [API DEBUG] Return not found");
      return NextResponse.json({ error: "Return not found" }, { status: 404 });
    }

    console.log(`🔵 [API DEBUG] RMA: ${returnRequest.rma_number}`);
    console.log(`🔵 [API DEBUG] Refund method: ${returnRequest.refund_method}`);
    console.log(`🔵 [API DEBUG] Refund status: ${returnRequest.refund_status}`);

    // Verify this is a bank transfer
    if (returnRequest.refund_method !== "bank_transfer") {
      console.error("❌ [API DEBUG] Not a bank transfer refund");
      return NextResponse.json(
        { error: "This is not a bank transfer refund" },
        { status: 400 }
      );
    }

    // Verify refund is in processing state
    if (returnRequest.refund_status !== "processing") {
      console.error(`❌ [API DEBUG] Refund not in processing state: ${returnRequest.refund_status}`);
      return NextResponse.json(
        { error: "Refund is not in processing state" },
        { status: 400 }
      );
    }

    // Update return to completed
    returnRequest.refund_status = "completed";
    returnRequest.status = "refunded";
    returnRequest.refunded_at = new Date();
    
    console.log("🔵 [API DEBUG] Saving updated return request...");
    await returnRequest.save();
    console.log("✅ [API DEBUG] Return marked as refunded");

    // Update associated refund record
    const refund = await (Refund as any).findOne({ return_id: returnRequest._id });
    if (refund) {
      refund.status = "completed";
      refund.completed_at = new Date();
      if (refund.metadata) {
        refund.metadata.set("completed_by", admin._id.toString());
        refund.metadata.set("completion_notes", "Bank transfer completed manually by admin");
      }
      await refund.save();
      console.log("✅ [API DEBUG] Refund record updated");
    }

    // Update order status
    console.log("🔵 [API DEBUG] Updating order with refunded status...");
    const order = await Order.findByIdAndUpdate(
      returnRequest.order_id,
      {
        status: "refunded",
        payment_status: "refunded",
        return_status: "refunded"
      },
      { new: true }
    );
    
    if (order) {
      console.log("✅ [API DEBUG] Order status updated to refunded");
    } else {
      console.error("❌ [API DEBUG] Order not found for update");
    }

    return NextResponse.json({
      success: true,
      message: "Bank transfer marked as completed successfully",
      return: returnRequest,
    });
  } catch (error) {
    console.error("❌ [API DEBUG] Complete bank transfer failed:", error);
    return NextResponse.json(
      { error: "Failed to complete bank transfer" },
      { status: 500 }
    );
  }
}