// lib/api/aliexpress.ts
import { getAuthToken, handleResponse } from "./helpers";

export const aliexpressApi = {
  /**
   * Fetch and preview a product from AliExpress without importing it.
   * Used in the import UI before the admin confirms.
   */
  previewProduct: async (productId: string | number) => {
    const response = await fetch(
      `/api/aliexpress/product?id=${productId}`,
      {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      }
    );
    return handleResponse(response);
  },

  /**
   * Import an AliExpress product into the database.
   * Downloads images, applies markup, and creates the product record.
   */
  importProduct: async (params: {
    productId: string | number;
    categoryId: string;
    markupPercent?: number;
    downloadImages?: boolean;
  }) => {
    const response = await fetch("/api/aliexpress/import", {
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