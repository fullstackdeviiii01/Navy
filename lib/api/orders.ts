// lib/api/orders.ts
import { getAuthToken, handleResponse } from "./helpers";

export const ordersApi = {
  // Get user's orders
  getOrders: async (page: number = 1, limit: number = 10, status?: string) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (status) {
      params.append("status", status);
    }

    const response = await fetch(`/api/orders?${params}`, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return handleResponse(response);
  },

  // Get order by ID
  getOrderById: async (id: string) => {
    const response = await fetch(`/api/orders/${id}`, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return handleResponse(response);
  },

  // Cancel order
  cancelOrder: async (id: string) => {
    const response = await fetch(`/api/orders/${id}/cancel`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return handleResponse(response);
  },

  // Download invoice PDF — only available when payment_status === "paid"
  downloadInvoice: async (orderId: string): Promise<Blob> => {
    const response = await fetch(`/api/orders/${orderId}/invoice`, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || "Failed to download invoice");
    }
    return response.blob();
  },
};

export const adminOrdersApi = {
  // Get all orders with filters
  getAll: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    payment_status?: string;
    search?: string;
  }) => {
    const queryParams = new URLSearchParams({ admin: "true" });
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== "all") {
          queryParams.append(key, String(value));
        }
      });
    }

    const response = await fetch(`/api/orders?${queryParams}`, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return handleResponse(response);
  },

  // Get order by ID
  getById: async (id: string) => {
    const response = await fetch(`/api/orders/${id}?admin=true`, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return handleResponse(response);
  },

  // Update order status
  updateStatus: async (
    id: string,
    status: string,
    trackingData?: { tracking_number?: string; carrier?: string }
  ) => {
    const response = await fetch(`/api/orders/${id}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify({
        status,
        ...(trackingData && trackingData),
      }),
    });
    return handleResponse(response);
  },

  // Update tracking info
  updateTracking: async (
    id: string,
    data: { tracking_number: string; carrier: string }
  ) => {
    const response = await fetch(`/api/orders/${id}/tracking`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  // Add admin notes
  addNotes: async (id: string, notes: string) => {
    const response = await fetch(`/api/orders/${id}/notes`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify({ admin_notes: notes }),
    });
    return handleResponse(response);
  },

  // Mark COD payment as received
  markPaid: async (id: string) => {
    const response = await fetch(`/api/orders/${id}/mark-paid`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return handleResponse(response);
  },

  // Get order statistics
  getStats: async () => {
    const response = await fetch("/api/orders/stats", {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return handleResponse(response);
  },

  // Download invoice PDF — admin can always download regardless of payment status
  downloadInvoice: async (orderId: string): Promise<Blob> => {
    const response = await fetch(`/api/orders/${orderId}/invoice?admin=true`, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || "Failed to download invoice");
    }
    return response.blob();
  },
};