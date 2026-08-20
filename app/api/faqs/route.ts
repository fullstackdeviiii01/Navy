// app/api/faqs/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getIdTokenFromHeader, verifyIdToken } from "../../../lib/auth";
import connectDB from "../../../lib/db";
import FAQ from "../../models/FAQ";
import User from "../../models/User";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const url = new URL(request.url);
    const includeInactive = url.searchParams.get("includeInactive") === "true";
    const category = url.searchParams.get("category");

    const query: any = {};

    // Only show active FAQs for public requests
    if (!includeInactive) {
      query.is_active = true;
    }

    if (category) {
      query.category = category;
    }

    const faqs = await (FAQ as any)
      .find(query)
      .populate("created_by", "name email")
      .populate("updated_by", "name email")
      .sort({ category: 1, sort_order: 1, created_at: -1 })
      .lean();

    // Group by category
    const groupedFaqs = faqs.reduce((acc: any, faq: any) => {
      if (!acc[faq.category]) {
        acc[faq.category] = [];
      }
      acc[faq.category].push(faq);
      return acc;
    }, {});

    return NextResponse.json({ faqs, groupedFaqs });
  } catch (error) {
    console.error("FAQs fetch failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch FAQs" },
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

    const adminUser = await (User as any).findOne({ uid: decodedToken.uid });
    if (!adminUser || adminUser.role !== "admin") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const body = await request.json();
    body.created_by = adminUser._id;

    const faq = new FAQ(body);
    await faq.save();

    return NextResponse.json({
      success: true,
      message: "FAQ created successfully",
      faq,
    });
  } catch (error: any) {
    console.error("FAQ creation failed:", error);
    return NextResponse.json(
      { error: "Failed to create FAQ" },
      { status: 500 }
    );
  }
}