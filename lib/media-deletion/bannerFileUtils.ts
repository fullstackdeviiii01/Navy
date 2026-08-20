// lib/bannerFileUtils.ts
import { unlink } from "fs/promises";
import path from "path";
import { existsSync } from "fs";

export const deleteBannerImages = async (imageUrls: string[]): Promise<{
  deletedFiles: string[];
  failedFiles: string[];
}> => {
  const deletedFiles: string[] = [];
  const failedFiles: string[] = [];

  for (const imageUrl of imageUrls) {
    try {
      if (!imageUrl || !imageUrl.startsWith("/promotional-banners/images/")) {
        failedFiles.push(imageUrl);
        continue;
      }

      const filename = imageUrl.split("/").pop();
      if (!filename) {
        failedFiles.push(imageUrl);
        continue;
      }

      const filepath = path.join(
        process.cwd(),
        "public",
        "promotional-banners",
        "images",
        filename
      );

      if (existsSync(filepath)) {
        await unlink(filepath);
        deletedFiles.push(imageUrl);
      } else {
        failedFiles.push(imageUrl);
      }
    } catch (error) {
      console.error(`Error deleting banner image ${imageUrl}:`, error);
      failedFiles.push(imageUrl);
    }
  }

  return { deletedFiles, failedFiles };
};