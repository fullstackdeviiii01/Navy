// app/api/wishlist/[productId]/route.ts - COMPLETE REPLACEMENT
import { NextRequest, NextResponse } from "next/server";
import { getIdTokenFromHeader, verifyIdToken } from "../../../../lib/auth";
import { getSessionIdFromRequest } from "../../../../lib/auth/session";
import connectDB from "../../../../lib/db";
import User from "../../../models/User";
import Wishlist from "../../../models/Wishlist";

export async function DELETE(
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
        user = await (User as any).findOne({ email: decodedToken.email });
      }
    }

    if (user) {
      // Registered user - remove from User model
      if (user.wishlist) {
        user.wishlist = user.wishlist.filter(
          (id: any) => id.toString() !== productId
        );
        await user.save();
      }

      return NextResponse.json({
        success: true,
        message: "Product removed from wishlist",
        wishlistCount: user.wishlist?.length || 0,
      });
    } else {
      // Guest user - remove from Wishlist model
      const sessionId = getSessionIdFromRequest(request);
      if (!sessionId) {
        return NextResponse.json(
          { error: "No session found" },
          { status: 401 }
        );
      }

      const wishlist = await Wishlist.findOne({ session_id: sessionId });
      if (!wishlist) {
        return NextResponse.json(
          { error: "Wishlist not found" },
          { status: 404 }
        );
      }

      wishlist.products = wishlist.products.filter(
        (id: any) => id.toString() !== productId
      );
      await wishlist.save();

      return NextResponse.json({
        success: true,
        message: "Product removed from wishlist",
        wishlistCount: wishlist.products.length,
      });
    }
  } catch (error) {
    console.error("Remove from wishlist failed:", error);
    return NextResponse.json(
      { error: "Failed to remove from wishlist" },
      { status: 500 }
    );
  }
}