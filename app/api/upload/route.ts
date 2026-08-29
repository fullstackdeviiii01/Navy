// app/api/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { existsSync } from "fs";
import sharp from "sharp";

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

    // Max 25MB allowed
    if (file.size > 25 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size too large. Maximum 25MB allowed." },
        { status: 400 }
      );
    }

    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 10);
    const ext = isImage ? "webp" : isPdf ? "pdf" : file.name.split(".").pop() || "mp4";
    const sanitizedExt = ext.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
    const filename = `media_${timestamp}_${randomString}.${sanitizedExt}`;

    // Legacy public upload path:
    // const uploadDir = path.join(process.cwd(), "public", "uploads", "returns");
    // if (!existsSync(uploadDir)) {
    //   await mkdir(uploadDir, { recursive: true });
    // }
    // const publicUrl = `/uploads/returns/${filename}`;

    // Persistent storage (survives builds without rebuilds)
    const { ensureUploadDir } = await import("../../../lib/storage/uploads");
    const uploadDir = await ensureUploadDir("uploads", "returns");

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let finalBuffer = buffer;

    if (isImage) {
      // Compress and convert to WebP via Sharp
      finalBuffer = await sharp(buffer)
        .webp({ quality: 80 })
        .resize(1400, 1400, {
          fit: "inside",
          withoutEnlargement: true,
        })
        .toBuffer();
    }

    const filepath = path.join(uploadDir, filename);
    await writeFile(filepath, finalBuffer);

    const publicUrl = `/api/media/uploads/returns/${filename}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename,
    });
  } catch (error: any) {
    console.error("File upload failed:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload file" },
      { status: 500 }
    );
  }
}
