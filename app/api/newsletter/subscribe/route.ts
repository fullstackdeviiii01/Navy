// app/api/newsletter/subscribe/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../../lib/db";
import NewsletterSubscriber from "../../../models/NewsletterSubscriber";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { email, name, source = "footer" } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = await (NewsletterSubscriber as any).findOne({ email: cleanEmail });

    if (existing) {
      if (existing.is_active) {
        return NextResponse.json(
          { success: true, message: "You are already subscribed to our newsletter!" },
          { status: 200 }
        );
      }

      existing.is_active = true;
      existing.subscribed_at = new Date();
      existing.unsubscribed_at = undefined;
      if (name) existing.name = name;
      await existing.save();

      return NextResponse.json({
        success: true,
        message: "Welcome back! Successfully resubscribed to newsletter.",
      });
    }

    const subscriber = await (NewsletterSubscriber as any).create({
      email: cleanEmail,
      name,
      source,
      metadata: {
        ip_address:
          request.headers.get("x-forwarded-for") ||
          request.headers.get("x-real-ip") ||
          "",
        user_agent: request.headers.get("user-agent") || "",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Thank you for subscribing to Talal Wooden Lamps newsletter!",
      subscriber: {
        email: subscriber.email,
        subscribed_at: subscriber.subscribed_at,
      },
    });
  } catch (error: any) {
    console.error("Newsletter subscription error:", error);
    return NextResponse.json(
      { error: "Failed to process subscription" },
      { status: 500 }
    );
  }
}
