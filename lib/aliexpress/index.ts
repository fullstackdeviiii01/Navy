import crypto from "crypto";
import connectDB from "../db";
import AliexpressCredentials from "../../app/models/AliexpressCredentials";
import { decrypt } from "../crypto/credentials";

interface ResolvedCredentials {
  appKey: string;
  appSecret: string;
  accessToken: string;
}

async function getCredentials(): Promise<ResolvedCredentials> {
  try {
    await connectDB();
    const cred = await (AliexpressCredentials as any)
      .findOne({ is_active: true })
      .sort({ created_at: -1 });

    if (cred) {
      return {
        appKey: cred.app_key,
        appSecret: decrypt(cred.app_secret),
        accessToken: decrypt(cred.access_token),
      };
    }
  } catch (err) {
    console.warn(
      "[AliExpress] Could not load credentials from DB, falling back to env:",
      err
    );
  }

  const appKey = process.env.ALI_APP_KEY;
  const appSecret = process.env.ALI_APP_SECRET;
  const accessToken = process.env.ALI_ACCESS_TOKEN;

  if (!appKey || !appSecret || !accessToken) {
    throw new Error(
      "AliExpress credentials not configured. Add them via Admin → Settings → AliExpress."
    );
  }

  return { appKey, appSecret, accessToken };
}

// /sync endpoint: NO method name prefix — sorted params only
function generateSign(
  params: Record<string, string>,
  appSecret: string
): string {
  const sortedStr = Object.keys(params)
    .sort()
    .map((k) => `${k}${params[k]}`)
    .join("");

  return crypto
    .createHmac("sha256", appSecret)
    .update(sortedStr)
    .digest("hex")
    .toUpperCase();
}

const BASE_URL = "https://api-sg.aliexpress.com/sync";

export async function aliexpressRequest(
  method: string,
  params: Record<string, string>
): Promise<any> {
  const { appKey, appSecret, accessToken } = await getCredentials();

  const timestamp = Date.now().toString();

  const allParams: Record<string, string> = {
    method,
    app_key: appKey,
    access_token: accessToken,
    timestamp,
    sign_method: "sha256",
    ...params,
  };

  allParams.sign = generateSign(allParams, appSecret);

  const queryString = new URLSearchParams(allParams).toString();
  const url = `${BASE_URL}?${queryString}`;

  const response = await fetch(url, { method: "GET" });

  if (!response.ok) {
    throw new Error(`AliExpress API HTTP error: ${response.status}`);
  }

  return response.json();
}