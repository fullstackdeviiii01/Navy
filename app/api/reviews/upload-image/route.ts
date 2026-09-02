// app/api/reviews/upload-image/route.ts
import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";

export async function POST(request: NextRequest) {
  try {
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

    if (file.size > 15 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size too large. Maximum 15MB allowed" },
        { status: 400 }
      );
    }

    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 10);
    const rawExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const ext = rawExt.replace(/[^a-zA-Z0-9]/g, "");
    const filename = `review_${timestamp}_${randomString}.${ext}`;

    const { ensureUploadDir } = await import("../../../../lib/storage/uploads");
    const uploadDir = await ensureUploadDir("reviews", "images");

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const filepath = path.join(uploadDir, filename);
    await writeFile(filepath, buffer);

    const imageUrl = `/api/media/reviews/images/${filename}`;

    return NextResponse.json({
      success: true,
      url: imageUrl,
      imageUrl,
      filename,
      message: "Review image uploaded successfully",
    });
  } catch (error: any) {
    console.error("Review image upload failed:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to upload image" },
      { status: 500 }
    );
  }
}
