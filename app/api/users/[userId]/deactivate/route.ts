// app/api/users/[userId]/deactivate/route.ts
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

    const userToDeactivate = await (User as any).findById(userId);
    if (!userToDeactivate) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (userToDeactivate.uid === decodedToken.uid) {
      return NextResponse.json({ error: "Cannot deactivate your own account" }, { status: 400 });
    }

    userToDeactivate.is_active = false;
    await userToDeactivate.save();

    return NextResponse.json({
      success: true,
      message: "User deactivated successfully",
    });
  } catch (error) {
    console.error("User deactivate failed:", error);
    return NextResponse.json({ error: "Failed to deactivate user" }, { status: 500 });
  }
}
