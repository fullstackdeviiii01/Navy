// app/api/cart/select-shipping/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getIdTokenFromHeader, verifyIdToken } from "../../../../lib/auth";
import { getSessionIdFromRequest } from "../../../../lib/auth/session";
import connectDB from "../../../../lib/db";
import Cart from "../../../models/Cart";
import ShippingService from "../../../models/ShippingService";
import User from "../../../models/User";

export async function POST(request: NextRequest) {
  try {
    const { shipping_service_id } = await request.json();

    if (!shipping_service_id) {
      return NextResponse.json(
        { error: "Shipping service ID is required" },
        { status: 400 }
      );
    }

    await connectDB();

    const token = getIdTokenFromHeader(request);
    let user = null;
    let sessionId = null;

    if (token) {
      const decodedToken = await verifyIdToken(token);
      if (decodedToken) {
        user = await (User as any).findOne({ email: decodedToken.email });
      }
    }

    if (!user) {
      sessionId = getSessionIdFromRequest(request);
      if (!sessionId) {
        return NextResponse.json(
          { error: "No session found" },
          { status: 401 }
        );
      }
    }

    const shippingService = await ShippingService.findOne({
      _id: shipping_service_id,
      is_active: true,
    });

    if (!shippingService) {
      return NextResponse.json(
        { error: "Shipping service not found or inactive" },
        { status: 404 }
      );
    }

    let cart: any;
    if (user) {
      cart = await Cart.findOne({ user_id: user._id });
    } else {
      cart = await Cart.findOne({ session_id: sessionId });
    }

    if (!cart) {
      return NextResponse.json({ error: "Cart not found" }, { status: 404 });
    }

    cart.selected_shipping_service_id = shippingService._id;
    await cart.calculateTotals(
      cart.applied_coupon_id
        ? await (
            await import("../../../models/Coupon")
          ).default.findById(cart.applied_coupon_id)
        : null,
      shippingService
    );
    await cart.save();

    cart = await cart.populate({
      path: "items.product_id",
      select: "name images pricing inventory",
    });

    cart = await cart.populate({
      path: "selected_shipping_service_id",
      select: "name display_name description base_price currency estimated_days_min estimated_days_max",
    });

    return NextResponse.json({
      success: true,
      message: "Shipping service selected",
      cart,
    });
  } catch (error: any) {
    console.error("Select shipping service failed:", error);
    return NextResponse.json(
      { error: error.message || "Failed to select shipping service" },
      { status: 500 }
    );
  }
}