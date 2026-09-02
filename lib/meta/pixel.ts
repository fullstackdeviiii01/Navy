// lib/meta/pixel.ts
"use client";

declare global {
  interface Window {
    fbq?: any;
    _fbq?: any;
  }
}

export const META_PIXEL_ID =
  process.env.NEXT_PUBLIC_META_PIXEL_ID || "3244071132470552";

/**
 * Safely call fbq if available in window and pixel ID is configured
 */
export function trackEvent(eventName: string, data: Record<string, any> = {}) {
  if (typeof window === "undefined" || !window.fbq) {
    return;
  }

  try {
    window.fbq("track", eventName, data);
  } catch (err) {
    console.warn(`[Meta Pixel] Failed to track ${eventName}:`, err);
  }
}

/**
 * Track PageView event
 */
export function trackPageView() {
  trackEvent("PageView");
}

/**
 * Track ViewContent event (Product Detail View)
 */
export interface ViewContentParams {
  content_ids: string[];
  content_name: string;
  content_type?: string;
  content_category?: string;
  value: number;
  currency?: string;
}

export function trackViewContent(params: ViewContentParams) {
  trackEvent("ViewContent", {
    content_ids: params.content_ids,
    content_name: params.content_name,
    content_type: params.content_type || "product",
    content_category: params.content_category || "Wooden Lamps",
    value: params.value,
    currency: params.currency || "PKR",
  });
}

/**
 * Track AddToCart event
 */
export interface AddToCartParams {
  content_ids: string[];
  content_name: string;
  content_type?: string;
  value: number;
  currency?: string;
  quantity?: number;
}

export function trackAddToCart(params: AddToCartParams) {
  trackEvent("AddToCart", {
    content_ids: params.content_ids,
    content_name: params.content_name,
    content_type: params.content_type || "product",
    value: params.value,
    currency: params.currency || "PKR",
    num_items: params.quantity || 1,
  });
}

/**
 * Track InitiateCheckout event
 */
export interface InitiateCheckoutParams {
  content_ids: string[];
  num_items: number;
  value: number;
  currency?: string;
}

export function trackInitiateCheckout(params: InitiateCheckoutParams) {
  trackEvent("InitiateCheckout", {
    content_ids: params.content_ids,
    num_items: params.num_items,
    value: params.value,
    currency: params.currency || "PKR",
  });
}

/**
 * Track Purchase event
 */
export interface PurchaseParams {
  content_ids: string[];
  content_type?: string;
  num_items: number;
  value: number;
  currency?: string;
  order_id?: string;
}

export function trackPurchase(params: PurchaseParams) {
  trackEvent("Purchase", {
    content_ids: params.content_ids,
    content_type: params.content_type || "product",
    num_items: params.num_items,
    value: params.value,
    currency: params.currency || "PKR",
    order_id: params.order_id,
  });
}
