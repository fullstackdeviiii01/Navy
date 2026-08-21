// app/components/product-detail/RelatedProducts.tsx
"use client";

import ProductCard from "../product/ProductCard";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";

interface RelatedProductsProps {
  products: any[];
  title?: string;
}

export default function RelatedProducts({ products, title = "You may also like" }: RelatedProductsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

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

  return (
    <section className="mt-16 sm:mt-20 pt-12 border-t border-theme-border-light dark:border-theme-border-dark" aria-labelledby="related-products-heading">
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-xs font-medium tracking-[0.25em] uppercase text-theme-hover-light dark:text-theme-hover-dark mb-2">
            CURATED PIECES
          </p>
          <h2 id="related-products-heading" className="text-2xl sm:text-3xl font-serif italic text-theme-text-primary-light dark:text-theme-text-primary-dark">
            {title}
          </h2>
        </div>

        <div className="flex gap-2" role="group" aria-label="Scroll related products">
          <button
            onClick={() => scroll("left")}
            className="flex items-center justify-center p-2.5 border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark hover:bg-theme-card-light dark:hover:bg-theme-card-dark transition-colors"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="flex items-center justify-center p-2.5 border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark hover:bg-theme-card-light dark:hover:bg-theme-card-dark transition-colors"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        role="list"
      >
        {products.map((product) => (
          <div key={product._id} className="flex-none w-64 sm:w-72" role="listitem">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
}