// lib/api/siteSettings.ts
import { getAuthToken, handleResponse } from "./helpers";

export const siteSettingsApi = {
  // Get all dynamic pages (existing functionality)
  getAllPages: async (includeInactive = false, pageType?: string) => {
    const params = new URLSearchParams({
      includeInactive: includeInactive.toString(),
    });
    if (pageType) params.append("pageType", pageType);

    const response = await fetch(`/api/site-settings?${params}`);
    return handleResponse(response);
  },

  // Get home page settings
  getHomeSettings: async () => {
    const response = await fetch("/api/site-settings?type=home");
    return handleResponse(response);
  },

  // Get static pages configuration
  getStaticPagesConfig: async () => {
    const response = await fetch("/api/site-settings?type=static");
    return handleResponse(response);
  },

  // Get company information
  getCompanyInfo: async () => {
    const response = await fetch("/api/site-settings?type=company");
    return handleResponse(response);
  },

  // Get page by slug (existing functionality)
  getPageBySlug: async (slug: string) => {
    const response = await fetch(`/api/site-settings/slug/${slug}`);
    return handleResponse(response);
  },

  // Get page by ID (existing functionality)
  getPageById: async (id: string) => {
    const response = await fetch(`/api/site-settings/${id}`, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return handleResponse(response);
  },

  // Create dynamic page (existing functionality)
  createPage: async (data: any) => {
    const response = await fetch("/api/site-settings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  // Update home settings
  updateHomeSettings: async (data: {
    home_meta_title?: string;
    home_meta_description?: string;
    home_components?: any[];
  }) => {
    const response = await fetch("/api/site-settings", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify({
        updateType: 'home',
        ...data
      }),
    });
    return handleResponse(response);
  },

  // Update static pages configuration
  updateStaticPagesConfig: async (static_pages: any[]) => {
    const response = await fetch("/api/site-settings", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify({
        updateType: 'static',
        static_pages
      }),
    });
    return handleResponse(response);
  },

  // Update company information
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

  // Upload company logo
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

  // Update dynamic page (existing functionality)
  updatePage: async (id: string, data: any) => {
    const response = await fetch(`/api/site-settings/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  // Delete dynamic page (existing functionality)
  deletePage: async (id: string) => {
    const response = await fetch(`/api/site-settings/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return handleResponse(response);
  },
};