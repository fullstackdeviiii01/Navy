/**
 * lib/cj/auth.ts
 *
 * CJ Dropshipping token manager.
 *
 * Credentials priority chain:
 *   Database (decrypted) → Environment variables (legacy fallback)
 *
 * Token priority chain:
 *   Memory cache → File cache → Refresh → New token
 *
 * The file cache (.cj-token.json) survives Next.js dev restarts,
 * avoiding the 5-minute rate limit on getAccessToken.
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import path from "path";
import connectDB from "../db";
import CJCredentials from "../../app/models/CJCredentials";

const CJ_BASE_URL = "https://developers.cjdropshipping.com/api2.0/v1";
const TOKEN_FILE = path.join(process.cwd(), ".cj-token.json");

interface CJTokenData {
  accessToken: string;
  accessTokenExpiryDate: string;
  refreshToken: string;
  refreshTokenExpiryDate: string;
}

// In-memory cache — fast path, lives for the process lifetime
let memCache: CJTokenData | null = null;

/**
 * Returns true if the ISO date string is still valid with a 1-hour safety buffer.
 */
function isValid(expiryDateStr: string): boolean {
  return new Date(expiryDateStr).getTime() - Date.now() > 60 * 60 * 1000;
}

/**
 * Load token from .cj-token.json (survives server restarts).
 */
function loadFromFile(): CJTokenData | null {
  try {
    if (!existsSync(TOKEN_FILE)) return null;
    const raw = readFileSync(TOKEN_FILE, "utf-8");
    return JSON.parse(raw) as CJTokenData;
  } catch {
    return null;
  }
}

/**
 * Persist token to .cj-token.json.
 * Add .cj-token.json to your .gitignore.
 */
function saveToFile(token: CJTokenData): void {
  try {
    writeFileSync(TOKEN_FILE, JSON.stringify(token, null, 2), "utf-8");
  } catch (err) {
    console.warn("[CJ Auth] Could not write token file:", err);
  }
}

/**
 * Load CJ API key from DB (decrypted) or fall back to env var.
 */
async function getApiKey(): Promise<string> {
  try {
    await connectDB();
    const cred = await (CJCredentials as any)
      .findOne({ is_active: true })
      .sort({ created_at: -1 });

    if (cred) {
      return cred.api_key;
    }
  } catch (err) {
    console.warn(
      "[CJ Auth] Could not load credentials from DB, falling back to env:",
      err
    );
  }

  // Legacy fallback — env var
  const apiKey = process.env.CJ_API_KEY;
  if (!apiKey) {
    throw new Error(
      "CJ credentials not configured. Add them via Admin → Settings → CJ Dropshipping."
    );
  }
  return apiKey;
}

/**
 * Exchange API key for a fresh token pair.
 * Rate-limited to once per 5 minutes by CJ.
 */
async function fetchNewToken(): Promise<CJTokenData> {
  const apiKey = await getApiKey();

  const res = await fetch(`${CJ_BASE_URL}/authentication/getAccessToken`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ apiKey }),
  });

  const data = await res.json();
  if (data.code !== 200 || !data.data?.accessToken) {
    throw new Error(`CJ Auth failed: ${data.message} (code: ${data.code})`);
  }

  console.log("[CJ Auth] New access token fetched.");
  return data.data as CJTokenData;
}

/**
 * Refresh using refresh token — NOT rate-limited.
 */
async function doRefresh(refreshToken: string): Promise<CJTokenData> {
  const res = await fetch(`${CJ_BASE_URL}/authentication/refreshAccessToken`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  const data = await res.json();
  if (data.code !== 200 || !data.data?.accessToken) {
    throw new Error(`CJ Token refresh failed: ${data.message}`);
  }

  console.log("[CJ Auth] Access token refreshed.");
  return data.data as CJTokenData;
}

/**
 * Returns a valid CJ access token.
 *
 * Priority:
 * 1. Memory cache     — same process, fastest path
 * 2. File cache       — survives Next.js dev restarts, fixes QPS rate limit
 * 3. Refresh token    — no rate limit, safe to call anytime
 * 4. New token        — rate-limited (1 per 5 min), only as last resort
 */
export async function getCJAccessToken(): Promise<string> {
  // 1. Memory cache
  if (memCache && isValid(memCache.accessTokenExpiryDate)) {
    return memCache.accessToken;
  }

  // 2. File cache
  const fileToken = loadFromFile();
  if (fileToken && isValid(fileToken.accessTokenExpiryDate)) {
    memCache = fileToken;
    console.log("[CJ Auth] Token loaded from file cache.");
    return memCache.accessToken;
  }

  // 3. Refresh (access token may be expired but refresh token still valid)
  const candidate = memCache || fileToken;
  if (candidate && isValid(candidate.refreshTokenExpiryDate)) {
    try {
      const refreshed = await doRefresh(candidate.refreshToken);
      memCache = refreshed;
      saveToFile(refreshed);
      return memCache.accessToken;
    } catch (err) {
      console.warn("[CJ Auth] Refresh failed, fetching new token:", err);
    }
  }

  // 4. Brand-new token (last resort)
  const fresh = await fetchNewToken();
  memCache = fresh;
  saveToFile(fresh);
  return memCache.accessToken;
}

/**
 * Invalidate the cached token — call this after saving new credentials.
 */
export function invalidateCJTokenCache(): void {
  memCache = null;
  try {
    if (existsSync(TOKEN_FILE)) {
      writeFileSync(TOKEN_FILE, "{}", "utf-8");
    }
  } catch {
    // Non-critical
  }
}