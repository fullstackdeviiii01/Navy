// app/components/home/HeroSection.tsx
"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { getProductMainImage } from "../../../lib/utils/productImages";

interface ProductItem {
  _id: string;
  name: string;
  pricing?: {
    price: number;
    compare_at_price?: number;
  };
  variantPricing?: {
    minPrice: number;
  };
  images?: Array<{ url: string; alt_text?: string }>;
  category_id?: {
    name?: string;
    slug?: string;
  };
  [key: string]: any;
}

interface HeroSectionProps {
  products?: ProductItem[];
}

export default function HeroSection({ products = [] }: HeroSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Curated showcase lamps matching reference photography (with DB fallback)
  const defaultShowcaseLamps = [
    { _id: "s1", name: "Geometric Table Lamp", pricing: { price: 6900 }, images: [{ url: "/images/showcase/lamp_left3.jpg" }] },
    { _id: "s2", name: "Artisanal Lantern", pricing: { price: 5800 }, images: [{ url: "/images/showcase/lamp_left2.jpg" }] },
    { _id: "s3", name: "Timber Desk Lamp", pricing: { price: 4200 }, images: [{ url: "/images/showcase/lamp_left1.jpg" }] },
    { _id: "s4", name: "Square Wooden Slatted Lamp", pricing: { price: 5800 }, images: [{ url: "/images/showcase/lamp_center.jpg" }] },
    { _id: "s5", name: "Cantilever Desk Lamp", pricing: { price: 6900 }, images: [{ url: "/images/showcase/lamp_right1.jpg" }] },
    { _id: "s6", name: "Timber Candle Lantern", pricing: { price: 4200 }, images: [{ url: "/images/showcase/lamp_right2.jpg" }] },
    { _id: "s7", name: "Rustic Geometric Light", pricing: { price: 3500 }, images: [{ url: "/images/showcase/lamp_right3.jpg" }] },
  ];

  // Combine DB products with reference showcase fallback
  const displayProducts = products.length >= 7 
    ? products 
    : [...products, ...defaultShowcaseLamps.slice(products.length)];

  const total = displayProducts.length;

  const navigateTo = useCallback((newIndex: number) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setActiveIndex((newIndex + total) % total);
    setTimeout(() => setIsAnimating(false), 450);
  }, [total, isAnimating]);

  const handleNext = useCallback(() => {
    navigateTo(activeIndex + 1);
  }, [activeIndex, navigateTo]);

  const handlePrev = useCallback(() => {
    navigateTo(activeIndex - 1);
  }, [activeIndex, navigateTo]);

  // Smooth auto-slide every 5 seconds
  useEffect(() => {
    if (isDragging) return;
    const timer = setInterval(() => {
      navigateTo(activeIndex + 1);
    }, 5000);
    return () => clearInterval(timer);
  }, [activeIndex, isDragging, navigateTo]);

  // Touch / Drag Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
    setDragOffset(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    setDragOffset(e.touches[0].clientX - startX);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (dragOffset < -35) handleNext();
    else if (dragOffset > 35) handlePrev();
    setDragOffset(0);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.clientX);
    setDragOffset(0);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setDragOffset(e.clientX - startX);
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (dragOffset < -40) handleNext();
    else if (dragOffset > 40) handlePrev();
    setDragOffset(0);
  };

  // 7 slots: 3 on left (-3, -2, -1), 1 center (0), 3 on right (+1, +2, +3)
  const visibleSlots = [-3, -2, -1, 0, 1, 2, 3];

  // Calibrated viewport spread ensuring equal, non-overlapping gaps across all 7 items
  const slotXPositionsVw: Record<number, number> = {
    0: 0,
    1: 14.2,
    2: 25.4,
    3: 35.2,
    [-1]: -14.2,
    [-2]: -25.4,
    [-3]: -35.2,
  };

  return (
    <section className="relative w-full bg-[#0A0604] text-[#F3E8D6] overflow-hidden select-none transition-colors">
      
      {/* ========================================================================= */}
      {/* 1. FULL-WIDTH HERO BANNER (ATMOSPHERIC BACKGROUND & TYPOGRAPHY) */}
      {/* ========================================================================= */}
      <div className="relative w-full min-h-[380px] sm:min-h-[420px] md:min-h-[460px] lg:min-h-[500px] flex items-center">
        
        {/* Full-width High-Res Hero Image with Lamp & Vases on Right */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/heroimageone.png"
            alt="Handcrafted Solid Wooden Table Lamp with Warm Glowing Filament Bulb"
            fill
            priority
            className="object-cover object-right-bottom sm:object-right lg:object-center"
            sizes="100vw"
          />
          {/* Subtle gradient overlay on left for crisp text contrast */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A0604]/90 via-[#0A0604]/50 to-transparent w-full md:w-[65%]" />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0A0604] to-transparent" />
        </div>

        {/* Hero Content (Positioned with comfortable side breathing room) */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10 py-10 sm:py-12 md:py-14">
          <div className="max-w-xl flex flex-col justify-center text-left space-y-2.5 sm:space-y-3 pl-1 sm:pl-4 lg:pl-8 xl:pl-10">
            
            {/* Elegant Script Tagline */}
            <p className="font-serif italic text-[#C59345] text-xl sm:text-2xl md:text-[26px] font-normal tracking-wide drop-shadow-sm">
              Handmade Natural
            </p>

            {/* Main Bold Headline (Strict Single Line) */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[52px] xl:text-[58px] font-serif font-bold text-white tracking-tight uppercase leading-none whitespace-nowrap drop-shadow-md">
              WOODEN <span className="text-[#C59345]">LAMP</span>
            </h1>

            {/* Sub-headline with delicate underline */}
            <div className="pt-0.5">
              <h2 className="text-xs sm:text-sm md:text-base font-serif font-normal text-[#E5D7C2] tracking-wide inline-block">
                Crafted by Nature, Designed to Inspire
              </h2>
              <div className="h-[1.5px] w-12 sm:w-16 bg-[#C59345]/70 mt-1" />
            </div>

            {/* Body Description */}
            <p className="text-xs sm:text-[13px] md:text-sm text-[#A89B8C] leading-relaxed max-w-md pt-1 font-sans">
              Premium quality wooden lamps, carefully handcrafted to bring warmth, elegance and a natural touch to your space.
            </p>

            {/* Dual CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 pt-3 sm:pt-4">
              <Link
                href="/products"
                className="inline-flex items-center justify-center gap-1.5 px-6 sm:px-7 py-2.5 sm:py-3 bg-[#C59345] hover:bg-[#D9A352] text-[#0A0604] text-xs sm:text-[13px] font-bold uppercase tracking-[0.12em] rounded-[2px] transition-all duration-200 shadow-lg shadow-[#C59345]/25 active:scale-95 group"
              >
                <span>SHOP NOW</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </Link>

              <Link
                href="/products?sort=popular"
                className="inline-flex items-center justify-center px-6 sm:px-7 py-2.5 sm:py-3 border border-white/60 hover:border-[#C59345] bg-[#0A0604]/40 hover:bg-white/10 text-white hover:text-[#C59345] text-xs sm:text-[13px] font-medium uppercase tracking-[0.12em] rounded-[2px] backdrop-blur-sm transition-all duration-200"
              >
                EXPORE COLLECTION
              </Link>
            </div>

          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 2. 3D GOLDEN HORIZONTAL ELLIPSE (ALL 7 ITEMS SPREAD UNIFORMLY) */}
      {/* ========================================================================= */}
      <div className="relative w-full max-w-7xl mx-auto px-1 sm:px-3 lg:px-6 pt-0 pb-6 sm:pb-8 md:pb-10 -mt-6 sm:-mt-8 md:-mt-10 z-20">
        
        {/* Main Orbit Stage */}
        <div 
          ref={containerRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="relative w-full h-[160px] sm:h-[195px] md:h-[225px] lg:h-[250px] flex items-center justify-center cursor-grab active:cursor-grabbing"
        >
          {/* Elongated Clean Gold Ellipse Frame (Lower Profile Top & Bottom) */}
          <div className="absolute inset-0 w-full h-full pointer-events-none flex items-center justify-center px-1 sm:px-2">
            <svg 
              className="w-full h-full max-w-7xl" 
              viewBox="0 0 1000 220" 
              fill="none" 
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="heroGoldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#C59345" stopOpacity="0.3" />
                  <stop offset="15%" stopColor="#E6BA6F" stopOpacity="0.85" />
                  <stop offset="50%" stopColor="#FFE1A0" stopOpacity="1" />
                  <stop offset="85%" stopColor="#E6BA6F" stopOpacity="0.85" />
                  <stop offset="100%" stopColor="#C59345" stopOpacity="0.3" />
                </linearGradient>
                <filter id="heroGoldGlow" x="-10%" y="-20%" width="120%" height="140%">
                  <feGaussianBlur stdDeviation="6" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>
              
              {/* Outer Radiant Ambient Glow */}
              <ellipse 
                cx="500" 
                cy="110" 
                rx="485" 
                ry="100" 
                stroke="url(#heroGoldGrad)" 
                strokeWidth="2.5" 
                filter="url(#heroGoldGlow)" 
                fill="none" 
                opacity="0.45" 
              />
              {/* Crisp Primary Gold Ellipse (Single Border) */}
              <ellipse 
                cx="500" 
                cy="110" 
                rx="485" 
                ry="98" 
                stroke="url(#heroGoldGrad)" 
                strokeWidth="1.75" 
                fill="none" 
              />
            </svg>
          </div>

          {/* Left Arrow Navigation (White Circle Button) */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            aria-label="Previous product"
            className="absolute left-0 sm:left-2 md:left-4 top-1/2 -translate-y-1/2 z-30 w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-full bg-white text-[#0A0604] hover:bg-[#C59345] hover:text-white shadow-xl flex items-center justify-center transition-all duration-200 active:scale-90 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Right Arrow Navigation (White Circle Button) */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            aria-label="Next product"
            className="absolute right-0 sm:right-2 md:right-4 top-1/2 -translate-y-1/2 z-30 w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-full bg-white text-[#0A0604] hover:bg-[#C59345] hover:text-white shadow-xl flex items-center justify-center transition-all duration-200 active:scale-90 cursor-pointer"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* 7 Product Lenses Spread Uniformly with Consistent Gaps */}
          <div className="relative w-full max-w-6xl h-full flex items-center justify-center">
            {visibleSlots.map((offset) => {
              const itemIndex = (activeIndex + offset + total * 100) % total;
              const product = displayProducts[itemIndex];
              if (!product) return null;

              const isCenter = offset === 0;
              const imgUrl = getProductMainImage(product) || product.images?.[0]?.url || "/images/showcase/lamp_center.jpg";
              const absOffset = Math.abs(offset);

              // Spread positioning in viewport width (vw) ensuring all 7 items are distinctly visible
              const xPosVw = slotXPositionsVw[offset] || 0;
              const zIndex = isCenter ? 25 : 20 - absOffset;
              const opacity = isCenter ? 1 : Math.max(0.65, 1 - absOffset * 0.11);

              // Proportional Lens Dimensions (Width x Height)
              let sizeClasses = "";
              if (isCenter) {
                // Center Product: Main Illuminated Lens
                sizeClasses = "w-[136px] h-[146px] sm:w-[166px] sm:h-[178px] md:w-[194px] md:h-[208px] lg:w-[214px] lg:h-[228px]";
              } else if (absOffset === 1) {
                // Level 1 (±1): Flanking Lenses (gentle breathing room from center)
                sizeClasses = "w-[88px] h-[95px] sm:w-[108px] sm:h-[116px] md:w-[126px] md:h-[136px] lg:w-[138px] lg:h-[148px]";
              } else if (absOffset === 2) {
                // Level 2 (±2): Smaller Lenses
                sizeClasses = "w-[62px] h-[67px] sm:w-[76px] sm:h-[82px] md:w-[88px] md:h-[95px] lg:w-[98px] lg:h-[105px]";
              } else {
                // Level 3 (±3): Smallest Lenses at ends
                sizeClasses = "w-[42px] h-[45px] sm:w-[50px] sm:h-[54px] md:w-[58px] md:h-[62px] lg:w-[64px] lg:h-[69px]";
              }

              return (
                <div
                  key={`${product._id || itemIndex}-${offset}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isCenter) navigateTo(itemIndex);
                  }}
                  style={{
                    transform: `translate(calc(-50% + ${xPosVw}vw), -50%)`,
                    opacity,
                    zIndex,
                    transition: "transform 0.45s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.45s ease",
                  }}
                  className={`absolute top-1/2 left-1/2 ${
                    isCenter ? "cursor-pointer" : "cursor-pointer hover:opacity-100 hover:scale-105"
                  }`}
                >
                  {isCenter ? (
                    /* ===== ACTIVE CENTER LENS WITH RADIANT GOLD DOUBLE RING ===== */
                    <Link href={`/product/${product._id}`} className="relative block group">
                      {/* Ambient Golden Glow Aura */}
                      <div className="absolute -inset-3 sm:-inset-4 bg-[#C59345]/35 rounded-[50%] blur-md animate-pulse" />
                      
                      {/* Concentric Double Gold Frame */}
                      <div className={`relative ${sizeClasses} rounded-[50%] p-[3px] sm:p-[4px] bg-gradient-to-b from-[#F7DB99] via-[#C59345] to-[#734A14] shadow-[0_0_35px_rgba(197,147,69,0.5)]`}>
                        <div className="w-full h-full rounded-[50%] overflow-hidden bg-[#18110B] relative">
                          <Image
                            src={imgUrl}
                            alt={product.name}
                            fill
                            sizes="(max-width: 640px) 140px, (max-width: 1024px) 200px, 220px"
                            className="object-cover object-center transition-transform duration-500 group-hover:scale-110"
                          />
                        </div>
                      </div>
                    </Link>
                  ) : (
                    /* ===== FLANKING LENSES (INSIDE THE ELLIPSE) ===== */
                    <div className="relative group">
                      {/* Soft ambient white-gold glow behind each side lens */}
                      <div className="absolute -inset-1 bg-white/10 rounded-[50%] blur-[2px]" />
                      
                      {/* Gold ring border */}
                      <div className={`relative ${sizeClasses} rounded-[50%] p-[2px] bg-gradient-to-b from-[#C59345]/75 to-[#8A5E22]/45 shadow-md transition-all group-hover:shadow-[0_0_15px_rgba(197,147,69,0.45)]`}>
                        <div className="w-full h-full rounded-[50%] overflow-hidden bg-[#18110B] relative">
                          <Image
                            src={imgUrl}
                            alt={product.name}
                            fill
                            sizes="140px"
                            className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Exploration Cue (Hand icon + Drag or Swipe to Explore) */}
        <div className="flex items-center justify-center gap-2 mt-1 text-center">
          <svg 
            className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#C59345] animate-bounce" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
            <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2" />
            <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8" />
            <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
          </svg>
          <span className="text-[10px] sm:text-[11px] font-mono tracking-[0.16em] uppercase text-[#C59345] font-medium">
            Drag or Swipe to Explore
          </span>
        </div>

      </div>

    </section>
  );
}
