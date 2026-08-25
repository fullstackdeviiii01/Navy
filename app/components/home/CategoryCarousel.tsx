// app/components/home/CategoryCarousel.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { ChevronsRight, Lamp } from "lucide-react";

interface Category {
  _id: string;
  name: string;
  slug: string;
  image_url?: string;
  product_count: number;
  description?: string;
}

interface CategoryCarouselProps {
  categories: Category[];
}

export default function CategoryCarousel({ categories }: CategoryCarouselProps) {
  if (!categories || categories.length === 0) return null;

  // Curate top 4 featured categories for the homepage
  const featuredCategories = categories.slice(0, 4);

  return (
    <section className="bg-theme-bg-light dark:bg-theme-bg-dark border-b border-theme-border-light dark:border-theme-border-dark py-4 sm:py-5 md:py-7 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4 pb-3 sm:pb-4 border-b border-theme-border-light dark:border-theme-border-dark mb-4 sm:mb-6">
          <div>
            <p className="text-[10px] sm:text-xs md:text-sm font-medium tracking-[0.25em] uppercase text-theme-hover-light dark:text-theme-hover-dark mb-1">
              CURATED COLLECTIONS
            </p>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-serif font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark tracking-tight">
              Shop by Category
            </h2>
          </div>

          <Link
            href="/categories"
            className="inline-flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs md:text-sm font-medium tracking-[0.2em] uppercase text-theme-hover-light dark:text-theme-hover-dark hover:text-theme-text-primary-light dark:hover:text-theme-text-primary-dark transition-colors group shrink-0"
          >
            <span>VIEW ALL CATEGORIES</span>
            <ChevronsRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform group-hover:translate-x-1 duration-300" />
          </Link>
        </div>

        {/* 4 Curated Category Cards Grid (4 columns desktop, 2 columns tablet & mobile) */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
          {featuredCategories.map((category, index) => {
            const indexFormatted = String(index + 1).padStart(2, "0");

            return (
              <Link
                key={category._id}
                href={`/products?category=${category.slug}`}
                className="group relative flex flex-col bg-theme-surface-light dark:bg-theme-surface-dark border border-theme-border-light dark:border-theme-border-dark hover:border-theme-hover-light dark:hover:border-theme-hover-dark transition-all duration-300 overflow-hidden shadow-xs"
              >
                {/* Image Container with Editorial Aspect Ratio (4:5) */}
                <div className="relative aspect-[4/5] w-full overflow-hidden bg-theme-card-light dark:bg-theme-card-dark border-b border-theme-border-light dark:border-theme-border-dark">
                  {category.image_url ? (
                    <>
                      <Image
                        src={category.image_url}
                        alt={category.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
                      />
                      {/* Gradient for text contrast */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent opacity-80 group-hover:opacity-70 transition-opacity" />
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-4 sm:p-6 text-center bg-gradient-to-b from-theme-card-light/40 to-theme-card-light dark:from-theme-card-dark/40 dark:to-theme-card-dark relative overflow-hidden">
                      <div className="w-9 h-9 sm:w-12 sm:h-12 border border-theme-border-light dark:border-theme-border-dark flex items-center justify-center mb-2 sm:mb-3 bg-theme-surface-light dark:bg-theme-surface-dark group-hover:border-theme-hover-light transition-colors">
                        <Lamp className="w-4 h-4 sm:w-6 sm:h-6 text-theme-hover-light dark:text-theme-hover-dark" strokeWidth={1.5} />
                      </div>
                      <span className="text-[8px] sm:text-[10px] font-mono uppercase tracking-[0.2em] text-theme-text-muted-light dark:text-theme-text-muted-dark">
                        HANDCRAFTED
                      </span>
                    </div>
                  )}

                  {/* Top Meta Badges */}
                  <div className="absolute top-2 left-2 right-2 sm:top-3 sm:left-3 sm:right-3 flex items-center justify-between z-10">
                    <span className="px-1.5 py-0.5 sm:px-2 sm:py-0.5 bg-black/75 backdrop-blur-xs text-white font-mono text-[8px] sm:text-[10px] uppercase tracking-[0.15em]">
                      N° {indexFormatted}
                    </span>
                    <span className="px-1.5 py-0.5 sm:px-2 sm:py-0.5 bg-black/75 backdrop-blur-xs text-white font-mono text-[8px] sm:text-[10px] uppercase tracking-[0.15em]">
                      {category.product_count} {category.product_count === 1 ? "PC" : "PCS"}
                    </span>
                  </div>

                  {/* Floating Title on Image Bottom */}
                  <div className="absolute bottom-2.5 left-2.5 right-2.5 sm:bottom-4 sm:left-4 sm:right-4 z-10">
                    <h3 className="text-sm sm:text-xl lg:text-2xl font-serif text-white group-hover:text-theme-hover-light transition-colors leading-snug line-clamp-1 sm:line-clamp-none">
                      {category.name}
                    </h3>
                  </div>
                </div>

                {/* Bottom Footer Strip */}
                <div className="p-2.5 sm:p-4 bg-theme-surface-light dark:bg-theme-surface-dark flex items-center justify-between text-[10px] sm:text-xs uppercase tracking-[0.2em] font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark group-hover:text-theme-hover-light dark:group-hover:text-theme-hover-dark transition-colors">
                  <span>DISCOVER</span>
                  <ChevronsRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 transition-transform group-hover:translate-x-1.5 duration-300" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}