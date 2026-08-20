// // app/api/cart/item/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getIdTokenFromHeader, verifyIdToken } from "../../../../../lib/auth";
import connectDB from "../../../../../lib/db";
import Cart from "../../../../models/Cart";
import User from "../../../../models/User";
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

    let cart : any;
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

    await cart.populate([
      { path: "selected_shipping_service_id" },
      { path: "applied_coupon_id" },
    ]);
    await cart.calculateTotals(
      cart.applied_coupon_id || null,
      cart.selected_shipping_service_id || null
    );
    await cart.save();

    const populatedCart = await cart.populate({
      path: "items.product_id",
      select:
        "name images pricing inventory hasVariants variants variantOptions",
    });

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

    await cart.populate([
      { path: "selected_shipping_service_id" },
      { path: "applied_coupon_id" },
    ]);
    await cart.calculateTotals(
      cart.applied_coupon_id || null,
      cart.selected_shipping_service_id || null
    );
    await cart.save();

    const populatedCart = await cart.populate({
      path: "items.product_id",
      select:
        "name images pricing inventory hasVariants variants variantOptions",
    });

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