// lib/api/heroSlider.ts
import { getAuthToken, handleResponse } from "./helpers";

export const heroSliderApi = {
  getAll: async (includeInactive = false) => {
    const response = await fetch(
      `/api/hero-slider?includeInactive=${includeInactive}`
    );
    return handleResponse(response);
  },

  create: async (data: any) => {
    const response = await fetch("/api/hero-slider", {
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
    const response = await fetch(`/api/hero-slider/${id}`, {
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
    const response = await fetch(`/api/hero-slider/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${getAuthToken()}` },
    });
    return handleResponse(response);
  },

  uploadImage: async (file: File) => {
    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch("/api/hero-slider/upload-image", {
      method: "POST",
      headers: { Authorization: `Bearer ${getAuthToken()}` },
      body: formData,
    });
    return handleResponse(response);
  },

};