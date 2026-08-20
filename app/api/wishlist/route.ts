// app/api/wishlist/route.ts - COMPLETE REPLACEMENT
import { NextRequest, NextResponse } from "next/server";
import { getIdTokenFromHeader, verifyIdToken } from "../../../lib/auth";
import { getOrCreateSessionId, createSessionCookie } from "../../../lib/auth/session";
import connectDB from "../../../lib/db";
import User from "../../models/User";
import Product from "../../models/Product";
import Wishlist from "../../models/Wishlist";

// GET - Fetch wishlist
export async function GET(request: NextRequest) {
  try {
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

    let wishlist;
    let products = [];

    if (user) {
      // Registered user - get from User model
      const populatedWishlist = await (Product as any)
        .find({
          _id: { $in: user.wishlist || [] },
        })
        .populate("category_id", "name slug")
        .select(
  "name images pricing rating_average rating_count inventory hasVariants variantOptions variants variantPricing badges status"
)
        .lean();

      products = populatedWishlist;
    } else {
      // Guest user - get from Wishlist model
      const { sessionId, isNew } = getOrCreateSessionId(request);

      wishlist = await Wishlist.findOne({ session_id: sessionId });

      if (wishlist) {
        const populatedWishlist = await (Product as any)
          .find({
            _id: { $in: wishlist.products || [] },
          })
          .populate("category_id", "name slug")
          .select(
  "name images pricing rating_average rating_count inventory hasVariants variantOptions variants variantPricing badges status"
)
          .lean();

        products = populatedWishlist;
      }

      const response = NextResponse.json({
        success: true,
        wishlist: products,
        count: products.length,
      });

      if (isNew) {
        response.headers.set("Set-Cookie", createSessionCookie(sessionId));
      }

      return response;
    }

    return NextResponse.json({
      success: true,
      wishlist: products,
      count: products.length,
    });
  } catch (error) {
    console.error("Wishlist fetch failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch wishlist" },
      { status: 500 }
    );
  }
}

// POST - Add product to wishlist
export async function POST(request: NextRequest) {
  try {
    const { product_id } = await request.json();

    if (!product_id) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Verify product exists
    const product = await (Product as any).findById(product_id);
    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Try to get authenticated user
    const token = getIdTokenFromHeader(request);
    let user = null;

    if (token) {
      const decodedToken = await verifyIdToken(token);
      if (decodedToken) {
        user = await (User as any).findOne({ uid: decodedToken.uid });
      }
    }

    if (user) {
      // Registered user - add to User model
      if (user.wishlist && user.wishlist.includes(product_id)) {
        return NextResponse.json(
          { error: "Product already in wishlist" },
          { status: 400 }
        );
      }

      if (!user.wishlist) {
        user.wishlist = [];
      }
      user.wishlist.push(product_id);
      await user.save();

      return NextResponse.json({
        success: true,
        message: "Product added to wishlist",
        wishlistCount: user.wishlist.length,
      });
    } else {
      // Guest user - add to Wishlist model
      const { sessionId, isNew } = getOrCreateSessionId(request);

      let wishlist = await Wishlist.findOne({ session_id: sessionId });

      if (!wishlist) {
        wishlist = new Wishlist({
          session_id: sessionId,
          products: [],
        });
      }

      if (wishlist.products.includes(product_id)) {
        return NextResponse.json(
          { error: "Product already in wishlist" },
          { status: 400 }
        );
      }

      wishlist.products.push(product_id);
      await wishlist.save();

      const response = NextResponse.json({
        success: true,
        message: "Product added to wishlist",
        wishlistCount: wishlist.products.length,
      });

      if (isNew) {
        response.headers.set("Set-Cookie", createSessionCookie(sessionId));
      }

      return response;
    }
  } catch (error) {
    console.error("Add to wishlist failed:", error);
    return NextResponse.json(
      { error: "Failed to add to wishlist" },
      { status: 500 }
    );
  }
}