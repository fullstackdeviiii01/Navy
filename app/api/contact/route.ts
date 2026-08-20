// app/api/contact/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../lib/db";
import { EmailService } from "../../../lib/services/emailService";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { name, email, phone, subject, message } = body;

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please provide a valid email address" },
        { status: 400 }
      );
    }

    // Send email using EmailService
    await EmailService.sendContactFormEmail({
      name,
      email,
      phone,
      subject,
      message,
    });

    return NextResponse.json({
      success: true,
      message: "Your message has been sent successfully! We'll get back to you soon.",
    });
  } catch (error: any) {
    console.error("Contact form submission failed:", error);

    // Provide more specific error messages
    let errorMessage = "Failed to send message. Please try again later.";

    if (error.code === "EAUTH") {
      errorMessage = "Email authentication failed. Please contact the administrator.";
    } else if (error.code === "ECONNECTION") {
      errorMessage = "Failed to connect to email server. Please try again later.";
    } else if (error.message) {
      errorMessage = error.message;
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}