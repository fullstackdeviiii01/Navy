// app/components/home/CollectionShowcase.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { ChevronsRight, Sparkles, Compass, Layers } from "lucide-react";

export default function CollectionShowcase() {
  return (
    <section className="bg-theme-bg-light dark:bg-theme-bg-dark border-b border-theme-border-light dark:border-theme-border-dark py-8 sm:py-10 md:py-12 transition-colors overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
          
          {/* IMAGE SIDE: Large Architectural Lamp Image with Overlaid "VIEW COLLECTION" Button (6 Cols) */}
          <div className="lg:col-span-6 relative group overflow-hidden border border-theme-border-light dark:border-theme-border-dark bg-theme-card-light dark:bg-theme-card-dark">
            {/* Image Container with Balanced 1:1 Aspect Ratio */}
            <div className="relative aspect-[1/1] w-full overflow-hidden">
              <Image
                src="/images/hero-timber-lamp.jpg"
                alt="Artisanal Handcrafted Lamp Collection"
                fill
                className="object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />

              {/* Editorial Gradient Vignette */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/10 transition-opacity duration-500" />

              {/* Floating Top Badge */}
              <div className="absolute top-4 left-4 z-10">
                <span className="px-3 py-1 bg-black/75 backdrop-blur-sm text-white font-mono text-[10px] uppercase tracking-[0.2em] border border-white/10">
                  ATELIER EDITION • 2026
                </span>
              </div>

              {/* OVERLAID BUTTON: Right inside the image with luxury brass styling */}
              <div className="absolute bottom-6 left-6 right-6 sm:bottom-8 sm:left-8 sm:right-8 z-10">
                <div className="p-4 sm:p-6 bg-black/70 dark:bg-[#140E08]/80 backdrop-blur-md border border-white/15 dark:border-theme-border-dark flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-300 group-hover:border-theme-hover-light">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#D4A359] block mb-1">
                      CURATED ANTHOLOGY
                    </span>
                    <h3 className="text-lg sm:text-xl font-serif text-white leading-tight">
                      Explore All 20 Pieces
                    </h3>
                  </div>

                  <Link
                    href="/products"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#A8752B] hover:bg-[#C99648] text-white text-xs uppercase tracking-[0.2em] font-medium transition-colors shrink-0 active:scale-95 shadow-lg"
                    aria-label="View our handcrafted lamp collection"
                  >
                    <span>VIEW COLLECTION</span>
                    <ChevronsRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* TEXT SIDE: Editorial Narrative & Collection Philosophy (6 Cols) */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-8">
            <div className="space-y-5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium tracking-[0.25em] uppercase text-theme-hover-light dark:text-theme-hover-dark">
                  THE ATELIER PHILOSOPHY
                </span>
              </div>

              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-theme-text-primary-light dark:text-theme-text-primary-dark leading-[1.12]">
                Form, shadow, and the{" "}
                <span className="italic font-normal font-serif text-theme-hover-light dark:text-theme-hover-dark">
                  warmth of living spaces.
                </span>
              </h2>

              <p className="text-xs sm:text-sm md:text-base text-theme-text-secondary-light dark:text-theme-text-secondary-dark leading-relaxed">
                Our lighting collection is conceived at the intersection of architectural discipline and raw organic material. Rather than mass-producing fixtures, our workshop shapes each luminaire individually from sustainably harvested American walnut, solid white oak, and precision-turned unlacquered brass.
              </p>

              <p className="text-xs sm:text-sm text-theme-text-muted-light dark:text-theme-text-muted-dark leading-relaxed">
                Every contour is turned by hand on wood lathes, finished with natural beeswax and organic botanical oils that allow the timber to breathe and develop a living patina over decades of daily illumination.
              </p>

              {/* 3 Core Collection Pillars */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-theme-border-light/60 dark:border-theme-border-dark/60">
                <div className="p-4 border border-theme-border-light/60 dark:border-theme-border-dark/60 bg-theme-surface-light dark:bg-theme-surface-dark space-y-1.5">
                  <div className="w-2 h-2 rotate-45 bg-theme-hover-light dark:bg-theme-hover-dark mb-2" />
                  <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-theme-text-primary-light dark:text-theme-text-primary-dark">
                    Solid Hardwood
                  </h4>
                  <p className="text-[11px] text-theme-text-secondary-light dark:text-theme-text-secondary-dark leading-snug">
                    Turned single-block oak & walnut without artificial veneers.
                  </p>
                </div>

                <div className="p-4 border border-theme-border-light/60 dark:border-theme-border-dark/60 bg-theme-surface-light dark:bg-theme-surface-dark space-y-1.5">
                  <div className="w-2 h-2 rotate-45 bg-theme-hover-light dark:bg-theme-hover-dark mb-2" />
                  <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-theme-text-primary-light dark:text-theme-text-primary-dark">
                    Natural Patina
                  </h4>
                  <p className="text-[11px] text-theme-text-secondary-light dark:text-theme-text-secondary-dark leading-snug">
                    Unlacquered architectural brass that deepens in tone with age.
                  </p>
                </div>

                <div className="p-4 border border-theme-border-light/60 dark:border-theme-border-dark/60 bg-theme-surface-light dark:bg-theme-surface-dark space-y-1.5">
                  <div className="w-2 h-2 rotate-45 bg-theme-hover-light dark:bg-theme-hover-dark mb-2" />
                  <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-theme-text-primary-light dark:text-theme-text-primary-dark">
                    2700K Ambiance
                  </h4>
                  <p className="text-[11px] text-theme-text-secondary-light dark:text-theme-text-secondary-dark leading-snug">
                    Gentle glare-free dispersion tailored for residential sanctuaries.
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-6 border-t border-theme-border-light/60 dark:border-theme-border-dark/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-theme-text-muted-light dark:text-theme-text-muted-dark">
                <span>CATALOG INDEX:</span>
                <span className="text-theme-text-primary-light dark:text-theme-text-primary-dark font-bold">20 UNIQUE PIECES</span>
              </div>

              <Link
                href="/categories"
                className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-medium text-theme-hover-light dark:text-theme-hover-dark hover:text-theme-text-primary-light dark:hover:text-theme-text-primary-dark transition-colors group"
              >
                <span>BROWSE CATEGORY INDEX</span>
                <ChevronsRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1.5 duration-300" />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
