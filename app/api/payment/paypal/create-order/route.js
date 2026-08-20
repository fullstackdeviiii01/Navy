// app/api/payment/paypal/create-order/route.js - UPDATED
import { NextRequest, NextResponse } from "next/server";
import { getIdTokenFromHeader, verifyIdToken } from "../../../../../lib/firebase/auth";
import { getSessionIdFromRequest } from "../../../../../lib/auth/session";
import connectDB from "../../../../../lib/db";
import User from "../../../../models/User";
import PaymentGateway from "../../../../models/PaymentGateway";
import Payment from "../../../../models/Payment";

async function getPayPalAccessToken(gateway) {
  const auth = Buffer.from(
    `${gateway.credentials.paypal_client_id}:${gateway.credentials.paypal_client_secret}`
  ).toString("base64");

  const response = await fetch(
    `https://api${gateway.is_test_mode ? "-m.sandbox" : ""}.paypal.com/v1/oauth2/token`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    }
  );

  const data = await response.json();
  return data.access_token;
}

export async function POST(request) {
  try {
    await connectDB();

    // Get user or session
    const token = getIdTokenFromHeader(request);
    let user = null;
    let sessionId = null;

    if (token) {
      const decodedToken = await verifyIdToken(token);
      if (decodedToken) {
        user = await User.findOne({ uid: decodedToken.uid });
      }
    }

    if (!user) {
      sessionId = getSessionIdFromRequest(request);
      if (!sessionId) {
        return NextResponse.json({ error: "No session found" }, { status: 401 });
      }
    }

    const { amount, currency = "USD", checkoutData } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    // Fetch PayPal gateway config
    const gateway = await PaymentGateway.findOne({
      name: "paypal",
      is_enabled: true,
    });

    if (!gateway) {
      return NextResponse.json({ error: "PayPal not configured" }, { status: 400 });
    }

    const accessToken = await getPayPalAccessToken(gateway);

    // Create PayPal order
    const paypalResponse = await fetch(
      `https://api${gateway.is_test_mode ? "-m.sandbox" : ""}.paypal.com/v2/checkout/orders`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          intent: "CAPTURE",
          purchase_units: [
            {
              amount: {
                currency_code: currency,
                value: amount.toFixed(2),
              },
              description: "Order Payment",
            },
          ],
          application_context: {
            return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success`,
            cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/cancelled`,
            brand_name: "Your Store",
            user_action: "PAY_NOW",
          },
        }),
      }
    );

    const paypalOrder = await paypalResponse.json();

    if (!paypalResponse.ok) {
      throw new Error(paypalOrder.message || "PayPal order creation failed");
    }

    // Create payment record (without order_id)
    await Payment.create({
      order_id: null, // Will be set after order creation
      user_id: user?._id || null,
      session_id: sessionId || null,
      payment_gateway: "paypal",
      payment_method: "paypal",
      transaction_id: paypalOrder.id,
      amount: amount,
      currency: currency,
      status: "pending",
      checkout_data: checkoutData, // Store temporarily
    });

    // Get approval URL
    const approvalUrl = paypalOrder.links.find(
      (link) => link.rel === "approve"
    )?.href;

    return NextResponse.json({
      orderId: paypalOrder.id,
      approvalUrl,
    });
  } catch (error) {
    console.error("PayPal order creation failed:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create PayPal order" },
      { status: 500 }
    );
  }
}