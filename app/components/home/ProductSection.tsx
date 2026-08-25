// app/components/home/ProductSection.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import ProductCard from "../product/ProductCard";
import { ChevronsRight } from "lucide-react";

interface Product {
  _id: string;
  name: string;
  description?: string;
  pricing: {
    price: number;
    compare_at_price?: number;
    currency?: string;
  };
  images: { url: string; alt_text?: string }[];
  rating_average?: number;
  rating_count?: number;
  purchase_count?: number;
  inventory?: {
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
  const [showAll, setShowAll] = useState(false);

  if (!products || products.length === 0) return null;

  // By default, display 2 rows (8 products on desktop / 4 on mobile)
  const displayedProducts = showAll ? products : products.slice(0, 8);

  return (
    <section className={`py-4 sm:py-5 md:py-7 border-b border-theme-border-light dark:border-theme-border-dark ${bgClass} transition-colors`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2.5 sm:gap-3 mb-4 sm:mb-6">
          <div>
            {label && (
              <p className="text-[10px] sm:text-xs md:text-sm font-medium tracking-[0.25em] uppercase text-theme-hover-light dark:text-theme-hover-dark mb-1">
                {label}
              </p>
            )}
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-serif font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark leading-tight tracking-tight">
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs sm:text-sm text-theme-text-secondary-light dark:text-theme-text-secondary-dark mt-1.5 sm:mt-2">
                {subtitle}
              </p>
            )}
          </div>
          <Link
            href={viewAllLink}
            className="inline-flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs md:text-sm font-medium tracking-[0.2em] uppercase text-theme-hover-light dark:text-theme-hover-dark hover:text-theme-text-primary-light dark:hover:text-theme-text-primary-dark transition-colors group shrink-0"
          >
            <span>VIEW ALL PIECES</span>
            <ChevronsRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform group-hover:translate-x-1 duration-300" />
          </Link>
        </div>

        {/* 2-Row Responsive Grid: 4 cols on desktop (8 items), 3 on tablet, 2 on mobile */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
          {displayedProducts.map((product) => (
            <div key={product._id} className="h-full">
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        {/* Action Button if more products exist */}
        {products.length > 8 && (
          <div className="mt-10 sm:mt-12 text-center">
            <button
              onClick={() => setShowAll(!showAll)}
              className="px-8 py-4 border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark hover:border-theme-hover-light text-theme-text-primary-light dark:text-theme-text-primary-dark text-xs uppercase tracking-[0.2em] font-medium transition-colors"
            >
              {showAll ? "SHOW LESS" : `SHOW ALL (${products.length - 8} MORE)`}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
