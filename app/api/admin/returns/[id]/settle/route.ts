// app/api/admin/returns/[id]/settle/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getIdTokenFromHeader, verifyIdToken } from "../../../../../../lib/auth";
import connectDB from "../../../../../../lib/db";
import Return from "../../../../../models/Return";
import Order from "../../../../../models/Order";
import User from "../../../../../models/User";
import { EmailService } from "../../../../../../lib/services/emailService";

export async function POST(
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
    const { transaction_reference, proof_url, admin_notes } = body;

    if (!transaction_reference || !transaction_reference.trim()) {
      return NextResponse.json(
        { error: "Transaction / Reference ID is required to confirm refund payout disbursement" },
        { status: 400 }
      );
    }

    const returnDoc = await Return.findById(id).populate("order_id");
    if (!returnDoc) {
      return NextResponse.json({ error: "Return claim not found" }, { status: 404 });
    }

    // STRICT CHECK: Must be approved before refunding
    if (returnDoc.status !== "approved") {
      return NextResponse.json(
        { error: `Return claim must be 'approved' before settling refund. Current status: '${returnDoc.status}'` },
        { status: 400 }
      );
    }

    // Check if customer submitted payout details
    if (!returnDoc.payout_details || !returnDoc.payout_details.account_number) {
      return NextResponse.json(
        { error: "Customer has not submitted payout bank/wallet details yet." },
        { status: 400 }
      );
    }

    // Update return record with settlement details
    returnDoc.status = "refunded";
    returnDoc.refunded_at = new Date();
    returnDoc.settlement = {
      transaction_reference: transaction_reference.trim(),
      proof_url: proof_url || undefined,
      settled_at: new Date(),
      settled_by: adminUser._id,
      admin_notes: admin_notes || undefined,
    };

    await returnDoc.save();

    // Update the associated order status to refunded
    const updatedOrder = await Order.findByIdAndUpdate(
      returnDoc.order_id,
      {
        status: "refunded",
        payment_status: "refunded",
        return_status: "refunded",
        has_active_return: false,
      },
      { new: true }
    );

    // Send confirmation email to customer
    try {
      if (updatedOrder) {
        await EmailService.sendRefundConfirmationEmail(returnDoc, updatedOrder);
      }
    } catch (emailErr) {
      console.error("Refund confirmation email error:", emailErr);
    }

    return NextResponse.json({
      success: true,
      message: "Refund payout successfully recorded and order marked as refunded",
      return: returnDoc,
      order: updatedOrder,
    });
  } catch (error: any) {
    console.error("Admin refund settlement error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to settle refund" },
      { status: 500 }
    );
  }
}
