// app/api/cart/buy-now/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getIdTokenFromHeader, verifyIdToken } from "../../../../lib/auth";
import { getOrCreateSessionId, createSessionCookie } from "../../../../lib/auth/session";
import connectDB from "../../../../lib/db";
import Cart from "../../../models/Cart";
import Product from "../../../models/Product";
import User from "../../../models/User";
import ShippingService from "../../../models/ShippingService";
import { getProductMainImage } from "../../../../lib/utils/productImages";

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

    let sessionId: string;
    let isNewSession = false;
    if (!user) {
      const sessionData = getOrCreateSessionId(request);
      sessionId = sessionData.sessionId;
      isNewSession = sessionData.isNew;
    } else {
      sessionId = user._id.toString();
    }

    const buyNowSessionId = `buynow_${user ? "user_" : "guest_"}${sessionId}`;

    const product = await (Product as any).findById(product_id);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    let price = Math.round(product.pricing?.price || 0);
    let variantAttributes: Record<string, string> = clientAttributes || {};

    if (product.hasVariants && product.variants && product.variants.length > 0) {
      const targetVarId = variant_id ? variant_id.toString() : null;
      let variant = targetVarId
        ? product.variants.find((v: any) => (v._id?.toString() || String(v._id)) === targetVarId)
        : product.variants[0];

      if (!variant) {
        variant = product.variants[0];
      }

      if (variant) {
        price = Math.round(variant.price || price);
        if (variant.attributes && Array.isArray(variant.attributes)) {
          variant.attributes.forEach((attr: any) => {
            if (attr.name && attr.value) {
              variantAttributes[attr.name] = attr.value;
            }
          });
        }
      }
    }

    const resolvedProductName = clientProductName || product.name || "Product";
    const resolvedImage =
      clientProductImage ||
      getProductMainImage(product, variant_id, variantAttributes) ||
      product.images?.[0]?.url ||
      "";

    // Create or reset the dedicated temporary Buy-Now express cart
    let cart = await Cart.findOne({ session_id: buyNowSessionId });
    if (!cart) {
      cart = new Cart({
        session_id: buyNowSessionId,
        user_id: null, // Keep null to guarantee zero conflict with regular user cart queries
        items: [],
      });
    }

    // Single item only in the chosen quantity
    cart.items = [
      {
        product_id: product._id,
        variant_id: variant_id || null,
        product_name: resolvedProductName,
        product_image: resolvedImage,
        quantity,
        price_at_addition: price,
        variant_attributes: variantAttributes,
        added_at: new Date(),
      } as any,
    ];

    // Find default active shipping service if none selected
    if (!cart.selected_shipping_service_id) {
      const defaultShipping = await ShippingService.findOne({ is_active: true }).sort({ base_price: 1 });
      if (defaultShipping) {
        cart.selected_shipping_service_id = defaultShipping._id as any;
      }
    }

    const shippingService = cart.selected_shipping_service_id
      ? await ShippingService.findById(cart.selected_shipping_service_id)
      : null;

    await cart.calculateTotals(null, shippingService);
    await cart.save();

    await cart.populate([
      { path: "items.product_id" },
      {
        path: "selected_shipping_service_id",
        select: "name display_name inventory description base_price currency estimated_days_min estimated_days_max is_active",
      },
    ]);

    const response = NextResponse.json({
      success: true,
      cart,
      buy_now: true,
    });

    if (isNewSession) {
      response.headers.set("Set-Cookie", createSessionCookie(sessionId));
    }

    return response;
  } catch (error: any) {
    console.error("Buy-Now initiation failed:", error);
    return NextResponse.json(
      { error: error.message || "Failed to initiate Buy It Now" },
      { status: 500 }
    );
  }
}
