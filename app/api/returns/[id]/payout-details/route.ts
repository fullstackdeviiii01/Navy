// app/api/returns/[id]/payout-details/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getIdTokenFromHeader, verifyIdToken } from "../../../../../lib/auth";
import { getSessionIdFromRequest } from "../../../../../lib/auth/session";
import connectDB from "../../../../../lib/db";
import Return from "../../../../models/Return";
import Order from "../../../../models/Order";
import User from "../../../../models/User";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = getIdTokenFromHeader(request);
    let user = null;

    if (token) {
      const decodedToken = await verifyIdToken(token);
      if (decodedToken) {
        user = await (User as any).findOne({ email: decodedToken.email });
      }
    }

    await connectDB();

    const returnDoc = await Return.findById(id);
    if (!returnDoc) {
      return NextResponse.json({ error: "Return claim not found" }, { status: 404 });
    }

    // Check ownership
    const order = await Order.findById(returnDoc.order_id);
    if (!order) {
      return NextResponse.json({ error: "Associated order not found" }, { status: 404 });
    }

    if (user) {
      const isOwner =
        (returnDoc.user_id &&
          returnDoc.user_id.toString() === user._id.toString()) ||
        (order.user_id && order.user_id.toString() === user._id.toString()) ||
        (returnDoc.guest_email &&
          returnDoc.guest_email.toLowerCase() === user.email.toLowerCase()) ||
        user.role === "admin";

      if (!isOwner) {
        return NextResponse.json({ error: "Unauthorized access to this return claim" }, { status: 403 });
      }
    } else {
      const sessionId = getSessionIdFromRequest(request);
      if (order.order_type !== "guest" || order.session_id !== sessionId) {
        return NextResponse.json({ error: "Unauthorized session for guest return" }, { status: 401 });
      }
    }

    // STRICT SECURITY GATE: Only APPROVED returns can receive payout details
    if (returnDoc.status !== "approved") {
      return NextResponse.json(
        {
          error: `Payout details can only be submitted for approved return claims. Current status: '${returnDoc.status}'.`,
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { method, account_title, account_number, bank_or_wallet_name } = body;

    if (!method || !account_title || !account_number || !bank_or_wallet_name) {
      return NextResponse.json(
        {
          error: "All payout fields (method, account title, account/IBAN number, bank/wallet name) are required.",
        },
        { status: 400 }
      );
    }

    const validMethods = ["bank_transfer", "jazzcash", "easypaisa"];
    if (!validMethods.includes(method)) {
      return NextResponse.json(
        { error: `Invalid payout method '${method}'. Must be one of: ${validMethods.join(", ")}` },
        { status: 400 }
      );
    }

    // Update return record with customer payout information
    returnDoc.payout_details = {
      method,
      account_title: account_title.trim(),
      account_number: account_number.trim(),
      bank_or_wallet_name: bank_or_wallet_name.trim(),
      submitted_at: new Date(),
    };

    await returnDoc.save();

    return NextResponse.json({
      success: true,
      message: "Refund payout details saved successfully. Payout will be processed once the returned package is received.",
      return: returnDoc,
    });
  } catch (error: any) {
    console.error("Payout details submission error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to submit payout details" },
      { status: 500 }
    );
  }
}
