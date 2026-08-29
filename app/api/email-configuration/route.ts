import { NextRequest, NextResponse } from "next/server";
import { getIdTokenFromHeader, verifyIdToken } from "../../../lib/auth";
import connectDB from "../../../lib/db";
import EmailConfiguration from "../../models/EmailConfiguration";
import User from "../../models/User";

export async function GET(request: NextRequest) {
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
          order_confirmation: {
            enabled: true,
            subject: "Order Confirmation - Talal Wooden Lamps",
            template: "order_confirmation_default",
          },
          order_status_update: {
            enabled: true,
            subject: "Order Status Update - Talal Wooden Lamps",
            template: "status_update_default",
          },
          review_submission: {
            enabled: true,
            subject: "Thank You for Your Review - Talal Wooden Lamps",
            template: "review_submission_default",
          },
          custom_email: {
            enabled: true,
            subject: "Notification from Talal Wooden Lamps",
            template: "custom_email_default",
          },
        },
        branding: {
          company_name: "Talal Wooden Lamps",
          logo_url: "",
          primary_color: "#18181b",
          footer_text: "Handcrafted Wooden Lamps - Illuminating Your Spaces with Elegance",
        },
        updated_by: user._id,
      });
    }

    return NextResponse.json({ config });
  } catch (error) {
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