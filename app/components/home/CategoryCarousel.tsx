// app/components/home/CategoryCarousel.tsx - FULLY RESPONSIVE
"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

interface Category {
  _id: string;
  name: string;
  slug: string;
  image_url?: string;
  product_count: number;
}

interface CategoryCarouselProps {
  categories: Category[];
}

export default function CategoryCarousel({ categories }: CategoryCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showAll, setShowAll] = useState(false);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 250;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (!categories || categories.length === 0) {
    return null;
  }

  // Mobile: Show 6 initially, expandable
  const mobileDisplayCategories = showAll ? categories : categories.slice(0, 6);

  return (
    <section className="py-6 sm:py-8 md:py-10 bg-theme-surface-light dark:bg-theme-surface-dark">
      <div className="container mx-auto px-3 sm:px-4 md:px-6">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-5 md:mb-6 lg:mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark mb-1 sm:mb-2">
              Shop by Category
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
              Explore our diverse collection
            </p>
          </div>

          {/* Desktop Navigation Buttons */}
          <div className="hidden md:flex gap-2">
            <button
              onClick={() => scroll("left")}
              className="p-2.5 lg:p-3 bg-white dark:bg-gray-800 border border-theme-border-light dark:border-theme-border-dark rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm active:scale-95"
              aria-label="Previous categories"
            >
              <FaChevronLeft className="w-4 h-4 text-theme-text-secondary-light dark:text-theme-text-secondary-dark"/>
            </button>
            <button
              onClick={() => scroll("right")}
              className="p-2.5 lg:p-3 bg-white dark:bg-gray-800 border border-theme-border-light dark:border-theme-border-dark rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm active:scale-95"
              aria-label="Next categories"
            >
              <FaChevronRight className="w-4 h-4 text-theme-text-secondary-light dark:text-theme-text-secondary-dark"/>
            </button>
          </div>
        </div>

        {/* MOBILE: Grid Layout (2 columns) */}
        <div className="md:hidden">
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {mobileDisplayCategories.map((category) => (
              <Link
                key={category._id}
                href={`/products?category=${category.slug}`}
                className="group block"
              >
                <div className="relative h-40 sm:h-48 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 shadow-md active:scale-95 transition-transform">
                  {/* Category Image */}
                  {category.image_url ? (
                    <Image
                      src={category.image_url}
                      alt={category.name}
                      fill
                      className="object-cover group-active:scale-110 transition-transform duration-500"
                      sizes="(max-width: 640px) 50vw, 224px"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400 dark:from-purple-600 dark:to-pink-600" />
                  )}

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <h3 className="text-white font-bold text-sm sm:text-base mb-0.5 line-clamp-1">
                      {category.name}
                    </h3>
                    <p className="text-white/80 text-xs">
                      {category.product_count} {category.product_count === 1 ? 'item' : 'items'}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Mobile Show More Button */}
          {categories.length > 6 && !showAll && (
            <button
              onClick={() => setShowAll(true)}
              aria-label={`Show ${categories.length - 6} more categories`}
              className="w-full mt-4 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-theme-text-primary-light dark:text-theme-text-primary-dark font-semibold rounded-lg transition-colors text-sm active:scale-95"
            >
              Show More Categories ({categories.length - 6} more)
            </button>
          )}

          {/* View All Link */}
          <div className="text-center mt-3">
            <Link
              href="/categories"
              className="inline-flex items-center gap-1.5 text-theme-primary hover:text-theme-primary-hover font-semibold transition-colors text-sm active:scale-95"
            >
              View All Categories
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>
        </div>

        {/* DESKTOP: Horizontal Carousel */}
        <div className="hidden md:block relative">
          <div
            ref={scrollRef}
            className="flex gap-4 lg:gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {categories.map((category) => (
              <Link
                key={category._id}
                href={`/products?category=${category.slug}`}
                className="group flex-none w-48 lg:w-56"
              >
                <div className="relative h-56 lg:h-64 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 shadow-md hover:shadow-xl transition-all duration-300">
                  {/* Category Image */}
                  {category.image_url ? (
                    <Image
                      src={category.image_url}
                      alt={category.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                      sizes="(max-width: 1024px) 192px, 224px"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400 dark:from-purple-600 dark:to-pink-600" />
                  )}

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent group-hover:from-black/80 transition-all duration-300" />

                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-white font-bold text-lg mb-1 group-hover:translate-y-[-4px] transition-transform duration-300 line-clamp-1">
                      {category.name}
                    </h3>
                    <p className="text-white/80 text-sm">
                      {category.product_count} {category.product_count === 1 ? 'item' : 'items'}
                    </p>
                  </div>

                  {/* Hover Arrow */}
                  <div className="absolute top-4 right-4 w-10 h-10 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg">
                    <svg
                      className="w-5 h-5 text-theme-text-primary-light dark:text-theme-text-primary-dark"
                      aria-hidden="true"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Desktop View All Link */}
          <div className="text-center mt-4">
            <Link
              href="/categories"
              className="inline-flex items-center gap-2 text-theme-primary hover:text-theme-primary-hover font-semibold transition-colors"
            >
              View All Categories
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}