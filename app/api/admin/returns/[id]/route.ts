// app/api/admin/returns/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getIdTokenFromHeader, verifyIdToken } from "../../../../../lib/auth";
import connectDB from "../../../../../lib/db";
import Return from "../../../../models/Return";
import Order from "../../../../models/Order";
import User from "../../../../models/User";

export async function GET(
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

    const returnDoc = await (Return as any)
      .findById(id)
      .populate(
        "order_id",
        "order_number placed_at pricing status payment_status shipping_address billing_address customer_notes items"
      )
      .populate("user_id", "name email phone")
      .populate("settlement.settled_by", "name email")
      .lean();

    if (!returnDoc) {
      return NextResponse.json({ error: "Return claim not found" }, { status: 404 });
    }

    return NextResponse.json({ return: returnDoc });
  } catch (error: any) {
    console.error("Admin return detail fetch error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch return detail" },
      { status: 500 }
    );
  }
}
