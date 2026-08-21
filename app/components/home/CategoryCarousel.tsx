// app/components/home/CategoryCarousel.tsx
"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

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

// Short editorial blurbs keyed by index — fallback for any category
const blurbs = [
  "The oldest light, held in turned solid wood.",
  "The first hello your home gives.",
  "Sculptural presence for the corner that anchors the room.",
  "Where warmth meets the craft of the hand.",
  "A quiet glow shaped from the grain.",
  "Form follows light, finished by hand.",
  "Statement pieces carved for living spaces.",
  "Illumination drawn from natural texture.",
];

export default function CategoryCarousel({ categories }: CategoryCarouselProps) {
  if (!categories || categories.length === 0) return null;

  return (
    <section className="bg-[#241910] text-[#F3EBDC] py-16 sm:py-20 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12 sm:mb-16">
          <div>
            <p className="text-xs sm:text-sm font-medium tracking-[0.25em] uppercase text-[#A8752B] mb-3">
              SHOP BY CATEGORY
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif italic text-[#F3EBDC] leading-tight">
              Shop the full collection
            </h2>
          </div>
          <Link
            href="/categories"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium tracking-[0.2em] uppercase text-[#D4A359] hover:text-white transition-colors group shrink-0"
          >
            ALL PIECES
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 duration-300" />
          </Link>
        </div>

        {/* Category Grid */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0 border-t border-[#F3EBDC]/10"
        >
          {categories.map((category, index) => {
            const num = String(index + 1).padStart(2, "0");
            const shortName = category.name.split(" ")[0].toUpperCase();

            return (
              <div
                key={category._id}
                className="relative border-b border-r border-[#F3EBDC]/10 px-6 sm:px-8 py-10 sm:py-14 group overflow-hidden"
              >
                {/* Large Watermark Number */}
                <span
                  className="absolute -top-4 right-2 text-[120px] sm:text-[140px] font-serif italic leading-none text-[#F3EBDC]/[0.04] select-none pointer-events-none"
                  aria-hidden="true"
                >
                  {num}
                </span>

                {/* Content */}
                <div className="relative z-10">
                  <span className="text-xs font-medium tracking-widest text-[#A8752B] mb-4 block">
                    {num}
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-serif text-[#F3EBDC] mb-2 leading-snug">
                    {category.name}
                  </h3>
                  <p className="text-sm text-[#D7D3CF]/60 mb-6 max-w-xs leading-relaxed">
                    {blurbs[index % blurbs.length]}
                  </p>
                  <Link
                    href={`/products?category=${category.slug}`}
                    className="inline-flex items-center gap-2 text-xs font-medium tracking-[0.2em] uppercase text-[#F3EBDC] hover:text-[#D4A359] transition-colors group/link"
                  >
                    SHOP {shortName}
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/link:translate-x-1 duration-300" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}