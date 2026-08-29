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

      // Check persistent upload path first
      const persistentPath = path.join(process.cwd(), "data", "uploads", "products", "images", filename);
      // Legacy public path:
      const legacyPath = path.join(process.cwd(), "public", "products", "images", filename);

      if (existsSync(persistentPath)) {
        await unlink(persistentPath);
        deletedFiles.push(filename);
      } else if (existsSync(legacyPath)) {
        await unlink(legacyPath);
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

      // Check persistent upload path first
      const persistentPath = path.join(process.cwd(), "data", "uploads", "products", "videos", filename);
      // Legacy public path:
      const legacyPath = path.join(process.cwd(), "public", "products", "videos", filename);

      if (existsSync(persistentPath)) {
        await unlink(persistentPath);
        deletedFiles.push(filename);
      } else if (existsSync(legacyPath)) {
        await unlink(legacyPath);
        deletedFiles.push(filename);
      }

      // Also delete thumbnail if exists
      const thumbnailFilename = filename.replace("product_video_", "thumb_").replace(".mp4", ".jpg");
      const persistentThumbPath = path.join(process.cwd(), "data", "uploads", "products", "videos", thumbnailFilename);
      const legacyThumbPath = path.join(process.cwd(), "public", "products", "videos", thumbnailFilename);
      
      if (existsSync(persistentThumbPath)) {
        await unlink(persistentThumbPath);
        deletedFiles.push(thumbnailFilename);
      } else if (existsSync(legacyThumbPath)) {
        await unlink(legacyThumbPath);
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