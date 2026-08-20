// lib/api/faqs.ts
import { getAuthToken, handleResponse } from "./helpers";

export const faqsApi = {
  // Public - Get all active FAQs
  getAll: async (category?: string) => {
    const params = new URLSearchParams();
    if (category) params.append("category", category);
    
    const response = await fetch(`/api/faqs?${params}`);
    return handleResponse(response);
  },

  // Admin - Get all FAQs including inactive
  getAllAdmin: async (includeInactive = true, category?: string) => {
    const params = new URLSearchParams({
      includeInactive: includeInactive.toString(),
    });
    if (category) params.append("category", category);

    const response = await fetch(`/api/faqs?${params}`, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return handleResponse(response);
  },

  // Get FAQ by ID
  getById: async (id: string) => {
    const response = await fetch(`/api/faqs/${id}`, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return handleResponse(response);
  },

  // Create FAQ
  create: async (data: any) => {
    const response = await fetch("/api/faqs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  // Update FAQ
  update: async (id: string, data: any) => {
    const response = await fetch(`/api/faqs/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  // Delete FAQ
  delete: async (id: string) => {
    const response = await fetch(`/api/faqs/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return handleResponse(response);
  },
};