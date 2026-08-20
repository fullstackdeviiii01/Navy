// lib/reviewFileUtils.ts
import { unlink } from "fs/promises";
import path from "path";
import { existsSync } from "fs";

export async function deleteReviewImages(imageUrls: string[]) {
  const deletedFiles: string[] = [];
  const failedFiles: string[] = [];

  for (const imageUrl of imageUrls) {
    try {
      const filename = imageUrl.split("/").pop();
      if (!filename) continue;

      const filepath = path.join(process.cwd(), "public", "reviews", filename);

      if (existsSync(filepath)) {
        await unlink(filepath);
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

      const filepath = path.join(process.cwd(), "public", "reviews", "videos", filename);

      if (existsSync(filepath)) {
        await unlink(filepath);
        deletedFiles.push(filename);
      }

      // Also delete thumbnail if exists
      const thumbnailFilename = filename.replace("review_video_", "thumb_").replace(".mp4", ".jpg");
      const thumbnailPath = path.join(process.cwd(), "public", "reviews", "videos", thumbnailFilename);
      
      if (existsSync(thumbnailPath)) {
        await unlink(thumbnailPath);
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