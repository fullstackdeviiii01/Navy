// // app/api/cart/apply-coupon/route.ts - COMPLETE REPLACEMENT
import { NextRequest, NextResponse } from "next/server";
import { getIdTokenFromHeader, verifyIdToken } from "../../../../lib/firebase/auth";
import { getSessionIdFromRequest } from "../../../../lib/auth/session";
import connectDB from "../../../../lib/db";
import Cart from "../../../models/Cart";
import Coupon from "../../../models/Coupon";
import CouponUsage from "../../../models/CouponUsage";
import User from "../../../models/User";

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json(
        { error: "Coupon code is required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Try to get authenticated user
    const token = getIdTokenFromHeader(request);
    let user = null;
    let sessionId = null;

    if (token) {
      const decodedToken = await verifyIdToken(token);
      if (decodedToken) {
        user = await (User as any).findOne({ uid: decodedToken.uid });
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

    const coupon = await (Coupon as any).findOne({ code: code.toUpperCase() });
    if (!coupon) {
      return NextResponse.json(
        { error: "Invalid coupon code" },
        { status: 404 }
      );
    }

    // Validate coupon
    if (!coupon.isValid()) {
      return NextResponse.json(
        { error: "Coupon is expired or inactive" },
        { status: 400 }
      );
    }

    // Check usage limits
    let usageCount = 0;
    if (user) {
      usageCount = await CouponUsage.countDocuments({
        coupon_id: coupon._id,
        user_id: user._id,
      });
    } else {
      // For guests, check by session_id
      usageCount = await CouponUsage.countDocuments({
        coupon_id: coupon._id,
        session_id: sessionId,
      });
    }

    if (usageCount >= coupon.per_user_limit) {
      return NextResponse.json(
        { error: "You have exceeded the usage limit for this coupon" },
        { status: 400 }
      );
    }

    // Get cart
    let cart;
    if (user) {
      cart = await (Cart as any).findOne({ user_id: user._id }).populate({
        path: "items.product_id",
        select: "name category_id pricing",
      });
    } else {
      cart = await (Cart as any).findOne({ session_id: sessionId }).populate({
        path: "items.product_id",
        select: "name category_id pricing",
      });
    }

    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // Check minimum order amount
    if (cart.subtotal < coupon.min_order_amount) {
      return NextResponse.json(
        {
          error: `Minimum order amount of $${coupon.min_order_amount} required`,
        },
        { status: 400 }
      );
    }

    // Validate applicable items
    const applicableItems = cart.items.filter((item: any) => {
      const product = item.product_id;
      if (!product) return false;

      if (coupon.applicable_to.type === "all") {
        return true;
      }

      if (coupon.applicable_to.type === "products") {
        if (
          !coupon.applicable_to.product_ids ||
          coupon.applicable_to.product_ids.length === 0
        ) {
          return false;
        }
        return coupon.applicable_to.product_ids.some(
          (id: any) => id.toString() === product._id.toString()
        );
      }

      if (coupon.applicable_to.type === "categories") {
        if (
          !coupon.applicable_to.category_ids ||
          coupon.applicable_to.category_ids.length === 0
        ) {
          return false;
        }
        if (!product.category_id) return false;
        return coupon.applicable_to.category_ids.some(
          (id: any) => id.toString() === product.category_id.toString()
        );
      }

      return false;
    });

    if (applicableItems.length === 0) {
      let errorMessage =
        "This coupon is not applicable to any items in your cart";

      if (coupon.applicable_to.type === "categories") {
        errorMessage = "This coupon only applies to specific categories";
      } else if (coupon.applicable_to.type === "products") {
        errorMessage = "This coupon only applies to specific products";
      }

      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    // Apply coupon
    cart.applied_coupon_id = coupon._id;
    const shippingService = cart.selected_shipping_service_id
      ? await (await import("../../../models/ShippingService")).default.findById(cart.selected_shipping_service_id)
      : null;
    await cart.calculateTotals(coupon, shippingService);
    await cart.save();

    cart = await cart.populate({
      path: "items.product_id",
      select: "name images videos pricing short_description inventory",
    });

    return NextResponse.json({
      success: true,
      message: `Coupon applied successfully to ${applicableItems.length} ${applicableItems.length === 1 ? "item" : "items"}`,
      cart,
      discount: cart.discount_amount,
      applicable_items_count: applicableItems.length,
    });
  } catch (error) {
    console.error("Apply coupon failed:", error);
    return NextResponse.json(
      { error: "Failed to apply coupon" },
      { status: 500 }
    );
  }
}