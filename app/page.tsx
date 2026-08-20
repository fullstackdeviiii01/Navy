// app/page.tsx
import { Metadata } from "next";
import React from "react";
import CategoryCarousel from "./components/home/CategoryCarousel";
import ProductSection from "./components/home/ProductSection";
import FeaturesSection from "./components/home/FeaturesSection";
import { getHomeDataSSR } from "../lib/api/home";
import { getHomeSettings } from "../lib/metadata/homeMetadata";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getHomeSettings();
  
  return {
    title: settings.home_meta_title || "Home",
    description: settings.home_meta_description || "Welcome to our store",
  };
}

export default async function HomePage() {
  const {
    categories,
    newArrivals,
    bestSellers,
  } = await getHomeDataSSR();
  
  // Get component visibility settings
  const settings = await getHomeSettings();
  const components = settings.home_components || [];

  // Sort components by sort_order
  const sortedComponents = [...components].sort((a, b) => a.sort_order - b.sort_order);
  
  // Component render map
  const componentRenderers: Record<string, React.ReactElement | null> = {
    category_carousel: categories.length > 0 ? <CategoryCarousel categories={categories} key="category_carousel" /> : null,
    new_arrivals: newArrivals.length > 0 ? (
      <ProductSection
        key="new_arrivals"
        title="New Arrivals"
        subtitle="Discover our latest collection"
        products={newArrivals}
        viewAllLink="/products?sort=newest"
        bgClass="bg-white dark:bg-gray-900"
      />
    ) : null,
    features_section: <FeaturesSection key="features_section" />,
    best_sellers: bestSellers.length > 0 ? (
      <ProductSection
        key="best_sellers"
        title="Best Sellers"
        subtitle="Most loved by our customers"
        products={bestSellers}
        viewAllLink="/products?sort=popular"
        bgClass="bg-white dark:bg-gray-900"
      />
    ) : null,
  };

  return (
    <main className="min-h-screen bg-white dark:bg-gray-900">
      {sortedComponents.map((comp) => {
        if (!comp.is_visible) return null;
        const component = componentRenderers[comp.component_key];
        return component;
      })}
    </main>
  );
}