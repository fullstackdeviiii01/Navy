// lib/api/helpers.ts

export const getAuthToken = () => {
  if (typeof window !== "undefined") {
    const localToken =
      localStorage.getItem("auth_token") || localStorage.getItem("__session");
    if (localToken) return localToken;
    const match =
      document.cookie.match(/(?:^|;\s*)auth_token=([^;]+)/) ||
      document.cookie.match(/(?:^|;\s*)__session=([^;]+)/);
    if (match) return decodeURIComponent(match[1]);
  }
  return "";
};

export const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Request failed" }));
    throw new Error(error.error || "Request failed");
  }
  return response.json();
};