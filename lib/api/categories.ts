import { getAuthToken, handleResponse } from "./helpers";
import { ICategoryAttribute } from "../../app/models/Category";

export const categoriesApi = {
  getAll: async (includeInactive = true) => {
    const response = await fetch(
      `/api/categories?includeInactive=${includeInactive}`
    );
    return handleResponse(response);
  },

  getById: async (id: string) => {
    const response = await fetch(`/api/categories/${id}`);
    return handleResponse(response);
  },

  getProducts: async (id: string) => {
    const response = await fetch(`/api/categories/${id}/products`);
    return handleResponse(response);
  },

  create: async (data: any) => {
    const response = await fetch("/api/categories", {
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
    const response = await fetch(`/api/categories/${id}`, {
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
    const response = await fetch(`/api/categories/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${getAuthToken()}` },
    });
    return handleResponse(response);
  },

  uploadImage: async (file: File) => {
    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch("/api/categories/upload-image", {
      method: "POST",
      headers: { Authorization: `Bearer ${getAuthToken()}` },
      body: formData,
    });
    return handleResponse(response);
  },

  getAttributes: async (categoryId: string) => {
    const response = await fetch(
      `/api/categories/${categoryId}/attributes`
    );
    return handleResponse(response);
  },

  addAttribute: async (categoryId: string, attribute: Partial<ICategoryAttribute>) => {
    const response = await fetch(
      `/api/categories/${categoryId}/attributes`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify(attribute),
      }
    );
    return handleResponse(response);
  },

  updateAttribute: async (
    categoryId: string,
    attributeId: string,
    attribute: Partial<ICategoryAttribute>
  ) => {
    const response = await fetch(
      `/api/categories/${categoryId}/attributes/${attributeId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify(attribute),
      }
    );
    return handleResponse(response);
  },

  deleteAttribute: async (categoryId: string, attributeId: string) => {
    const response = await fetch(
      `/api/categories/${categoryId}/attributes/${attributeId}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      }
    );
    return handleResponse(response);
  },

  async getForCategoryPage(): Promise<{ categories: any[] }> {
    const response = await fetch("/api/categories?includeSubcategories=true", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch categories");
    }

    return response.json();
  }
};