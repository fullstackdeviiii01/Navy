// app/components/home/ProductSection.tsx - FULLY RESPONSIVE
"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import ProductCard from "../product/ProductCard";
import { FaChevronLeft, FaChevronRight, FaArrowRight } from "react-icons/fa";

interface Product {
  _id: string;
  name: string;
  description?: string;
  short_description?: string;
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
  badges?: {
    is_featured?: boolean;
    is_bestseller?: boolean;
    is_on_sale?: boolean;
    is_trending?: boolean;
  };
  unit_of_measure?: string;
}

interface ProductSectionProps {
  title: string;
  subtitle?: string;
  products: Product[];
  viewAllLink: string;
  bgClass?: string;
}

export default function ProductSection({
  title,
  subtitle,
  products,
  viewAllLink,
  bgClass = "bg-white dark:bg-gray-900",
}: ProductSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showAll, setShowAll] = useState(false);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 320;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (!products || products.length === 0) {
    return null;
  }

  // Mobile: Show 4 initially, expandable
  const mobileDisplayProducts = showAll ? products : products.slice(0, 4);
  // Desktop: Show all in carousel
  const desktopProducts = products;

  return (
    <section className={`py-5 sm:py-2 lg:py-5 ${bgClass}`}>
      <div className="container mx-auto px-3 sm:px-4 md:px-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-4 sm:mb-5 md:mb-6">
          <div className="mb-3 md:mb-0">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark mb-1 sm:mb-2">
              {title}
            </h2>
            {subtitle && (
              <p className="text-theme-text-secondary-light dark:text-theme-text-secondary-dark text-sm sm:text-base md:text-lg">
                {subtitle}
              </p>
            )}
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-3 lg:gap-4">
            <div className="flex gap-2">
              <button
                onClick={() => scroll("left")}
                className="p-2.5 lg:p-3 bg-white dark:bg-gray-800 border border-theme-border-light dark:border-theme-border-dark rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm active:scale-95"
                aria-label="Previous products"
              >
                <FaChevronLeft
                  className="w-4 h-4 text-theme-text-secondary-light dark:text-theme-text-secondary-dark"
                  
                />
              </button>
              <button
                onClick={() => scroll("right")}
                className="p-2.5 lg:p-3 bg-white dark:bg-gray-800 border border-theme-border-light dark:border-theme-border-dark rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm active:scale-95"
                aria-label="Next products"
              >
                <FaChevronRight
                  className="w-4 h-4 text-theme-text-secondary-light dark:text-theme-text-secondary-dark"
                
                />
              </button>
            </div>

            <Link
              href={viewAllLink}
              className="inline-flex items-center gap-2 px-4 lg:px-6 py-2.5 lg:py-3 bg-theme-primary hover:bg-theme-primary-hover text-white font-semibold rounded-lg transition-all shadow-sm hover:shadow-md text-sm lg:text-base active:scale-95"
            >
              View All
              <FaArrowRight className="text-xs lg:text-sm" />
            </Link>
          </div>
        </div>

        {/* MOBILE: Grid Layout (2 columns) */}
        <div className="md:hidden">
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {mobileDisplayProducts.map((product) => (
              <div key={product._id} className="w-full">
                <ProductCard product={product} />
              </div>
            ))}
          </div>

          {/* Mobile Controls */}
          <div className="flex flex-col gap-3 mt-4 sm:mt-5">
            {products.length > 4 && !showAll && (
              <button
                onClick={() => setShowAll(true)}
                className="w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-theme-text-primary-light dark:text-theme-text-primary-dark font-semibold rounded-lg transition-colors text-sm active:scale-95"
              >
                Show More Products ({products.length - 4} more)
              </button>
            )}

            <Link
              href={viewAllLink}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-theme-primary hover:bg-theme-primary-hover text-white font-semibold rounded-lg transition-all shadow-sm text-sm active:scale-95"
            >
              View All Products
              <FaArrowRight className="text-xs" />
            </Link>
          </div>
        </div>

        {/* DESKTOP: Horizontal Carousel */}
        <div className="hidden md:block relative">
          <div
            role="region"
            aria-label="Product carousel"
            aria-live="polite"
            ref={scrollRef}
            className="flex gap-4 lg:gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {desktopProducts.map((product) => (
              <div key={product._id} className="flex-none w-64 lg:w-72 xl:w-80">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
