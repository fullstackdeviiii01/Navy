// lib/meta/conversionsApi.ts
import crypto from "crypto";

const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || process.env.META_PIXEL_ID || "";
const META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN || "";
const META_GRAPH_API_VERSION = "v19.0";

/**
 * SHA-256 hash helper as required by Meta CAPI documentation
 */
export function hashData(value?: string | null): string | undefined {
  if (!value || typeof value !== "string") return undefined;
  const normalized = value.trim().toLowerCase();
  if (!normalized) return undefined;
  return crypto.createHash("sha256").update(normalized).digest("hex");
}

/**
 * Normalizes and hashes phone numbers (digits only, e.g. 923001234567)
 */
export function hashPhone(phone?: string | null): string | undefined {
  if (!phone || typeof phone !== "string") return undefined;
  const digitsOnly = phone.replace(/\D/g, "");
  if (!digitsOnly) return undefined;
  return crypto.createHash("sha256").update(digitsOnly).digest("hex");
}

export interface CapiUserData {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  clientIpAddress?: string;
  clientUserAgent?: string;
  fbc?: string; // _fbc cookie
  fbp?: string; // _fbp cookie
}

export interface CapiCustomData {
  currency?: string;
  value?: number;
  content_ids?: string[];
  content_type?: string;
  content_name?: string;
  content_category?: string;
  num_items?: number;
  order_id?: string;
  [key: string]: any;
}

export interface CapiEventPayload {
  eventName: "PageView" | "ViewContent" | "AddToCart" | "InitiateCheckout" | "Purchase";
  eventTime?: number; // Unix timestamp
  eventId?: string; // Unique deduplication ID matching browser pixel event
  eventSourceUrl?: string;
  userData: CapiUserData;
  customData?: CapiCustomData;
}

/**
 * Sends an event to Meta Conversions API (CAPI)
 */
export async function sendMetaCapiEvent(event: CapiEventPayload) {
  if (!META_PIXEL_ID || !META_ACCESS_TOKEN) {
    // Graceful exit if not configured yet
    return { skipped: true, reason: "META_PIXEL_ID or META_ACCESS_TOKEN not set" };
  }

  const endpoint = `https://graph.facebook.com/${META_GRAPH_API_VERSION}/${META_PIXEL_ID}/events?access_token=${encodeURIComponent(
    META_ACCESS_TOKEN
  )}`;

  const userDataFormatted: Record<string, any> = {};

  if (event.userData.email) {
    userDataFormatted.em = [hashData(event.userData.email)];
  }
  if (event.userData.phone) {
    userDataFormatted.ph = [hashPhone(event.userData.phone)];
  }
  if (event.userData.firstName) {
    userDataFormatted.fn = [hashData(event.userData.firstName)];
  }
  if (event.userData.lastName) {
    userDataFormatted.ln = [hashData(event.userData.lastName)];
  }
  if (event.userData.city) {
    userDataFormatted.ct = [hashData(event.userData.city)];
  }
  if (event.userData.state) {
    userDataFormatted.st = [hashData(event.userData.state)];
  }
  if (event.userData.zip) {
    userDataFormatted.zp = [hashData(event.userData.zip)];
  }
  if (event.userData.country) {
    userDataFormatted.country = [hashData(event.userData.country || "pk")];
  }
  if (event.userData.clientIpAddress) {
    userDataFormatted.client_ip_address = event.userData.clientIpAddress;
  }
  if (event.userData.clientUserAgent) {
    userDataFormatted.client_user_agent = event.userData.clientUserAgent;
  }
  if (event.userData.fbc) {
    userDataFormatted.fbc = event.userData.fbc;
  }
  if (event.userData.fbp) {
    userDataFormatted.fbp = event.userData.fbp;
  }

  const payload = {
    data: [
      {
        event_name: event.eventName,
        event_time: event.eventTime || Math.floor(Date.now() / 1000),
        event_id: event.eventId,
        event_source_url: event.eventSourceUrl || "https://talalwoodenlamp.com",
        action_source: "website",
        user_data: userDataFormatted,
        custom_data: event.customData,
      },
    ],
  };

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await res.json();
    if (!res.ok) {
      console.warn("[Meta CAPI] Event dispatch warning:", result);
    }
    return result;
  } catch (error) {
    console.error("[Meta CAPI] Failed to send event:", error);
    return { error: (error as Error).message };
  }
}
