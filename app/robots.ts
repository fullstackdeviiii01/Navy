// app/robots.ts
import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://talalwoodenlamps.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/*",
          "/api/*",
          "/checkout",
          "/checkout/*",
          "/account",
          "/account/*",
          "/wishlist",
          "/cart",
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
