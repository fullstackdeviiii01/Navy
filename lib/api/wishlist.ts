// lib/api/wishlist.ts - COMPLETE REPLACEMENT
import { getAuthToken, handleResponse } from "./helpers";

export const wishlistApi = {
  // Get wishlist (works for both guest and authenticated)
  getWishlist: async () => {
    const token = getAuthToken();
    const headers: any = {};
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch("/api/wishlist", { headers });
    return handleResponse(response);
  },

  // Add product to wishlist
  addToWishlist: async (productId: string) => {
    const token = getAuthToken();
    const headers: any = {
      "Content-Type": "application/json",
    };
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch("/api/wishlist", {
      method: "POST",
      headers,
      body: JSON.stringify({ product_id: productId }),
    });
    return handleResponse(response);
  },

  // Remove product from wishlist
  removeFromWishlist: async (productId: string) => {
    const token = getAuthToken();
    const headers: any = {};
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`/api/wishlist/${productId}`, {
      method: "DELETE",
      headers,
    });
    return handleResponse(response);
  },

  // Check if product is in wishlist
  isInWishlist: async (productId: string) => {
    const token = getAuthToken();
    const headers: any = {};
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`/api/wishlist/check/${productId}`, {
      headers,
    });
    return handleResponse(response);
  },

  // Clear entire wishlist
  clearWishlist: async () => {
    const token = getAuthToken();
    const headers: any = {};
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch("/api/wishlist/clear", {
      method: "POST",
      headers,
    });
    return handleResponse(response);
  },
};