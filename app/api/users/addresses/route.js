// app/api/users/addresses/route.js
import { NextResponse } from "next/server";
import { getIdTokenFromHeader, verifyIdToken } from "../../../../lib/auth.js";
import connectDB from "../../../../lib/db";
import User from "../../../models/User";

export async function GET(request) {
  try {
    const token = getIdTokenFromHeader(request);
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decodedToken = await verifyIdToken(token);
    if (!decodedToken) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    await connectDB();
    const user = await User.findOne({ email: decodedToken.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const shippingAddress = user.addresses?.find((a) => a.type === "shipping") || null;
    const billingAddress = user.addresses?.find((a) => a.type === "billing") || null;

    return NextResponse.json({
      addresses: user.addresses || [],
      shippingAddress,
      billingAddress,
    });
  } catch (error) {
    console.error("Fetch addresses error:", error);
    return NextResponse.json({ error: "Failed to fetch addresses" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const token = getIdTokenFromHeader(request);
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decodedToken = await verifyIdToken(token);
    if (!decodedToken) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    await connectDB();
    const body = await request.json();
    const { shippingAddress, billingAddress, sameAsShipping } = body;

    const user = await User.findOne({ email: decodedToken.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updatedAddresses = [];

    // 1. Single Shipping Address
    if (shippingAddress && shippingAddress.line1) {
      updatedAddresses.push({
        type: "shipping",
        full_name: shippingAddress.full_name || user.name || "",
        phone: shippingAddress.phone || user.phone || "",
        line1: shippingAddress.line1,
        line2: shippingAddress.line2 || "",
        city: shippingAddress.city || "",
        state: shippingAddress.state || "",
        postal_code: shippingAddress.postal_code || "",
        country: shippingAddress.country || "Pakistan",
        is_default_shipping: true,
        is_default_billing: false,
      });
    }

    // 2. Single Billing Address
    const finalBilling = sameAsShipping ? shippingAddress : billingAddress;
    if (finalBilling && finalBilling.line1) {
      updatedAddresses.push({
        type: "billing",
        full_name: finalBilling.full_name || user.name || "",
        phone: finalBilling.phone || user.phone || "",
        line1: finalBilling.line1,
        line2: finalBilling.line2 || "",
        city: finalBilling.city || "",
        state: finalBilling.state || "",
        postal_code: finalBilling.postal_code || "",
        country: finalBilling.country || "Pakistan",
        is_default_shipping: false,
        is_default_billing: true,
      });
    }

    user.addresses = updatedAddresses;
    await user.save();

    return NextResponse.json({
      success: true,
      message: "Addresses saved successfully",
      addresses: user.addresses,
    });
  } catch (error) {
    console.error("Save addresses error:", error);
    return NextResponse.json({ error: "Failed to save addresses" }, { status: 500 });
  }
}
