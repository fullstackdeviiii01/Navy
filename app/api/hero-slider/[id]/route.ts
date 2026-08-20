// app/api/hero-slider/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getIdTokenFromHeader, verifyIdToken } from "../../../../lib/firebase/auth";
import connectDB from "../../../../lib/db";
import HeroSlider from "../../../models/HeroSlider";
import User from "../../../models/User";
import { deleteHeroSliderImage } from "../../../../lib/media-deletion/heroSliderFileUtils";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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

    // If image is being changed, delete old image
    if (body.hasOwnProperty("image_url")) {
      const oldSlide = await (HeroSlider as any).findById(id);
      if (oldSlide && oldSlide.image_url && oldSlide.image_url !== body.image_url) {
        await deleteHeroSliderImage(oldSlide.image_url);
      }
    }

    body.updated_by = adminUser._id;

    const slide = await (HeroSlider as any).findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!slide) {
      return NextResponse.json({ error: "Hero slide not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Hero slide updated successfully",
      slide,
    });
  } catch (error: any) {
    console.error("Hero slide update failed:", error);
    return NextResponse.json(
      { error: "Failed to update hero slide" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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

    const slide = await (HeroSlider as any).findById(id);
    if (!slide) {
      return NextResponse.json({ error: "Hero slide not found" }, { status: 404 });
    }

    const imageUrl = slide.image_url;

    await (HeroSlider as any).findByIdAndDelete(id);

    if (imageUrl) {
      await deleteHeroSliderImage(imageUrl);
    }

    return NextResponse.json({
      success: true,
      message: "Hero slide deleted successfully",
    });
  } catch (error) {
    console.error("Hero slide deletion failed:", error);
    return NextResponse.json(
      { error: "Failed to delete hero slide" },
      { status: 500 }
    );
  }}