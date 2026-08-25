// app/api/upload/payment-proof/route.ts
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

    // Validate file type
    const isImage =
      file.type.startsWith("image/") ||
      /\.(jpg|jpeg|png|webp|avif|gif|svg|bmp|heic|heif)$/i.test(file.name);
    if (!isImage) {
      return NextResponse.json(
        { error: "Invalid file type. Only images are allowed" },
        { status: 400 }
      );
    }

    if (file.size > 20 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size too large. Maximum 20MB allowed" },
        { status: 400 }
      );
    }

    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const filename = `proof_${timestamp}_${randomString}.webp`;

    const uploadDir = path.join(process.cwd(), "public", "uploads", "payment-proofs");
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Process image buffer through Sharp: convert to WebP & compress
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const compressedBuffer = await sharp(buffer)
      .webp({ quality: 80 })
      .resize(1400, 1400, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .toBuffer();

    const filepath = path.join(uploadDir, filename);
    await writeFile(filepath, compressedBuffer);

    const publicUrl = `/uploads/payment-proofs/${filename}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename,
    });
  } catch (error: any) {
    console.error("Payment proof upload failed:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload payment proof" },
      { status: 500 }
    );
  }
}
