// app/components/home/HeroSection.tsx
"use client";

import Link from "next/link";
import { ChevronsRight } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative w-full min-h-[90vh] lg:min-h-screen flex items-center bg-[#140E08] text-[#F3EBDC] overflow-hidden -mt-16 sm:-mt-20 pt-20">
      {/* Background Image with Dark Vignette Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 scale-105"
        style={{
          backgroundImage: `url('/images/hero-timber-lamp.jpg')`,
        }}
      >
        {/* Gradient & Vignette Overlays for Perfect Readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#140E08]/95 via-[#140E08]/80 to-transparent lg:w-[65%]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#140E08] via-transparent to-[#140E08]/40" />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Hero Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 md:py-24 w-full">
        <div className="max-w-2xl lg:max-w-3xl">
          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif text-[#F3EBDC] leading-[1.08] tracking-tight mb-6 sm:mb-8 drop-shadow-sm">
            <span className="italic font-normal block font-serif">Sculptural light,</span>
            <span className="font-normal block">carved from</span>
            <span className="italic font-normal text-[#D4A359] block font-serif">solid timber.</span>
          </h1>

          {/* Subtitle / Narrative */}
          <p className="text-sm sm:text-base md:text-lg text-[#D7D3CF]/90 max-w-xl leading-relaxed mb-8 sm:mb-10 font-light drop-shadow-sm">
            Solid-wood lighting, shaped and finished entirely by hand. Discover heirloom-quality floor lamps, pendants, and candlelight — made to order for spaces that celebrate form.
          </p>

          {/* Single Action Button (takes to products page) */}
          <div className="flex flex-col items-start gap-6">
            <Link
              href="/products"
              className="inline-flex items-center gap-3 px-7 sm:px-9 py-3.5 sm:py-4 border border-[#A8752B] bg-[#241910]/80 hover:bg-[#A8752B] text-[#F3EBDC] hover:text-white hover:border-[#A8752B] text-xs sm:text-sm font-medium tracking-[0.2em] uppercase transition-all duration-300 group backdrop-blur-sm shadow-xl active:scale-95"
            >
              <span>SHOP THE COLLECTIONS</span>
              <ChevronsRight className="w-4 h-4 transition-transform group-hover:translate-x-1.5 duration-300 text-[#D4A359] group-hover:text-white" />
            </Link>

            {/* Subtle Scroll Cue */}
            <div className="flex items-center gap-2 text-[10px] sm:text-xs uppercase tracking-[0.25em] text-[#D4A359]/70 pt-2">
              <span className="w-6 h-[1px] bg-[#D4A359]/40" />
              <span>SCROLL</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
