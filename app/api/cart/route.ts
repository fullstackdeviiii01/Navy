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
import { getProductMainImage } from "../../../lib/utils/productImages";
import mongoose from "mongoose";

export async function GET(request: NextRequest) {
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

      await cart.populate([
        { path: "items.product_id" },
        {
          path: "selected_shipping_service_id",
          select: "name display_name inventory description base_price currency estimated_days_min estimated_days_max is_active",
        },
      ]);

      const rawCouponId = (cart.applied_coupon_id as any)?._id || cart.applied_coupon_id;
      const coupon = rawCouponId ? await (await import("../../models/Coupon")).default.findById(rawCouponId) : null;
      const shippingService = cart.selected_shipping_service_id;
      await cart.calculateTotals(coupon, shippingService);

      if (rawCouponId) {
        await cart.populate({
          path: "applied_coupon_id",
          select: "code description discount_type discount_value min_order_amount",
        });
      }

      const response = NextResponse.json({ cart });
      if (isNew) {
        response.headers.set("Set-Cookie", createSessionCookie(sessionId));
      }
      return response;
    }

    await cart.populate([
      { path: "items.product_id" },
      {
        path: "selected_shipping_service_id",
        select: "name display_name description inventory base_price currency estimated_days_min estimated_days_max is_active",
      },
    ]);
    
    const rawCouponId = (cart.applied_coupon_id as any)?._id || cart.applied_coupon_id;
    const coupon = rawCouponId ? await (await import("../../models/Coupon")).default.findById(rawCouponId) : null;
    const shippingService = cart.selected_shipping_service_id;
    await cart.calculateTotals(coupon, shippingService);

    if (rawCouponId) {
      await cart.populate({
        path: "applied_coupon_id",
        select: "code description discount_type discount_value min_order_amount",
      });
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
    const body = await request.json();
    const {
      product_id,
      quantity,
      variant_id,
      variant_attributes: clientAttributes,
      product_name: clientProductName,
      product_image: clientProductImage,
    } = body;

    if (!product_id || !quantity || quantity < 1) {
      console.warn("⚠️ [API POST /api/cart] Invalid product or quantity:", { product_id, quantity });
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
        user = await (User as any).findOne({ email: decodedToken.email });
      }
    }

    const product = await (Product as any).findById(product_id);
    if (!product) {
      console.error("❌ [API POST /api/cart] Product not found for ID:", product_id);
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }


    let price = Math.round(product.pricing?.price || 0);
    let stockQuantity = product.inventory?.stock_quantity || 99;
    let variantAttributes: Record<string, string> = clientAttributes || {};

    if (product.hasVariants) {
      if (!variant_id) {
        console.warn("⚠️ [API POST /api/cart] Missing variant_id for variable product");
        return NextResponse.json(
          { error: "Variant selection required" },
          { status: 400 }
        );
      }

      const targetVarId = variant_id.toString();
      const variant = product.variants?.find(
        (v: any) => (v._id?.toString() || String(v._id)) === targetVarId
      );

      if (!variant) {
        console.error("❌ [API POST /api/cart] Variant not found for ID:", variant_id);
        return NextResponse.json(
          { error: "Variant not found" },
          { status: 404 }
        );
      }

      price = Math.round(variant.price);
      stockQuantity = typeof variant.stockQuantity === "number" ? variant.stockQuantity : stockQuantity;

      if (variant.attributes && Array.isArray(variant.attributes)) {
        variant.attributes.forEach((attr: any) => {
          if (attr.name && attr.value) {
            variantAttributes[attr.name] = attr.value;
          }
        });
      }
    }

    const resolvedProductName = clientProductName || product.name || "Product";
    const resolvedImage =
      clientProductImage ||
      getProductMainImage(product, variant_id, variantAttributes) ||
      product.images?.[0]?.url ||
      "";


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
      existingItem.product_name = resolvedProductName;
      if (resolvedImage) existingItem.product_image = resolvedImage;
      if (Object.keys(variantAttributes).length > 0) {
        existingItem.variant_attributes = variantAttributes;
      }
    } else {
      const newItem: any = {
        product_id: product._id,
        variant_id: variant_id ? new mongoose.Types.ObjectId(variant_id) : null,
        product_name: resolvedProductName,
        product_image: resolvedImage || undefined,
        quantity,
        price_at_addition: price,
        variant_attributes: variantAttributes,
      };
      cart.items.push(newItem);
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
    console.error("💥 [API POST /api/cart] Add to cart error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to add item to cart" },
      { status: 500 }
    );
  }
}