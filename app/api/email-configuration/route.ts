import { NextRequest, NextResponse } from "next/server";
import { getIdTokenFromHeader, verifyIdToken } from "../../../lib/auth";
import connectDB from "../../../lib/db";
import EmailConfiguration from "../../models/EmailConfiguration";
import User from "../../models/User";

export async function GET(request: NextRequest) {
  try {
    const token = getIdTokenFromHeader(request);
    if (!token) {
      console.error("❌ [API DEBUG] No token provided");
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const decodedToken = await verifyIdToken(token);
    if (!decodedToken) {
      console.error("❌ [API DEBUG] Invalid token");
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    await connectDB();

    const user = await (User as any).findOne({ email: decodedToken.email });
    if (!user || user.role !== "admin") {
      console.error("❌ [API DEBUG] Unauthorized - Admin access required");
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    let config = await (EmailConfiguration as any).findOne();

    // Create default configuration if none exists
    if (!config) {
      config = await EmailConfiguration.create({
        smtp_settings: {
          host: "smtp.gmail.com",
          port: 587,
          secure: false,
          auth_user: "",
          auth_pass: "",
        },
        email_notifications: {
          contact_form: {
            enabled: true,
            recipient_email: "",
            subject_prefix: "Contact Form:",
          },
          order_confirmation: {
            enabled: true,
            send_to_customer: true,
            send_to_admin: true,
            admin_email: "",
            subject: "Order Confirmation - {{order_number}}",
          },
          order_status_update: {
            enabled: true,
            notify_on_confirmed: true,
            notify_on_shipped: true,
            notify_on_delivered: true,
            notify_on_cancelled: true,
          },
          // ADD DEFAULT RETURN NOTIFICATIONS CONFIGURATION
          return_notifications: {
            enabled: true,
            notify_on_request: true,
            notify_on_approved: true,
            notify_on_received: true,
            notify_on_processed: true,
            notify_on_completed: true,
            notify_on_rejected: true,
            admin_email: "",
          },
        },
        sender_info: {
          from_name: "Your Store",
          from_email: "",
          reply_to: "",
        },
        updated_by: user._id,
      });
    }

    // Log the configuration details

    return NextResponse.json({ config });
  } catch (error) {
    console.error("❌ [API DEBUG] Email configuration fetch failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch email configuration" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = getIdTokenFromHeader(request);
    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const decodedToken = await verifyIdToken(token);
    if (!decodedToken) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    await connectDB();

    const user = await (User as any).findOne({ email: decodedToken.email });
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    body.updated_by = user._id;

    // If password is masked, don't update it
    if (body.smtp_settings?.auth_pass === "••••••••") {
      const existingConfig = await (EmailConfiguration as any).findOne();
      if (existingConfig) {
        body.smtp_settings.auth_pass = existingConfig.smtp_settings.auth_pass;
      }
    }

    let config = await (EmailConfiguration as any).findOne();

    if (!config) {
      config = await EmailConfiguration.create(body);
    } else {
      config = await (EmailConfiguration as any).findOneAndUpdate({}, body, {
        new: true,
        runValidators: true,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Email configuration updated successfully",
      config,
    });
  } catch (error: any) {
    console.error("Email configuration update failed:", error);
    return NextResponse.json(
      { error: "Failed to update email configuration" },
      { status: 500 }
    );
  }
}