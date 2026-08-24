// lib/api/shipping.ts
import { getApiHeaders, handleResponse } from "./helpers";

export const shippingApi = {
  getActiveServices: async () => {
    const response = await fetch("/api/shipping-services");
    return handleResponse(response);
  },

  selectService: async (serviceId: string) => {
    const response = await fetch("/api/cart/select-shipping", {
      method: "POST",
      headers: getApiHeaders({ "Content-Type": "application/json" }),
      credentials: "include",
      body: JSON.stringify({ shipping_service_id: serviceId }),
    });
    return handleResponse(response);
  },

  // Admin APIs
  admin: {
    getAll: async () => {
      const response = await fetch("/api/shipping-services/admin", {
        headers: getApiHeaders(),
        credentials: "include",
      });
      return handleResponse(response);
    },

    getById: async (id: string) => {
      const response = await fetch(`/api/shipping-services/admin/${id}`, {
        headers: getApiHeaders(),
        credentials: "include",
      });
      return handleResponse(response);
    },

    create: async (data: any) => {
      const response = await fetch("/api/shipping-services/admin", {
        method: "POST",
        headers: getApiHeaders({ "Content-Type": "application/json" }),
        credentials: "include",
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    },

    update: async (id: string, data: any) => {
      const response = await fetch(`/api/shipping-services/admin/${id}`, {
        method: "PUT",
        headers: getApiHeaders({ "Content-Type": "application/json" }),
        credentials: "include",
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    },

    delete: async (id: string) => {
      const response = await fetch(`/api/shipping-services/admin/${id}`, {
        method: "DELETE",
        headers: getApiHeaders(),
        credentials: "include",
      });
      return handleResponse(response);
    },
  },
};