// lib/api/home.ts
import connectDB from "../db";
import Product from "../../app/models/Product";
import Category from "../../app/models/Category";
import { handleResponse } from "./helpers";

export const homeApi = {
  getHomeData: async () => {
    const response = await fetch("/api/home", {
      cache: "no-store",
    });
    return handleResponse(response);
  },
};

// Server-side data fetching directly from DB (100% reliable on all hosting/ports)
export const getHomeDataSSR = async () => {
  try {
    await connectDB();

    const categories = await Category.find({ is_active: true })
      .sort({ sort_order: 1, name: 1 })
      .select("name slug image_url product_count")
      .limit(12)
      .lean();

    const productFields =
      "name description pricing images rating_average rating_count purchase_count inventory attributes hasVariants variants variantOptions variantPricing variantInventory category_id seo";

    const newArrivals = await (Product as any)
      .find({
        status: "active",
        is_visible: true,
      })
      .select(productFields)
      .populate("category_id", "name slug")
      .sort({ created_at: -1 })
      .limit(12)
      .lean();

    const mostLovedProducts = await (Product as any)
      .find({
        status: "active",
        is_visible: true,
      })
      .select(productFields)
      .populate("category_id", "name slug")
      .sort({ purchase_count: -1, rating_average: -1, created_at: -1 })
      .limit(16)
      .lean();

    const premiumProducts = await (Product as any)
      .find({
        status: "active",
        is_visible: true,
      })
      .select(productFields)
      .populate("category_id", "name slug")
      .sort({ "pricing.price": -1, created_at: -1 })
      .limit(16)
      .lean();

    const bestSellers = await (Product as any)
      .find({
        status: "active",
        is_visible: true,
      })
      .select(productFields)
      .populate("category_id", "name slug")
      .sort({ purchase_count: -1, created_at: -1 })
      .limit(12)
      .lean();

    const showcaseProducts = await (Product as any)
      .find({
        status: "active",
        is_visible: true,
      })
      .select(productFields)
      .populate("category_id", "name slug")
      .sort({ created_at: -1 })
      .limit(50)
      .lean();

    return JSON.parse(
      JSON.stringify({
        categories,
        newArrivals,
        bestSellers,
        mostLovedProducts: mostLovedProducts.length > 0 ? mostLovedProducts : bestSellers,
        premiumProducts: premiumProducts.length > 0 ? premiumProducts : newArrivals,
        showcaseProducts: showcaseProducts.length > 0 ? showcaseProducts : (mostLovedProducts.length > 0 ? mostLovedProducts : bestSellers),
      })
    );
  } catch (error) {
    console.error("Error fetching home data directly from DB:", error);
    return {
      categories: [],
      newArrivals: [],
      bestSellers: [],
      mostLovedProducts: [],
      premiumProducts: [],
      showcaseProducts: [],
    };
  }
};