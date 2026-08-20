// app/api/payment/stripe/create-intent/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getIdTokenFromHeader, verifyIdToken } from "../../../../../lib/firebase/auth";
import { getSessionIdFromRequest } from "../../../../../lib/auth/session";
import connectDB from "../../../../../lib/db";
import User from "../../../../models/User";
import PaymentGateway from "../../../../models/PaymentGateway";
import Payment from "../../../../models/Payment";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

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
        return NextResponse.json({ error: "No session found" }, { status: 401 });
      }
    }

    const { amount, currency = "USD", checkoutData, tax_calculation_id } =
      await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    // Fetch Stripe gateway config from DB
    const gateway = await (PaymentGateway as any).findOne({
      name: "stripe",
      is_enabled: true,
    });

    if (!gateway) {
      return NextResponse.json(
        { error: "Stripe not configured" },
        { status: 400 }
      );
    }

    const stripe = new Stripe(gateway.credentials.stripe_secret_key);

    // Build payment intent params
    const paymentIntentParams: Stripe.PaymentIntentCreateParams = {
      amount: Math.round(amount * 100), // convert to cents
      currency: currency.toLowerCase(),
      metadata: {
        user_id: user?._id?.toString() || "guest",
        session_id: sessionId || "",
        tax_calculation_id: tax_calculation_id || "",
      },
      automatic_payment_methods: {
        enabled: true,
      },
    };

    // Link Stripe Tax calculation if provided
    if (tax_calculation_id) {
      (paymentIntentParams as any).tax = {
        tax_calculation: tax_calculation_id,
      } as any;
    }

    const paymentIntent = await stripe.paymentIntents.create(
      paymentIntentParams
    );

    // Save payment record
    await (Payment as any).create({
      order_id: null, // set after order creation
      user_id: user?._id || null,
      session_id: sessionId || null,
      payment_gateway: "stripe",
      payment_method: "card",
      transaction_id: paymentIntent.id,
      payment_intent_id: paymentIntent.id,
      amount: amount,
      currency: currency,
      status: "pending",
      checkout_data: checkoutData,
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error: any) {
    console.error("Stripe payment intent creation failed:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create payment intent" },
      { status: 500 }
    );
  }
}