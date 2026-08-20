// lib/api/chatbot.ts
import { getAuthToken, handleResponse } from "./helpers";
import type {
  CreateQAPayload,
  UpdateQAPayload,
  UpdateConfigPayload,
} from "../../types/chatbot.types";

export const chatbotApi = {
  // ── Public ──────────────────────────────────────────────
  getConfig: async () => {
    const response = await fetch("/api/chatbot/config");
    return handleResponse(response);
  },

  getVisibleQAs: async (category?: string) => {
    const params = new URLSearchParams();
    if (category && category !== "all") params.append("category", category);
    const response = await fetch(`/api/chatbot/qa?${params}`);
    return handleResponse(response);
  },

  getQAAnswer: async (id: string) => {
    // Fetches full QA (including HTML answer) and increments click count
    const response = await fetch(`/api/chatbot/qa/${id}`);
    return handleResponse(response);
  },

  // ── Admin ────────────────────────────────────────────────
  adminGetAllQAs: async (category?: string) => {
    const params = new URLSearchParams({ admin: "true" });
    if (category && category !== "all") params.append("category", category);
    const response = await fetch(`/api/chatbot/qa?${params}`, {
      headers: { Authorization: `Bearer ${getAuthToken()}` },
    });
    return handleResponse(response);
  },

  adminGetQA: async (id: string) => {
    const response = await fetch(`/api/chatbot/qa/${id}?admin=true`, {
      headers: { Authorization: `Bearer ${getAuthToken()}` },
    });
    return handleResponse(response);
  },

  createQA: async (data: CreateQAPayload) => {
    const response = await fetch("/api/chatbot/qa", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  updateQA: async (id: string, data: UpdateQAPayload) => {
    const response = await fetch(`/api/chatbot/qa/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  deleteQA: async (id: string) => {
    const response = await fetch(`/api/chatbot/qa/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${getAuthToken()}` },
    });
    return handleResponse(response);
  },

  toggleVisibility: async (id: string, is_visible: boolean) => {
    const response = await fetch(`/api/chatbot/qa/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify({ is_visible }),
    });
    return handleResponse(response);
  },

  updateConfig: async (data: UpdateConfigPayload) => {
    const response = await fetch("/api/chatbot/config", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  getStats: async () => {
    const response = await fetch("/api/chatbot/stats", {
      headers: { Authorization: `Bearer ${getAuthToken()}` },
    });
    return handleResponse(response);
  },
};