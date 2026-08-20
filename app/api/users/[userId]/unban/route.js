// app/api/users/[userId]/unban/route.js
import { NextResponse } from "next/server";
import { getIdTokenFromHeader, verifyIdToken } from "../../../../../lib/auth";
import connectDB from "../../../../../lib/db";
import User from "../../../../models/User";

export async function POST(request, { params }) {
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

    const adminUser = await User.findOne({ email: decodedToken.email });
    if (!adminUser || adminUser.role !== "admin") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const userToUnban = await User.findById(userId);
    if (!userToUnban) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    userToUnban.is_banned = false;
    userToUnban.is_active = true;
    await userToUnban.save();

    return NextResponse.json({
      success: true,
      message: "User unbanned successfully",
    });
  } catch (error) {
    console.error("User unban failed:", error);
    return NextResponse.json({ error: "Failed to unban user" }, { status: 500 });
  }
}