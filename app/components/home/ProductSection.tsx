// app/components/home/ProductSection.tsx
"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import ProductCard from "../product/ProductCard";
import { ArrowRight } from "lucide-react";

interface Product {
  _id: string;
  name: string;
  description?: string;
  pricing: {
    price: number;
    compare_at_price?: number;
    currency: string;
  };
  images: { url: string; alt_text?: string }[];
  rating_average: number;
  rating_count: number;
  inventory: {
    stock_status: string;
    stock_quantity: number;
  };
  [key: string]: any;
}

interface ProductSectionProps {
  title: string;
  subtitle?: string;
  label?: string;
  products: Product[];
  viewAllLink: string;
  bgClass?: string;
}

export default function ProductSection({
  title,
  subtitle,
  label,
  products,
  viewAllLink,
  bgClass = "bg-theme-bg-light dark:bg-theme-bg-dark",
}: ProductSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showAll, setShowAll] = useState(false);

  if (!products || products.length === 0) return null;

  const mobileDisplayProducts = showAll ? products : products.slice(0, 4);

  return (
    <section className={`py-16 sm:py-20 md:py-24 ${bgClass}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10 sm:mb-14">
          <div>
            {label && (
              <p className="text-xs sm:text-sm font-medium tracking-[0.25em] uppercase text-theme-hover-light dark:text-theme-hover-dark mb-3">
                {label}
              </p>
            )}
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif italic text-theme-text-primary-light dark:text-theme-text-primary-dark leading-tight">
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs sm:text-sm text-theme-text-secondary-light dark:text-theme-text-secondary-dark mt-2">
                {subtitle}
              </p>
            )}
          </div>
          <Link
            href={viewAllLink}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium tracking-[0.2em] uppercase text-theme-hover-light dark:text-theme-hover-dark hover:text-theme-text-primary-light dark:hover:text-theme-text-primary-dark transition-colors group shrink-0"
          >
            SHOP ALL PIECES
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 duration-300" />
          </Link>
        </div>

        {/* MOBILE: Grid Layout (2 columns) */}
        <div className="md:hidden">
          <div className="grid grid-cols-2 gap-4">
            {mobileDisplayProducts.map((product) => (
              <div key={product._id}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>

          {products.length > 4 && !showAll && (
            <button
              onClick={() => setShowAll(true)}
              className="w-full mt-6 px-4 py-3 border border-theme-border-light dark:border-theme-border-dark text-theme-text-primary-light dark:text-theme-text-primary-dark hover:bg-theme-card-light dark:hover:bg-theme-card-dark font-medium text-xs tracking-[0.15em] uppercase transition-colors"
            >
              Show More ({products.length - 4} more)
            </button>
          )}
        </div>

        {/* DESKTOP: Horizontal scroll */}
        <div className="hidden md:block relative">
          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-2"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {products.map((product) => (
              <div
                key={product._id}
                className="flex-none w-[calc(50%-12px)] md:w-[calc(33.333%-16px)] lg:w-[calc(25%-18px)]"
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
