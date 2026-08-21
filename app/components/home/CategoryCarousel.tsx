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
    <section className="bg-theme-bg-light dark:bg-theme-bg-dark border-b border-theme-border-light dark:border-theme-border-dark py-8 sm:py-10 md:py-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-8 border-b border-theme-border-light dark:border-theme-border-dark mb-10 sm:mb-12">
          <div>
            <p className="text-xs sm:text-sm font-medium tracking-[0.25em] uppercase text-theme-hover-light dark:text-theme-hover-dark mb-2">
              CURATED COLLECTIONS
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-theme-text-primary-light dark:text-theme-text-primary-dark">
              Shop by <span className="italic font-normal font-serif text-theme-hover-light dark:text-theme-hover-dark">Category</span>
            </h2>
          </div>

          <Link
            href="/categories"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium tracking-[0.2em] uppercase text-theme-hover-light dark:text-theme-hover-dark hover:text-theme-text-primary-light dark:hover:text-theme-text-primary-dark transition-colors group shrink-0"
          >
            VIEW ALL CATEGORIES
            <ChevronsRight className="w-4 h-4 transition-transform group-hover:translate-x-1 duration-300" />
          </Link>
        </div>

        {/* 4 Curated Category Cards Grid (4 columns desktop, 2 columns tablet/mobile) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-6 lg:gap-8">
          {featuredCategories.map((category, index) => {
            const indexFormatted = String(index + 1).padStart(2, "0");

            return (
              <Link
                key={category._id}
                href={`/products?category=${category.slug}`}
                className="group relative flex flex-col bg-theme-surface-light dark:bg-theme-surface-dark border border-theme-border-light dark:border-theme-border-dark hover:border-theme-hover-light dark:hover:border-theme-hover-dark transition-all duration-300 overflow-hidden"
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
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                      {/* Gradient for text contrast */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-70 group-hover:opacity-60 transition-opacity" />
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-theme-card-light/40 to-theme-card-light dark:from-theme-card-dark/40 dark:to-theme-card-dark relative overflow-hidden">
                      <div className="w-12 h-12 border border-theme-border-light dark:border-theme-border-dark flex items-center justify-center mb-3 bg-theme-surface-light dark:bg-theme-surface-dark group-hover:border-theme-hover-light transition-colors">
                        <Lamp className="w-6 h-6 text-theme-hover-light dark:text-theme-hover-dark" strokeWidth={1.5} />
                      </div>
                      <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-theme-text-muted-light dark:text-theme-text-muted-dark">
                        HANDCRAFTED
                      </span>
                    </div>
                  )}

                  {/* Top Meta Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
                    <span className="px-2 py-0.5 bg-black/75 backdrop-blur-xs text-white font-mono text-[10px] uppercase tracking-[0.15em]">
                      N° {indexFormatted}
                    </span>
                    <span className="px-2 py-0.5 bg-black/75 backdrop-blur-xs text-white font-mono text-[10px] uppercase tracking-[0.15em]">
                      {category.product_count} {category.product_count === 1 ? "PIECE" : "PIECES"}
                    </span>
                  </div>

                  {/* Floating Title on Image Bottom */}
                  <div className="absolute bottom-4 left-4 right-4 z-10">
                    <h3 className="text-xl sm:text-2xl font-serif text-white group-hover:text-theme-hover-light transition-colors leading-tight">
                      {category.name}
                    </h3>
                  </div>
                </div>

                {/* Bottom Footer Strip */}
                <div className="p-4 bg-theme-surface-light dark:bg-theme-surface-dark flex items-center justify-between text-xs uppercase tracking-[0.2em] font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark group-hover:text-theme-hover-light dark:group-hover:text-theme-hover-dark transition-colors">
                  <span>DISCOVER</span>
                  <ChevronsRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1.5 duration-300" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}