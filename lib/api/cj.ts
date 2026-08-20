/**
 * lib/api/cj.ts
 *
 * Client-side CJ Dropshipping API helper.
 * Mirrors lib/api/aliexpress.ts exactly.
 */

import { getAuthToken, handleResponse } from "./helpers";

export const cjApi = {
  // ── Credentials ────────────────────────────────────────────────────────────

  getCredentials: async () => {
    const response = await fetch("/api/cj/credentials", {
      headers: { Authorization: `Bearer ${getAuthToken()}` },
    });
    return handleResponse(response);
  },

  saveCredentials: async (params: { api_key: string }) => {
    const response = await fetch("/api/cj/credentials", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(params),
    });
    return handleResponse(response);
  },

  deleteCredentials: async () => {
    const response = await fetch("/api/cj/credentials", {
      method: "DELETE",
      headers: { Authorization: `Bearer ${getAuthToken()}` },
    });
    return handleResponse(response);
  },

  // ── Products ───────────────────────────────────────────────────────────────

  /**
   * Search CJ products by keyword.
   */
  searchProducts: async (params: {
    keyword: string;
    page?: number;
    pageSize?: number;
    categoryId?: string;
    countryCode?: string;
    minPrice?: number;
    maxPrice?: number;
    freeShipping?: boolean;
  }) => {
    const query = new URLSearchParams();
    query.set("keyword", params.keyword);
    if (params.page) query.set("page", String(params.page));
    if (params.pageSize) query.set("pageSize", String(params.pageSize));
    if (params.categoryId) query.set("categoryId", params.categoryId);
    if (params.countryCode) query.set("countryCode", params.countryCode);
    if (params.minPrice !== undefined) query.set("minPrice", String(params.minPrice));
    if (params.maxPrice !== undefined) query.set("maxPrice", String(params.maxPrice));
    if (params.freeShipping) query.set("freeShipping", "1");

    const response = await fetch(`/api/cj/search?${query.toString()}`, {
      headers: { Authorization: `Bearer ${getAuthToken()}` },
    });
    return handleResponse(response);
  },

  /**
   * Fetch and preview a CJ product without importing it.
   */
  previewProduct: async (productId: string) => {
    const response = await fetch(`/api/cj/product?id=${encodeURIComponent(productId)}`, {
      headers: { Authorization: `Bearer ${getAuthToken()}` },
    });
    return handleResponse(response);
  },

  /**
   * Import a CJ product into the database.
   */
  importProduct: async (params: {
    productId: string;
    categoryId: string;
    markupPercent?: number;
    downloadImages?: boolean;
  }) => {
    const response = await fetch("/api/cj/import", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(params),
    });
    return handleResponse(response);
  },
};