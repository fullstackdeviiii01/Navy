// app/api/cart/calculate-tax/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getIdTokenFromHeader, verifyIdToken } from "../../../../lib/firebase/auth";
import { getSessionIdFromRequest } from "../../../../lib/auth/session";
import connectDB from "../../../../lib/db";
import Cart from "../../../models/Cart";
import User from "../../../models/User";
import PaymentGateway from "../../../models/PaymentGateway";

export async function POST(request: NextRequest) {
  const LOG_PREFIX = "[StripeTax]";

  try {
    const { shipping_address } = await request.json();

    console.log(`\n${LOG_PREFIX} ─────────────────────────────────────────`);
    console.log(`${LOG_PREFIX} Tax calculation request received`);
    console.log(`${LOG_PREFIX} Shipping address:`, JSON.stringify(shipping_address, null, 2));

    // ── Address Validation ──
    if (
      !shipping_address ||
      !shipping_address.line1 ||
      !shipping_address.city ||
      !shipping_address.country
    ) {
      console.warn(`${LOG_PREFIX} ❌ FAILED: Missing required address fields`);
      console.warn(`${LOG_PREFIX}    Required: line1, city, country`);
      console.warn(`${LOG_PREFIX}    Received:`, shipping_address);
      return NextResponse.json(
        { error: "Valid shipping address is required" },
        { status: 400 }
      );
    }

    await connectDB();

    // ── Stripe init from DB ──
    const stripeGateway = await (PaymentGateway as any).findOne({ name: "stripe" });
    const stripeSecretKey = stripeGateway?.credentials?.stripe_secret_key || process.env.STRIPE_SECRET_KEY!;
    const stripe = new Stripe(stripeSecretKey);

    // ── Auth Resolution ──
    const token = getIdTokenFromHeader(request);
    let user = null;
    let sessionId = null;

    if (token) {
      const decodedToken = await verifyIdToken(token);
      if (decodedToken) {
        user = await (User as any).findOne({ uid: decodedToken.uid });
        console.log(`${LOG_PREFIX} 👤 Authenticated user: ${user?._id} (${user?.email})`);
      }
    }

    if (!user) {
      sessionId = getSessionIdFromRequest(request);
      console.log(`${LOG_PREFIX} 👤 Guest session: ${sessionId}`);
      if (!sessionId) {
        console.warn(`${LOG_PREFIX} ❌ FAILED: No session ID found for guest`);
        return NextResponse.json({ error: "No session found" }, { status: 401 });
      }
    }

    // ── Cart Lookup ──
    let cart: any;
    if (user) {
      cart = await Cart.findOne({ user_id: user._id }).populate({
        path: "items.product_id",
        select: "name pricing stripe_tax_code",
      });
    } else {
      cart = await Cart.findOne({ session_id: sessionId }).populate({
        path: "items.product_id",
        select: "name pricing stripe_tax_code",
      });
    }

    if (!cart || cart.items.length === 0) {
      console.warn(`${LOG_PREFIX} ⚠️  Cart is empty — returning $0 tax`);
      return NextResponse.json({ tax_amount: 0, tax_calculation_id: null });
    }

    console.log(`${LOG_PREFIX} 🛒 Cart found: ${cart.items.length} item(s)`);

    // ── Line Items ──
    const lineItems = cart.items.map((item: any) => {
      const taxCode = item.product_id?.stripe_tax_code || "txcd_99999999";
      const amount = Math.round(item.price_at_addition * item.quantity * 100);

      console.log(`${LOG_PREFIX}    • Product: "${item.product_id?.name}"`);
      console.log(`${LOG_PREFIX}      Price: $${item.price_at_addition} x ${item.quantity} = $${(item.price_at_addition * item.quantity).toFixed(2)} (${amount} cents)`);
      console.log(`${LOG_PREFIX}      Tax code: ${taxCode}${!item.product_id?.stripe_tax_code ? " (FALLBACK — field missing on product)" : ""}`);

      return {
        amount,
        reference: item.product_id._id.toString(),
        tax_code: taxCode,
      };
    });

    console.log(`${LOG_PREFIX} 📦 Line items built:`, JSON.stringify(lineItems, null, 2));

    // ── Stripe API Call ──
    console.log(`${LOG_PREFIX} 🔄 Calling Stripe Tax Calculation API...`);
    console.log(`${LOG_PREFIX}    Country: ${shipping_address.country}`);
    console.log(`${LOG_PREFIX}    State:   ${shipping_address.state || "N/A"}`);
    console.log(`${LOG_PREFIX}    Postal:  ${shipping_address.postal_code || "N/A"}`);

    const taxCalculation = await stripe.tax.calculations.create({
      currency: "usd",
      line_items: lineItems,
      customer_details: {
        address: {
          line1: shipping_address.line1,
          line2: shipping_address.line2 || undefined,
          city: shipping_address.city,
          state: shipping_address.state || undefined,
          postal_code: shipping_address.postal_code || undefined,
          country: shipping_address.country,
        },
        address_source: "shipping",
      },
      expand: ["line_items"],
    });

    const taxAmount = taxCalculation.tax_amount_exclusive / 100;

    // ── Tax Breakdown ──
    console.log(`${LOG_PREFIX} ✅ Stripe Tax calculation successful!`);
    console.log(`${LOG_PREFIX}    Calculation ID: ${taxCalculation.id}`);
    console.log(`${LOG_PREFIX}    Tax amount:     $${taxAmount.toFixed(2)}`);
    console.log(`${LOG_PREFIX}    Tax inclusive:  ${taxCalculation.tax_amount_inclusive / 100}`);

    if (taxCalculation.tax_breakdown && taxCalculation.tax_breakdown.length > 0) {
      console.log(`${LOG_PREFIX}    Tax breakdown:`);
      taxCalculation.tax_breakdown.forEach((breakdown: any) => {
        console.log(`${LOG_PREFIX}      - ${breakdown.tax_rate_details?.display_name || "Tax"}: ${breakdown.tax_rate_details?.percentage_decimal || "?"}% → $${(breakdown.amount / 100).toFixed(2)} (${breakdown.sourcing})`);
      });
    } else {
      console.log(`${LOG_PREFIX}    ⚠️  No tax breakdown returned — likely $0 tax for this country/region`);
    }

    console.log(`${LOG_PREFIX} ─────────────────────────────────────────\n`);

    return NextResponse.json({
      tax_amount: taxAmount,
      tax_calculation_id: taxCalculation.id,
      tax_breakdown: taxCalculation.tax_breakdown,
    });

  } catch (error: any) {
    console.error(`\n${LOG_PREFIX} ❌ ERROR during tax calculation`);
    console.error(`${LOG_PREFIX}    Type:    ${error.type || "unknown"}`);
    console.error(`${LOG_PREFIX}    Code:    ${error.code || "N/A"}`);
    console.error(`${LOG_PREFIX}    Message: ${error.message}`);

    if (error.type === "invalid_request_error") {
      console.error(`${LOG_PREFIX}    ℹ️  Likely cause: Country not registered in Stripe Tax, or invalid tax code`);
      console.error(`${LOG_PREFIX}    ℹ️  Stripe Tax must be enabled for the destination country in your Stripe dashboard`);
    }

    if (error.code === "tax_calculation_failed") {
      console.error(`${LOG_PREFIX}    ℹ️  Stripe could not calculate tax — returning $0`);
    }

    console.error(`${LOG_PREFIX}    Raw error:`, error);
    console.error(`${LOG_PREFIX} ─────────────────────────────────────────\n`);

    // Graceful fallback
    return NextResponse.json({ tax_amount: 0, tax_calculation_id: null });
  }
}