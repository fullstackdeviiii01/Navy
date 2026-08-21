// app/components/home/HeroSection.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { ChevronsRight } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative w-full bg-theme-bg-light dark:bg-theme-bg-dark border-b border-theme-border-light dark:border-theme-border-dark py-8 sm:py-10 md:py-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Asymmetric 2-Column Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">
          
          {/* LEFT: Editorial Narrative & Action Hub (7 Columns) */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-5 sm:space-y-6">
            
            {/* Top Atelier Tag */}
            <div className="inline-flex items-center gap-2.5 px-3 py-1 border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark self-start">
              <span className="w-1.5 h-1.5 rotate-45 bg-theme-hover-light dark:bg-theme-hover-dark" />
              <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.22em] text-theme-hover-light dark:text-theme-hover-dark font-medium">
                HANDCRAFTED ARCHIVE • 2026
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif text-theme-text-primary-light dark:text-theme-text-primary-dark leading-[1.1] tracking-tight">
              Luminaires sculpted in{" "}
              <span className="italic font-normal font-serif text-theme-hover-light dark:text-theme-hover-dark block sm:inline">
                solid timber & brass.
              </span>
            </h1>

            {/* Subtitle / Description */}
            <p className="text-xs sm:text-sm md:text-base text-theme-text-secondary-light dark:text-theme-text-secondary-dark leading-relaxed max-w-xl">
              Turned by hand on wood lathes from sustainably harvested American walnut, natural oak, and unlacquered architectural brass. Calibrated 2700K ambient illumination designed to anchor distinctive living spaces.
            </p>

            {/* Dual Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
              <Link
                href="/products"
                className="no-theme-hover inline-flex items-center justify-center gap-3 px-7 sm:px-8 py-3.5 bg-theme-primary hover:bg-[#A8752B] dark:hover:bg-[#C99648] text-theme-btn-text hover:text-white dark:hover:text-white text-xs uppercase tracking-[0.2em] font-medium transition-all duration-300 shadow-md active:scale-95 group"
              >
                <span className="text-inherit">EXPLORE THE COLLECTION</span>
                <ChevronsRight className="w-4 h-4 transition-transform group-hover:translate-x-1.5 duration-300 text-inherit" />
              </Link>

              <Link
                href="/categories"
                className="no-theme-hover inline-flex items-center justify-center gap-2 px-6 py-3.5 border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark hover:bg-[#241910] dark:hover:bg-[#1A130D] hover:border-[#241910] dark:hover:border-[#1A130D] text-theme-text-primary-light dark:text-theme-text-primary-dark hover:text-white dark:hover:text-[#F3EBDC] text-xs uppercase tracking-[0.2em] font-medium transition-all duration-300"
              >
                <span className="text-inherit">VIEW BY CATEGORY</span>
              </Link>
            </div>

            {/* Quick Metrics Bar */}
            <div className="pt-4 border-t border-theme-border-light/60 dark:border-theme-border-dark/60 grid grid-cols-3 gap-3 max-w-lg">
              <div>
                <span className="font-mono text-xs sm:text-sm font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark block">
                  20 PIECES
                </span>
                <span className="text-[10px] uppercase font-mono tracking-wider text-theme-text-muted-light dark:text-theme-text-muted-dark">
                  Handmade Catalog
                </span>
              </div>

              <div>
                <span className="font-mono text-xs sm:text-sm font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark block">
                  100% SOLID
                </span>
                <span className="text-[10px] uppercase font-mono tracking-wider text-theme-text-muted-light dark:text-theme-text-muted-dark">
                  Hardwood & Brass
                </span>
              </div>

              <div>
                <span className="font-mono text-xs sm:text-sm font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark block">
                  2700K WARMTH
                </span>
                <span className="text-[10px] uppercase font-mono tracking-wider text-theme-text-muted-light dark:text-theme-text-muted-dark">
                  Eye-Comfort Glow
                </span>
              </div>
            </div>

          </div>

          {/* RIGHT: Featured Architectural Lamp Showcase Frame (5 Columns) */}
          <div className="lg:col-span-5 relative group overflow-hidden border border-theme-border-light dark:border-theme-border-dark bg-theme-card-light dark:bg-theme-card-dark">
            <div className="relative aspect-[4/3] sm:aspect-[16/11] lg:aspect-[4/3] w-full overflow-hidden">
              <Image
                src="/images/hero-atelier-lamp.jpg"
                alt="Handcrafted Walnut Table Lamp in Living Room"
                fill
                className="object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 40vw"
                priority
              />

              {/* Gradient Scrim */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

              {/* Top Quality Badge */}
              <div className="absolute top-3 left-3 z-10">
                <span className="px-2.5 py-0.5 bg-black/75 backdrop-blur-xs text-white font-mono text-[9px] uppercase tracking-[0.18em]">
                  ARTISANAL WORKSHOP
                </span>
              </div>

              {/* Floating Bottom Craftsmanship Caption */}
              <div className="absolute bottom-3 left-3 right-3 z-10">
                <div className="p-3 sm:p-3.5 bg-black/75 dark:bg-[#140E08]/85 backdrop-blur-md border border-white/15 dark:border-theme-border-dark flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[9px] font-mono uppercase tracking-[0.18em] text-[#D4A359] block mb-0.5">
                      HEIRLOOM STANDARD
                    </span>
                    <h3 className="text-xs sm:text-sm font-serif text-white font-medium">
                      Turned from solid timber & unlacquered brass.
                    </h3>
                  </div>

                  <span className="text-[9px] font-mono uppercase tracking-wider text-white/80 border border-white/20 px-2 py-1 shrink-0 hidden sm:inline">
                    HANDMADE
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
