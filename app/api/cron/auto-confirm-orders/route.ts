import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../../lib/db";
import Order from "../../../models/Order";

const NIGHT_START_HOUR = 22;
const NIGHT_END_HOUR = 6;
const AUTO_CONFIRM_DELAY_MINUTES = 30;

function isNightTime(date: Date): boolean {
  const hour = date.getHours();
  return hour >= NIGHT_START_HOUR || hour < NIGHT_END_HOUR;
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const cutoffTime = new Date(Date.now() - AUTO_CONFIRM_DELAY_MINUTES * 60 * 1000);

    const eligibleOrders = await Order.find({
      status: "pending",
      auto_confirm: false,
      placed_at: { $lte: cutoffTime },
    }).lean();

    let autoConfirmedCount = 0;

    for (const order of eligibleOrders) {
      if (isNightTime(order.placed_at)) {
        await Order.findByIdAndUpdate(order._id, {
          status: "confirmed",
          auto_confirm: true,
          confirmed_at: new Date(),
        });
        autoConfirmedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      eligibleOrders: eligibleOrders.length,
      autoConfirmed: autoConfirmedCount,
    });
  } catch (error) {
    console.error("Auto-confirm cron failed:", error);
    return NextResponse.json({ error: "Cron job failed" }, { status: 500 });
  }
}
