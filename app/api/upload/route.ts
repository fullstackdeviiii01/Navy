// app/api/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type: images, PDFs, videos
    const isImage =
      file.type.startsWith("image/") ||
      /\.(jpg|jpeg|png|webp|avif|gif|svg|bmp|heic|heif)$/i.test(file.name);
    const isPdf =
      file.type === "application/pdf" || /\.pdf$/i.test(file.name);
    const isVideo =
      file.type.startsWith("video/") || /\.(mp4|webm|mov|m4v)$/i.test(file.name);

    if (!isImage && !isPdf && !isVideo) {
      return NextResponse.json(
        { error: "Invalid file type. Only images, PDFs, and videos are allowed." },
        { status: 400 }
      );
    }

    if (file.size > 25 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size too large. Maximum 25MB allowed." },
        { status: 400 }
      );
    }

    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 10);
    const rawExt = file.name.split(".").pop()?.toLowerCase() || (isImage ? "jpg" : isPdf ? "pdf" : "mp4");
    const sanitizedExt = rawExt.replace(/[^a-zA-Z0-9]/g, "");
    const filename = `media_${timestamp}_${randomString}.${sanitizedExt}`;

    const { ensureUploadDir } = await import("../../../lib/storage/uploads");
    const uploadDir = await ensureUploadDir("uploads", "returns");

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const filepath = path.join(uploadDir, filename);
    await writeFile(filepath, buffer);

    const publicUrl = `/api/media/uploads/returns/${filename}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename,
    });
  } catch (error: any) {
    console.error("File upload failed:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to upload file" },
      { status: 500 }
    );
  }
}
