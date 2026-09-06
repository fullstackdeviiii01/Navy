// lib/api/cart.ts
import { getApiHeaders, handleResponse } from "./helpers";

export const cartApi = {
  getCart: async () => {
    const response = await fetch("/api/cart", {
      headers: getApiHeaders(),
      credentials: "include",
    });
    return handleResponse(response);
  },

  addItem: async (
    productId: string,
    quantity: number = 1,
    variantId?: string,
    variantAttributes?: Record<string, string>,
    productName?: string,
    productImage?: string
  ) => {

    const response = await fetch("/api/cart", {
      method: "POST",
      headers: getApiHeaders({ "Content-Type": "application/json" }),
      credentials: "include",
      body: JSON.stringify({
        product_id: productId,
        quantity,
        variant_id: variantId,
        variant_attributes: variantAttributes,
        product_name: productName,
        product_image: productImage,
      }),
    });
    const result = await handleResponse(response);
    return result;
  },

  initiateBuyNow: async (
    productId: string,
    quantity: number = 1,
    variantId?: string,
    variantAttributes?: Record<string, string>,
    productName?: string,
    productImage?: string
  ) => {
    const response = await fetch("/api/cart/buy-now", {
      method: "POST",
      headers: getApiHeaders({ "Content-Type": "application/json" }),
      credentials: "include",
      body: JSON.stringify({
        product_id: productId,
        quantity,
        variant_id: variantId,
        variant_attributes: variantAttributes,
        product_name: productName,
        product_image: productImage,
      }),
    });
    return handleResponse(response);
  },

  updateQuantity: async (itemId: string, quantity: number) => {
    const response = await fetch(`/api/cart/item/${itemId}`, {
      method: "PUT",
      headers: getApiHeaders({ "Content-Type": "application/json" }),
      credentials: "include",
      body: JSON.stringify({ quantity }),
    });
    return handleResponse(response);
  },

  updateGuestEmail: async (email: string, source: string = "cart_sidebar") => {
    const response = await fetch("/api/cart/update-email", {
      method: "POST",
      headers: getApiHeaders({ "Content-Type": "application/json" }),
      credentials: "include",
      body: JSON.stringify({ email, source }),
    });
    return handleResponse(response);
  },

  removeItem: async (itemId: string) => {
    const response = await fetch(`/api/cart/item/${itemId}`, {
      method: "DELETE",
      headers: getApiHeaders(),
      credentials: "include",
    });
    return handleResponse(response);
  },

  clearCart: async () => {
    const response = await fetch("/api/cart/clear", {
      method: "POST",
      headers: getApiHeaders(),
      credentials: "include",
    });
    return handleResponse(response);
  },

  applyCoupon: async (code: string, buyNow: boolean = false) => {
    const response = await fetch("/api/cart/apply-coupon", {
      method: "POST",
      headers: getApiHeaders({
        "Content-Type": "application/json",
        ...(buyNow ? { "x-buy-now": "1" } : {}),
      }),
      credentials: "include",
      body: JSON.stringify({ code, buy_now: buyNow }),
    });
    return handleResponse(response);
  },

  removeCoupon: async (buyNow: boolean = false) => {
    const response = await fetch("/api/cart/remove-coupon", {
      method: "POST",
      headers: getApiHeaders({
        "Content-Type": "application/json",
        ...(buyNow ? { "x-buy-now": "1" } : {}),
      }),
      credentials: "include",
      body: JSON.stringify({ buy_now: buyNow }),
    });
    return handleResponse(response);
  },
};
