// lib/api/search.ts
import { handleResponse } from "./helpers";

export const searchApi = {
  search: async (query: string, limit: number = 5) => {
    const response = await fetch(
      `/api/search?q=${encodeURIComponent(query)}&limit=${limit}`
    );
    return handleResponse(response);
  },
};