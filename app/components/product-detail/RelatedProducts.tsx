// app/components/product-detail/RelatedProducts.tsx
"use client";

import ProductCard from "../product/ProductCard";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useRef } from "react";

interface RelatedProductsProps {
  products: any[];
  title?: string;
}

export default function RelatedProducts({ products, title = "Related Products" }: RelatedProductsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section className="mt-8 sm:mt-10 md:mt-12 lg:mt-16" aria-labelledby="related-products-heading">
      <div className="flex items-center justify-between mb-3 sm:mb-4 md:mb-5 lg:mb-6">
        <h2 id="related-products-heading" className="text-theme-text-primary-light dark:text-theme-text-primary-dark text-lg sm:text-xl md:text-2xl font-bold">
          {title}
        </h2>
        <div className="flex gap-1.5 sm:gap-2" role="group" aria-label="Scroll related products">
          <button
            onClick={() => scroll("left")}
            className="flex items-center justify-center p-1.5 sm:p-2 border border-theme-border-light dark:border-theme-border-dark rounded-md sm:rounded-lg hover:bg-theme-hover-bg-light dark:hover:bg-theme-hover-bg-dark transition-colors"
            aria-label="Scroll left"
            style={{ minWidth: '44px', minHeight: '44px' }}
          >
            <FaChevronLeft className="text-theme-text-secondary-light dark:text-theme-text-secondary-dark text-xs sm:text-sm" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="flex items-center justify-center p-1.5 sm:p-2 border border-theme-border-light dark:border-theme-border-dark rounded-md sm:rounded-lg hover:bg-theme-hover-bg-light dark:hover:bg-theme-hover-bg-dark transition-colors"
            aria-label="Scroll right"
            style={{ minWidth: '44px', minHeight: '44px' }}
          >
            <FaChevronRight className="text-theme-text-secondary-light dark:text-theme-text-secondary-dark text-xs sm:text-sm" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-3 sm:gap-4 md:gap-5 lg:gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-2 sm:pb-3 md:pb-4"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        role="list"
      >
        {products.map((product) => (
          <div key={product._id} className="flex-none w-48 sm:w-56 md:w-64 lg:w-72" role="listitem">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
}