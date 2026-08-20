/**
 * lib/cj/index.ts
 *
 * Base CJ Dropshipping request helper.
 * Mirrors the aliexpressRequest() pattern from lib/aliexpress/index.ts.
 *
 * All CJ API calls use:
 *   - Header: CJ-Access-Token: <token>
 *   - GET requests: query params
 *   - POST requests: JSON body
 */

import { getCJAccessToken } from "./auth";

const CJ_BASE_URL = "https://developers.cjdropshipping.com/api2.0/v1";


/**
 * Make a GET request to the CJ API.
 */
export async function cjGet(
  path: string,
  params: Record<string, string | number | boolean | undefined> = {}
): Promise<any> {
  const token = await getCJAccessToken();

  // Build query string, skip undefined values
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, String(value));
    }
  }

  const url = `${CJ_BASE_URL}${path}?${query.toString()}`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      "CJ-Access-Token": token,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`CJ API HTTP error ${res.status} on GET ${path}`);
  }

  const data = await res.json();

  if (data.code !== 200) {
    throw new Error(`CJ API error: ${data.message} (code: ${data.code})`);
  }

  return data.data;
}

/**
 * Make a POST request to the CJ API.
 */
export async function cjPost(path: string, body: Record<string, any> = {}): Promise<any> {
  const token = await getCJAccessToken();

  const res = await fetch(`${CJ_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "CJ-Access-Token": token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`CJ API HTTP error ${res.status} on POST ${path}`);
  }

  const data = await res.json();

  if (data.code !== 200) {
    throw new Error(`CJ API error: ${data.message} (code: ${data.code})`);
  }

  return data.data;
}