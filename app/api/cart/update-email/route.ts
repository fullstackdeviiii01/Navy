// app/api/cart/update-email/route.ts - NEW FILE

import { NextRequest, NextResponse } from "next/server";
import { getIdTokenFromHeader, verifyIdToken } from "../../../../lib/auth";
import { getSessionIdFromRequest } from "../../../../lib/auth/session";
import connectDB from "../../../../lib/db";
import Cart from "../../../models/Cart";
import User from "../../../models/User";

export async function POST(request: NextRequest) {
  try {
    const { email, source } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: "Valid email is required" },
        { status: 400 }
      );
    }

    const validSources = ['cart_sidebar', 'exit_intent', 'checkout'];
    if (source && !validSources.includes(source)) {
      return NextResponse.json(
        { error: "Invalid email capture source" },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if user is authenticated
    const token = getIdTokenFromHeader(request);
    let user = null;

    if (token) {
      const decodedToken = await verifyIdToken(token);
      if (decodedToken) {
        user = await (User as any).findOne({ email: decodedToken.email });
      }
    }

    let cart;

    if (user) {
      // For logged-in users, we don't need to save guest_email
      // But we can still track the source if needed
      cart = await Cart.findOne({ user_id: user._id });
      
      if (!cart) {
        return NextResponse.json(
          { error: "Cart not found" },
          { status: 404 }
        );
      }

      // Optional: track email capture source even for logged-in users
      if (source && !cart.email_capture_source) {
        cart.email_capture_source = source;
        cart.email_captured_at = new Date();
        await cart.save();
      }

      return NextResponse.json({
        success: true,
        message: "Email already associated with account",
        cart,
      });
    } else {
      // For guest users, save email to cart
      const sessionId = getSessionIdFromRequest(request);
      
      if (!sessionId) {
        return NextResponse.json(
          { error: "No session found" },
          { status: 401 }
        );
      }

      cart = await Cart.findOne({ session_id: sessionId });

      if (!cart) {
        return NextResponse.json(
          { error: "Cart not found" },
          { status: 404 }
        );
      }

      // Update cart with email
      cart.guest_email = email.toLowerCase().trim();
      cart.email_capture_source = source || 'cart_sidebar';
      cart.email_captured_at = new Date();
      
      await cart.save();

      return NextResponse.json({
        success: true,
        message: "Email saved successfully",
        cart,
      });
    }
  } catch (error: any) {
    console.error("Update cart email failed:", error);
    return NextResponse.json(
      { error: "Failed to update email" },
      { status: 500 }
    );
  }
}