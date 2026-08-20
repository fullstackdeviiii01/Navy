// lib/heroSliderFileUtils.ts
import { unlink } from "fs/promises";
import path from "path";
import { existsSync } from "fs";

export const deleteHeroSliderImage = async (imageUrl: string): Promise<boolean> => {
  try {
    if (!imageUrl || !imageUrl.startsWith("/hero-slider/images/")) {
      return false;
    }

    const filename = imageUrl.split("/").pop();
    if (!filename) return false;

    const filepath = path.join(
      process.cwd(),
      "public",
      "hero-slider",
      "images",
      filename
    );

    if (existsSync(filepath)) {
      await unlink(filepath);
      return true;
    }

    return false;
  } catch (error) {
    console.error("Error deleting hero slider image:", error);
    return false;
  }
};

