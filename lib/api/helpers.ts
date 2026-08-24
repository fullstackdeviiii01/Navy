// lib/api/helpers.ts

export const getAuthToken = () => {
  if (typeof window !== "undefined") {
    const localToken =
      localStorage.getItem("auth_token") || localStorage.getItem("__session");
    if (localToken && localToken !== "undefined" && localToken !== "null") {
      return localToken;
    }
    const match =
      document.cookie.match(/(?:^|;\s*)auth_token=([^;]+)/) ||
      document.cookie.match(/(?:^|;\s*)__session=([^;]+)/);
    if (match) {
      const val = decodeURIComponent(match[1]);
      if (val && val !== "undefined" && val !== "null") return val;
    }
  }
  return "";
};

export const getSessionId = () => {
  if (typeof window !== "undefined") {
    const localSession = localStorage.getItem("guest_session_id");
    if (localSession && localSession !== "undefined" && localSession !== "null") {
      return localSession;
    }
    const match = document.cookie.match(/(?:^|;\s*)guest_session_id=([^;]+)/);
    if (match) {
      const val = decodeURIComponent(match[1]);
      if (val && val !== "undefined" && val !== "null") return val;
    }
  }
  return "";
};

export const getApiHeaders = (extraHeaders: Record<string, string> = {}) => {
  const headers: Record<string, string> = { ...extraHeaders };
  const token = getAuthToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const sessionId = getSessionId();
  if (sessionId) {
    headers["x-session-id"] = sessionId;
  }
  return headers;
};

export const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Request failed" }));
    throw new Error(error.error || "Request failed");
  }
  return response.json();
};