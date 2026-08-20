// lib/api/newsletter.ts
import { getAuthToken, handleResponse } from "./helpers";

export const newsletterApi = {
  subscribe: async (email: string, name?: string) => {
    const response = await fetch("/api/newsletter/subscribe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, name }),
    });
    return handleResponse(response);
  },

  unsubscribe: async (email: string) => {
    const response = await fetch("/api/newsletter/unsubscribe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });
    return handleResponse(response);
  },
};

export const adminNewsletterApi = {
  getSubscribers: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) queryParams.append(key, String(value));
      });
    }

    const response = await fetch(
      `/api/newsletter/subscribers?${queryParams}`,
      {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      }
    );
    return handleResponse(response);
  },

  createSubscriber: async (data: { email: string; name?: string }) => {
    const response = await fetch("/api/newsletter/subscribers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  updateSubscriber: async (id: string, data: any) => {
    const response = await fetch(`/api/newsletter/subscribers/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  deleteSubscriber: async (id: string) => {
    const response = await fetch(`/api/newsletter/subscribers/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return handleResponse(response);
  },

  exportSubscribers: async (status?: string) => {
    const params = new URLSearchParams();
    if (status) params.append("status", status);

    const response = await fetch(
      `/api/newsletter/subscribers/export?${params}`,
      {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Export failed");
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `subscribers-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },

  getCampaigns: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) queryParams.append(key, String(value));
      });
    }

    const response = await fetch(
      `/api/newsletter/campaigns?${queryParams}`,
      {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      }
    );
    return handleResponse(response);
  },

  getCampaignById: async (id: string) => {
    const response = await fetch(`/api/newsletter/campaigns/${id}`, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return handleResponse(response);
  },

  createCampaign: async (data: {
    title: string;
    subject: string;
    content: string;
    status?: string;
  }) => {
    const response = await fetch("/api/newsletter/campaigns", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  updateCampaign: async (id: string, data: any) => {
    const response = await fetch(`/api/newsletter/campaigns/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  deleteCampaign: async (id: string) => {
    const response = await fetch(`/api/newsletter/campaigns/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return handleResponse(response);
  },

  sendCampaign: async (id: string) => {
    const response = await fetch(`/api/newsletter/campaigns/${id}/send`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return handleResponse(response);
  },
};