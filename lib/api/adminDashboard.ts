import { getAuthToken, handleResponse } from "./helpers";

export const adminDashboardApi = {
  getDashboardData: async (range: string = "7d") => {
    const response = await fetch(`/api/admin/dashboard?range=${range}`, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });

    return handleResponse(response);
  },
};
