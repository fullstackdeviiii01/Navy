// lib/api/coupons.ts
import { getApiHeaders, handleResponse } from "./helpers";

export const couponsApi = {
  // Get all coupons (admin only)
  getAll: async () => {
    const response = await fetch("/api/coupons", {
      headers: getApiHeaders(),
      credentials: "include",
    });
    return handleResponse(response);
  },

  // Get active coupons for display on products (public)
  getActiveCoupons: async () => {
    const response = await fetch("/api/coupons/active", {
      credentials: "include",
    });
    return handleResponse(response);
  },

  // Get coupon by ID (admin only)
  getById: async (id: string) => {
    const response = await fetch(`/api/coupons/${id}`, {
      headers: getApiHeaders(),
      credentials: "include",
    });
    return handleResponse(response);
  },

  // Create coupon (admin only)
  create: async (data: any) => {
    const response = await fetch("/api/coupons", {
      method: "POST",
      headers: getApiHeaders({ "Content-Type": "application/json" }),
      credentials: "include",
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  // Update coupon (admin only)
  update: async (id: string, data: any) => {
    const response = await fetch(`/api/coupons/${id}`, {
      method: "PUT",
      headers: getApiHeaders({ "Content-Type": "application/json" }),
      credentials: "include",
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  // Delete coupon (admin only)
  delete: async (id: string) => {
    const response = await fetch(`/api/coupons/${id}`, {
      method: "DELETE",
      headers: getApiHeaders(),
      credentials: "include",
    });
    return handleResponse(response);
  },

  // Validate coupon (check if code exists and is valid)
  validate: async (code: string) => {
    const response = await fetch(`/api/coupons/validate`, {
      method: "POST",
      headers: getApiHeaders({ "Content-Type": "application/json" }),
      credentials: "include",
      body: JSON.stringify({ code }),
    });
    return handleResponse(response);
  },
};