// lib/storage/uploads.ts
import path from "path";
import { existsSync } from "fs";
import { mkdir } from "fs/promises";

/**
 * Base directory for all persistent uploads.
 * Can be overridden via UPLOAD_DIR environment variable if hosted on external mount,
 * defaults to project-root/data/uploads which survives Next.js builds.
 */
export const UPLOAD_BASE_DIR =
  process.env.UPLOAD_DIR || path.join(process.cwd(), "data", "uploads");

/**
 * Legacy public directory path (for backward compatibility fallback)
 */
export const LEGACY_PUBLIC_DIR = path.join(process.cwd(), "public");

/**
 * Get absolute path for an upload subfolder in persistent storage
 * e.g. getUploadDir("products/images") -> ".../data/uploads/products/images"
 */
export function getUploadDir(...subfolders: string[]): string {
  return path.join(UPLOAD_BASE_DIR, ...subfolders);
}

/**
 * Ensure an upload subfolder exists in persistent storage
 */
export async function ensureUploadDir(...subfolders: string[]): Promise<string> {
  const dir = getUploadDir(...subfolders);
  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true });
  }
  return dir;
}

/**
 * Resolve the absolute disk filepath for a media item.
 * First checks persistent storage (data/uploads/...),
 * then checks legacy public directory (public/...) for backward compatibility.
 */
export function resolveMediaFilePath(relativePath: string): string | null {
  // Sanitize path to prevent directory traversal
  const normalized = path.normalize(relativePath).replace(/^(\.\.[\/\\])+/, "").replace(/^[\\\/]+/, "");

  // 1. Check persistent storage first
  const persistentPath = path.join(UPLOAD_BASE_DIR, normalized);
  if (existsSync(persistentPath)) {
    return persistentPath;
  }

  // 2. Check legacy public directory as fallback
  const legacyPath = path.join(LEGACY_PUBLIC_DIR, normalized);
  if (existsSync(legacyPath)) {
    return legacyPath;
  }

  // Also check if relativePath had a prefix like 'uploads/' stripped
  if (!normalized.startsWith("uploads")) {
    const legacyUploadsPath = path.join(LEGACY_PUBLIC_DIR, "uploads", normalized);
    if (existsSync(legacyUploadsPath)) {
      return legacyUploadsPath;
    }
  }

  return null;
}

/**
 * Format public URL for media serving
 */
export function getMediaUrl(subpath: string): string {
  const clean = subpath.replace(/^\/+/, "");
  return `/api/media/${clean}`;
}
