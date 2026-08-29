// // app/api/cart/item/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getIdTokenFromHeader, verifyIdToken } from "../../../../../lib/auth";
import connectDB from "../../../../../lib/db";
import Cart from "../../../../models/Cart";
import User from "../../../../models/User";
import Coupon from "../../../../models/Coupon";
import { getSessionIdFromRequest } from "../../../../../lib/auth/session";


// PUT - Update cart item quantity
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: itemId } = await params;
    const { quantity } = await request.json();

    if (!quantity || quantity < 1) {
      return NextResponse.json(
        { error: "Invalid quantity" },
        { status: 400 }
      );
    }

    await connectDB();

    const token = getIdTokenFromHeader(request);
    let user = null;
    if (token) {
      const decodedToken = await verifyIdToken(token);
      if (decodedToken) {
        user = await (User as any).findOne({ email: decodedToken.email });
      }
    }

    let cart: any;
    if (user) {
      cart = await Cart.findOne({ user_id: user._id });
    } else {
      const sessionId = getSessionIdFromRequest(request);
      if (!sessionId) {
        return NextResponse.json({ error: "No session found" }, { status: 401 });
      }
      cart = await Cart.findOne({ session_id: sessionId });
    }

    if (!cart) {
      return NextResponse.json({ error: "Cart not found" }, { status: 404 });
    }

    // Find item by _id using filter instead of .id() method
    const itemIndex = cart.items.findIndex(
      (item: any) => item._id.toString() === itemId
    );

    if (itemIndex === -1) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    cart.items[itemIndex].quantity = quantity;

    const rawCouponId = (cart.applied_coupon_id as any)?._id || cart.applied_coupon_id;
    const coupon = rawCouponId
      ? await (Coupon as any).findById(rawCouponId)
      : null;

    await cart.calculateTotals(
      coupon,
      cart.selected_shipping_service_id || null
    );
    await cart.save();

    const populatedCart = await cart.populate([
      { path: "items.product_id" },
      { path: "applied_coupon_id", select: "code description discount_type discount_value min_order_amount" },
    ]);

    return NextResponse.json({
      success: true,
      message: "Cart updated",
      cart: populatedCart,
    });
  } catch (error) {
    console.error("Update cart item failed:", error);
    return NextResponse.json(
      { error: "Failed to update cart item" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: itemId } = await params;

    await connectDB();

    const token = getIdTokenFromHeader(request);
    let user = null;
    if (token) {
      const decodedToken = await verifyIdToken(token);
      if (decodedToken) {
        user = await (User as any).findOne({ email: decodedToken.email });
      }
    }

    let cart: any;
    if (user) {
      cart = await Cart.findOne({ user_id: user._id });
    } else {
      const sessionId = getSessionIdFromRequest(request);
      if (!sessionId) {
        return NextResponse.json({ error: "No session found" }, { status: 401 });
      }
      cart = await Cart.findOne({ session_id: sessionId });
    }

    if (!cart) {
      return NextResponse.json({ error: "Cart not found" }, { status: 404 });
    }

    cart.items = cart.items.filter(
      (item: any) => item._id.toString() !== itemId
    );

    const rawCouponId = (cart.applied_coupon_id as any)?._id || cart.applied_coupon_id;
    const coupon = rawCouponId
      ? await (Coupon as any).findById(rawCouponId)
      : null;

    await cart.calculateTotals(
      coupon,
      cart.selected_shipping_service_id || null
    );
    await cart.save();

    const populatedCart = await cart.populate([
      { path: "items.product_id" },
      { path: "applied_coupon_id", select: "code description discount_type discount_value min_order_amount" },
    ]);

    return NextResponse.json({
      success: true,
      message: "Item removed from cart",
      cart: populatedCart,
    });
  } catch (error) {
    console.error("Remove cart item failed:", error);
    return NextResponse.json(
      { error: "Failed to remove cart item" },
      { status: 500 }
    );
  }
}