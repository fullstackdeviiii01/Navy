// app/api/media/[...filepath]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { resolveMediaFilePath } from "../../../../lib/storage/uploads";
import fs from "fs";
import path from "path";

const MIME_TYPES: Record<string, string> = {
  // Images
  webp: "image/webp",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  svg: "image/svg+xml",
  avif: "image/avif",
  ico: "image/x-icon",
  bmp: "image/bmp",
  // Videos
  mp4: "video/mp4",
  webm: "video/webm",
  mov: "video/quicktime",
  m4v: "video/x-m4v",
  // Documents
  pdf: "application/pdf",
  json: "application/json",
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filepath: string[] }> }
) {
  try {
    const { filepath: segments } = await params;
    if (!segments || segments.length === 0) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const relativePath = segments.join("/");
    const resolvedPath = resolveMediaFilePath(relativePath);

    if (!resolvedPath || !fs.existsSync(resolvedPath)) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const stat = fs.statSync(resolvedPath);
    if (!stat.isFile()) {
      return NextResponse.json({ error: "Invalid file" }, { status: 400 });
    }

    const ext = path.extname(resolvedPath).toLowerCase().replace(".", "");
    const contentType = MIME_TYPES[ext] || "application/octet-stream";
    const range = request.headers.get("range");

    // Support HTTP Range Requests (essential for video playback & seeking)
    if (range && contentType.startsWith("video/")) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1;
      const chunksize = end - start + 1;

      const nodeStream = fs.createReadStream(resolvedPath, { start, end });
      const webStream = new ReadableStream({
        start(controller) {
          nodeStream.on("data", (chunk) => controller.enqueue(chunk));
          nodeStream.on("end", () => controller.close());
          nodeStream.on("error", (err) => controller.error(err));
        },
      });

      return new Response(webStream, {
        status: 206,
        headers: {
          "Content-Range": `bytes ${start}-${end}/${stat.size}`,
          "Accept-Ranges": "bytes",
          "Content-Length": chunksize.toString(),
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    }

    // Standard static stream with aggressive immutable cache
    const nodeStream = fs.createReadStream(resolvedPath);
    const webStream = new ReadableStream({
      start(controller) {
        nodeStream.on("data", (chunk) => controller.enqueue(chunk));
        nodeStream.on("end", () => controller.close());
        nodeStream.on("error", (err) => controller.error(err));
      },
    });

    return new Response(webStream, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": stat.size.toString(),
        "Cache-Control": "public, max-age=31536000, immutable",
        "Last-Modified": stat.mtime.toUTCString(),
        ETag: `"${stat.size}-${stat.mtime.getTime()}"`,
      },
    });
  } catch (error: any) {
    console.error("Media serving error:", error);
    return NextResponse.json(
      { error: "Failed to serve media" },
      { status: 500 }
    );
  }
}
