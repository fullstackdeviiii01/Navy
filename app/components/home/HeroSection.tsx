// app/components/home/HeroSection.tsx
"use client";

import React, { useState, useRef, useCallback, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { getProductMainImage } from "../../../lib/utils/productImages";
import { getProductUrl } from "../../../lib/utils/productUrl";
import { formatPrice } from "../../../lib/utils/formatPrice";

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
  variants?: any[];
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

const getProductImages = (prod?: ProductItem): string[] => {
  if (!prod) return ["/images/showcase/lamp_center.jpg"];
  const urls: string[] = [];

  const mainImg = getProductMainImage(prod);
  if (mainImg) urls.push(mainImg);

  if (Array.isArray(prod.images)) {
    prod.images.forEach((img: any) => {
      const u = typeof img === "string" ? img : img?.url;
      if (u && typeof u === "string" && !urls.includes(u)) {
        urls.push(u);
      }
    });
  }

  if (Array.isArray(prod.variants)) {
    prod.variants.forEach((v: any) => {
      if (v?.imageUrl && typeof v.imageUrl === "string" && !urls.includes(v.imageUrl)) {
        urls.push(v.imageUrl);
      }
    });
  }

  return urls.length > 0 ? urls : [mainImg || "/images/showcase/lamp_center.jpg"];
};

export default function HeroSection({ products = [] }: HeroSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [windowWidth, setWindowWidth] = useState<number>(1200);
  const [isAnimating, setIsAnimating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Track window width for responsive calculation without CSS conflicts
  useEffect(() => {
    const updateWidth = () => setWindowWidth(window.innerWidth);
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

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
  const activeProduct = displayProducts[activeIndex] || displayProducts[0];

  // All images for the currently active/focused product
  const activeImages = useMemo(() => {
    return getProductImages(activeProduct);
  }, [activeProduct]);

  const navigateTo = useCallback((newIndex: number) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentImageIndex(0);
    setActiveIndex((newIndex + total * 100) % total);
    setTimeout(() => setIsAnimating(false), 450);
  }, [total, isAnimating]);

  const handleNext = useCallback(() => {
    navigateTo(activeIndex + 1);
  }, [activeIndex, navigateTo]);

  const handlePrev = useCallback(() => {
    navigateTo(activeIndex - 1);
  }, [activeIndex, navigateTo]);

  // Reset image index whenever active product index changes
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [activeIndex]);

  // Auto-cycle through every picture of the active product, then advance to next product
  useEffect(() => {
    if (isDragging) return;

    const totalImages = activeImages.length;
    // 1.8 seconds per picture; 3.5 seconds if product has only 1 picture
    const intervalMs = totalImages > 1 ? 1800 : 3500;

    const timer = setTimeout(() => {
      if (currentImageIndex < totalImages - 1) {
        setCurrentImageIndex((prev) => prev + 1);
      } else {
        setCurrentImageIndex(0);
        handleNext();
      }
    }, intervalMs);

    return () => clearTimeout(timer);
  }, [activeIndex, currentImageIndex, isDragging, activeImages, handleNext]);

  // Touch / Drag Handlers for mobile & desktop swiping with live drag follow
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
    e.preventDefault();
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

  // 7 slots total
  const visibleSlots = [-3, -2, -1, 0, 1, 2, 3];

  // Calculate clean, non-overlapping horizontal offset per screen size
  const getSlotXOffsetVw = (offset: number): number => {
    const abs = Math.abs(offset);
    const sign = Math.sign(offset);
    if (abs === 0) return 0;

    if (windowWidth < 640) {
      // Mobile (<640px): 3 items with wide clearance
      return sign * 26.0;
    } else if (windowWidth < 1024) {
      // Tablet (640px - 1024px): 5 items
      if (abs === 1) return sign * 18.5;
      if (abs === 2) return sign * 33.5;
      return sign * 44.0;
    } else {
      // Laptop/Desktop (1024px+): 7 items
      if (abs === 1) return sign * 14.2;
      if (abs === 2) return sign * 25.4;
      if (abs === 3) return sign * 35.2;
      return 0;
    }
  };

  return (
    <section className="relative w-full bg-[#0A0604] text-[#F3E8D6] overflow-hidden select-none transition-colors">
      
      {/* ========================================================================= */}
      {/* 1. RESPONSIVE HERO BANNER (MOBILE, TABLET, LAPTOP & DESKTOP) */}
      {/* ========================================================================= */}
      <div className="relative w-full min-h-[360px] sm:min-h-[420px] md:min-h-[460px] lg:min-h-[500px] xl:min-h-[540px] flex items-center">
        
        {/* Full-width Responsive Hero Image (Moved 90px up on tablet and higher) */}
        <div className="absolute inset-0 md:-top-[90px] md:h-[calc(100%+90px)] z-0 pointer-events-none">
          <Image
            src="/images/heroimageone.png"
            alt="Handcrafted Solid Wooden Table Lamp with Warm Glowing Filament Bulb"
            fill
            priority
            className="object-cover object-[82%_center] sm:object-[78%_center] md:object-[74%_center] lg:object-center"
            sizes="100vw"
          />
          {/* Responsive dark gradient overlay ensuring high text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A0604]/95 via-[#0A0604]/70 to-transparent w-full sm:w-[85%] md:w-[70%] lg:w-[60%]" />
          <div className="absolute inset-x-0 bottom-0 h-20 sm:h-24 bg-gradient-to-t from-[#0A0604] via-[#0A0604]/70 to-transparent" />
        </div>

        {/* Hero Content Area (Moved 30px up on laptop and higher) */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 w-full relative z-10 py-8 sm:py-12 md:py-14">
          <div className="max-w-xl xl:max-w-2xl flex flex-col justify-center text-left space-y-2.5 sm:space-y-3 pl-1 sm:pl-4 lg:pl-6 lg:-translate-y-[30px]">
            
            {/* Elegant Script Tagline */}
            <p className="font-serif italic text-[#C59345] text-lg sm:text-2xl md:text-3xl lg:text-[32px] font-normal tracking-wide drop-shadow-sm">
              Handmade Natural
            </p>

            {/* Main Bold Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[56px] xl:text-[64px] font-serif font-bold text-white tracking-tight uppercase leading-[1.05] whitespace-nowrap drop-shadow-md">
              WOODEN <span className="text-[#C59345]">LAMP</span>
            </h1>

            {/* Sub-headline */}
            <div className="pt-0.5 sm:pt-1">
              <h2 className="text-xs sm:text-base md:text-lg lg:text-xl font-serif font-normal text-[#E5D7C2] tracking-wide inline-block">
                Crafted by Nature, Designed to Inspire
              </h2>
              <div className="h-[2px] w-12 sm:w-20 bg-[#C59345] mt-1 sm:mt-1.5 rounded-full" />
            </div>

            {/* Body Description */}
            <p className="text-xs sm:text-sm md:text-[15px] text-[#A89B8C] leading-relaxed max-w-md lg:max-w-lg pt-1 font-sans">
              Premium quality wooden lamps, carefully handcrafted to bring warmth, elegance and a natural touch to your space.
            </p>

            {/* Dual CTA Buttons (Clean, with no-theme-hover) */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-3 sm:pt-5">
              <Link
                href="/products"
                className="no-theme-hover inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3.5 bg-[#C59345] hover:bg-[#B37F33] text-white hover:text-white text-xs sm:text-sm font-semibold uppercase tracking-[0.14em] rounded-sm transition-colors duration-200 cursor-pointer"
              >
                <span className="text-white">SHOP NOW</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </Link>

              <Link
                href="/products?sort=popular"
                className="no-theme-hover inline-flex items-center justify-center px-6 sm:px-8 py-2.5 sm:py-3.5 border border-white/70 hover:border-white text-white hover:text-white hover:bg-white/10 text-xs sm:text-sm font-medium uppercase tracking-[0.14em] rounded-sm transition-colors duration-200 cursor-pointer"
              >
                EXPORE COLLECTION
              </Link>
            </div>

          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 2. RESPONSIVE ORBIT SHOWCASE (NATURAL FLOW WITHOUT BUTTON OVERLAP) */}
      {/* ========================================================================= */}
      <div className="relative w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 pt-2 sm:pt-4 md:pt-6 pb-6 sm:pb-8 md:pb-10 lg:-mt-6 z-20">
        
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
          className={`relative w-full h-[155px] sm:h-[190px] md:h-[225px] lg:h-[255px] flex items-center justify-center ${
            isDragging ? "cursor-grabbing" : "cursor-grab"
          }`}
        >
          {/* Elongated Golden Ellipse Frame */}
          <div className="absolute inset-0 w-full h-full pointer-events-none flex items-center justify-center px-1 sm:px-2">
            <svg 
              className="w-full h-full max-w-7xl" 
              viewBox="0 0 1000 220" 
              fill="none" 
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="heroGoldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#C59345" stopOpacity="0.25" />
                  <stop offset="15%" stopColor="#E6BA6F" stopOpacity="0.85" />
                  <stop offset="50%" stopColor="#FFE1A0" stopOpacity="1" />
                  <stop offset="85%" stopColor="#E6BA6F" stopOpacity="0.85" />
                  <stop offset="100%" stopColor="#C59345" stopOpacity="0.25" />
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
                ry="98" 
                stroke="url(#heroGoldGrad)" 
                strokeWidth="2.5" 
                filter="url(#heroGoldGlow)" 
                fill="none" 
                opacity="0.45" 
              />
              {/* Crisp Primary Gold Ellipse */}
              <ellipse 
                cx="500" 
                cy="110" 
                rx="485" 
                ry="96" 
                stroke="url(#heroGoldGrad)" 
                strokeWidth="1.75" 
                fill="none" 
              />
            </svg>
          </div>

          {/* Left Navigation Arrow */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            aria-label="Previous product"
            className="absolute left-0.5 sm:left-2 md:left-4 top-1/2 -translate-y-1/2 z-30 w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-full bg-white text-[#0A0604] hover:bg-[#C59345] hover:text-white shadow-xl flex items-center justify-center transition-all duration-200 active:scale-90 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Right Navigation Arrow */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            aria-label="Next product"
            className="absolute right-0.5 sm:right-2 md:right-4 top-1/2 -translate-y-1/2 z-30 w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-full bg-white text-[#0A0604] hover:bg-[#C59345] hover:text-white shadow-xl flex items-center justify-center transition-all duration-200 active:scale-90 cursor-pointer"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Responsive Orbit Items: 
              - Mobile (<640px): 3 Items ([-1, 0, 1])
              - Tablet (640-1024px): 5 Items ([-2, -1, 0, 1, 2])
              - Desktop (1024px+): 7 Items ([-3, -2, -1, 0, 1, 2, 3])
          */}
          <div className="relative w-full max-w-6xl h-full flex items-center justify-center pointer-events-none">
            {visibleSlots.map((offset) => {
              const itemIndex = (activeIndex + offset + total * 100) % total;
              const product = displayProducts[itemIndex];
              if (!product) return null;

              const isCenter = offset === 0;
              const imgUrl = getProductMainImage(product) || product.images?.[0]?.url || "/images/showcase/lamp_center.jpg";
              const absOffset = Math.abs(offset);

              // Visibility: Hide outer items cleanly per screen width
              let isVisible = true;
              if (windowWidth < 640 && absOffset > 1) isVisible = false;
              if (windowWidth >= 640 && windowWidth < 1024 && absOffset > 2) isVisible = false;

              if (!isVisible) return null;

              const xOffsetVw = getSlotXOffsetVw(offset);

              // Size classes per breakpoint (Exact original styling)
              let sizeClasses = "";
              if (isCenter) {
                sizeClasses = "w-[125px] h-[135px] sm:w-[155px] sm:h-[166px] md:w-[185px] md:h-[198px] lg:w-[205px] lg:h-[218px]";
              } else if (absOffset === 1) {
                sizeClasses = "w-[80px] h-[86px] sm:w-[100px] sm:h-[108px] md:w-[120px] md:h-[129px] lg:w-[132px] lg:h-[142px]";
              } else if (absOffset === 2) {
                sizeClasses = "w-[60px] h-[65px] sm:w-[74px] sm:h-[80px] md:w-[86px] md:h-[93px] lg:w-[94px] lg:h-[101px]";
              } else {
                sizeClasses = "w-[40px] h-[43px] sm:w-[48px] sm:h-[52px] md:w-[56px] md:h-[60px] lg:w-[62px] lg:h-[67px]";
              }

              const zIndex = isCenter ? 25 : 20 - absOffset;
              const opacity = isCenter ? 1 : Math.max(0.65, 1 - absOffset * 0.11);

              return (
                <div
                  key={`${product._id || itemIndex}-${offset}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (Math.abs(dragOffset) > 5) return;
                    if (!isCenter) navigateTo(itemIndex);
                  }}
                  className={`absolute top-1/2 left-1/2 pointer-events-auto ${
                    isCenter ? "cursor-pointer" : "cursor-pointer hover:opacity-100 hover:scale-105"
                  }`}
                  style={{
                    opacity,
                    zIndex,
                    transition: isDragging 
                      ? "none" 
                      : "transform 0.45s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.45s ease",
                    transform: `translate(calc(-50% + ${xOffsetVw}vw + ${dragOffset}px), -50%)`,
                  }}
                >
                  {isCenter ? (
                    /* ===== ACTIVE CENTER LENS WITH RADIANT GOLD DOUBLE RING ===== */
                    <Link 
                      href={getProductUrl(product)} 
                      onClick={(e) => {
                        if (Math.abs(dragOffset) > 5) e.preventDefault();
                      }}
                      className="relative block group"
                    >
                      {/* Ambient Golden Glow Aura */}
                      <div className="absolute -inset-3 sm:-inset-4 bg-[#C59345]/35 rounded-[50%] blur-md animate-pulse pointer-events-none" />
                      
                      {/* Concentric Double Gold Frame */}
                      <div className={`relative ${sizeClasses} rounded-[50%] p-[3px] sm:p-[4px] bg-gradient-to-b from-[#F7DB99] via-[#C59345] to-[#734A14] shadow-[0_0_35px_rgba(197,147,69,0.5)]`}>
                        <div className="w-full h-full rounded-[50%] overflow-hidden bg-[#18110B] relative">
                          {activeImages.map((img, idx) => (
                            <div
                              key={`${product._id}-img-${idx}`}
                              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                                idx === currentImageIndex ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
                              }`}
                            >
                              <Image
                                src={img}
                                alt={`${product.name} - view ${idx + 1}`}
                                fill
                                draggable={false}
                                priority={idx === 0}
                                sizes="(max-width: 640px) 140px, (max-width: 1024px) 200px, 220px"
                                className="object-cover object-center transition-transform duration-500 group-hover:scale-110 pointer-events-none"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </Link>
                  ) : (
                    /* ===== FLANKING LENSES (INSIDE THE ELLIPSE) ===== */
                    <div className="relative group">
                      {/* Ambient soft glow */}
                      <div className="absolute -inset-1 bg-white/10 rounded-[50%] blur-[2px] pointer-events-none" />
                      
                      {/* Gold ring border */}
                      <div className={`relative ${sizeClasses} rounded-[50%] p-[2px] bg-gradient-to-b from-[#C59345]/75 to-[#8A5E22]/45 shadow-md transition-all group-hover:shadow-[0_0_15px_rgba(197,147,69,0.45)]`}>
                        <div className="w-full h-full rounded-[50%] overflow-hidden bg-[#18110B] relative">
                          <Image
                            src={imgUrl}
                            alt={product.name}
                            fill
                            draggable={false}
                            sizes="140px"
                            className="object-cover object-center transition-transform duration-300 group-hover:scale-105 pointer-events-none"
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

        {/* Active Product Name & Price Bar (Always Visible on Smaller & Larger Screens) */}
        {activeProduct && (
          <div className="text-center mt-2.5 sm:mt-3 px-3 select-none flex flex-col items-center">
            <Link 
              href={getProductUrl(activeProduct)} 
              className="inline-block group/info hover:opacity-90 transition-opacity max-w-full"
            >
              <h3 className="text-xs sm:text-sm md:text-base font-serif font-medium text-white tracking-wide group-hover/info:text-[#C59345] transition-colors line-clamp-1 max-w-[280px] sm:max-w-md mx-auto">
                {activeProduct.name}
              </h3>
              {(activeProduct.pricing?.price || activeProduct.variantPricing?.minPrice) ? (
                <p className="text-[11px] sm:text-xs font-sans font-bold text-[#C59345] mt-0.5">
                  {formatPrice(activeProduct.pricing?.price || activeProduct.variantPricing?.minPrice)}
                </p>
              ) : null}
            </Link>

            {/* Subtle Image Progress Dots (when active product has multiple images) */}
            {activeImages.length > 1 && (
              <div className="flex items-center justify-center gap-1.5 mt-2">
                {activeImages.map((_, i) => (
                  <button
                    key={`dot-${i}`}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentImageIndex(i);
                    }}
                    aria-label={`Show picture ${i + 1}`}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === currentImageIndex
                        ? "w-4 sm:w-5 bg-[#C59345]"
                        : "w-1.5 bg-white/30 hover:bg-white/60"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Bottom Exploration Cue (Hand icon + Drag or Swipe to Explore) */}
        <div className="flex items-center justify-center gap-2 mt-2 text-center select-none">
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
