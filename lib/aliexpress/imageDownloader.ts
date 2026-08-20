/**
 * AliExpress Image Proxy Downloader
 *
 * Downloads external AliExpress CDN images, compresses them to WebP via Sharp,
 * and saves them to the local /public/products/images directory.
 * Returns internal public URLs compatible with the existing product image schema.
 */

import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { existsSync } from "fs";
import sharp from "sharp";

const UPLOAD_DIR = path.join(process.cwd(), "public", "products", "images");
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;
const DOWNLOAD_TIMEOUT_MS = 15000;

interface DownloadResult {
  success: boolean;
  url: string;          // Internal public URL on success
  originalUrl: string;  // Original AliExpress URL
  error?: string;
}

/**
 * Ensure the upload directory exists.
 */
async function ensureUploadDir(): Promise<void> {
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }
}

/**
 * Download a single image from a URL with retry logic.
 */
async function fetchImageWithRetry(
  url: string,
  retries = MAX_RETRIES
): Promise<Buffer> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DOWNLOAD_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        // AliExpress CDN requires a browser-like user agent
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Referer: "https://www.aliexpress.com/",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error: any) {
    if (retries > 0) {
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
      return fetchImageWithRetry(url, retries - 1);
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Download a single AliExpress image, compress to WebP, save locally.
 * Returns the internal public URL.
 */
export async function downloadAndSaveImage(
  originalUrl: string,
  productId: number | string,
  index: number
): Promise<DownloadResult> {
  try {
    await ensureUploadDir();

    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9);
    const filename = `ali_${productId}_${index}_${timestamp}_${random}.webp`;
    const filepath = path.join(UPLOAD_DIR, filename);

    const rawBuffer = await fetchImageWithRetry(originalUrl);

    // Compress and convert to WebP — same pipeline as existing upload-image route
    const compressedBuffer = await sharp(rawBuffer)
      .webp({ quality: 60 })
      .resize(1200, 1200, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .toBuffer();

    await writeFile(filepath, compressedBuffer);

    return {
      success: true,
      url: `/products/images/${filename}`,
      originalUrl,
    };
  } catch (error: any) {
    console.error(`Failed to download image: ${originalUrl}`, error.message);
    return {
      success: false,
      url: originalUrl, // Fallback to original AliExpress URL if download fails
      originalUrl,
      error: error.message,
    };
  }
}

/**
 * Download all product images concurrently with a concurrency limit.
 * Falls back to original URL on individual failures so the import never fully breaks.
 *
 * @param imageUrls     - Array of AliExpress CDN image URLs
 * @param productId     - AliExpress product ID (used in filename)
 * @param concurrency   - Max parallel downloads (default: 3)
 */
export async function downloadProductImages(
  imageUrls: string[],
  productId: number | string,
  concurrency = 3
): Promise<
  {
    url: string;
    alt_text: string;
    is_primary: boolean;
    sort_order: number;
    download_failed?: boolean;
  }[]
> {
  const results: DownloadResult[] = new Array(imageUrls.length);

  // Process in batches to respect concurrency limit
  for (let i = 0; i < imageUrls.length; i += concurrency) {
    const batch = imageUrls.slice(i, i + concurrency);
    const batchResults = await Promise.all(
      batch.map((url, batchIndex) =>
        downloadAndSaveImage(url, productId, i + batchIndex)
      )
    );
    batchResults.forEach((result, batchIndex) => {
      results[i + batchIndex] = result;
    });
  }

  return results.map((result, index) => ({
    url: result.url,
    alt_text: `Product Image ${index + 1}`,
    is_primary: index === 0,
    sort_order: index,
    ...(result.success ? {} : { download_failed: true }),
  }));
}

/**
 * Download all variant swatch images (per-colour images from SKU properties).
 * Returns a map of originalUrl → localUrl for use in variant imageUrl fields.
 */
export async function downloadVariantImages(
  variantImageUrls: string[],
  productId: number | string
): Promise<Map<string, string>> {
  const uniqueUrls = [...new Set(variantImageUrls.filter(Boolean))];
  const urlMap = new Map<string, string>();

  for (let i = 0; i < uniqueUrls.length; i++) {
    const result = await downloadAndSaveImage(
      uniqueUrls[i],
      `${productId}_swatch`,
      i
    );
    urlMap.set(uniqueUrls[i], result.url);
  }

  return urlMap;
}