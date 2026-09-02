// app/api/categories/upload-image/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getIdTokenFromHeader, verifyIdToken } from "../../../../lib/auth";
import User from "../../../models/User";
import { writeFile } from "fs/promises";
import path from "path";
import connectDB from "../../../../lib/db";

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

    const isImage =
      file.type.startsWith("image/") ||
      /\.(jpg|jpeg|png|webp|avif|gif|svg|bmp|heic|heif)$/i.test(file.name);
    if (!isImage) {
      return NextResponse.json(
        { error: "Invalid file type. Please upload a valid image" },
        { status: 400 }
      );
    }

    if (file.size > 25 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size too large. Maximum 25MB allowed" },
        { status: 400 }
      );
    }

    const timestamp = Date.now();
    const rawExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const ext = rawExt.replace(/[^a-zA-Z0-9]/g, "");
    const filename = `category-${timestamp}.${ext}`;

    const { ensureUploadDir } = await import("../../../../lib/storage/uploads");
    const uploadDir = await ensureUploadDir("categories", "images");

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const filepath = path.join(uploadDir, filename);
    await writeFile(filepath, buffer);

    const imageUrl = `/api/media/categories/images/${filename}`;

    return NextResponse.json({
      success: true,
      url: imageUrl,
      imageUrl,
      message: "Image uploaded successfully",
    });
  } catch (error: any) {
    console.error("Category image upload failed:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to upload image" },
      { status: 500 }
    );
  }
}
