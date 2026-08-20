// app/api/newsletter/campaigns/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getIdTokenFromHeader, verifyIdToken } from "../../../../lib/firebase/auth";
import connectDB from "../../../../lib/db";
import NewsletterCampaign from "../../../models/NewsletterCampaign";
import User from "../../../models/User";

export async function GET(request: NextRequest) {
  try {
    const token = getIdTokenFromHeader(request);
    if (!token)
      return NextResponse.json({ error: "No token provided" }, { status: 401 });

    const decodedToken = await verifyIdToken(token);
    if (!decodedToken)
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    await connectDB();

    const user = await (User as any).findOne({ uid: decodedToken.uid });
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "20");
    const status = url.searchParams.get("status");

    const query: any = {};
    if (status && status !== "all") query.status = status;

    const skip = (page - 1) * limit;

    const [campaigns, total] = await Promise.all([
      NewsletterCampaign.find(query)
        .populate("created_by", "name email")
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      NewsletterCampaign.countDocuments(query),
    ]);

    return NextResponse.json({
      campaigns,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Campaigns fetch failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch campaigns" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = getIdTokenFromHeader(request);
    if (!token)
      return NextResponse.json({ error: "No token provided" }, { status: 401 });

    const decodedToken = await verifyIdToken(token);
    if (!decodedToken)
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    await connectDB();

    const user = await (User as any).findOne({ uid: decodedToken.uid });
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const body = await request.json();
    const { title, subject, content, status } = body;

    if (!title || !subject || !content) {
      return NextResponse.json(
        { error: "Title, subject, and content are required" },
        { status: 400 }
      );
    }

    const campaign = await NewsletterCampaign.create({
      title,
      subject,
      content,
      status: status || "draft",
      created_by: user._id,
    });

    return NextResponse.json({
      success: true,
      message: "Campaign created successfully",
      campaign,
    });
  } catch (error) {
    console.error("Campaign creation failed:", error);
    return NextResponse.json(
      { error: "Failed to create campaign" },
      { status: 500 }
    );
  }
}