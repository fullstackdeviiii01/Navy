// app/api/orders/stats/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getIdTokenFromHeader, verifyIdToken } from "../../../../lib/firebase/auth";
import connectDB from "../../../../lib/db";
import Order from "../../../models/Order";
import User from "../../../models/User";

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

    const stats = await Order.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const statsObj: any = {
      total: 0,
      pending: 0,
      confirmed: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    };

    stats.forEach((stat: any) => {
      statsObj[stat._id] = stat.count;
      statsObj.total += stat.count;
    });

    return NextResponse.json({ stats: statsObj });
  } catch (error) {
    console.error("Stats fetch failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}