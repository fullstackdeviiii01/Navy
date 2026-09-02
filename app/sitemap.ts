// app/sitemap.ts
import { MetadataRoute } from "next";
import connectDB from "../lib/db";
import Product from "./models/Product";
import Category from "./models/Category";
import { getProductUrl } from "../lib/utils/productUrl";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || "https://talalwoodenlamp.com";
  const now = new Date();

  // 1. Static Public Routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${siteUrl}/products`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/categories`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${siteUrl}/contact`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${siteUrl}/faqs`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${siteUrl}/care-guide`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${siteUrl}/shipping-policy`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${siteUrl}/refund-policy`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${siteUrl}/terms-and-conditions`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${siteUrl}/privacy-policy`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${siteUrl}/track-order`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.5,
    },
  ];

  // 2. Dynamic Product Routes from Database
  let productRoutes: MetadataRoute.Sitemap = [];
  try {
    await connectDB();
    const products = await (Product as any)
      .find({ is_active: { $ne: false } })
      .select("_id name slug updatedAt")
      .lean();

    if (products && products.length > 0) {
      productRoutes = products.map((prod: any) => ({
        url: `${siteUrl}${getProductUrl(prod)}`,
        lastModified: prod.updatedAt ? new Date(prod.updatedAt) : now,
        changeFrequency: "daily",
        priority: 0.9,
      }));
    }
  } catch (err) {
    console.error("Error generating product sitemap:", err);
  }

  // 3. Dynamic Category Routes from Database
  let categoryRoutes: MetadataRoute.Sitemap = [];
  try {
    await connectDB();
    const categories = await (Category as any)
      .find({ is_active: { $ne: false } })
      .select("_id name slug updatedAt")
      .lean();

    if (categories && categories.length > 0) {
      categoryRoutes = categories.map((cat: any) => ({
        url: `${siteUrl}/products?category=${cat.slug || cat._id}`,
        lastModified: cat.updatedAt ? new Date(cat.updatedAt) : now,
        changeFrequency: "weekly",
        priority: 0.8,
      }));
    }
  } catch (err) {
    console.error("Error generating category sitemap:", err);
  }

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
