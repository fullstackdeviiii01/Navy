/**
 * lib/utils/imageToWebp.ts
 * 
 * High-performance, client-side WebP image converter.
 * Converts uploaded images (JPEG, PNG, HEIC, BMP) into optimized WebP format
 * using native HTML5 Canvas before uploading to the server.
 * 
 * Benefits:
 * - 100% Platform-independent (no C++ libvips / native node binaries required on server)
 * - Drastically reduces upload bandwidth and time (often 70-90% smaller)
 * - Prevents server memory overflow on shared cPanel hosting
 * - Visually lossless high quality (0.85 quality ratio)
 */

export interface WebpConvertOptions {
  quality?: number; // 0.1 to 1.0 (default: 0.85)
  maxDimension?: number; // Max width or height in px (default: 2400)
}

/**
 * Converts a single File object to WebP format.
 */
export async function convertImageToWebP(
  file: File,
  options: WebpConvertOptions = {}
): Promise<File> {
  const { quality = 0.85, maxDimension = 2400 } = options;

  // Don't convert if already WebP
  if (file.type === "image/webp" || file.name.toLowerCase().endsWith(".webp")) {
    return file;
  }

  // Preserve SVGs and animated GIFs
  if (file.type === "image/svg+xml" || file.type === "image/gif") {
    return file;
  }

  // Only attempt conversion on image files
  if (!file.type.startsWith("image/") && !/\.(jpe?g|png|bmp|webp|heic|heif)$/i.test(file.name)) {
    return file;
  }

  // Ensure window and canvas exist (client-side only)
  if (typeof window === "undefined" || typeof document === "undefined") {
    return file;
  }

  return new Promise<File>((resolve) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let width = img.naturalWidth || img.width;
      let height = img.naturalHeight || img.height;

      if (!width || !height) {
        resolve(file);
        return;
      }

      // Proportional downscale if exceeding maximum dimension
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d", { alpha: true });
      if (!ctx) {
        resolve(file);
        return;
      }

      // Enable high-quality image smoothing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      // Draw image onto canvas
      ctx.drawImage(img, 0, 0, width, height);

      // Export canvas to WebP Blob
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }

          // Build new filename with .webp extension
          const baseName = file.name.replace(/\.[^/.]+$/, "");
          const webpFileName = `${baseName}.webp`;

          const webpFile = new File([blob], webpFileName, {
            type: "image/webp",
            lastModified: Date.now(),
          });

          resolve(webpFile);
        },
        "image/webp",
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file); // Fallback to original file on decode error
    };

    img.src = objectUrl;
  });
}

/**
 * Converts an array of File objects to WebP format in parallel.
 */
export async function convertImagesToWebP(
  files: File[],
  options?: WebpConvertOptions
): Promise<File[]> {
  return Promise.all(files.map((file) => convertImageToWebP(file, options)));
}
