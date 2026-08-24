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
    console.log("🌐 [cartApi.addItem] Sending POST /api/cart with payload:", {
      product_id: productId,
      quantity,
      variant_id: variantId,
      variant_attributes: variantAttributes,
      product_name: productName,
      product_image: productImage,
    });

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
    console.log("🌐 [cartApi.addItem] Received result from /api/cart:", result);
    return result;
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

  applyCoupon: async (code: string) => {
    const response = await fetch("/api/cart/apply-coupon", {
      method: "POST",
      headers: getApiHeaders({ "Content-Type": "application/json" }),
      credentials: "include",
      body: JSON.stringify({ code }),
    });
    return handleResponse(response);
  },

  removeCoupon: async () => {
    const response = await fetch("/api/cart/remove-coupon", {
      method: "POST",
      headers: getApiHeaders(),
      credentials: "include",
    });
    return handleResponse(response);
  },
};
