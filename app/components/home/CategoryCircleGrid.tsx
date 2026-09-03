// app/components/home/CategoryCircleGrid.tsx
"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

interface CategoryItem {
  _id?: string;
  name: string;
  slug?: string;
  image_url?: string;
  product_count?: number;
}

interface CategoryCircleGridProps {
  categories?: CategoryItem[];
}

export default function CategoryCircleGrid({ categories = [] }: CategoryCircleGridProps) {
  // Default fallback photography for categories
  const fallbackImages: Record<string, string> = {
    "table": "/images/categories/table_lamp.jpg",
    "floor": "/images/categories/floor_lamp.jpg",
    "hanging": "/images/categories/hanging_lamp.jpg",
    "pendant": "/images/categories/hanging_lamp.jpg",
    "wall": "/images/categories/wall_lamp.jpg",
    "candle": "/images/categories/candle_lamp.jpg",
    "bedroom": "/images/categories/table_lamp.jpg",
    "living": "/images/categories/floor_lamp.jpg",
    "entryway": "/images/categories/wall_lamp.jpg",
  };

  const getCategoryImage = (cat: CategoryItem, idx: number) => {
    if (cat.image_url && cat.image_url.trim().length > 0) {
      return cat.image_url;
    }
    const lowerName = (cat.name || "").toLowerCase();
    for (const [key, url] of Object.entries(fallbackImages)) {
      if (lowerName.includes(key)) return url;
    }
    const defaultList = [
      "/images/categories/table_lamp.jpg",
      "/images/categories/floor_lamp.jpg",
      "/images/categories/hanging_lamp.jpg",
      "/images/categories/wall_lamp.jpg",
      "/images/categories/candle_lamp.jpg",
    ];
    return defaultList[idx % defaultList.length];
  };

  // Fallback if DB has no categories at all
  const fallbackCategories: CategoryItem[] = [
    { name: "Table Lamps", slug: "table-lamp", image_url: "/images/categories/table_lamp.jpg" },
    { name: "Floor Lamps", slug: "floor-lamp", image_url: "/images/categories/floor_lamp.jpg" },
    { name: "Hanging Lamps", slug: "pendant-lamp", image_url: "/images/categories/hanging_lamp.jpg" },
    { name: "Wall Lamps", slug: "wall-lamp", image_url: "/images/categories/wall_lamp.jpg" },
    { name: "Candle Lamps", slug: "candle-lamp", image_url: "/images/categories/candle_lamp.jpg" },
  ];

  // Dynamic DB categories (limit to exactly 5)
  const displayCategories = categories.length > 0 ? categories.slice(0, 5) : fallbackCategories;

  return (
    <section className="relative w-full bg-[#F3EBDC] dark:bg-[#1E1610] py-8 sm:py-10 md:py-12 border-b border-[#E5DAC8] dark:border-[#38281B] transition-colors select-none">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        
        {/* Section Header: • --- SHOP BY CATEGORY --- • */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4 sm:mb-6 md:mb-8">
          <span className="w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full bg-[#C59345]" />
          <span className="h-[1px] w-6 sm:w-14 bg-[#C59345]/60" />
          <h2 className="text-[11px] sm:text-sm md:text-base font-serif font-bold tracking-[0.14em] sm:tracking-[0.16em] text-[#241910] dark:text-[#F3EBDC] uppercase text-center">
            SHOP BY CATEGORY
          </h2>
          <span className="h-[1px] w-6 sm:w-14 bg-[#C59345]/60" />
          <span className="w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full bg-[#C59345]" />
        </div>

        {/* 5 Concentric Circular Categories in a Single Row on ALL Screen Sizes */}
        <div className="grid grid-cols-5 gap-1 xs:gap-1.5 sm:gap-4 md:gap-6 lg:gap-8 max-w-5xl mx-auto w-full items-start">
          {displayCategories.map((cat, idx) => {
            const linkHref = `/products?category=${cat.slug || encodeURIComponent(cat.name)}`;
            const imgSource = getCategoryImage(cat, idx);

            return (
              <Link
                key={cat._id || cat.slug || idx}
                href={linkHref}
                className="group flex flex-col items-center text-center focus:outline-none transition-transform duration-300 hover:-translate-y-1 w-full"
              >
                {/* Double Concentric Gold Ring Frame scaled for 5 items in 1 row on mobile & desktop */}
                <div className="relative w-[52px] h-[52px] xs:w-[60px] xs:h-[60px] sm:w-[95px] sm:h-[95px] md:w-[125px] md:h-[125px] lg:w-[145px] lg:h-[145px] rounded-full p-[2px] sm:p-[3px] border border-[#C59345]/60 group-hover:border-[#C59345] bg-transparent shadow-sm group-hover:shadow-md transition-all duration-300">
                  <div className="w-full h-full rounded-full overflow-hidden border border-[#C59345]/40 group-hover:border-[#C59345]/80 relative bg-[#1C130C]">
                    <Image
                      src={imgSource}
                      alt={cat.name}
                      fill
                      sizes="(max-width: 640px) 60px, (max-width: 768px) 95px, (max-width: 1024px) 125px, 145px"
                      className="object-cover object-center transition-transform duration-500 group-hover:scale-108"
                    />
                  </div>
                </div>

                {/* Category Title */}
                <h3 className="mt-1.5 sm:mt-2.5 text-[8px] xs:text-[9px] sm:text-[11px] md:text-xs font-serif font-bold uppercase tracking-tight sm:tracking-[0.08em] text-[#241910] dark:text-[#F3EBDC] group-hover:text-[#C59345] transition-colors truncate max-w-full text-center px-0.5">
                  {cat.name}
                </h3>

                {/* Subtitle (Hidden on smallest screens to keep 5-in-a-row perfectly clean) */}
                <span className="hidden sm:block text-[9px] sm:text-[10px] font-sans text-[#7D6A5A] dark:text-[#A69E96] group-hover:text-[#241910] dark:group-hover:text-white transition-colors mt-0.5">
                  Explore Collection
                </span>

                {/* Small Center Horizontal Accent Line Underneath */}
                <div className="h-[1px] sm:h-[1.5px] w-3 xs:w-4 sm:w-8 bg-[#C59345] mx-auto mt-1 sm:mt-1.5 transition-all group-hover:w-11" />
              </Link>
            );
          })}
        </div>

      </div>
    </section>
  );
}
