// app/api/company/upload-logo/route.ts
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

    // Validate file type
    const isImage = file.type.startsWith("image/") || /\.(jpg|jpeg|png|webp|avif|gif|svg|bmp|heic|heif)$/i.test(file.name);
    if (!isImage) {
      return NextResponse.json(
        { error: "Invalid file type. Please upload a valid image" },
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
    const filename = `company_logo_${timestamp}_${randomString}.webp`;

    // Legacy public upload path:
    // const uploadDir = path.join(process.cwd(), "public", "company");
    // if (!existsSync(uploadDir)) {
    //   await mkdir(uploadDir, { recursive: true });
    // }
    // const publicUrl = `/company/${filename}`;

    // Persistent storage (survives builds without rebuilds)
    const { ensureUploadDir } = await import("../../../../lib/storage/uploads");
    const uploadDir = await ensureUploadDir("company");

    // Convert file to buffer, compress and convert to WebP
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    const compressedBuffer = await sharp(buffer)
      .webp({ quality: 80 })
      .resize(400, 400, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .toBuffer();

    const filepath = path.join(uploadDir, filename);
    await writeFile(filepath, compressedBuffer);

    // Return public URL
    const publicUrl = `/api/media/company/${filename}`;

    return NextResponse.json({
      success: true,
      message: "Logo uploaded successfully",
      url: publicUrl,
      filename,
    });
  } catch (error) {
    console.error("Logo upload failed:", error);
    return NextResponse.json(
      { error: "Failed to upload logo" },
      { status: 500 }
    );
  }
}