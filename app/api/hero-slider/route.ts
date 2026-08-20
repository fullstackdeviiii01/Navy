// app/api/hero-slider/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getIdTokenFromHeader, verifyIdToken } from "../../../lib/firebase/auth";
import connectDB from "../../../lib/db";
import HeroSlider from "../../models/HeroSlider";
import User from "../../models/User";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const url = new URL(request.url);
    const includeInactive = url.searchParams.get("includeInactive") === "true";

    const query: any = {};
    if (!includeInactive) {
      query.is_active = true;
    }

    const slides = await (HeroSlider as any).find(query)
      .populate("created_by", "name email")
      .sort({ sort_order: 1 })
      .lean();

    return NextResponse.json({ slides });
  } catch (error) {
    console.error("Hero slider fetch failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch hero slides" },
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

    const slide = new HeroSlider(body);
    await slide.save();

    return NextResponse.json({
      success: true,
      message: "Hero slide created successfully",
      slide,
    });
  } catch (error: any) {
    console.error("Hero slide creation failed:", error);
    return NextResponse.json(
      { error: "Failed to create hero slide" },
      { status: 500 }
    );
  }
}