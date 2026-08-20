// lib/api/returns.ts - SIMPLIFIED
import { getAuthToken, handleResponse } from "./helpers";

export const returnsApi = {
  // User - Create return request (refund only)
  createReturn: async (data: {
    order_id: string;
    items: Array<{
      product_id: string;
      variant_id?: string;
      product_name: string;
      variant_attributes?: { [key: string]: string };
      quantity: number;
      price: number;
      reason: string;
    }>;
    return_reason: string;
    return_reason_details?: string;
    bank_transfer_details?: {
      account_holder_name: string;
      account_number: string;
      bank_name: string;
      ifsc_code?: string;
      swift_code?: string;
      routing_number?: string;
    };
  }) => {
    const response = await fetch("/api/returns", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  // User - Get user's returns
  getUserReturns: async (page: number = 1, limit: number = 10) => {
    const response = await fetch(`/api/returns?page=${page}&limit=${limit}`, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return handleResponse(response);
  },

  // User - Get single return
  getReturn: async (id: string) => {
    const response = await fetch(`/api/returns/${id}`, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return handleResponse(response);
  },
};

export const adminReturnsApi = {
  // Admin - Get all returns
  getAllReturns: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== "all") {
          queryParams.append(key, String(value));
        }
      });
    }

    const response = await fetch(`/api/returns/admin/?${queryParams}`, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return handleResponse(response);
  },

  // Admin - Get single return
  getReturn: async (id: string) => {
    const response = await fetch(`/api/returns/admin/${id}`, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return handleResponse(response);
  },

  // Admin - Approve or Reject return
  updateStatus: async (
    id: string,
    status: "approved" | "rejected",
    data?: { rejection_reason?: string }
  ) => {
    const response = await fetch(`/api/returns/admin/${id}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify({ status, ...data }),
    });
    return handleResponse(response);
  },

  // Admin - Process refund
  processRefund: async (id: string) => {
    const response = await fetch(`/api/returns/admin/${id}/refund`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return handleResponse(response);
  },

  // Admin - Complete bank transfer (for COD orders)
  completeBankTransfer: async (id: string) => {
    const response = await fetch(`/api/returns/admin/${id}/complete-transfer`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return handleResponse(response);
  },

  // Admin - Update return notes
  updateNotes: async (id: string, notes: string) => {
    const response = await fetch(`/api/returns/admin/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify({ admin_notes: notes }),
    });
    return handleResponse(response);
  },
};