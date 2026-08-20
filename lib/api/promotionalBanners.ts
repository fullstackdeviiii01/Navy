// lib/api/promotionalBanners.ts
import { getAuthToken, handleResponse } from "./helpers";

export const promotionalBannersApi = {
  getAll: async (includeInactive = false) => {
    const response = await fetch(
      `/api/promotional-banners?includeInactive=${includeInactive}`
    );
    return handleResponse(response);
  },

  getById: async (id: string) => {
    const response = await fetch(`/api/promotional-banners/${id}`);
    return handleResponse(response);
  },

  getActive: async (targetPage: string, position?: string) => {
    const url = position 
      ? `/api/promotional-banners/active?target_page=${targetPage}&position=${position}`
      : `/api/promotional-banners/active?target_page=${targetPage}`;
    
    const response = await fetch(url);
    return handleResponse(response);
  },

  create: async (data: any) => {
    const response = await fetch("/api/promotional-banners", {
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
    const response = await fetch(`/api/promotional-banners/${id}`, {
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
    const response = await fetch(`/api/promotional-banners/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${getAuthToken()}` },
    });
    return handleResponse(response);
  },

  uploadImage: async (file: File) => {
    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch("/api/promotional-banners/upload-image", {
      method: "POST",
      headers: { Authorization: `Bearer ${getAuthToken()}` },
      body: formData,
    });
    return handleResponse(response);
  },
};