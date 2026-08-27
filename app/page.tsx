// app/page.tsx
import { Metadata } from "next";
import React from "react";
import HeroSection from "./components/home/HeroSection";
import CategoryCarousel from "./components/home/CategoryCarousel";
import CollectionShowcase from "./components/home/CollectionShowcase";
import ProductSection from "./components/home/ProductSection";
import CraftsmanshipSpotlight from "./components/home/CraftsmanshipSpotlight";
import BespokeInquiryBanner from "./components/home/BespokeInquiryBanner";
import { getHomeDataSSR } from "../lib/api/home";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Home | Talal Wooden Lamps",
    description: "Artisanal handcrafted lighting luminaires and architectural lamps",
  };
}

export default async function HomePage() {
  const {
    categories = [],
    newArrivals = [],
    bestSellers = [],
  } = await getHomeDataSSR();

  return (
    <main className="min-h-screen bg-theme-bg-light dark:bg-theme-bg-dark transition-colors">
      {/* 1. Hero Banner */}
      <HeroSection />

      {/* 2. Curated Categories Showcase */}
      {categories.length > 0 && <CategoryCarousel categories={categories} />}


      {/* 4. New Arrivals Section (2-Row Responsive Grid) */}
      {newArrivals.length > 0 && (
        <ProductSection
        label="FRESH FROM THE WORKSHOP"
        title="New Arrivals"
        subtitle="Explore the latest handcrafted luminaires added to our studio catalog."
        products={newArrivals}
        viewAllLink="/products?sort=newest"
        bgClass="bg-theme-bg-light dark:bg-theme-bg-dark"
        />
      )}

      {/* 3. The Atelier Collection Showcase (Large Image + Overlaid Button + Narrative) */}
      <CollectionShowcase />

      {/* 6. Best Sellers Section (2-Row Responsive Grid) */}
      {bestSellers.length > 0 && (
        <ProductSection
          label="CURATED FAVORITES"
          title="Best Sellers"
          subtitle="Our most celebrated luminaires, chosen by discerning collectors and architects."
          products={bestSellers}
          viewAllLink="/products?sort=popular"
          bgClass="bg-theme-bg-light dark:bg-theme-bg-dark"
        />
      )}

      {/* 5. Artisanal Quality & Top 2 Most Sold Masterpieces Spotlight */}
      <CraftsmanshipSpotlight products={bestSellers} />

      {/* 7. Bespoke Commissions & Contact Concierge Banner */}
      <BespokeInquiryBanner />
    </main>
  );
}
