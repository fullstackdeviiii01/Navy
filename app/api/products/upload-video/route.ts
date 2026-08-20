// app/api/products/upload-video/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getIdTokenFromHeader, verifyIdToken } from "../../../../lib/auth";
import connectDB from "../../../../lib/db";
import User from "../../../models/User";
import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";
import { existsSync } from "fs";
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "@ffmpeg-installer/ffmpeg";
import ffprobePath from "@ffprobe-installer/ffprobe";

// Set ffmpeg and ffprobe paths
ffmpeg.setFfmpegPath(ffmpegPath.path);
ffmpeg.setFfprobePath(ffprobePath.path);

const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_DURATION = 30; // 30 seconds
const ALLOWED_MIMETYPES = ["video/mp4", "video/webm", "video/quicktime"];

export async function POST(request: NextRequest) {
  let tempInputPath: string | null = null;
  let tempOutputPath: string | null = null;

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
    const file = formData.get("video") as File;

    if (!file) {
      return NextResponse.json({ error: "No video provided" }, { status: 400 });
    }

    // Validate file type
    if (!ALLOWED_MIMETYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only MP4, WebM, and MOV are allowed" },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_VIDEO_SIZE) {
      return NextResponse.json(
        { error: "File size too large. Maximum 50MB allowed" },
        { status: 400 }
      );
    }

    // Create unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const inputFilename = `temp_${timestamp}_${randomString}.mp4`;
    const outputFilename = `product_video_${timestamp}_${randomString}.mp4`;

    // Ensure directories exist
    const uploadDir = path.join(process.cwd(), "public", "products", "videos");
    const tempDir = path.join(process.cwd(), "temp");

    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }
    if (!existsSync(tempDir)) {
      await mkdir(tempDir, { recursive: true });
    }

    // Save temp input file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    tempInputPath = path.join(tempDir, inputFilename);
    await writeFile(tempInputPath, buffer);

    // Output path
    const outputPath = path.join(uploadDir, outputFilename);
    tempOutputPath = outputPath;

    let finalSize = file.size;
    let videoDuration = 0;
    let thumbnailFilename = "";
    let thumbnailUrl = "";

    try {
      // Try getting video metadata
      const metadata = await getVideoMetadata(tempInputPath);
      videoDuration = Math.round(metadata.duration || 0);

      if (videoDuration > MAX_DURATION) {
        if (tempInputPath && existsSync(tempInputPath)) {
          await unlink(tempInputPath);
        }
        return NextResponse.json(
          {
            error: `Video too long. Maximum duration is ${MAX_DURATION} seconds. Your video is ${videoDuration}s`,
          },
          { status: 400 }
        );
      }

      // Try ffmpeg compression
      await compressVideo(tempInputPath, outputPath);

      // Try thumbnail generation
      thumbnailFilename = `thumb_${timestamp}_${randomString}.jpg`;
      const thumbnailPath = path.join(uploadDir, thumbnailFilename);
      try {
        await generateThumbnail(outputPath, thumbnailPath);
        thumbnailUrl = `/products/videos/${thumbnailFilename}`;
      } catch (thumbErr) {
        console.warn("Thumbnail generation failed, skipping thumbnail:", thumbErr);
        thumbnailUrl = "";
      }

      const fs = require("fs");
      if (existsSync(outputPath)) {
        const finalStats = fs.statSync(outputPath);
        finalSize = finalStats.size;
      }
    } catch (ffmpegErr) {
      console.warn("FFMPEG processing failed, saving raw video directly:", ffmpegErr);
      await writeFile(outputPath, buffer);
      finalSize = file.size;
    }

    // Clean up temp input file
    if (tempInputPath && existsSync(tempInputPath)) {
      await unlink(tempInputPath);
      tempInputPath = null;
    }

    // Return public URLs
    const videoUrl = `/products/videos/${outputFilename}`;

    return NextResponse.json({
      success: true,
      message: "Video uploaded successfully",
      url: videoUrl,
      thumbnail: thumbnailUrl || videoUrl,
      filename: outputFilename,
      originalSize: file.size,
      compressedSize: finalSize,
      compressionRatio: ((1 - finalSize / file.size) * 100).toFixed(1),
      duration: videoDuration,
    });
  } catch (error: any) {
    console.error("Video upload failed:", error);

    // Clean up temp files on error
    try {
      if (tempInputPath && existsSync(tempInputPath)) {
        await unlink(tempInputPath);
      }
      if (tempOutputPath && existsSync(tempOutputPath)) {
        await unlink(tempOutputPath);
      }
    } catch (cleanupError) {
      console.error("Cleanup error:", cleanupError);
    }

    return NextResponse.json(
      { error: error.message || "Failed to upload video" },
      { status: 500 }
    );
  }
}

function getVideoMetadata(inputPath: string): Promise<{ duration: number }> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(inputPath, (err, metadata) => {
      if (err) {
        reject(new Error(`Failed to read video metadata: ${err.message}`));
      } else {
        resolve({
          duration: metadata.format.duration || 0,
        });
      }
    });
  });
}

function compressVideo(inputPath: string, outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .outputOptions([
        "-c:v libx264", // H.264 codec
        "-preset medium", // Encoding speed/compression ratio
        "-crf 28", // Quality (18-28, lower = better quality)
        "-maxrate 1M", // Max bitrate
        "-bufsize 2M", // Buffer size
        "-vf scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2", // Scale to 720p
        "-c:a aac", // Audio codec
        "-b:a 128k", // Audio bitrate
        "-ac 2", // Stereo audio
        "-movflags +faststart", // Enable fast start for web playback
      ])
      .output(outputPath)
      .on("end", () => resolve())
      .on("error", (err) => reject(new Error(`Video compression failed: ${err.message}`)))
      .run();
  });
}

function generateThumbnail(
  videoPath: string,
  thumbnailPath: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .screenshots({
        timestamps: ["00:00:01"],
        filename: path.basename(thumbnailPath),
        folder: path.dirname(thumbnailPath),
        size: "640x480",
      })
      .on("end", () => resolve())
      .on("error", (err) => reject(new Error(`Thumbnail generation failed: ${err.message}`)));
  });
}