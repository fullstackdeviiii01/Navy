// app/page.tsx
import { Metadata } from "next";
import React from "react";
import CategoryCarousel from "./components/home/CategoryCarousel";
import ProductSection from "./components/home/ProductSection";
import FeaturesSection from "./components/home/FeaturesSection";
import { getHomeDataSSR } from "../lib/api/home";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Home",
    description: "Welcome to our store",
  };
}

export default async function HomePage() {
  const {
    categories,
    newArrivals,
    bestSellers,
  } = await getHomeDataSSR();

  return (
    <main className="min-h-screen bg-white dark:bg-gray-900">
      {categories.length > 0 && <CategoryCarousel categories={categories} />}
      {newArrivals.length > 0 && (
        <ProductSection
          title="New Arrivals"
          subtitle="Discover our latest collection"
          products={newArrivals}
          viewAllLink="/products?sort=newest"
          bgClass="bg-white dark:bg-gray-900"
        />
      )}
      <FeaturesSection />
      {bestSellers.length > 0 && (
        <ProductSection
          title="Best Sellers"
          subtitle="Most loved by our customers"
          products={bestSellers}
          viewAllLink="/products?sort=popular"
          bgClass="bg-white dark:bg-gray-900"
        />
      )}
    </main>
  );
}
