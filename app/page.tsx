// app/page.tsx
import { Metadata } from "next";
import React from "react";
import CategoryCarousel from "./components/home/CategoryCarousel";
import ProductSection from "./components/home/ProductSection";
import FeaturesSection from "./components/home/FeaturesSection";
import { getHomeDataSSR, getHeroSlidesSSR } from "../lib/api/home";
import BannerDisplay from "./components/banners/BannerDisplay";
import Slider from "./components/home/Slider";
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
    featuredProducts,
    bestSellers,
    trendingProducts,
    onSaleProducts,
  } = await getHomeDataSSR();
  const slides = await getHeroSlidesSSR();
  
  // Get component visibility settings
  const settings = await getHomeSettings();
  const components = settings.home_components || [];

  // Fetch banner data for all visible banner components
  const bannerPromises = components
    .filter((c: any) => c.component_type === 'banner' && c.is_visible && c.banner_id)
    .map(async (c: any) => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const res = await fetch(`${baseUrl}/api/promotional-banners/${c.banner_id}`, {
          cache: 'no-store'
        });
        
        if (!res.ok) {
          console.error(`Failed to fetch banner ${c.banner_id}`);
          return null;
        }
        
        const data = await res.json();
        return {
          component_key: c.component_key,
          bannerData: data.banner
        };
      } catch (error) {
        console.error(`Error fetching banner ${c.banner_id}:`, error);
        return null;
      }
    });
  
  const bannersWithData = (await Promise.all(bannerPromises)).filter(Boolean);
  
  // Sort components by sort_order
  const sortedComponents = [...components].sort((a, b) => a.sort_order - b.sort_order);
  
  // Component render map
  const componentRenderers: Record<string, React.ReactElement | null> = {
    hero_slider: slides.length > 0 ? <Slider slides={slides} key="hero_slider" /> : null,
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
    featured_products: featuredProducts.length > 0 ? (
      <ProductSection
        key="featured_products"
        title="Featured Products"
        subtitle="Hand-picked favorites just for you"
        products={featuredProducts}
        viewAllLink="/products?featured=true"
        bgClass="bg-gray-50 dark:bg-gray-800/50"
      />
    ) : null,
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
    trending_products: trendingProducts.length > 0 ? (
      <ProductSection
        key="trending_products"
        title="Trending Now"
        subtitle="What's hot right now"
        products={trendingProducts}
        viewAllLink="/products?trending=true"
        bgClass="bg-gray-50 dark:bg-gray-800/50"
      />
    ) : null,
    on_sale_products: onSaleProducts.length > 0 ? (
      <ProductSection
        key="on_sale_products"
        title="Special Offers"
        subtitle="Limited time deals you don't want to miss"
        products={onSaleProducts}
        viewAllLink="/products?sale=true"
        bgClass="bg-white dark:bg-gray-900"
      />
    ) : null,
  };
  
  // Add banner components dynamically
  bannersWithData.forEach((item: any) => {
    if (item && item.bannerData) {
      componentRenderers[item.component_key] = (
        <div key={item.component_key} className="my-6 max-w-6xl mx-auto px-4">
          <BannerDisplay banner={item.bannerData} />
        </div>
      );
    }
  });

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