// app/components/home/HeroSection.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { ChevronsRight, TreePine, Hammer, SunMedium } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative w-full bg-theme-bg-light dark:bg-theme-bg-dark border-b border-theme-border-light dark:border-theme-border-dark py-4 sm:py-6 md:py-8 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Asymmetric 2-Column Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 items-center">
          
          {/* LEFT: Editorial Narrative & Action Hub (7 Columns) */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-4 sm:space-y-5">
            
            {/* Top Atelier Tag */}
            <div className="inline-flex items-center gap-2.5 px-3 py-1 border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark self-start">
              <span className="w-1.5 h-1.5 rotate-45 bg-theme-hover-light dark:bg-theme-hover-dark" />
              <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.22em] text-theme-hover-light dark:text-theme-hover-dark font-medium">
                HANDCRAFTED ARCHIVE • 2026
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark leading-[1.15] sm:leading-[1.1] tracking-tight">
              Luminaires sculpted in solid timber & brass.
            </h1>

            {/* Subtitle / Description */}
            <p className="text-xs sm:text-sm md:text-base text-theme-text-secondary-light dark:text-theme-text-secondary-dark leading-relaxed max-w-xl">
              Turned by hand on wood lathes from sustainably harvested American walnut, natural oak, and unlacquered architectural brass. Warm ambient illumination designed to anchor distinctive living spaces.
            </p>

            {/* Dual Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 pt-1">
              <Link
                href="/products"
                className="no-theme-hover inline-flex items-center justify-center gap-2.5 px-6 sm:px-8 py-3 sm:py-3.5 bg-theme-primary hover:bg-[#A8752B] dark:hover:bg-[#C99648] text-theme-btn-text hover:text-white dark:hover:text-white text-[11px] sm:text-xs uppercase tracking-[0.2em] font-medium transition-all duration-300 shadow-md active:scale-95 group"
              >
                <span className="text-inherit">EXPLORE THE COLLECTION</span>
                <ChevronsRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform group-hover:translate-x-1.5 duration-300 text-inherit" />
              </Link>

              <Link
                href="/categories"
                className="no-theme-hover inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3 sm:py-3.5 border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark hover:bg-[#241910] dark:hover:bg-[#1A130D] hover:border-[#241910] dark:hover:border-[#1A130D] text-theme-text-primary-light dark:text-theme-text-primary-dark hover:text-white dark:hover:text-[#F3EBDC] text-[11px] sm:text-xs uppercase tracking-[0.2em] font-medium transition-all duration-300"
              >
                <span className="text-inherit">VIEW BY CATEGORY</span>
              </Link>
            </div>

            {/* Craftsmanship Pillars / Value Highlights (Hidden on Mobile) */}
            <div className="hidden sm:grid sm:grid-cols-3 pt-5 border-t border-theme-border-light/70 dark:border-theme-border-dark/70 gap-4 max-w-xl">
              <div className="flex items-center gap-3 p-2.5 sm:p-0 rounded-lg sm:rounded-none bg-theme-surface-light/70 sm:bg-transparent dark:bg-theme-surface-dark/50 sm:dark:bg-transparent border sm:border-0 border-theme-border-light/60 dark:border-theme-border-dark/60">
                <div className="w-8 h-8 sm:w-7 sm:h-7 rounded-full bg-theme-hover-light/10 dark:bg-theme-hover-dark/15 flex items-center justify-center shrink-0 text-theme-hover-light dark:text-theme-hover-dark">
                  <TreePine className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-theme-text-primary-light dark:text-theme-text-primary-dark">
                    Solid Hardwood
                  </h4>
                  <p className="text-[11px] text-theme-text-muted-light dark:text-theme-text-muted-dark">
                    Natural Walnut & Oak
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-2.5 sm:p-0 rounded-lg sm:rounded-none bg-theme-surface-light/70 sm:bg-transparent dark:bg-theme-surface-dark/50 sm:dark:bg-transparent border sm:border-0 border-theme-border-light/60 dark:border-theme-border-dark/60">
                <div className="w-8 h-8 sm:w-7 sm:h-7 rounded-full bg-theme-hover-light/10 dark:bg-theme-hover-dark/15 flex items-center justify-center shrink-0 text-theme-hover-light dark:text-theme-hover-dark">
                  <Hammer className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-theme-text-primary-light dark:text-theme-text-primary-dark">
                    Atelier Turned
                  </h4>
                  <p className="text-[11px] text-theme-text-muted-light dark:text-theme-text-muted-dark">
                    By Master Woodturners
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-2.5 sm:p-0 rounded-lg sm:rounded-none bg-theme-surface-light/70 sm:bg-transparent dark:bg-theme-surface-dark/50 sm:dark:bg-transparent border sm:border-0 border-theme-border-light/60 dark:border-theme-border-dark/60">
                <div className="w-8 h-8 sm:w-7 sm:h-7 rounded-full bg-theme-hover-light/10 dark:bg-theme-hover-dark/15 flex items-center justify-center shrink-0 text-theme-hover-light dark:text-theme-hover-dark">
                  <SunMedium className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-theme-text-primary-light dark:text-theme-text-primary-dark">
                    Warm Ambient Light
                  </h4>
                  <p className="text-[11px] text-theme-text-muted-light dark:text-theme-text-muted-dark">
                    Cozy, Glare-Free Glow
                  </p>
                </div>
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
