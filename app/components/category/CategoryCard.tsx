// app/components/category/CategoryCard.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { ChevronsRight, Lamp, Sparkles } from "lucide-react";

interface CategoryCardProps {
  category: {
    _id: string;
    name: string;
    description?: string;
    slug: string;
    image_url?: string;
    product_count: number;
  };
  index?: number;
}

export default function CategoryCard({ category, index = 0 }: CategoryCardProps) {
  const indexFormatted = String(index + 1).padStart(2, "0");

  return (
    <Link
      href={`/products?category=${category.slug}`}
      aria-label={`Explore ${category.name} collection - ${category.product_count} handcrafted pieces`}
      className="group relative flex flex-col h-full bg-theme-surface-light dark:bg-theme-surface-dark border border-theme-border-light dark:border-theme-border-dark hover:border-theme-hover-light dark:hover:border-theme-hover-dark transition-all duration-300 overflow-hidden"
    >
      {/* Top Meta Bar */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-theme-border-light/60 dark:border-theme-border-dark/60 bg-theme-card-light/30 dark:bg-theme-card-dark/30">
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-theme-hover-light dark:text-theme-hover-dark font-medium">
          N° {indexFormatted}
        </span>
        <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-theme-text-muted-light dark:text-theme-text-muted-dark">
          {category.product_count} {category.product_count === 1 ? "PIECE" : "PIECES"}
        </span>
      </div>

      {/* Visual Area */}
      <div className="relative aspect-[16/11] sm:aspect-[4/3] w-full overflow-hidden bg-theme-card-light/60 dark:bg-theme-card-dark/60 border-b border-theme-border-light/60 dark:border-theme-border-dark/60 flex items-center justify-center">
        {category.image_url ? (
          <>
            <Image
              src={category.image_url}
              alt={`${category.name} collection`}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-theme-card-light/40 to-theme-card-light dark:from-theme-card-dark/40 dark:to-theme-card-dark relative overflow-hidden">
            {/* Subtle Architectural Grid Lines */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:16px_16px]" />
            
            <div className="relative z-10 w-12 h-12 border border-theme-border-light dark:border-theme-border-dark flex items-center justify-center mb-3 bg-theme-surface-light dark:bg-theme-surface-dark group-hover:border-theme-hover-light transition-colors">
              <Lamp className="w-6 h-6 text-theme-hover-light dark:text-theme-hover-dark" strokeWidth={1.5} />
            </div>
            <span className="relative z-10 text-[10px] font-mono uppercase tracking-[0.2em] text-theme-text-muted-light dark:text-theme-text-muted-dark">
              CURATED COLLECTION
            </span>
          </div>
        )}

        {/* Hover Action Badge */}
        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-theme-primary text-theme-btn-text text-[10px] uppercase tracking-[0.18em] font-medium shadow-md">
            <span>EXPLORE</span>
            <ChevronsRight className="w-3 h-3" />
          </span>
        </div>
      </div>

      {/* Content Details */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-xl sm:text-2xl font-serif text-theme-text-primary-light dark:text-theme-text-primary-dark group-hover:text-theme-hover-light dark:group-hover:text-theme-hover-dark transition-colors mb-2">
            {category.name}
          </h3>

          <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark line-clamp-2 leading-relaxed mb-4">
            {category.description || `Handcrafted ${category.name.toLowerCase()} luminaires shaped by master artisans for architectural spaces.`}
          </p>
        </div>

        {/* Bottom Action Strip */}
        <div className="pt-4 border-t border-theme-border-light/60 dark:border-theme-border-dark/60 flex items-center justify-between text-xs uppercase tracking-[0.2em] font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark group-hover:text-theme-hover-light dark:group-hover:text-theme-hover-dark transition-colors">
          <span>VIEW COLLECTION</span>
          <ChevronsRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1.5 duration-300" />
        </div>
      </div>
    </Link>
  );
}
