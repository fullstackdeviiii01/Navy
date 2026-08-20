// app/api/promotional-banners/upload-image/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getIdTokenFromHeader, verifyIdToken } from "../../../../lib/firebase/auth";
import connectDB from "../../../../lib/db";
import User from "../../../models/User";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import sharp from "sharp";

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

    const formData = await request.formData();
    const file = formData.get("image") as File;

    if (!file) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, and WebP are allowed" },
        { status: 400 }
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size too large. Maximum 5MB allowed" },
        { status: 400 }
      );
    }

    const timestamp = Date.now();
    const filename = `banner-${timestamp}.webp`;

    const uploadDir = path.join(process.cwd(), "public", "promotional-banners", "images");
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    const compressedBuffer = await sharp(buffer)
      .webp({ quality: 70 })
      .resize(800, 600, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .toBuffer();

    const filepath = path.join(uploadDir, filename);
    await writeFile(filepath, compressedBuffer);

    const imageUrl = `/promotional-banners/images/${filename}`;

    return NextResponse.json({
      success: true,
      imageUrl,
      message: "Image uploaded successfully",
    });
  } catch (error) {
    console.error("Image upload failed:", error);
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 }
    );
  }
}