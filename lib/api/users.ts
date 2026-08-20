// lib/api/users.ts
import { getAuthToken, handleResponse } from "./helpers";

export const usersApi = {
  // Get all users (admin only)
  getAll: async () => {
    const response = await fetch("/api/users", {
      headers: { Authorization: `Bearer ${getAuthToken()}` },
    });
    return handleResponse(response);
  },

  // Get user by ID (admin only)
  getById: async (userId: string) => {
    const response = await fetch(`/api/users/${userId}`, {
      headers: { Authorization: `Bearer ${getAuthToken()}` },
    });
    return handleResponse(response);
  },

  // Get current user profile
  getProfile: async () => {
    const response = await fetch("/api/users/profile", {
      headers: { Authorization: `Bearer ${getAuthToken()}` },
    });
    return handleResponse(response);
  },

  // Update user profile
  updateProfile: async (data: any) => {
    const response = await fetch("/api/users/update", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  // Update user status (admin only)
  updateStatus: async (userId: string, data: { is_active?: boolean; is_banned?: boolean }) => {
    const response = await fetch(`/api/users/${userId}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  // Promote user to admin (admin only)
  promoteToAdmin: async (userId: string) => {
    const response = await fetch(`/api/users/${userId}/promote`, {
      method: "POST",
      headers: { Authorization: `Bearer ${getAuthToken()}` },
    });
    return handleResponse(response);
  },

  // Get user statistics (admin only)
  getStats: async () => {
    const response = await fetch("/api/users/stats", {
      headers: { Authorization: `Bearer ${getAuthToken()}` },
    });
    return handleResponse(response);
  },

  // Sync user with backend
  sync: async (additionalData?: any) => {
    const response = await fetch("/api/users/sync", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(additionalData || {}),
    });
    return handleResponse(response);
  },

  // Add user address
  addAddress: async (addressData: any) => {
    const response = await fetch("/api/users/addresses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(addressData),
    });
    return handleResponse(response);
  },

  // Update user address
  updateAddress: async (addressId: string, addressData: any) => {
    const response = await fetch(`/api/users/addresses/${addressId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(addressData),
    });
    return handleResponse(response);
  },

  // Delete user address
  deleteAddress: async (addressId: string) => {
    const response = await fetch(`/api/users/addresses/${addressId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${getAuthToken()}` },
    });
    return handleResponse(response);
  },

  // Get user orders
  getOrders: async (userId: string, page: number = 1, limit: number = 10) => {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    const response = await fetch(`/api/users/${userId}/orders?${params}`, {
      headers: { Authorization: `Bearer ${getAuthToken()}` },
    });
    return handleResponse(response);
  },

  // Get user activity log (admin only)
  getActivityLog: async (userId: string, page: number = 1, limit: number = 20) => {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    const response = await fetch(`/api/users/${userId}/activity?${params}`, {
      headers: { Authorization: `Bearer ${getAuthToken()}` },
    });
    return handleResponse(response);
  },

  // Get login activities for activity monitoring page (admin only)
  getActivities: async (days: number = 7) => {
    const response = await fetch(`/api/users/activities?days=${days}`, {
      headers: { Authorization: `Bearer ${getAuthToken()}` },
    });
    return handleResponse(response);
  },

  // Search users (admin only)
  search: async (query: string, filters?: any) => {
    const params = new URLSearchParams({ q: query, ...filters });
    const response = await fetch(`/api/users/search?${params}`, {
      headers: { Authorization: `Bearer ${getAuthToken()}` },
    });
    return handleResponse(response);
  },

  // Export users data (admin only)
  exportData: async (filters?: any) => {
    const params = new URLSearchParams(filters);
    const response = await fetch(`/api/users/export?${params}`, {
      headers: { Authorization: `Bearer ${getAuthToken()}` },
    });
    if (!response.ok) throw new Error("Export failed");
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `customers-export-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  },
};