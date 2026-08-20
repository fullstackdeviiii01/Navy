// app/api/returns/admin/[id]/status/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getIdTokenFromHeader, verifyIdToken } from "../../../../../../lib/auth";
import connectDB from "../../../../../../lib/db";
import Return from "../../../../../models/Return";
import Order from "../../../../../models/Order";
import User from "../../../../../models/User";
import { EmailService } from "../../../../../../lib/services/emailService";

// PUT - Update return status (Admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log("🔵 [API DEBUG] === UPDATE RETURN STATUS ===");
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
    
    const body = await request.json();
    const { status, rejection_reason } = body;
    
    console.log(`🔵 [API DEBUG] New status: ${status}`);
    console.log(`🔵 [API DEBUG] Rejection reason: ${rejection_reason || "Not provided"}`);

    if (!status) {
      console.error("❌ [API DEBUG] Status is required");
      return NextResponse.json({ error: "Status is required" }, { status: 400 });
    }

    const validStatuses = ["approved", "rejected"];

    if (!validStatuses.includes(status)) {
      console.error(`❌ [API DEBUG] Invalid status: ${status}`);
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    console.log(`🔵 [API DEBUG] Finding return with ID: ${id}`);
    const returnRequest = await (Return as any).findById(id).populate("order_id");
    
    console.log(`🔵 [API DEBUG] Return found: ${!!returnRequest}`);
    if (!returnRequest) {
      console.error("❌ [API DEBUG] Return not found");
      return NextResponse.json({ error: "Return not found" }, { status: 404 });
    }

    console.log(`🔵 [API DEBUG] Current status: ${returnRequest.status}`);
    console.log(`🔵 [API DEBUG] RMA: ${returnRequest.rma_number}`);

    // Only allow status updates from pending
    if (returnRequest.status !== "pending") {
      console.error(`❌ [API DEBUG] Return is not in pending status: ${returnRequest.status}`);
      return NextResponse.json(
        { error: "Return has already been processed" },
        { status: 400 }
      );
    }

    // Update status
    const oldStatus = returnRequest.status;
    returnRequest.status = status;
    returnRequest.processed_by = admin._id;

    // Update timestamps
    if (status === "approved") {
      returnRequest.approved_at = new Date();
      returnRequest.refund_status = "pending";
      console.log("🔵 [API DEBUG] Set approved_at timestamp");
    } else if (status === "rejected") {
      returnRequest.rejected_at = new Date();
      if (rejection_reason) {
        returnRequest.rejection_reason = rejection_reason;
        console.log("🔵 [API DEBUG] Set rejection reason");
      } else {
        console.error("❌ [API DEBUG] Rejection reason required");
        return NextResponse.json(
          { error: "Rejection reason is required" },
          { status: 400 }
        );
      }
      console.log("🔵 [API DEBUG] Set rejected_at timestamp");
    }

    console.log("🔵 [API DEBUG] Saving return request...");
    await returnRequest.save();
    console.log("✅ [API DEBUG] Return request saved");

    // Update order with return status
    console.log("🔵 [API DEBUG] Updating order with return status...");
    const updateData: any = {
      return_status: status
    };
    
    // If rejected, clear has_active_return flag
    if (status === "rejected") {
      updateData.has_active_return = false;
    }
    
    await Order.findByIdAndUpdate(returnRequest.order_id, updateData);
    console.log("✅ [API DEBUG] Order updated with return status");

    // Send email notification
    console.log(`🔵 [API DEBUG] Status changed from ${oldStatus} to ${status}`);
    console.log("🔵 [API DEBUG] Attempting to send return status email...");
    try {
      await EmailService.sendReturnStatusUpdateEmail(returnRequest, status);
      console.log("✅ [API DEBUG] Return status email sent successfully");
    } catch (emailError) {
      console.error("❌ [API DEBUG] Failed to send return status email:", emailError);
    }

    return NextResponse.json({
      success: true,
      message: `Return ${status} successfully`,
      return: returnRequest,
    });
  } catch (error) {
    console.error("❌ [API DEBUG] Return status update failed:", error);
    return NextResponse.json(
      { error: "Failed to update return status" },
      { status: 500 }
    );
  }
}