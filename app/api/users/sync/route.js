// // app/api/users/sync/route.js
import { NextResponse } from "next/server";
import {
  getIdTokenFromHeader,
  verifyIdToken,
  getClientIp,
} from "../../../../lib/auth";
import connectDB from "../../../../lib/db";
import User from "../../../models/User";

export async function POST(request) {
  try {
    const token = getIdTokenFromHeader(request);
    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const decodedToken = await verifyIdToken(token);
    if (!decodedToken) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Get additional data from request body
    let additionalData = {};
    try {
      const body = await request.json();
      additionalData = body || {};
    } catch {
      // No body, continue
    }

    await connectDB();

    const clientIp = getClientIp(request);
    const now = new Date();

    const signupMethod = "email";

    // Only record login history when this is an actual login event,
    // not a background token-refresh sync triggered by onAuthStateChanged
    const isNewLogin = additionalData.isNewLogin === true;

    let user = await User.findOne({ email: decodedToken.email });

    if (user) {
      // Existing user - update fields
      user.email = decodedToken.email;
      user.email_verified = decodedToken.email_verified || false;
      user.avatar_url = decodedToken.picture || user.avatar_url;
      user.last_login_ip = clientIp;
      user.last_login_at = now;

      // Only push to login_history on real login events, not background syncs
      if (additionalData.isExplicitLogin) {
  user.login_history.push({
    at: now,
    ip: clientIp,
    method: signupMethod,
  });

  if (user.login_history.length > 50) {
    user.login_history = user.login_history.slice(-50);
  }
}

      await user.save();

      return NextResponse.json({
        success: true,
        user: {
          uid: user.uid,
          email: user.email,
          name: user.name,
          role: user.role,
          phone: user.phone,
        },
      });
    }

    // NEW USER - Prioritize additionalData over token
    const userName =
      additionalData.name ||
      decodedToken.name ||
      decodedToken.displayName ||
      "";
    const userPhone = additionalData.phone || "";
    const nameParts = userName.split(" ");

    const newUser = new User({
      uid: decodedToken.uid,
      email: decodedToken.email,
      email_verified: decodedToken.email_verified || false,
      name: userName,
      first_name: nameParts[0] || "",
      last_name: nameParts.slice(1).join(" ") || "",
      avatar_url: decodedToken.picture,
      phone: userPhone,

      signup_method: signupMethod,
      provider_ids: ["email"],

      role: "user",
      is_active: true,
      is_banned: false,

      preferred_currency: "PKR",
      preferred_locale: "en-US",
      timezone: "UTC",
      marketing_opt_in: false,

      cart: [],
      wishlist: [],
      order_count: 0,
      total_spent: 0,

      email_notifications: true,
      sms_notifications: false,

      customer_since: now,
      last_order_at: null,

      addresses: [],
      default_shipping_address_id: null,
      default_billing_address_id: null,

      signup_ip: clientIp,
      last_login_ip: clientIp,
      last_login_at: now,
      // New users always get their first login recorded
      login_history: [
        {
          at: now,
          ip: clientIp,
          method: signupMethod,
        },
      ],
    });

    await newUser.save();

    return NextResponse.json({
      success: true,
      user: {
        uid: newUser.uid,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        phone: newUser.phone,
      },
    });
  } catch (error) {
    console.error("User sync failed:", error);

    if (error.code === 11000) {
      return NextResponse.json(
        {
          error: "User already exists",
          code: "DUPLICATE_USER",
        },
        { status: 409 }
      );
    }

    return NextResponse.json({ error: "User sync failed" }, { status: 500 });
  }
}