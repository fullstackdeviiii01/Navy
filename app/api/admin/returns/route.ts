// app/api/admin/returns/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getIdTokenFromHeader, verifyIdToken } from "../../../../lib/auth";
import connectDB from "../../../../lib/db";
import Return from "../../../models/Return";
import Order from "../../../models/Order";
import User from "../../../models/User";

export async function GET(request: NextRequest) {
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

    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    const search = url.searchParams.get("search");
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = parseInt(url.searchParams.get("limit") || "15", 10);

    const filter: any = {};
    if (status && status !== "all") {
      filter.status = status;
    }

    if (search) {
      const searchRegex = new RegExp(search.trim(), "i");
      filter.$or = [
        { rma_number: searchRegex },
        { guest_email: searchRegex },
      ];
    }

    const skip = (page - 1) * limit;

    const [returns, totalCount, statsAgg] = await Promise.all([
      (Return as any)
        .find(filter)
        .populate("order_id", "order_number placed_at pricing status payment_status customer_notes")
        .populate("user_id", "name email phone")
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      (Return as any).countDocuments(filter),
      (Return as any).aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
            totalAmount: { $sum: "$refund_amount" },
          },
        },
      ]),
    ]);

    // Compute KPI metrics
    let pendingCount = 0;
    let approvedCount = 0;
    let rejectedCount = 0;
    let refundedCount = 0;
    let totalRefundedSum = 0;

    statsAgg.forEach((s: any) => {
      if (s._id === "pending") pendingCount = s.count;
      else if (s._id === "approved") approvedCount = s.count;
      else if (s._id === "rejected") rejectedCount = s.count;
      else if (s._id === "refunded") {
        refundedCount = s.count;
        totalRefundedSum = s.totalAmount || 0;
      }
    });

    const totalAll =
      pendingCount + approvedCount + rejectedCount + refundedCount;

    return NextResponse.json({
      returns,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit) || 1,
      },
      stats: {
        total: totalAll,
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount,
        refunded: refundedCount,
        totalRefundedAmount: totalRefundedSum,
      },
    });
  } catch (error: any) {
    console.error("Admin returns fetch error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch admin returns" },
      { status: 500 }
    );
  }
}
