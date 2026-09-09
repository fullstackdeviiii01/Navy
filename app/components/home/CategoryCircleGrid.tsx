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
    <section className="relative w-full bg-[#E5E5E5] dark:bg-[#1E1610] py-8 sm:py-10 md:py-12 border-t border-b border-[#B8A894] dark:border-[#38281B] transition-colors select-none">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        
        {/* Section Header: • --- SHOP BY CATEGORY --- • */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 mb-5 sm:mb-7 md:mb-9">
          <span className="w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full bg-[#C59345]" />
          <span className="h-[1px] w-8 sm:w-20 md:w-28 bg-[#B8A894]" />
          <h2 className="text-[11px] sm:text-sm md:text-base font-serif font-bold tracking-[0.14em] sm:tracking-[0.16em] text-[#241910] dark:text-[#F3EBDC] uppercase text-center">
            SHOP BY CATEGORY
          </h2>
          <span className="h-[1px] w-8 sm:w-20 md:w-28 bg-[#B8A894]" />
          <span className="w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full bg-[#C59345]" />
        </div>

        {/* Responsive Grid: 3-by-2 Centered on Mobile (< sm), 5 in a Single Row on Tablet & Desktop (sm+) */}
        <div className="grid grid-cols-6 sm:grid-cols-5 gap-x-2 xs:gap-x-3 sm:gap-x-5 md:gap-x-6 lg:gap-x-8 gap-y-5 sm:gap-y-6 max-w-5xl mx-auto w-full items-start justify-items-center">
          {displayCategories.map((cat, idx) => {
            const linkHref = `/products?category=${cat.slug || encodeURIComponent(cat.name)}`;
            const imgSource = getCategoryImage(cat, idx);

            // On mobile (< sm): Items 0,1,2 take 2 cols each (3 items in row 1).
            // Item 3 starts at col 2 and takes 2 cols, Item 4 takes 2 cols (2 items centered in row 2).
            // On sm+: all items are sm:col-span-1 sm:col-start-auto
            const colPlacement =
              idx < 3
                ? "col-span-2 sm:col-span-1 sm:col-start-auto"
                : idx === 3
                ? "col-span-2 col-start-2 sm:col-span-1 sm:col-start-auto"
                : "col-span-2 sm:col-span-1 sm:col-start-auto";

            return (
              <Link
                key={cat._id || cat.slug || idx}
                href={linkHref}
                className={`group flex flex-col items-center text-center focus:outline-none transition-transform duration-300 hover:-translate-y-1 w-full ${colPlacement}`}
              >
                {/* Double Concentric Gold Ring Frame with Noticeably Bigger Circles */}
                <div className="relative w-[78px] h-[78px] xs:w-[88px] xs:h-[88px] sm:w-[110px] sm:h-[110px] md:w-[130px] md:h-[130px] lg:w-[150px] lg:h-[150px] rounded-full p-[2.5px] sm:p-[3.5px] border border-[#C59345]/60 group-hover:border-[#C59345] bg-transparent shadow-sm group-hover:shadow-md transition-all duration-300">
                  <div className="w-full h-full rounded-full overflow-hidden border border-[#C59345]/40 group-hover:border-[#C59345]/80 relative bg-[#1C130C]">
                    <Image
                      src={imgSource}
                      alt={cat.name}
                      fill
                      sizes="(max-width: 640px) 90px, (max-width: 768px) 110px, (max-width: 1024px) 130px, 150px"
                      className="object-cover object-center transition-transform duration-500 group-hover:scale-108"
                    />
                  </div>
                </div>

                {/* Category Title */}
                <h3 className="mt-2 sm:mt-2.5 text-[10px] xs:text-[11px] sm:text-xs md:text-[13px] font-serif font-bold uppercase tracking-tight sm:tracking-[0.08em] text-[#241910] dark:text-[#F3EBDC] group-hover:text-[#C59345] transition-colors truncate max-w-full text-center px-1">
                  {cat.name}
                </h3>

                {/* Subtitle */}
                <span className="text-[9px] sm:text-[10px] font-sans text-[#7D6A5A] dark:text-[#A69E96] group-hover:text-[#241910] dark:group-hover:text-white transition-colors mt-0.5">
                  Explore
                </span>

                {/* Small Center Horizontal Accent Line Underneath */}
                <div className="h-[1px] sm:h-[1.5px] w-4 xs:w-5 sm:w-8 bg-[#C59345] mx-auto mt-1 sm:mt-1.5 transition-all group-hover:w-11" />
              </Link>
            );
          })}
        </div>

      </div>
    </section>
  );
}
