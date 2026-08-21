// app/components/category/CategoryCard.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

interface CategoryCardProps {
  category: {
    _id: string;
    name: string;
    description?: string;
    slug: string;
    image_url?: string;
    product_count: number;
  };
}

export default function CategoryCard({ category }: CategoryCardProps) {
  const shortName = category.name.split(" ")[0].toUpperCase();

  return (
    <Link
      href={`/products?category=${category.slug}`}
      aria-label={`Shop ${category.name} - ${category.product_count} items available`}
      className="group flex flex-col h-full overflow-hidden border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark transition-all duration-300 hover:border-theme-hover-light/60 dark:hover:border-theme-hover-dark/60"
    >
      {/* Sharp Aspect-Ratio Image Container */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-theme-card-light dark:bg-theme-card-dark border-b border-theme-border-light dark:border-theme-border-dark">
        {category.image_url ? (
          <>
            <Image
              src={category.image_url}
              alt={`${category.name} category`}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-theme-text-muted-light dark:text-theme-text-muted-dark text-xs">
            No Image
          </div>
        )}

        {/* Product Count Badge */}
        <div className="absolute top-3 right-3 bg-black/75 backdrop-blur-xs px-2.5 py-1">
          <span className="text-[10px] font-medium uppercase tracking-[0.15em] text-white">
            {category.product_count}{" "}
            {category.product_count === 1 ? "PIECE" : "PIECES"}
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-xl sm:text-2xl font-serif text-theme-text-primary-light dark:text-theme-text-primary-dark group-hover:text-theme-hover-light dark:group-hover:text-theme-hover-dark transition-colors mb-2 leading-snug">
            {category.name}
          </h3>

          {category.description && (
            <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark line-clamp-2 mb-4 leading-relaxed">
              {category.description}
            </p>
          )}
        </div>

        {/* Shop Now Link */}
        <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark group-hover:text-theme-hover-light dark:group-hover:text-theme-hover-dark transition-colors pt-2 border-t border-theme-border-light/60 dark:border-theme-border-dark/60 mt-auto">
          <span>SHOP {shortName}</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1 duration-300" />
        </div>
      </div>
    </Link>
  );
}
