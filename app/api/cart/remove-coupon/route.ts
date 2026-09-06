// app/api/cart/remove-coupon/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getIdTokenFromHeader, verifyIdToken } from "../../../../lib/auth";
import connectDB from "../../../../lib/db";
import Cart from "../../../models/Cart";
import User from "../../../models/User";
import { getSessionIdFromRequest } from "../../../../lib/auth/session";


export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const token = getIdTokenFromHeader(request);
    let user = null;

    if (token) {
      const decodedToken = await verifyIdToken(token);
      if (decodedToken) {
        user = await (User as any).findOne({ email: decodedToken.email });
      }
    }

    let body: any = {};
    try {
      body = await request.json();
    } catch (_) {}

    const isBuyNow =
      body.buy_now === true ||
      body.buy_now === "1" ||
      request.headers.get("x-buy-now") === "1" ||
      request.nextUrl.searchParams.get("buy_now") === "1";

    let sessionId = null;
    if (!user) {
      sessionId = getSessionIdFromRequest(request);
      if (!sessionId) {
        return NextResponse.json({ error: "No session found" }, { status: 401 });
      }
    }

    let cart: any;
    if (isBuyNow) {
      const buyNowSessionId = `buynow_${user ? "user_" : "guest_"}${user ? user._id.toString() : sessionId}`;
      cart = await Cart.findOne({ session_id: buyNowSessionId });
    } else if (user) {
      cart = await Cart.findOne({ user_id: user._id });
    } else {
      cart = await Cart.findOne({ session_id: sessionId });
    }

    if (!cart) {
      return NextResponse.json({ error: "Cart not found" }, { status: 404 });
    }

    cart.applied_coupon_id = null;
    const shippingService = cart.selected_shipping_service_id
      ? await (await import("../../../models/ShippingService")).default.findById(cart.selected_shipping_service_id)
      : null;
    await cart.calculateTotals(null, shippingService);
    await cart.save();

    cart = await cart.populate({
      path: "items.product_id",
    });

    return NextResponse.json({
      success: true,
      message: "Coupon removed",
      cart,
    });
  } catch (error) {
    console.error("Remove coupon failed:", error);
    return NextResponse.json(
      { error: "Failed to remove coupon" },
      { status: 500 }
    );
  }
}