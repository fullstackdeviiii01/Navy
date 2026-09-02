// app/api/upload/payment-proof/route.ts
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
    const randomString = Math.random().toString(36).substring(2, 10);
    const rawExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const ext = rawExt.replace(/[^a-zA-Z0-9]/g, "");
    const filename = `proof_${timestamp}_${randomString}.${ext}`;

    const { ensureUploadDir } = await import("../../../../lib/storage/uploads");
    const uploadDir = await ensureUploadDir("uploads", "payment-proofs");

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const filepath = path.join(uploadDir, filename);
    await writeFile(filepath, buffer);

    const publicUrl = `/api/media/uploads/payment-proofs/${filename}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename,
    });
  } catch (error: any) {
    console.error("Payment proof upload failed:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to upload payment proof" },
      { status: 500 }
    );
  }
}
