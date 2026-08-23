// lib/api/variants.ts
import { getAuthToken, handleResponse } from "./helpers";

export const variantsApi = {
  listVariants: async (productId: string) => {
    const response = await fetch(
      `/api/products/variants/${productId}/list`
    );
    return handleResponse(response);
  },

  configureVariants: async (
    productId: string,
    config: {
      hasVariants: boolean;
      variantOptions?: any[];
      variants?: any[];
    }
  ) => {
    const response = await fetch(
      `/api/products/variants/${productId}/configure`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify(config),
      }
    );
    return handleResponse(response);
  },

  generateVariants: async (
    productId: string,
    config: {
      optionNames: string[];
      basePrice: number;
      baseSku?: string;
    }
  ) => {
    const response = await fetch(
      `/api/products/variants/${productId}/generate`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify(config),
      }
    );
    return handleResponse(response);
  },

  updateVariant: async (
    productId: string,
    variantId: string,
    updates: any
  ) => {
    const response = await fetch(
      `/api/products/variants/${productId}/update`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify({
          variantId,
          updates,
        }),
      }
    );
    return handleResponse(response);
  },

  syncVariants: async (productId: string) => {
    const response = await fetch(
      `/api/products/variants/${productId}/sync`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      }
    );
    return handleResponse(response);
  },
};