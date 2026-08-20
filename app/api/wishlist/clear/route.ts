// app/api/wishlist/clear/route.ts - COMPLETE REPLACEMENT
import { NextRequest, NextResponse } from "next/server";
import { getIdTokenFromHeader, verifyIdToken } from "../../../../lib/auth";
import { getSessionIdFromRequest } from "../../../../lib/auth/session";
import connectDB from "../../../../lib/db";
import User from "../../../models/User";
import Wishlist from "../../../models/Wishlist";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Try to get authenticated user
    const token = getIdTokenFromHeader(request);
    let user = null;

    if (token) {
      const decodedToken = await verifyIdToken(token);
      if (decodedToken) {
        user = await (User as any).findOne({ email: decodedToken.email });
      }
    }

    if (user) {
      // Registered user
      user.wishlist = [];
      await user.save();

      return NextResponse.json({
        success: true,
        message: "Wishlist cleared successfully",
      });
    } else {
      // Guest user
      const sessionId = getSessionIdFromRequest(request);
      if (!sessionId) {
        return NextResponse.json(
          { error: "No session found" },
          { status: 401 }
        );
      }

      const wishlist = await Wishlist.findOne({ session_id: sessionId });
      if (wishlist) {
        wishlist.products = [];
        await wishlist.save();
      }

      return NextResponse.json({
        success: true,
        message: "Wishlist cleared successfully",
      });
    }
  } catch (error) {
    console.error("Clear wishlist failed:", error);
    return NextResponse.json(
      { error: "Failed to clear wishlist" },
      { status: 500 }
    );
  }
}