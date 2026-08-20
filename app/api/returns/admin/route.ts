// app/api/returns/admin/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getIdTokenFromHeader, verifyIdToken } from "../../../../lib/firebase/auth";
import connectDB from "../../../../lib/db";
import Return from "../../../models/Return";
import Order from "../../../models/Order";
import User from "../../../models/User";

// GET - Get all returns (admin)
export async function GET(request: NextRequest) {
  try {
    const token = getIdTokenFromHeader(request);
    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const decodedToken = await verifyIdToken(token);
    if (!decodedToken) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    await connectDB();

    const user = await (User as any).findOne({ uid: decodedToken.uid });
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const status = url.searchParams.get("status");
    const search = url.searchParams.get("search");

    const skip = (page - 1) * limit;

    // Build query
    const query: any = {};

    if (status && status !== "all") {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { rma_number: { $regex: search, $options: "i" } },
        { guest_email: { $regex: search, $options: "i" } },
      ];
    }

    const returns = await Return.find(query)
      .populate("order_id", "order_number placed_at pricing")
      .populate("user_id", "name email")
      .populate("processed_by", "name")
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Return.countDocuments(query);

    // Get stats
    const stats = {
  total: await Return.countDocuments(),
  pending: await Return.countDocuments({ status: "pending" }),
  approved: await Return.countDocuments({ status: "approved" }),
  rejected: await Return.countDocuments({ status: "rejected" }),
  refunded: await Return.countDocuments({ status: "refunded" }),
};

    return NextResponse.json({
      returns,
      stats,
      pagination: {
        total,
        page,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Admin returns fetch failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch returns" },
      { status: 500 }
    );
  }
}