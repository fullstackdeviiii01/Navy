// lib/api/contact.ts
import { getAuthToken, handleResponse } from "./helpers";

export const contactApi = {
  // Public - Get contact settings (without sensitive data)
  getSettings: async () => {
    const response = await fetch("/api/contact-settings");
    return handleResponse(response);
  },

  // Admin - Get contact settings with SMTP credentials
  getSettingsAdmin: async () => {
    const response = await fetch("/api/contact-settings?includeSmtp=true", {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return handleResponse(response);
  },

  // Admin - Update contact settings
  updateSettings: async (data: any) => {
    const response = await fetch("/api/contact-settings", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  // Public - Submit contact form
  submitForm: async (data: {
    name: string;
    email: string;
    phone?: string;
    subject?: string;
    message: string;
  }) => {
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },
};