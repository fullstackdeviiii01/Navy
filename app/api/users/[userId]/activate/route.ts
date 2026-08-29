// app/api/users/[userId]/activate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getIdTokenFromHeader, verifyIdToken } from "../../../../../lib/auth";
import connectDB from "../../../../../lib/db";
import User from "../../../../models/User";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    const token = getIdTokenFromHeader(request);
    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const decodedToken = await verifyIdToken(token);
    if (!decodedToken) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    await connectDB();

    const adminUser = await (User as any).findOne({ email: decodedToken.email });
    if (!adminUser || adminUser.role !== "admin") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const userToActivate = await (User as any).findById(userId);
    if (!userToActivate) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    userToActivate.is_active = true;
    await userToActivate.save();

    return NextResponse.json({
      success: true,
      message: "User activated successfully",
    });
  } catch (error) {
    console.error("User activate failed:", error);
    return NextResponse.json({ error: "Failed to activate user" }, { status: 500 });
  }
}
