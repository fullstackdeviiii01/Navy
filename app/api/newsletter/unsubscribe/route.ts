// app/api/newsletter/unsubscribe/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../../lib/db";
import NewsletterSubscriber from "../../../models/NewsletterSubscriber";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const subscriber = await (NewsletterSubscriber as any).findOne({ email: cleanEmail });

    if (!subscriber) {
      return NextResponse.json(
        { error: "Email not found in subscriber list" },
        { status: 404 }
      );
    }

    if (!subscriber.is_active) {
      return NextResponse.json(
        { error: "Email is already unsubscribed" },
        { status: 400 }
      );
    }

    subscriber.is_active = false;
    subscriber.unsubscribed_at = new Date();
    await subscriber.save();

    return NextResponse.json({
      success: true,
      message: "Successfully unsubscribed from newsletter",
    });
  } catch (error: any) {
    console.error("Newsletter unsubscription error:", error);
    return NextResponse.json(
      { error: "Failed to unsubscribe" },
      { status: 500 }
    );
  }
}
