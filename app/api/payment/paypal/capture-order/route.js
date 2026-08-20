// app/api/payment/paypal/capture-order/route.js - UPDATED
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

    const { paypalOrderId } = await request.json();

    if (!paypalOrderId) {
      return NextResponse.json(
        { error: "PayPal Order ID required" },
        { status: 400 }
      );
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

    // Capture PayPal order
    const captureResponse = await fetch(
      `https://api${gateway.is_test_mode ? "-m.sandbox" : ""}.paypal.com/v2/checkout/orders/${paypalOrderId}/capture`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const captureData = await captureResponse.json();

    if (!captureResponse.ok || captureData.status !== "COMPLETED") {
      throw new Error("PayPal capture failed");
    }

    // Update payment record
    const payment = await Payment.findOne({ transaction_id: paypalOrderId });
    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    payment.status = "completed";
    payment.completed_at = new Date();
    payment.capture_id = captureData.purchase_units?.[0]?.payments?.captures?.[0]?.id;
    payment.payer_id = captureData.payer?.payer_id;
    payment.payment_details = {
      paypal_email: captureData.payer?.email_address,
      payer_name: `${captureData.payer?.name?.given_name || ""} ${captureData.payer?.name?.surname || ""}`.trim(),
    };
    await payment.save();

    // NOTE: Order will be created by frontend after payment success
    // We don't update order here because it doesn't exist yet

    return NextResponse.json({
      success: true,
      message: "Payment completed successfully",
      paymentId: payment._id,
    });
  } catch (error) {
    console.error("PayPal capture failed:", error);
    return NextResponse.json(
      { error: error.message || "Failed to capture payment" },
      { status: 500 }
    );
  }
}