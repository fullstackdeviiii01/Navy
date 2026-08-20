// app/api/users/guests/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getIdTokenFromHeader, verifyIdToken } from "../../../../lib/auth";
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

    // Check if user is admin
    const adminUser = await (User as any).findOne({ uid: decodedToken.uid });
    if (!adminUser || adminUser.role !== "admin") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Aggregate guest orders to create virtual guest customers
    const guests = await Order.aggregate([
      { $match: { order_type: "guest" } },
      {
        $group: {
          _id: "$guest_info.email",
          email: { $first: "$guest_info.email" },
          name: { $first: "$guest_info.name" },
          phone: { $first: "$guest_info.phone" },
          order_count: { $sum: 1 },
          total_spent: { $sum: "$pricing.total" },
          customer_since: { $min: "$placed_at" },
          last_order_at: { $max: "$placed_at" },
          last_login_at: { $max: "$placed_at" },
        },
      },
      { $sort: { customer_since: -1 } },
    ]);

    // Format to match User schema structure
    const formattedGuests = guests.map((g) => ({
      _id: `guest-${g._id}`,
      uid: `guest-${g._id}`,
      email: g.email,
      name: g.name || "Guest User",
      phone: g.phone || "",
      role: "guest",
      is_active: true,
      is_banned: false,
      order_count: g.order_count,
      total_spent: g.total_spent,
      customer_since: g.customer_since,
      last_order_at: g.last_order_at,
      last_login_at: g.last_login_at,
      cart: [],
      wishlist: [],
      addresses: [],
      // Flag to identify guest users
      isGuest: true,
    }));

    return NextResponse.json({ guests: formattedGuests });
  } catch (error) {
    console.error("Guest customers fetch failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch guest customers" },
      { status: 500 }
    );
  }
}