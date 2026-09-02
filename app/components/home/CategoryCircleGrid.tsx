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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header: • --- SHOP BY CATEGORY --- • */}
        <div className="flex items-center justify-center gap-2.5 sm:gap-3 mb-6 sm:mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-[#C59345]" />
          <span className="h-[1px] w-8 sm:w-14 bg-[#C59345]/60" />
          <h2 className="text-xs sm:text-sm md:text-base font-serif font-bold tracking-[0.16em] text-[#241910] dark:text-[#F3EBDC] uppercase text-center">
            SHOP BY CATEGORY
          </h2>
          <span className="h-[1px] w-8 sm:w-14 bg-[#C59345]/60" />
          <span className="w-1.5 h-1.5 rounded-full bg-[#C59345]" />
        </div>

        {/* 5 Concentric Circular Categories Row */}
        <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-5 md:gap-6 lg:gap-8 max-w-5xl mx-auto">
          {displayCategories.map((cat, idx) => {
            const linkHref = `/products?category=${cat.slug || encodeURIComponent(cat.name)}`;
            const imgSource = getCategoryImage(cat, idx);

            return (
              <Link
                key={cat._id || cat.slug || idx}
                href={linkHref}
                className="group flex flex-col items-center text-center focus:outline-none transition-transform duration-300 hover:-translate-y-1 w-[105px] sm:w-[125px] md:w-[145px] lg:w-[160px]"
              >
                {/* Double Concentric Gold Ring Frame with explicit pixel dimensions */}
                <div className="relative w-[88px] h-[88px] sm:w-[110px] sm:h-[110px] md:w-[130px] md:h-[130px] lg:w-[145px] lg:h-[145px] rounded-full p-[3px] border border-[#C59345]/60 group-hover:border-[#C59345] bg-transparent shadow-sm group-hover:shadow-md transition-all duration-300">
                  <div className="w-full h-full rounded-full overflow-hidden border border-[#C59345]/40 group-hover:border-[#C59345]/80 relative bg-[#1C130C]">
                    <Image
                      src={imgSource}
                      alt={cat.name}
                      fill
                      sizes="(max-width: 640px) 88px, (max-width: 768px) 110px, (max-width: 1024px) 130px, 145px"
                      className="object-cover object-center transition-transform duration-500 group-hover:scale-108"
                    />
                  </div>
                </div>

                {/* Category Title */}
                <h3 className="mt-2.5 sm:mt-3 text-[10.5px] sm:text-[11.5px] md:text-xs font-serif font-bold uppercase tracking-[0.08em] text-[#241910] dark:text-[#F3EBDC] group-hover:text-[#C59345] transition-colors truncate max-w-full">
                  {cat.name}
                </h3>

                {/* Subtitle */}
                <span className="text-[9px] sm:text-[10px] font-sans text-[#7D6A5A] dark:text-[#A69E96] group-hover:text-[#241910] dark:group-hover:text-white transition-colors mt-0.5">
                  Explore Collection
                </span>

                {/* Small Center Horizontal Accent Line Underneath */}
                <div className="h-[1.5px] w-7 sm:w-9 bg-[#C59345] mx-auto mt-1.5 transition-all group-hover:w-11" />
              </Link>
            );
          })}
        </div>

      </div>
    </section>
  );
}
