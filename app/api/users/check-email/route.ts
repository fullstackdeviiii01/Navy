// app/api/users/check-email/route.ts - NEW FILE
import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../../lib/db";
import User from "../../../models/User";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await (User as any).findOne({ email: email.toLowerCase() });

    return NextResponse.json({
      exists: !!user,
    });
  } catch (error) {
    console.error("Email check failed:", error);
    return NextResponse.json(
      { error: "Failed to check email" },
      { status: 500 }
    );
  }
}