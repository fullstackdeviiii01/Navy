// lib/api/reports.ts
import { getAuthToken, handleResponse } from "./helpers";

export const reportsApi = {
  getSalesReport: async (params?: {
    range?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    const queryParams = new URLSearchParams({ type: "sales" });
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });
    }

    const response = await fetch(`/api/reports?${queryParams}`, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return handleResponse(response);
  },

  getProductReport: async (params?: {
    range?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    const queryParams = new URLSearchParams({ type: "products" });
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });
    }

    const response = await fetch(`/api/reports?${queryParams}`, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return handleResponse(response);
  },

  getCustomerReport: async (params?: {
    range?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    const queryParams = new URLSearchParams({ type: "customers" });
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });
    }

    const response = await fetch(`/api/reports?${queryParams}`, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return handleResponse(response);
  },

  getInventoryReport: async () => {
    const response = await fetch("/api/reports?type=inventory", {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return handleResponse(response);
  },
};