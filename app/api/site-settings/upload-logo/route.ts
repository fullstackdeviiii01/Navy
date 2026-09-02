// app/api/site-settings/upload-logo/route.ts
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
    const file = formData.get("logo") as File;
    const type = (formData.get("type") as string) || "header";

    if (!file) {
      return NextResponse.json({ error: "No logo provided" }, { status: 400 });
    }

    const isImage =
      file.type.startsWith("image/") ||
      /\.(jpg|jpeg|png|webp|avif|gif|svg|bmp|ico)$/i.test(file.name);
    if (!isImage) {
      return NextResponse.json(
        { error: "Invalid file type. Please upload a valid image" },
        { status: 400 }
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size too large. Maximum 5MB allowed" },
        { status: 400 }
      );
    }

    const timestamp = Date.now();
    const rawExt = file.name.split(".").pop()?.toLowerCase() || "png";
    const ext = rawExt.replace(/[^a-zA-Z0-9]/g, "");
    const filename = `logo-${type}-${timestamp}.${ext}`;

    const { ensureUploadDir } = await import("../../../../lib/storage/uploads");
    const uploadDir = await ensureUploadDir("company");

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const filepath = path.join(uploadDir, filename);
    await writeFile(filepath, buffer);

    const logoUrl = `/api/media/company/${filename}`;

    return NextResponse.json({
      success: true,
      logoUrl,
      message: "Logo uploaded successfully",
    });
  } catch (error: any) {
    console.error("Logo upload failed:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to upload logo" },
      { status: 500 }
    );
  }
}