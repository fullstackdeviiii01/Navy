// app/api/admin/returns/[id]/status/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getIdTokenFromHeader, verifyIdToken } from "../../../../../../lib/auth";
import connectDB from "../../../../../../lib/db";
import Return from "../../../../../models/Return";
import Order from "../../../../../models/Order";
import User from "../../../../../models/User";
import { EmailService } from "../../../../../../lib/services/emailService";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = getIdTokenFromHeader(request);
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decodedToken = await verifyIdToken(token);
    if (!decodedToken) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    await connectDB();

    const adminUser = await (User as any).findOne({ email: decodedToken.email });
    if (!adminUser || adminUser.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { status, rejection_reason } = body;

    if (!status || !["approved", "rejected"].includes(status)) {
      return NextResponse.json(
        { error: "Valid status ('approved' or 'rejected') is required" },
        { status: 400 }
      );
    }

    if (status === "rejected" && (!rejection_reason || !rejection_reason.trim())) {
      return NextResponse.json(
        { error: "A clear rejection reason is required when declining a return claim" },
        { status: 400 }
      );
    }

    const returnDoc = await Return.findById(id).populate("order_id");
    if (!returnDoc) {
      return NextResponse.json({ error: "Return claim not found" }, { status: 404 });
    }

    if (returnDoc.status !== "pending") {
      return NextResponse.json(
        { error: `Return claim is already processed with status: '${returnDoc.status}'` },
        { status: 400 }
      );
    }

    // Update status
    returnDoc.status = status;
    returnDoc.reviewed_at = new Date();

    if (status === "rejected") {
      returnDoc.rejection_reason = rejection_reason.trim();
      // Clear active return flag on order
      await Order.findByIdAndUpdate(returnDoc.order_id, {
        return_status: "rejected",
        has_active_return: false,
      });
    } else if (status === "approved") {
      await Order.findByIdAndUpdate(returnDoc.order_id, {
        return_status: "approved",
      });
    }

    await returnDoc.save();

    // Trigger email notification
    try {
      await EmailService.sendReturnStatusUpdateEmail(returnDoc, status);
    } catch (emailErr) {
      console.error("Return status update email error:", emailErr);
    }

    return NextResponse.json({
      success: true,
      message: `Return claim successfully marked as ${status}`,
      return: returnDoc,
    });
  } catch (error: any) {
    console.error("Admin return status update error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update return status" },
      { status: 500 }
    );
  }
}
