// app/api/users/[userId]/ban/route.js
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

    const adminUser = await User.findOne({ uid: decodedToken.uid });
    if (!adminUser || adminUser.role !== "admin") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const userToBan = await User.findById(userId);
    if (!userToBan) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (userToBan.role === "admin") {
      return NextResponse.json({ error: "Cannot ban admin users" }, { status: 400 });
    }

    userToBan.is_banned = true;
    userToBan.is_active = false;
    await userToBan.save();

    return NextResponse.json({
      success: true,
      message: "User banned successfully",
    });
  } catch (error) {
    console.error("User ban failed:", error);
    return NextResponse.json({ error: "Failed to ban user" }, { status: 500 });
  }
}