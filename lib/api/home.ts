// lib/api/home.ts
import { handleResponse } from "./helpers";

export const homeApi = {
  getHomeData: async () => {
    const response = await fetch("/api/home", {
      cache: "no-store",
    });
    return handleResponse(response);
  },
};

// Server-side data fetching for SSR
export const getHomeDataSSR = async () => {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/home`, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch home data");
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching home data:", error);
    return {
      categories: [],
      newArrivals: [],
      featuredProducts: [],
      bestSellers: [],
      trendingProducts: [],
      onSaleProducts: [],
    };
  }
};

// Add this new function at the bottom of the file
export const getHeroSlidesSSR = async () => {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/hero-slider`, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch hero slides");
    }

    const data = await response.json();
    return data.slides || [];
  } catch (error) {
    console.error("Error fetching hero slides:", error);
    return [];
  }
};