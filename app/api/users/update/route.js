// app/api/users/update/route.js
import { NextResponse } from "next/server";
import { getIdTokenFromHeader, verifyIdToken } from "../../../../lib/auth";
import connectDB from "../../../../lib/db";
import User from "../../../models/User";

const ALLOWED_LOCALES = ["en-US", "en-GB", "ur-PK"];
const ALLOWED_TIMEZONES = [
  "UTC",
  "Asia/Karachi",
  "Asia/Dubai",
];

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

    const body = await request.json();
    const {
      name,
      phone,
      preferred_currency,
      preferred_locale,
      timezone,
      email_notifications,
      marketing_opt_in,
    } = body;

    await connectDB();

    // Validate locale
    if (preferred_locale && !ALLOWED_LOCALES.includes(preferred_locale)) {
      return NextResponse.json({ error: "Invalid locale" }, { status: 400 });
    }

    // Validate timezone
    if (timezone && !ALLOWED_TIMEZONES.includes(timezone)) {
      return NextResponse.json({ error: "Invalid timezone" }, { status: 400 });
    }

    const user = await User.findOne({ email: decodedToken.email });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update fields
    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (email_notifications !== undefined)
      user.email_notifications = email_notifications;
    if (marketing_opt_in !== undefined)
      user.marketing_opt_in = marketing_opt_in;
    if (preferred_locale) user.preferred_locale = preferred_locale;
    if (timezone) user.timezone = timezone;

    await user.save();

    // Return updated profile data
    return NextResponse.json({
      uid: user.uid,
      email: user.email,
      email_verified: user.email_verified,
      name: user.name,
      phone: user.phone,
      first_name: user.first_name,
      last_name: user.last_name,
      avatar_url: user.avatar_url,
      role: user.role,
      is_active: user.is_active,
      preferred_currency: user.preferred_currency,
      preferred_locale: user.preferred_locale,
      timezone: user.timezone,
      marketing_communications: user.marketing_opt_in,
      marketing_opt_in: user.marketing_opt_in,
      email_notifications: user.email_notifications,
      last_login_at: user.last_login_at,
      last_login_ip: user.last_login_ip,
      created_at: user.created_at,
      updated_at: user.updated_at,
      addresses: user.addresses,
    });
  } catch (error) {
    console.error("Profile update failed:", error);
    return NextResponse.json(
      { error: "Profile update failed" },
      { status: 500 }
    );
  }
}