// lib/reviewFileUtils.ts
import { unlink } from "fs/promises";
import path from "path";
import { existsSync } from "fs";

export async function deleteReviewImages(imageUrls: string[]) {
  const deletedFiles: string[] = [];
  const failedFiles: string[] = [];

  for (const imageUrl of imageUrls) {
    try {
      if (!imageUrl || imageUrl.startsWith("data:")) continue;

      const filename = imageUrl.split("/").pop();
      if (!filename) continue;

      // Check persistent upload path first
      const persistentPath = path.join(process.cwd(), "data", "uploads", "reviews", filename);
      // Legacy public path:
      const legacyPath = path.join(process.cwd(), "public", "reviews", filename);

      if (existsSync(persistentPath)) {
        await unlink(persistentPath);
        deletedFiles.push(filename);
      } else if (existsSync(legacyPath)) {
        await unlink(legacyPath);
        deletedFiles.push(filename);
      }
    } catch (error) {
      console.error(`Failed to delete review image: ${imageUrl}`, error);
      failedFiles.push(imageUrl);
    }
  }

  return { deletedFiles, failedFiles };
}

export async function deleteReviewVideos(videoUrls: string[]) {
  const deletedFiles: string[] = [];
  const failedFiles: string[] = [];

  for (const videoUrl of videoUrls) {
    try {
      const filename = videoUrl.split("/").pop();
      if (!filename) continue;

      // Check persistent upload path first
      const persistentPath = path.join(process.cwd(), "data", "uploads", "reviews", "videos", filename);
      // Legacy public path:
      const legacyPath = path.join(process.cwd(), "public", "reviews", "videos", filename);

      if (existsSync(persistentPath)) {
        await unlink(persistentPath);
        deletedFiles.push(filename);
      } else if (existsSync(legacyPath)) {
        await unlink(legacyPath);
        deletedFiles.push(filename);
      }

      // Also delete thumbnail if exists
      const thumbnailFilename = filename.replace("review_video_", "thumb_").replace(".mp4", ".jpg");
      const persistentThumbPath = path.join(process.cwd(), "data", "uploads", "reviews", "videos", thumbnailFilename);
      const legacyThumbPath = path.join(process.cwd(), "public", "reviews", "videos", thumbnailFilename);
      
      if (existsSync(persistentThumbPath)) {
        await unlink(persistentThumbPath);
        deletedFiles.push(thumbnailFilename);
      } else if (existsSync(legacyThumbPath)) {
        await unlink(legacyThumbPath);
        deletedFiles.push(thumbnailFilename);
      }
    } catch (error) {
      console.error(`Failed to delete review video: ${videoUrl}`, error);
      failedFiles.push(videoUrl);
    }
  }

  return { deletedFiles, failedFiles };
}

export async function deleteReviewMedia(imageUrls: string[], videoUrls: string[]) {
  const imageResults = await deleteReviewImages(imageUrls);
  const videoResults = await deleteReviewVideos(videoUrls);

  return {
    images: imageResults,
    videos: videoResults,
    totalDeleted: imageResults.deletedFiles.length + videoResults.deletedFiles.length,
    totalFailed: imageResults.failedFiles.length + videoResults.failedFiles.length,
  };
}