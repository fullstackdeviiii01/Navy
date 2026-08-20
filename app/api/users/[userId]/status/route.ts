// app/api/users/[userId]/status/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getIdTokenFromHeader, verifyIdToken } from "../../../../../lib/auth";
import connectDB from "../../../../../lib/db";
import User from "../../../../models/User";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
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

    const { userId } = await params;
    const body = await request.json();
    const { is_active, is_banned } = body;

    // Find and update user
    const userToUpdate = await (User as any).findById(userId);
    if (!userToUpdate) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prevent admin from deactivating/banning themselves
    if (userToUpdate.uid === decodedToken.uid) {
      return NextResponse.json(
        { error: "You cannot modify your own status" },
        { status: 400 }
      );
    }

    // Update status fields
    if (is_active !== undefined) {
      userToUpdate.is_active = is_active;
    }

    if (is_banned !== undefined) {
      userToUpdate.is_banned = is_banned;
      // If banning, also deactivate
      if (is_banned) {
        userToUpdate.is_active = false;
      }
    }

    await userToUpdate.save();

    return NextResponse.json({
      success: true,
      message: "User status updated successfully",
      user: {
        _id: userToUpdate._id,
        uid: userToUpdate.uid,
        email: userToUpdate.email,
        name: userToUpdate.name,
        is_active: userToUpdate.is_active,
        is_banned: userToUpdate.is_banned,
      },
    });
  } catch (error) {
    console.error("User status update failed:", error);
    return NextResponse.json(
      { error: "Failed to update user status" },
      { status: 500 }
    );
  }
}