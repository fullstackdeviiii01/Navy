// app/api/reviews/upload-image/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getIdTokenFromHeader, verifyIdToken } from "../../../../lib/firebase/auth";
import { getSessionIdFromRequest } from "../../../../lib/auth/session";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { existsSync } from "fs";
import sharp from "sharp";

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated OR has valid guest session
    const token = getIdTokenFromHeader(request);
    const sessionId = getSessionIdFromRequest(request);
    
    if (!token && !sessionId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Verify user if token exists
    if (token) {
      const decodedToken = await verifyIdToken(token);
      if (!decodedToken) {
        return NextResponse.json(
          { error: "Invalid token" },
          { status: 401 }
        );
      }
    }

    const formData = await request.formData();
    const file = formData.get("image") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No image provided" },
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, and WebP are allowed" },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size too large. Maximum 5MB allowed" },
        { status: 400 }
      );
    }

    // Create unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const filename = `review_${timestamp}_${randomString}.webp`;

    // Ensure directory exists
    const uploadDir = path.join(process.cwd(), "public", "reviews");
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Convert file to buffer, compress and convert to WebP
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    const compressedBuffer = await sharp(buffer)
      .webp({ quality: 80 })
      .resize(1200, 1200, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .toBuffer();

    const filepath = path.join(uploadDir, filename);
    await writeFile(filepath, compressedBuffer);

    // Return public URL
    const publicUrl = `/reviews/${filename}`;

    return NextResponse.json({
      success: true,
      message: "Image uploaded successfully",
      url: publicUrl,
      filename,
    });
  } catch (error) {
    console.error("Image upload failed:", error);
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 }
    );
  }
}

