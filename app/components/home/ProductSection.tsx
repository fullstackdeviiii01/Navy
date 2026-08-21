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
  bgClass = "bg-[#241910]",
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
              <p className="text-xs sm:text-sm font-medium tracking-[0.25em] uppercase text-[#A8752B] mb-3">
                {label}
              </p>
            )}
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif italic text-[#F3EBDC] leading-tight">
              {title}
            </h2>
          </div>
          <Link
            href={viewAllLink}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium tracking-[0.2em] uppercase text-[#D4A359] hover:text-white transition-colors group shrink-0"
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
              className="w-full mt-6 px-4 py-3 border border-[#F3EBDC]/20 text-[#F3EBDC] hover:bg-[#F3EBDC]/10 font-medium text-xs tracking-[0.15em] uppercase transition-colors"
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
              <div key={product._id} className="flex-none w-[calc(33.333%-16px)] xl:w-[calc(33.333%-16px)]">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
