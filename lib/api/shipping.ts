// lib/api/shipping.ts
import { getAuthToken, handleResponse } from "./helpers";

export const shippingApi = {
  getActiveServices: async () => {
    const response = await fetch("/api/shipping-services");
    return handleResponse(response);
  },

  selectService: async (serviceId: string) => {
    const response = await fetch("/api/cart/select-shipping", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify({ shipping_service_id: serviceId }),
    });
    return handleResponse(response);
  },

  // Admin APIs
  admin: {
    getAll: async () => {
      const response = await fetch("/api/shipping-services/admin", {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });
      return handleResponse(response);
    },

    getById: async (id: string) => {
      const response = await fetch(`/api/shipping-services/admin/${id}`, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });
      return handleResponse(response);
    },

    create: async (data: any) => {
      const response = await fetch("/api/shipping-services/admin", {
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
      const response = await fetch(`/api/shipping-services/admin/${id}`, {
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
      const response = await fetch(`/api/shipping-services/admin/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });
      return handleResponse(response);
    },
  },
};