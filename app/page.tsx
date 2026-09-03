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
    "Talal Wooden Lamp — handcrafted wooden lamps and artisan lighting, beautifully crafted from natural solid wood.";

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

      {/* 4 & 5. Curated Products (Side-by-Side on Laptop/Desktop, Stacked on Mobile) */}
      <section className="relative w-full py-8 sm:py-10 md:py-12 border-b border-[#B8A894] dark:border-[#38281B] bg-[#E5E5E5] dark:bg-[#1A120B] transition-colors select-none">
        <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-y-10 lg:gap-y-0">
            
            {/* Left Column: MOST LOVED BY OUR CUSTOMERS */}
            <div className="min-w-0 lg:pr-6 xl:pr-8 lg:border-r border-[#B8A894]">
              <CuratedProductCarousel
                title="MOST LOVED BY OUR CUSTOMERS"
                products={mostLovedProducts}
                viewAllLink="/products?sort=popular"
                isNested
              />
            </div>

            {/* Right Column: PREMIUM COLLECTION */}
            <div className="min-w-0 pt-8 lg:pt-0 lg:pl-6 xl:pl-8 border-t lg:border-t-0 border-[#B8A894]">
              <CuratedProductCarousel
                title="PREMIUM COLLECTION"
                products={premiumProducts}
                viewAllLink="/products?sort=price-desc"
                isNested
              />
            </div>

          </div>
        </div>
      </section>

      {/* 6. Brand Value & Trust Highlights Bar */}
      <BrandTrustBar />

      {/* 7. Stay Updated Newsletter Section */}
      <NewsletterSection />
    </main>
  );
}

