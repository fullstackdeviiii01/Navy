// app/api/orders/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getIdTokenFromHeader, verifyIdToken } from "../../../lib/auth";
import connectDB from "../../../lib/db";
import Order from "../../models/Order";
import User from "../../models/User";
import { getSessionIdFromRequest } from "../../../lib/auth/session";

export async function GET(request: NextRequest) {
  try {
    const token = getIdTokenFromHeader(request);

    await connectDB();

    const url = new URL(request.url);
    const isAdmin = url.searchParams.get("admin") === "true";

    let user = null;
    if (token) {
      const decodedToken = await verifyIdToken(token);
      if (decodedToken) {
        user = await (User as any).findOne({ email: decodedToken.email });
      }
    }

    // Admin orders
    if (isAdmin) {
      if (!user || user.role !== "admin") {
        return NextResponse.json(
          { error: "Unauthorized - Admin access required" },
          { status: 403 },
        );
      }

      const page = parseInt(url.searchParams.get("page") || "1");
      const limit = parseInt(url.searchParams.get("limit") || "10");
      const status = url.searchParams.get("status");
      const payment_status = url.searchParams.get("payment_status");
      const search = url.searchParams.get("search");

      const query: any = {};

      if (status && status !== "all") {
        query.status = status;
      }

      if (payment_status && payment_status !== "all") {
        query.payment_status = payment_status;
      }

      if (search) {
        query.$or = [
          { order_number: { $regex: search, $options: "i" } },
          { "guest_info.email": { $regex: search, $options: "i" } },
          { "guest_info.name": { $regex: search, $options: "i" } },
        ];
      }

      const skip = (page - 1) * limit;

      const [orders, total] = await Promise.all([
        Order.find(query)
          .populate("user_id", "name email customer_since order_count")
          .sort({ placed_at: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Order.countDocuments(query),
      ]);

      return NextResponse.json({
        orders,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      });
    }

    // User orders or guest orders
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const status = url.searchParams.get("status");

    let query: any;

    if (user) {
      // Authenticated user - get their orders
      query = { user_id: user._id };
    } else {
      // Guest user - get orders by session_id
      const sessionId = getSessionIdFromRequest(request);
      if (!sessionId) {
        return NextResponse.json(
          { error: "No session or authentication found" },
          { status: 401 },
        );
      }
      query = { session_id: sessionId, order_type: "guest" };
    }

    if (status && status !== "all") {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find(query).sort({ placed_at: -1 }).skip(skip).limit(limit).lean(),
      Order.countDocuments(query),
    ]);

    return NextResponse.json({
      orders,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Orders fetch failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 },
    );
  }
}
