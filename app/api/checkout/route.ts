// // app/api/checkout/route.ts — UPDATED WITH INVOICE CREATION
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getIdTokenFromHeader, verifyIdToken } from "../../../lib/auth";
import { getSessionIdFromRequest } from "../../../lib/auth/session";
import connectDB from "../../../lib/db";
import Cart from "../../models/Cart";
import Order from "../../models/Order";
import User from "../../models/User";
import Payment from "../../models/Payment";
import CouponUsage from "../../models/CouponUsage";
import PaymentGateway from "../../models/PaymentGateway";
import { EmailService } from "../../../lib/services/emailService";
import { InvoiceService } from "../../../lib/services/invoiceService";

export async function POST(request: NextRequest) {
  try {
    const {
      shipping_address,
      billing_address,
      same_as_shipping,
      customer_notes,
      guest_info,
      payment_method,
      payment_intent_id,
      paypal_order_id,
      tax_calculation_id,
      tax_amount,
    } = await request.json();

    if (!shipping_address || !payment_method) {
      return NextResponse.json(
        { error: "Shipping address and payment method are required" },
        { status: 400 }
      );
    }

    await connectDB();

    const token = getIdTokenFromHeader(request);
    let user = null;
    let sessionId = null;
    let isGuestOrder = false;

    if (token) {
      const decodedToken = await verifyIdToken(token);
      if (decodedToken) {
        user = await (User as any).findOne({ uid: decodedToken.uid });
      }
    }

    if (!user) {
      sessionId = getSessionIdFromRequest(request);
      if (!sessionId) {
        return NextResponse.json({ error: "No session found" }, { status: 401 });
      }
      if (!guest_info?.email || !guest_info?.name || !guest_info?.phone) {
        return NextResponse.json(
          { error: "Guest information required" },
          { status: 400 }
        );
      }
      isGuestOrder = true;
    }

    // ── Ban check ─────────────────────────────────────────────────────────────
    const emailToCheck = isGuestOrder
      ? guest_info?.email?.toLowerCase().trim()
      : user?.email?.toLowerCase().trim();

    if (emailToCheck) {
      const bannedUser = await (User as any).findOne(
        { email: emailToCheck },
        { is_banned: 1 }
      );
      if (bannedUser?.is_banned === true) {
        return NextResponse.json(
          { error: "This account has been suspended and cannot place orders. Please contact support." },
          { status: 403 }
        );
      }
    }
    // ─────────────────────────────────────────────────────────────────────────

    // Save guest email to cart
    if (isGuestOrder && guest_info?.email && sessionId) {
      try {
        const guestCart = await Cart.findOne({ session_id: sessionId });
        if (guestCart && !guestCart.guest_email) {
          guestCart.guest_email = guest_info.email.toLowerCase().trim();
          guestCart.email_capture_source = "checkout";
          guestCart.email_captured_at = new Date();
          await guestCart.save();
        }
      } catch (err) {
        console.error("Failed to save guest email to cart:", err);
      }
    }

    // ── Payment verification ──────────────────────────────────────────────────
    let paymentRecord = null;

    if (payment_method === "stripe" && payment_intent_id) {
      const stripeGateway = await (PaymentGateway as any).findOne({ name: "stripe" });
      const stripeSecretKey = stripeGateway?.credentials?.stripe_secret_key || process.env.STRIPE_SECRET_KEY!;
      const stripe = new Stripe(stripeSecretKey);
      const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id);
      if (paymentIntent.status !== "succeeded") {
        return NextResponse.json({ error: "Payment not confirmed" }, { status: 400 });
      }
      paymentRecord = await (Payment as any).findOne({ payment_intent_id });
      if (paymentRecord && paymentRecord.status !== "completed") {
        paymentRecord.status = "completed";
        paymentRecord.completed_at = new Date();
      }
    } else if (payment_method === "paypal" && paypal_order_id) {
      paymentRecord = await (Payment as any).findOne({
        transaction_id: paypal_order_id,
        status: "completed",
      });
      if (!paymentRecord) {
        return NextResponse.json({ error: "Payment not confirmed" }, { status: 400 });
      }
    }

    // ── Cart ──────────────────────────────────────────────────────────────────
    let cart: any;
    const cartQuery = user
      ? { user_id: user._id }
      : { session_id: sessionId };

    cart = await (Cart as any)
      .findOne(cartQuery)
      .populate("items.product_id")
      .populate("selected_shipping_service_id")
      .populate({ path: "applied_coupon_id", select: "code" });

    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // ── Build order items + update stock ─────────────────────────────────────
    const orderItems = [];
    for (const item of cart.items) {
      const product = item.product_id;
      if (!product) {
        return NextResponse.json({ error: "Product not found" }, { status: 400 });
      }

      let itemPrice = item.price_at_addition;

      if (product.hasVariants && item.variant_id) {
        const variant = product.variants.find(
          (v: any) => v._id?.toString() === item.variant_id?.toString()
        );
        if (!variant || !variant.isAvailable || variant.stockQuantity < item.quantity) {
          return NextResponse.json(
            { error: `Insufficient stock for ${product.name}` },
            { status: 400 }
          );
        }
        itemPrice = variant.price;
        variant.stockQuantity -= item.quantity;
        await product.save();
      } else {
        if (product.inventory.stock_quantity < item.quantity) {
          return NextResponse.json(
            { error: `Insufficient stock for ${product.name}` },
            { status: 400 }
          );
        }
        product.inventory.stock_quantity -= item.quantity;
        await product.save();
      }

      orderItems.push({
        product_id: product._id,
        variant_id: item.variant_id || null,
        product_name: product.name,
        product_image: product.images?.[0]?.url || "",
        quantity: item.quantity,
        price: itemPrice,
        subtotal: itemPrice * item.quantity,
      });
    }

    // ── Pricing ───────────────────────────────────────────────────────────────
    const finalTaxAmount =
      payment_method === "stripe" && tax_amount ? tax_amount : cart.tax_amount;

    const finalTotal =
      cart.subtotal - cart.discount_amount + finalTaxAmount + cart.shipping_cost;

    // ── Build order ───────────────────────────────────────────────────────────
    const orderData: any = {
      order_type: isGuestOrder ? "guest" : "registered",
      items: orderItems,
      pricing: {
        subtotal: cart.subtotal,
        discount_amount: cart.discount_amount,
        tax_amount: finalTaxAmount,
        shipping_cost: cart.shipping_cost,
        total: finalTotal,
        currency: "PKR",
      },
      shipping_address,
      billing_address: same_as_shipping ? shipping_address : billing_address,
      same_as_shipping,
      coupon_code: (cart.applied_coupon_id as any)?.code || undefined,
      coupon_id: (cart.applied_coupon_id as any)?._id ?? cart.applied_coupon_id ?? undefined,
      customer_notes: customer_notes || undefined,
      payment_method,
      status: payment_method === "cod" ? "pending" : "confirmed",
      payment_status: payment_method === "cod" ? "pending" : "paid",
      placed_at: new Date(),
    };

    if (payment_method === "stripe" && tax_calculation_id) {
      orderData.stripe_tax_calculation_id = tax_calculation_id;
    }

    if (cart.selected_shipping_service_id) {
      const svc = cart.selected_shipping_service_id;
      orderData.shipping_service = {
        service_id: svc._id,
        service_name: svc.name,
        service_display_name: svc.display_name,
        estimated_days_min: svc.estimated_days_min,
        estimated_days_max: svc.estimated_days_max,
      };
    }

    if (payment_method !== "cod") {
      orderData.confirmed_at = new Date();
    }

    if (isGuestOrder) {
      orderData.guest_info = guest_info;
      orderData.session_id = sessionId;
    } else {
      orderData.user_id = user._id;
    }

    const order = new Order(orderData);
    await order.save();

    // ── Stripe Tax commit ─────────────────────────────────────────────────────
    if (payment_method === "stripe" && tax_calculation_id) {
      try {
        const stripeGateway = await (PaymentGateway as any).findOne({ name: "stripe" });
        const stripeSecretKey = stripeGateway?.credentials?.stripe_secret_key || process.env.STRIPE_SECRET_KEY!;
        const stripe = new Stripe(stripeSecretKey);
        await stripe.tax.transactions.createFromCalculation({
          calculation: tax_calculation_id,
          reference: order.order_number,
          expand: ["line_items"],
        });
      } catch (taxCommitError) {
        console.error("Stripe Tax transaction commit failed:", taxCommitError);
      }
    }

    // ── COD payment record ────────────────────────────────────────────────────
    if (payment_method === "cod") {
      await (Payment as any).create({
        order_id: order._id,
        user_id: user?._id || null,
        session_id: sessionId || null,
        payment_gateway: "cod",
        payment_method: "cod",
        transaction_id: `COD-${order.order_number}`,
        amount: order.pricing.total,
        currency: order.pricing.currency,
        status: "pending",
      });
    }

    if (paymentRecord) {
      paymentRecord.order_id = order._id;
      await paymentRecord.save();
    }

    // ── Coupon tracking ───────────────────────────────────────────────────────
    if (cart.applied_coupon_id) {
      const couponUsageData: any = {
        coupon_id: cart.applied_coupon_id,
        order_id: order._id,
        discount_applied: cart.discount_amount,
        used_at: new Date(),
      };
      if (isGuestOrder) {
        couponUsageData.guest_email = guest_info.email.toLowerCase().trim();
        couponUsageData.session_id = sessionId;
      } else {
        couponUsageData.user_id = user._id;
      }
      await new CouponUsage(couponUsageData).save();
      await (await import("../../models/Coupon")).default.findByIdAndUpdate(
        cart.applied_coupon_id,
        { $inc: { used_count: 1 } }
      );
    }

    // ── Update user stats (non-COD only) ──────────────────────────────────────
    if (user && payment_method !== "cod") {
      await (User as any).findByIdAndUpdate(user._id, {
        $inc: { order_count: 1, total_spent: order.pricing.total },
        $set: { last_order_at: new Date() },
      });
    }

    // ── Create invoice record ─────────────────────────────────────────────────
    try {
      await InvoiceService.createForOrder(order._id.toString(), {
        userId: user?._id?.toString() ?? null,
        guestEmail: guest_info?.email,
        currency: order.pricing.currency,
        issueImmediately: payment_method !== "cod",
      });
    } catch (invoiceError) {
      console.error("Failed to create invoice record:", invoiceError);
    }

    // ── Confirmation email ────────────────────────────────────────────────────
    let populatedOrder: any;
    if (isGuestOrder) {
      populatedOrder = await Order.findById(order._id).lean();
      populatedOrder.user_id = { name: guest_info.name, email: guest_info.email };
    } else {
      populatedOrder = await Order.findById(order._id)
        .populate("user_id", "name email")
        .lean();
    }

    try {
      await EmailService.sendOrderConfirmationEmail(populatedOrder);
    } catch (emailError) {
      console.error("Failed to send order confirmation email:", emailError);
    }

    // ── Clear cart ────────────────────────────────────────────────────────────
    cart.items = [];
    cart.applied_coupon_id = null;
    cart.selected_shipping_service_id = null;
    await cart.calculateTotals();
    await cart.save();

    return NextResponse.json({
      success: true,
      message: "Order created successfully",
      order: populatedOrder,
    });
  } catch (error: any) {
    console.error("Checkout failed:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process checkout" },
      { status: 500 }
    );
  }
}