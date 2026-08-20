// lib/api/siteSettings.ts
import { getAuthToken, handleResponse } from "./helpers";

export const siteSettingsApi = {
  getCompanyInfo: async () => {
    const response = await fetch("/api/site-settings?type=company");
    return handleResponse(response);
  },

  updateCompanyInfo: async (company_info: any) => {
    const response = await fetch("/api/site-settings", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify({
        updateType: 'company',
        company_info
      }),
    });
    return handleResponse(response);
  },

  uploadCompanyLogo: async (file: File) => {
    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch("/api/site-settings/upload-logo", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: formData,
    });
    return handleResponse(response);
  },
};
