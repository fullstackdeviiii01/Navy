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
  return {
    title: "Handcrafted Wooden Lamps & Artisanal Lighting in Pakistan | Talal Wooden Lamps",
    description:
      "Discover bespoke solid wood table lamps, lathe-turned floor lamps, rustic lanterns, and luxury ambient lighting. Handcrafted with seasoned timber. Free shipping nationwide.",
    keywords: [
      "wooden lamps pakistan",
      "handcrafted table lamps",
      "lathe turned floor lamps",
      "solid wood luminaires",
      "sheesham wood lamps",
      "luxury wooden home decor",
    ],
    alternates: {
      canonical: "/",
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
    <main className="min-h-screen bg-[#F3EBDC] dark:bg-[#0A0705] transition-colors">
      {/* 1. Seamless Hero & 3D Elliptical Circular Showcase */}
      <HeroSection products={showcaseProducts} />

      {/* 3. Shop By Category (Circular Concentric Gold Badges) */}
      <CategoryCircleGrid categories={categories} />

      {/* 4. Most Loved by Our Customers (Interactive Carousel) */}
      <CuratedProductCarousel
        title="MOST LOVED BY OUR CUSTOMERS"
        products={mostLovedProducts}
        viewAllLink="/products?sort=popular"
        bgClass="bg-[#F3EBDC] dark:bg-[#1E1610]"
      />

      {/* 5. Premium Collection (Interactive Carousel) */}
      <CuratedProductCarousel
        title="PREMIUM COLLECTION"
        products={premiumProducts}
        viewAllLink="/products?sort=price-desc"
        bgClass="bg-[#EAE1D1] dark:bg-[#18110B]"
      />

      {/* 6. Brand Value & Trust Highlights Bar */}
      <BrandTrustBar />

      {/* 7. Stay Updated Newsletter Section */}
      <NewsletterSection />
    </main>
  );
}

