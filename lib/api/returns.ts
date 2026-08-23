// lib/api/returns.ts
import { getAuthToken, handleResponse } from "./helpers";

export const returnsApi = {
  // Submit new return request (Stage 1)
  submitReturn: async (data: {
    order_id: string;
    items: Array<{
      product_id: string;
      product_name: string;
      product_image?: string;
      variant_attributes?: Record<string, string>;
      quantity: number;
      price: number;
    }>;
    return_reason: string;
    return_reason_details?: string;
    media_urls?: string[];
  }) => {
    const response = await fetch("/api/returns", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
      credentials: "include",
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  // Get active return for an order
  getReturnByOrder: async (orderId: string) => {
    const response = await fetch(`/api/returns/order/${orderId}`, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
      credentials: "include",
    });
    return handleResponse(response);
  },

  // Submit bank/wallet payout details (Stage 3 - only unlocked after admin approval)
  submitPayoutDetails: async (
    returnId: string,
    data: {
      method: "bank_transfer" | "jazzcash" | "easypaisa";
      account_title: string;
      account_number: string;
      bank_or_wallet_name: string;
    }
  ) => {
    const response = await fetch(`/api/returns/${returnId}/payout-details`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
      credentials: "include",
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },
};

export const adminReturnsApi = {
  // Get all returns with filters & KPI metrics
  getAll: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== "all" && value !== "") {
          queryParams.append(key, String(value));
        }
      });
    }

    const response = await fetch(`/api/admin/returns?${queryParams}`, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
      credentials: "include",
    });
    return handleResponse(response);
  },

  // Get single return detail
  getById: async (id: string) => {
    const response = await fetch(`/api/admin/returns/${id}`, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
      credentials: "include",
    });
    return handleResponse(response);
  },

  // Review return claim: Approve or Reject
  updateStatus: async (
    id: string,
    status: "approved" | "rejected",
    rejection_reason?: string
  ) => {
    const response = await fetch(`/api/admin/returns/${id}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
      credentials: "include",
      body: JSON.stringify({ status, rejection_reason }),
    });
    return handleResponse(response);
  },

  // Settle payout and confirm refund
  settleRefund: async (
    id: string,
    data: {
      transaction_reference: string;
      proof_url?: string;
      admin_notes?: string;
    }
  ) => {
    const response = await fetch(`/api/admin/returns/${id}/settle`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
      credentials: "include",
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },
};
