import { getAuthToken, handleResponse } from "./helpers";

export const cartApi = {
  getCart: async () => {
    const response = await fetch("/api/cart", {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return handleResponse(response);
  },

  addItem: async (
    productId: string,
    quantity: number = 1,
    variantId?: string
  ) => {
    const response = await fetch("/api/cart", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify({
        product_id: productId,
        quantity,
        variant_id: variantId,
      }),
    });
    return handleResponse(response);
  },

  updateQuantity: async (itemId: string, quantity: number) => {
    const response = await fetch(`/api/cart/item/${itemId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify({ quantity }),
    });
    return handleResponse(response);
  },

  updateGuestEmail: async (email: string, source: string = 'cart_sidebar') => {
    const response = await fetch("/api/cart/update-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify({ email, source }),
    });
    return handleResponse(response);
  },

  removeItem: async (itemId: string) => {
    const response = await fetch(`/api/cart/item/${itemId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return handleResponse(response);
  },

  clearCart: async () => {
    const response = await fetch("/api/cart/clear", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return handleResponse(response);
  },

  applyCoupon: async (code: string) => {
    const response = await fetch("/api/cart/apply-coupon", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify({ code }),
    });
    return handleResponse(response);
  },

  removeCoupon: async () => {
    const response = await fetch("/api/cart/remove-coupon", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return handleResponse(response);
  },
};
