// lib/api/helpers.ts

export const getAuthToken = () => {
  return document.cookie.split("__session=")[1]?.split(";")[0] || "";
};

export const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Request failed" }));
    throw new Error(error.error || "Request failed");
  }
  return response.json();
};