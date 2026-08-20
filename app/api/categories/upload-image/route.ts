// // app/api/categories/upload-image/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getIdTokenFromHeader, verifyIdToken } from "../../../../lib/auth";
import User from "../../../models/User";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import connectDB from "../../../../lib/db";
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

    const adminUser = await (User as any).findOne({ email: decodedToken.email });
    if (!adminUser || adminUser.role !== "admin") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get("image") as File;

    if (!file) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    // Validate file type (supports JPEG, PNG, WebP, AVIF, GIF, SVG, etc.)
    const isImage = file.type.startsWith("image/") || /\.(jpg|jpeg|png|webp|avif|gif|svg|bmp|heic|heif)$/i.test(file.name);
    if (!isImage) {
      return NextResponse.json(
        { error: "Invalid file type. Please upload a valid image" },
        { status: 400 }
      );
    }

    // Validate file size (25MB max)
    if (file.size > 25 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size too large. Maximum 25MB allowed" },
        { status: 400 }
      );
    }

    // Create unique filename
    const timestamp = Date.now();
    let filename = `category-${timestamp}.webp`;

    // Ensure directory exists
    const uploadDir = path.join(process.cwd(), "public", "categories", "images");
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Convert file to buffer, compress and convert to WebP
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    let finalBuffer: Buffer = buffer;
    try {
      finalBuffer = await sharp(buffer)
        .webp({ quality: 75 })
        .resize(1200, 1200, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .toBuffer();
    } catch (sharpError) {
      console.warn("Sharp compression failed, falling back to original buffer:", sharpError);
      const ext = file.name.split('.').pop() || 'jpg';
      filename = `category-${timestamp}.${ext}`;
      finalBuffer = buffer;
    }

    const filepath = path.join(uploadDir, filename);
    await writeFile(filepath, finalBuffer);

    // Return the URL path
    const imageUrl = `/categories/images/${filename}`;

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
