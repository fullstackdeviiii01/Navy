// lib/categoryFileUtils.ts
import { unlink } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

/**
 * Delete a category image from the filesystem
 * @param imageUrl - The image URL (e.g., /categories/images/category-123456.jpg)
 * @returns Promise<boolean> - true if deleted successfully, false otherwise
 */
export async function deleteCategoryImage(imageUrl: string): Promise<boolean> {
  try {
    if (!imageUrl) return false;

    // Extract filename from URL
    const filename = path.basename(imageUrl);
    const filepath = path.join(
      process.cwd(),
      "public",
      "categories",
      "images",
      filename
    );

    // Check if file exists
    if (!existsSync(filepath)) {
      console.log(`Image file not found: ${filepath}`);
      return false;
    }

    // Delete the file
    await unlink(filepath);
    console.log(`Successfully deleted image: ${filepath}`);
    return true;
  } catch (error) {
    console.error("Error deleting category image:", error);
    return false;
  }
}

/**
 * Delete multiple category images
 * @param imageUrls - Array of image URLs
 * @returns Promise with deleted and failed files
 */
export async function deleteCategoryImages(
  imageUrls: string[]
): Promise<{ deletedFiles: string[]; failedFiles: string[] }> {
  const deletedFiles: string[] = [];
  const failedFiles: string[] = [];

  for (const url of imageUrls) {
    const success = await deleteCategoryImage(url);
    if (success) {
      deletedFiles.push(url);
    } else {
      failedFiles.push(url);
    }
  }

  return { deletedFiles, failedFiles };
}