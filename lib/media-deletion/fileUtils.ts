// lib/fileUtils.ts (UPDATED)
import { unlink } from "fs/promises";
import path from "path";
import { existsSync } from "fs";

export async function deleteProductImages(imageUrls: string[]) {
  const deletedFiles: string[] = [];
  const failedFiles: string[] = [];

  for (const imageUrl of imageUrls) {
    try {
      const filename = imageUrl.split("/").pop();
      if (!filename) continue;

      const filepath = path.join(process.cwd(), "public", "products", "images", filename);

      if (existsSync(filepath)) {
        await unlink(filepath);
        deletedFiles.push(filename);
      }
    } catch (error) {
      console.error(`Failed to delete image: ${imageUrl}`, error);
      failedFiles.push(imageUrl);
    }
  }

  return { deletedFiles, failedFiles };
}

export async function deleteProductVideos(videoUrls: string[]) {
  const deletedFiles: string[] = [];
  const failedFiles: string[] = [];

  for (const videoUrl of videoUrls) {
    try {
      const filename = videoUrl.split("/").pop();
      if (!filename) continue;

      const filepath = path.join(process.cwd(), "public", "products", "videos", filename);

      if (existsSync(filepath)) {
        await unlink(filepath);
        deletedFiles.push(filename);
      }

      // Also delete thumbnail if exists
      const thumbnailFilename = filename.replace("product_video_", "thumb_").replace(".mp4", ".jpg");
      const thumbnailPath = path.join(process.cwd(), "public", "products", "videos", thumbnailFilename);
      
      if (existsSync(thumbnailPath)) {
        await unlink(thumbnailPath);
        deletedFiles.push(thumbnailFilename);
      }
    } catch (error) {
      console.error(`Failed to delete video: ${videoUrl}`, error);
      failedFiles.push(videoUrl);
    }
  }

  return { deletedFiles, failedFiles };
}

export async function deleteProductMedia(imageUrls: string[], videoUrls: string[]) {
  const imageResults = await deleteProductImages(imageUrls);
  const videoResults = await deleteProductVideos(videoUrls);

  return {
    images: imageResults,
    videos: videoResults,
    totalDeleted: imageResults.deletedFiles.length + videoResults.deletedFiles.length,
    totalFailed: imageResults.failedFiles.length + videoResults.failedFiles.length,
  };
}