// lib/api/products.ts
import { getAuthToken, handleResponse } from "./helpers";

// Products API
export const productsApi = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    category?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) queryParams.append(key, String(value));
      });
    }

    const response = await fetch(`/api/products?${queryParams}`);
    return handleResponse(response);
  },

  getById: async (id: string) => {
    const response = await fetch(`/api/products/${id}`);
    return handleResponse(response);
  },

  getByCategory: async (categoryId: string) => {
    const response = await fetch(`/api/categories/${categoryId}/products`);
    return handleResponse(response);
  },

  create: async (data: any) => {
    const response = await fetch("/api/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  update: async (id: string, data: any) => {
    const response = await fetch(`/api/products/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  delete: async (id: string) => {
    const response = await fetch(`/api/products/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${getAuthToken()}` },
    });
    return handleResponse(response);
  },

  bulkUpload: async (products: any[]) => {
    const response = await fetch("/api/products/bulk-upload-products/csv-file", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify({ products }),
    });
    return handleResponse(response);
  },

  bulkUploadExcel: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/products/bulk-upload-products/excel-file", {
      method: "POST",
      headers: { Authorization: `Bearer ${getAuthToken()}` },
      body: formData,
    });
    return handleResponse(response);
  },

  uploadImage: async (file: File) => {
    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch("/api/products/upload-image", {
      method: "POST",
      headers: { Authorization: `Bearer ${getAuthToken()}` },
      body: formData,
    });
    return handleResponse(response);
  },

  uploadVideo: async (file: File) => {
  const formData = new FormData();
  formData.append("video", file);

  const response = await fetch("/api/products/upload-video", {
    method: "POST",
    headers: { Authorization: `Bearer ${getAuthToken()}` },
    body: formData,
  });
  return handleResponse(response);
},

};

