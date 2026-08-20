// app/api/wishlist/check/[productId]/route.ts - COMPLETE REPLACEMENT
import { NextRequest, NextResponse } from "next/server";
import { getIdTokenFromHeader, verifyIdToken } from "../../../../../lib/firebase/auth";
import { getSessionIdFromRequest } from "../../../../../lib/auth/session";
import connectDB from "../../../../../lib/db";
import User from "../../../../models/User";
import Wishlist from "../../../../models/Wishlist";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params;

    await connectDB();

    // Try to get authenticated user
    const token = getIdTokenFromHeader(request);
    let user = null;

    if (token) {
      const decodedToken = await verifyIdToken(token);
      if (decodedToken) {
        user = await (User as any).findOne({ uid: decodedToken.uid });
      }
    }

    let isInWishlist = false;

    if (user) {
      // Registered user
      isInWishlist = user.wishlist
        ? user.wishlist.some((id: any) => id.toString() === productId)
        : false;
    } else {
      // Guest user
      const sessionId = getSessionIdFromRequest(request);
      if (sessionId) {
        const wishlist = await Wishlist.findOne({ session_id: sessionId });
        if (wishlist) {
          isInWishlist = wishlist.products.some(
            (id: any) => id.toString() === productId
          );
        }
      }
    }

    return NextResponse.json({
      success: true,
      isInWishlist,
    });
  } catch (error) {
    console.error("Check wishlist failed:", error);
    return NextResponse.json(
      { error: "Failed to check wishlist" },
      { status: 500 }
    );
  }
}