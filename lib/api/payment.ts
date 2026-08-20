// lib/api/payment.ts
import { getAuthToken, handleResponse } from "./helpers";

export const paymentApi = {
  // Admin - Get all payment gateways
  getGateways: async () => {
    const response = await fetch("/api/payment-gateways", {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return handleResponse(response);
  },

  // Admin - Get single gateway with credentials
  getGateway: async (name: string) => {
    const response = await fetch(`/api/payment-gateways/${name}`, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return handleResponse(response);
  },

  // Admin - Save gateway configuration
  saveGateway: async (data: any) => {
    const response = await fetch("/api/payment-gateways", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  // Admin - Delete gateway
  deleteGateway: async (name: string) => {
    const response = await fetch(`/api/payment-gateways/${name}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return handleResponse(response);
  },

  // User - Get active payment gateways
  getActiveGateways: async () => {
    const response = await fetch("/api/payment/gateways/active");
    return handleResponse(response);
  },
};
