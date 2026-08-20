// app/api/products/upload-image/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getIdTokenFromHeader, verifyIdToken } from "../../../../lib/auth";
import connectDB from "../../../../lib/db";
import User from "../../../models/User";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { existsSync } from "fs";
import sharp from "sharp";

export async function POST(request: NextRequest) {
  try {
    console.log("Image upload request received");
    
    const token = getIdTokenFromHeader(request);
    console.log("Token:", token ? "Present" : "Missing");
    
    if (!token) {
      console.error("Upload failed: No token provided");
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const decodedToken = await verifyIdToken(token);
    console.log("Decoded token:", decodedToken ? "Valid" : "Invalid");
    
    if (!decodedToken) {
      console.error("Upload failed: Invalid token");
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    await connectDB();

    const adminUser = await (User as any).findOne({ email: decodedToken.email });
    console.log("Admin user:", adminUser ? `Found (${adminUser.role})` : "Not found");
    
    if (!adminUser || adminUser.role !== "admin") {
      console.error("Upload failed: Access denied for user", decodedToken.email);
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get("image") as File;
    console.log("FormData file:", file ? `${file.name} (${file.size} bytes, ${file.type})` : "Missing");

    if (!file) {
      console.error("Upload failed: No image provided in formData");
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    // Validate file type (supports JPEG, PNG, WebP, AVIF, GIF, SVG, etc.)
    const isImage = file.type.startsWith("image/") || /\.(jpg|jpeg|png|webp|avif|gif|svg|bmp|heic|heif)$/i.test(file.name);
    if (!isImage) {
      return NextResponse.json(
        { error: "Invalid file type. Please upload a valid image (JPEG, PNG, WebP, AVIF, GIF, etc.)" },
        { status: 400 }
      );
    }

    // Validate file size (max 25MB)
    if (file.size > 25 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size too large. Maximum 25MB allowed" },
        { status: 400 }
      );
    }

    // Create unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const filename = `product_${timestamp}_${randomString}.webp`;

    // Ensure directory exists
    const uploadDir = path.join(process.cwd(), "public", "products", "images");
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Convert file to buffer, compress and convert to WebP
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    let finalBuffer: Buffer = buffer;
    let finalFilename = filename;
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
      finalFilename = `product_${timestamp}_${randomString}.${ext}`;
      finalBuffer = buffer;
    }

    const filepath = path.join(uploadDir, finalFilename);
    await writeFile(filepath, finalBuffer);

    // Return public URL
    const publicUrl = `/products/images/${finalFilename}`;

    return NextResponse.json({
      success: true,
      message: "Image uploaded successfully",
      url: publicUrl,
      filename,
    });
  } catch (error: any) {
    console.error("Image upload failed:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload image" },
      { status: 500 }
    );
  }
}