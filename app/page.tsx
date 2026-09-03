// app/page.tsx
import { Metadata } from "next";
import React from "react";
import HeroSection from "./components/home/HeroSection";
import CategoryCircleGrid from "./components/home/CategoryCircleGrid";
import CuratedProductCarousel from "./components/home/CuratedProductCarousel";
import BrandTrustBar from "./components/home/BrandTrustBar";
import NewsletterSection from "./components/home/NewsletterSection";
import { getHomeDataSSR } from "../lib/api/home";

export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = "https://talalwoodenlamp.com";
  const logoUrl = "https://talalwoodenlamp.com/images/talal-wooden-lamp-logo.png";
  const seoDescription =
    "Handcrafted wooden lamps and artisanal lighting in Pakistan. Beautiful table lamps, floor lamps, wall lights and more, crafted with natural wood";

  return {
    title: {
      absolute: "Talal Wooden Lamp",
    },
    description: seoDescription,
    keywords: [
      "talal wooden lamp",
      "talal wooden lamps",
      "wooden lamp",
      "wooden lamps",
      "handcrafted wooden lamps",
      "solid wood table lamp",
      "floor lamps pakistan",
      "sheesham wood lamps",
      "luxury wooden lighting",
      "artisanal lighting pakistan",
    ],
    alternates: {
      canonical: "https://talalwoodenlamp.com/",
    },
    openGraph: {
      title: "Talal Wooden Lamp",
      description: seoDescription,
      url: "https://talalwoodenlamp.com/",
      siteName: "Talal Wooden Lamp",
      type: "website",
      images: [
        {
          url: logoUrl,
          width: 512,
          height: 512,
          alt: "Talal Wooden Lamp Logo",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Talal Wooden Lamp",
      description: seoDescription,
      images: [logoUrl],
    },
  };
}

export default async function HomePage() {
  const {
    categories = [],
    mostLovedProducts = [],
    premiumProducts = [],
    showcaseProducts = [],
  } = await getHomeDataSSR();

  return (
    <main className="min-h-screen bg-[#E5E5E5] dark:bg-[#0A0705] transition-colors">
      {/* 1. Seamless Hero & 3D Elliptical Circular Showcase */}
      <HeroSection products={showcaseProducts} />

      {/* 3. Shop By Category (Circular Concentric Gold Badges) */}
      <CategoryCircleGrid categories={categories} />

      {/* 4. Most Loved by Our Customers (Full-width, Stacked, Exactly 5 Products) */}
      <CuratedProductCarousel
        title="MOST LOVED BY OUR CUSTOMERS"
        products={mostLovedProducts}
        viewAllLink="/products?sort=popular"
        topButtonText="Show all products"
      />

      {/* 5. Premium Collection (Full-width, Stacked, Exactly 5 Products) */}
      <CuratedProductCarousel
        title="PREMIUM COLLECTION"
        products={premiumProducts}
        viewAllLink="/products?sort=price-desc"
        topButtonText="Show all products"
      />

      {/* 6. Brand Value & Trust Highlights Bar */}
      <BrandTrustBar />

      {/* 7. Stay Updated Newsletter Section */}
      <NewsletterSection />
    </main>
  );
}

