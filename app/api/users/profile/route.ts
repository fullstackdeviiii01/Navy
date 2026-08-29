// app/api/users/profile/route.js
import { NextResponse } from "next/server";
import { getIdTokenFromHeader, verifyIdToken } from "../../../../lib/auth";
import connectDB from "../../../../lib/db";
import User from "../../../models/User";

export async function GET(request) {
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

    const user = await (User as any).findOne({ email: decodedToken.email });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.is_banned) {
      return NextResponse.json(
        { error: "This account has been suspended" },
        { status: 403 }
      );
    }

    if (user.is_active === false) {
      return NextResponse.json(
        { error: "This account has been deactivated" },
        { status: 403 }
      );
    }

    const { login_history, signup_ip, ...userProfile } = user.toObject();
    return NextResponse.json(userProfile);
  } catch (error) {
    console.error("Profile fetch failed:", error);
    return NextResponse.json(
      { error: "Profile fetch failed" },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    const token = getIdTokenFromHeader(request);

    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const decodedToken = await verifyIdToken(token);

    if (!decodedToken) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const updates = await request.json();

    // Protected fields that users cannot modify
    const protectedFields = [
      "uid",
      "signup_method",
      "provider_ids",
      "signup_ip",
      "signup_at",
      "login_history",
      "created_at",
      "updated_at",
      "role",
      "is_banned",
      "order_count",
      "total_spent"
    ];

    // Filter out protected fields
    const allowedUpdates: any = {};
    Object.keys(updates).forEach(key => {
      if (!protectedFields.includes(key) && updates[key] !== undefined) {
        allowedUpdates[key] = updates[key];
      }
    });

    if (Object.keys(allowedUpdates).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    await connectDB();

    const user = await (User as any).findOne({ email: decodedToken.email });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update user
    Object.keys(allowedUpdates).forEach(key => {
      user[key] = allowedUpdates[key];
    });

    await user.save();

    const { login_history, signup_ip, ...userProfile } = user.toObject();
    return NextResponse.json(userProfile);

  } catch (error) {
    console.error("Profile update failed:", error);
    return NextResponse.json(
      { error: "Profile update failed" },
      { status: 500 }
    );
  }
}