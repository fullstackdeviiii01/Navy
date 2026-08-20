// app/api/cart/route.ts - UPDATED WITH SHIPPING SERVICE
import { NextRequest, NextResponse } from "next/server";
import { getIdTokenFromHeader, verifyIdToken } from "../../../lib/auth";
import {
  getOrCreateSessionId,
  createSessionCookie,
} from "../../../lib/auth/session";
import connectDB from "../../../lib/db";
import Cart from "../../models/Cart";
import Product from "../../models/Product";
import User from "../../models/User";
import ShippingService from "../../models/ShippingService";
import { ICartItem } from "../../models/Cart";
import mongoose from "mongoose";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const token = getIdTokenFromHeader(request);
    let user = null;

    if (token) {
      const decodedToken = await verifyIdToken(token);
      if (decodedToken) {
        user = await (User as any).findOne({ uid: decodedToken.uid });
      }
    }

    let cart;

    if (user) {
      cart = await Cart.findOne({ user_id: user._id });
      if (!cart) {
        cart = new Cart({ user_id: user._id, items: [] });
        await cart.save();
      }
    } else {
      const { sessionId, isNew } = getOrCreateSessionId(request);
      cart = await Cart.findOne({ session_id: sessionId });
      if (!cart) {
        cart = new Cart({ session_id: sessionId, items: [] });
        await cart.save();
      }

      await cart.populate({
        path: "items.product_id",
        select:
          "name images videos short_description pricing inventory hasVariants variants variantOptions",
      });

      if (cart.selected_shipping_service_id) {
        await cart.populate({
          path: "selected_shipping_service_id",
          select: "name display_name inventory description base_price currency estimated_days_min estimated_days_max is_active",
        });
        
        const shippingService = cart.selected_shipping_service_id;
        const coupon = cart.applied_coupon_id ? await (await import("../../models/Coupon")).default.findById(cart.applied_coupon_id) : null;
        await cart.calculateTotals(coupon, shippingService);
      }

      const response = NextResponse.json({ cart });
      if (isNew) {
        response.headers.set("Set-Cookie", createSessionCookie(sessionId));
      }
      return response;
    }

    await cart.populate({
      path: "items.product_id",
      select:
        "name images videos short_description pricing inventory hasVariants variants variantOptions",
    });

    if (cart.selected_shipping_service_id) {
      await cart.populate({
        path: "selected_shipping_service_id",
        select: "name display_name description inventory base_price currency estimated_days_min estimated_days_max is_active",
      });
      
      const shippingService = cart.selected_shipping_service_id;
      const coupon = cart.applied_coupon_id ? await (await import("../../models/Coupon")).default.findById(cart.applied_coupon_id) : null;
      await cart.calculateTotals(coupon, shippingService);
    }

    return NextResponse.json({ cart });
  } catch (error) {
    console.error("Cart fetch failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch cart" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { product_id, quantity, variant_id } = await request.json();

    if (!product_id || !quantity || quantity < 1) {
      return NextResponse.json(
        { error: "Invalid product or quantity" },
        { status: 400 }
      );
    }

    await connectDB();

    const token = getIdTokenFromHeader(request);
    let user = null;

    if (token) {
      const decodedToken = await verifyIdToken(token);
      if (decodedToken) {
        user = await (User as any).findOne({ uid: decodedToken.uid });
      }
    }

    const product = await (Product as any).findById(product_id);
    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    let price = product.pricing.price;
    let stockQuantity = product.inventory.stock_quantity;
    let variantAttributes: Record<string, string> = {};

    if (product.hasVariants) {
      if (!variant_id) {
        return NextResponse.json(
          { error: "Variant selection required" },
          { status: 400 }
        );
      }

      const variant = product.variants.find(
        (v: any) => v._id?.toString() === variant_id
      );

      if (!variant) {
        return NextResponse.json(
          { error: "Variant not found" },
          { status: 404 }
        );
      }

      if (!variant.isAvailable || variant.stockQuantity < quantity) {
        return NextResponse.json(
          { error: "Variant unavailable or insufficient stock" },
          { status: 400 }
        );
      }

      price = variant.price;
      stockQuantity = variant.stockQuantity;

      if (variant.attributes && Array.isArray(variant.attributes)) {
        variant.attributes.forEach((attr: any) => {
          variantAttributes[attr.name] = attr.value;
        });
      }
    } else {
      if (stockQuantity < quantity) {
        return NextResponse.json(
          { error: "Insufficient stock" },
          { status: 400 }
        );
      }
    }

    let cart;
    let sessionId: string | null = null;
    let isNewSession = false;

    if (user) {
      cart = await Cart.findOne({ user_id: user._id });
      if (!cart) {
        cart = new Cart({ user_id: user._id, items: [] });
      }
    } else {
      const sessionData = getOrCreateSessionId(request);
      sessionId = sessionData.sessionId;
      isNewSession = sessionData.isNew;

      cart = await Cart.findOne({ session_id: sessionId });
      if (!cart) {
        cart = new Cart({ session_id: sessionId, items: [] });
      }
    }

    const existingItem = cart.items.find((item: ICartItem) => {
      const productMatch = item.product_id.toString() === product_id;
      const variantMatch = variant_id
        ? item.variant_id?.toString() === variant_id
        : !item.variant_id;
      return productMatch && variantMatch;
    });

    if (existingItem) {
      if (existingItem.quantity + quantity > stockQuantity) {
        return NextResponse.json(
          { error: "Exceeds available stock" },
          { status: 400 }
        );
      }
      existingItem.quantity += quantity;
    } else {
      const newItem: Omit<ICartItem, "_id" | "added_at"> = {
        product_id: product._id,
        variant_id: variant_id ? new mongoose.Types.ObjectId(variant_id) : null,
        quantity,
        price_at_addition: price,
        variant_attributes: variantAttributes,
      };
      cart.items.push(newItem as ICartItem);
    }

    const shippingServiceForCalc = cart.selected_shipping_service_id
      ? await (await import("../../models/ShippingService")).default.findById(cart.selected_shipping_service_id)
      : null;
    const couponForCalc = cart.applied_coupon_id
      ? await (await import("../../models/Coupon")).default.findById(cart.applied_coupon_id)
      : null;
    await cart.calculateTotals(couponForCalc, shippingServiceForCalc);
    await cart.save();

    const populatedCart = await cart.populate({
      path: "items.product_id",
      select:
        "name images pricing inventory hasVariants variants variantOptions",
    });

    const response = NextResponse.json({
      success: true,
      message: "Item added to cart",
      cart: populatedCart,
    });

    if (!user && sessionId && isNewSession) {
      response.headers.set("Set-Cookie", createSessionCookie(sessionId));
    }

    return response;
  } catch (error: any) {
    console.error("Add to cart failed:", error);
    return NextResponse.json(
      { error: error.message || "Failed to add item to cart" },
      { status: 500 }
    );
  }
}