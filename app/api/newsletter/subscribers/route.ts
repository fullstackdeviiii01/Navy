// app/api/newsletter/subscribers/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getIdTokenFromHeader, verifyIdToken } from "../../../../lib/auth";
import connectDB from "../../../../lib/db";
import NewsletterSubscriber from "../../../models/NewsletterSubscriber";
import User from "../../../models/User";

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
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "20");
    const status = url.searchParams.get("status");
    const search = url.searchParams.get("search");

    const query: any = {};

    if (status === "active") query.is_active = true;
    if (status === "inactive") query.is_active = false;

    if (search) {
      query.$or = [
        { email: { $regex: search, $options: "i" } },
        { name: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;

    const [subscribers, total, activeCount, inactiveCount] = await Promise.all([
      (NewsletterSubscriber as any).find(query)
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      (NewsletterSubscriber as any).countDocuments(query),
      (NewsletterSubscriber as any).countDocuments({ is_active: true }),
      (NewsletterSubscriber as any).countDocuments({ is_active: false }),
    ]);

    return NextResponse.json({
      subscribers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        active: activeCount,
        inactive: inactiveCount,
        total: activeCount + inactiveCount,
      },
    });
  } catch (error) {
    console.error("Subscribers fetch failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscribers" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const body = await request.json();
    const { email, name } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = await (NewsletterSubscriber as any).findOne({ email: cleanEmail });
    if (existing) {
      return NextResponse.json(
        { error: "Subscriber with this email already exists" },
        { status: 400 }
      );
    }

    const subscriber = await (NewsletterSubscriber as any).create({
      email: cleanEmail,
      name,
      source: "manual",
      is_active: true,
    });

    return NextResponse.json({
      success: true,
      message: "Subscriber added successfully",
      subscriber,
    });
  } catch (error) {
    console.error("Subscriber creation failed:", error);
    return NextResponse.json(
      { error: "Failed to create subscriber" },
      { status: 500 }
    );
  }
}
