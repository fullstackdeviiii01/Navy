// lib/api/aliexpress-credentials.ts
import { getAuthToken, handleResponse } from "./helpers";

export const aliexpressCredentialsApi = {
  get: async () => {
    const response = await fetch("/api/aliexpress/credentials", {
      headers: { Authorization: `Bearer ${getAuthToken()}` },
    });
    return handleResponse(response);
  },

  save: async (data: {
    app_key: string;
    app_secret: string;
    access_token: string;
    refresh_token: string;
    token_expiry?: string;
  }) => {
    const response = await fetch("/api/aliexpress/credentials", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  deactivate: async () => {
    const response = await fetch("/api/aliexpress/credentials", {
      method: "DELETE",
      headers: { Authorization: `Bearer ${getAuthToken()}` },
    });
    return handleResponse(response);
  },
};