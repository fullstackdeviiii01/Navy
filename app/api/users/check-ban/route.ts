// // app/api/users/check-ban/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../../lib/db";
import User from "../../../models/User";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    await connectDB();

    const user = await (User as any).findOne(
      { email: email.toLowerCase().trim() },
      { is_banned: 1, is_active: 1 }
    );

    if (!user) {
      return NextResponse.json({ is_banned: false, exists: false });
    }

    return NextResponse.json({
      is_banned: user.is_banned === true,
      is_active: user.is_active,
      exists: true,
    });
  } catch (error) {
    console.error("Ban check failed:", error);
    return NextResponse.json({ error: "Failed to check ban status" }, { status: 500 });
  }
}