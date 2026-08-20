// app/api/payment/stripe/webhook/route.js - UPDATED
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import connectDB from "../../../../../lib/db";
import Payment from "../../../../models/Payment";
import PaymentGateway from "../../../../models/PaymentGateway";

export async function POST(request) {
  try {
    await connectDB();

    const gateway = await PaymentGateway.findOne({ name: "stripe" });
    if (!gateway) {
      return NextResponse.json({ error: "Gateway not found" }, { status: 404 });
    }

    const stripe = new Stripe(gateway.credentials.stripe_secret_key);
    const sig = request.headers.get("stripe-signature");
    const body = await request.text();

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        body,
        sig,
        gateway.credentials.stripe_webhook_secret
      );
    } catch (err) {
      console.error("Webhook signature verification failed:", err.message);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // Handle the event
    switch (event.type) {
      case "payment_intent.succeeded":
        await handlePaymentSuccess(event.data.object);
        break;
      case "payment_intent.payment_failed":
        await handlePaymentFailed(event.data.object);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}

async function handlePaymentSuccess(paymentIntent) {
  const payment = await Payment.findOne({
    payment_intent_id: paymentIntent.id,
  });

  if (!payment) {
    console.error("Payment not found for intent:", paymentIntent.id);
    return;
  }

  // Update payment status
  payment.status = "completed";
  payment.completed_at = new Date();
  
  // Extract payment method details
  if (paymentIntent.charges?.data?.[0]) {
    const charge = paymentIntent.charges.data[0];
    payment.payment_details = {
      card_last4: charge.payment_method_details?.card?.last4,
      card_brand: charge.payment_method_details?.card?.brand,
    };
  }
  
  await payment.save();

  // NOTE: Order will be created by frontend after payment success
  // We don't update order here because it might not exist yet
}

async function handlePaymentFailed(paymentIntent) {
  const payment = await Payment.findOne({
    payment_intent_id: paymentIntent.id,
  });

  if (!payment) {
    console.error("Payment not found for intent:", paymentIntent.id);
    return;
  }

  payment.status = "failed";
  payment.error_message =
    paymentIntent.last_payment_error?.message || "Payment failed";
  await payment.save();
}