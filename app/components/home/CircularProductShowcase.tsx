// app/components/home/CircularProductShowcase.tsx
"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatPrice } from "../../../lib/utils/formatPrice";
import { getProductMainImage } from "../../../lib/utils/productImages";

interface ShowcaseProduct {
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

interface CircularProductShowcaseProps {
  products: ShowcaseProduct[];
}

export default function CircularProductShowcase({ products = [] }: CircularProductShowcaseProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const displayProducts = products.length > 0 ? products : [
    { _id: "1", name: "Geometric Table Lamp", pricing: { price: 6900 }, images: [{ url: "/images/hero-atelier-lamp.jpg" }] },
    { _id: "2", name: "Artisanal Lantern", pricing: { price: 5800 }, images: [{ url: "/images/hero-timber-lamp.jpg" }] },
    { _id: "3", name: "Timber Desk Lamp", pricing: { price: 4200 }, images: [{ url: "/images/hero-atelier-lamp.jpg" }] },
    { _id: "4", name: "Rustic Floor Lamp", pricing: { price: 8900 }, images: [{ url: "/images/hero-timber-lamp.jpg" }] },
    { _id: "5", name: "Carved Wall Sconce", pricing: { price: 3500 }, images: [{ url: "/images/hero-atelier-lamp.jpg" }] },
    { _id: "6", name: "Wooden Pendant Light", pricing: { price: 7200 }, images: [{ url: "/images/hero-timber-lamp.jpg" }] },
    { _id: "7", name: "Oak Candleholder", pricing: { price: 2800 }, images: [{ url: "/images/hero-atelier-lamp.jpg" }] },
  ];

  const total = displayProducts.length;

  const navigateTo = useCallback((direction: "next" | "prev") => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setActiveIndex((prev) => 
      direction === "next" ? (prev + 1) % total : (prev - 1 + total) % total
    );
    setTimeout(() => setIsTransitioning(false), 500);
  }, [total, isTransitioning]);

  const handleNext = useCallback(() => navigateTo("next"), [navigateTo]);
  const handlePrev = useCallback(() => navigateTo("prev"), [navigateTo]);

  // Auto-rotate
  useEffect(() => {
    if (isDragging) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % total);
    }, 4000);
    return () => clearInterval(timer);
  }, [total, isDragging]);

  // Touch & Mouse Drag Handlers
  const handleDragStart = (clientX: number) => {
    setIsDragging(true);
    setStartX(clientX);
    setDragOffset(0);
  };

  const handleDragMove = (clientX: number) => {
    if (!isDragging) return;
    setDragOffset(clientX - startX);
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (dragOffset < -40) handleNext();
    else if (dragOffset > 40) handlePrev();
    setDragOffset(0);
  };

  // Number of visible slots on each side of center
  const visibleSlots = [-3, -2, -1, 0, 1, 2, 3];

  return (
    <section className="relative w-full bg-[#0A0705] text-[#F3E8D6] pt-0 pb-10 sm:pb-14 overflow-hidden select-none">
      {/* Background Ambient Glow behind ellipse */}
      <div className="absolute bottom-[30%] left-1/2 -translate-x-1/2 w-[800px] h-[200px] bg-[#C59345]/12 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Main Elliptical Orbit Area */}
        <div 
          ref={containerRef}
          onTouchStart={(e) => handleDragStart(e.touches[0].clientX)}
          onTouchMove={(e) => handleDragMove(e.touches[0].clientX)}
          onTouchEnd={handleDragEnd}
          onMouseDown={(e) => handleDragStart(e.clientX)}
          onMouseMove={(e) => handleDragMove(e.clientX)}
          onMouseUp={handleDragEnd}
          onMouseLeave={handleDragEnd}
          className="relative w-full h-[260px] sm:h-[300px] md:h-[340px] lg:h-[360px] flex items-center justify-center cursor-grab active:cursor-grabbing"
        >
          {/* Golden Glowing Elliptical Track */}
          <div className="absolute inset-x-4 sm:inset-x-12 md:inset-x-16 lg:inset-x-20 top-[45%] -translate-y-1/2 h-[100px] sm:h-[130px] md:h-[150px] lg:h-[170px]">
            {/* Outer glow */}
            <div className="absolute inset-0 rounded-[50%] shadow-[0_0_60px_rgba(197,147,69,0.3),0_0_120px_rgba(197,147,69,0.15)]" />
            {/* Main ellipse border */}
            <div className="absolute inset-0 rounded-[50%] border-[1.5px] border-[#C59345]/50" />
            {/* Inner glow line */}
            <div className="absolute inset-[1px] rounded-[50%] border border-[#C59345]/20" />
          </div>

          {/* Left Arrow Navigation */}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); handlePrev(); }}
            aria-label="Previous product"
            className="absolute left-1 sm:left-4 md:left-8 top-[55%] -translate-y-1/2 z-30 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/90 text-[#0A0705] hover:bg-[#C59345] hover:text-white shadow-xl flex items-center justify-center transition-all duration-300 active:scale-90 backdrop-blur-sm"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Right Arrow Navigation */}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); handleNext(); }}
            aria-label="Next product"
            className="absolute right-1 sm:right-4 md:right-8 top-[55%] -translate-y-1/2 z-30 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/90 text-[#0A0705] hover:bg-[#C59345] hover:text-white shadow-xl flex items-center justify-center transition-all duration-300 active:scale-90 backdrop-blur-sm"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Orbit Items */}
          <div className="relative w-full max-w-5xl h-full flex items-center justify-center">
            {visibleSlots.map((offset) => {
              const itemIndex = (activeIndex + offset + total * 100) % total;
              const product = displayProducts[itemIndex];
              if (!product) return null;

              const isCenter = offset === 0;
              const imgUrl = getProductMainImage(product) || product.images?.[0]?.url || "/images/hero-atelier-lamp.jpg";
              const absOffset = Math.abs(offset);

              // Positioning along the elliptical track
              const xPercent = offset * 14; // horizontal spread
              const yOffset = Math.pow(absOffset, 1.5) * 8; // vertical curve (arc)
              
              // Sizing: center is largest, outer items shrink
              const centerSize = "w-[120px] h-[120px] sm:w-[140px] sm:h-[140px] md:w-[160px] md:h-[160px] lg:w-[180px] lg:h-[180px]";
              const sideSize = absOffset === 1 
                ? "w-[80px] h-[80px] sm:w-[95px] sm:h-[95px] md:w-[105px] md:h-[105px] lg:w-[115px] lg:h-[115px]"
                : absOffset === 2
                  ? "w-[60px] h-[60px] sm:w-[72px] sm:h-[72px] md:w-[80px] md:h-[80px] lg:w-[90px] lg:h-[90px]"
                  : "w-[45px] h-[45px] sm:w-[55px] sm:h-[55px] md:w-[62px] md:h-[62px] lg:w-[70px] lg:h-[70px]";

              const scale = isCenter ? 1 : 1;
              const opacity = isCenter ? 1 : Math.max(0.5, 1 - absOffset * 0.18);
              const zIndex = isCenter ? 25 : 20 - absOffset;

              return (
                <div
                  key={`${product._id}-${offset}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isCenter) setActiveIndex(itemIndex);
                  }}
                  style={{
                    transform: `translate(calc(-50% + ${xPercent}vw), calc(-50% + ${yOffset}px)) scale(${scale})`,
                    opacity,
                    zIndex,
                  }}
                  className={`absolute top-[42%] left-1/2 transition-all duration-600 ease-[cubic-bezier(0.25,1,0.5,1)] ${
                    isCenter ? "cursor-default" : "cursor-pointer hover:opacity-90"
                  }`}
                >
                  {isCenter ? (
                    /* ===== CENTER ACTIVE PRODUCT ===== */
                    <Link href={`/product/${product._id}`} className="relative group block">
                      {/* Outer golden glow ring */}
                      <div className="absolute -inset-3 sm:-inset-4 rounded-full bg-[#C59345]/25 blur-lg animate-pulse" />
                      <div className="absolute -inset-1.5 sm:-inset-2 rounded-full bg-gradient-to-b from-[#E7C17D] via-[#C59345] to-[#7B531C] opacity-80" />
                      
                      {/* Main circular image */}
                      <div className={`relative ${centerSize} rounded-full overflow-hidden bg-[#18110B] ring-2 ring-[#C59345]/60 shadow-[0_0_50px_rgba(197,147,69,0.4)]`}>
                        <Image
                          src={imgUrl}
                          alt={product.name}
                          fill
                          sizes="(max-width: 640px) 120px, (max-width: 1024px) 160px, 180px"
                          className="object-cover object-center transition-transform duration-700 group-hover:scale-110"
                        />
                      </div>

                      {/* Center product name badge */}
                      <div className="absolute -bottom-8 sm:-bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap text-center">
                        <p className="text-[10px] sm:text-xs font-serif font-medium text-[#E5D7C2] truncate max-w-[140px] sm:max-w-[200px]">
                          {product.name}
                        </p>
                        <p className="text-[9px] sm:text-[11px] font-mono font-semibold text-[#C59345]">
                          {formatPrice(product.pricing?.price || product.variantPricing?.minPrice || 0)}
                        </p>
                      </div>
                    </Link>
                  ) : (
                    /* ===== SIDE PRODUCTS ===== */
                    <div className="relative group">
                      {/* Subtle gold border ring */}
                      <div className="absolute -inset-[2px] rounded-full bg-gradient-to-b from-[#C59345]/60 to-[#8A5E22]/40 opacity-70 group-hover:opacity-100 transition-opacity" />
                      
                      <div className={`relative ${sideSize} rounded-full overflow-hidden bg-[#18110B]`}>
                        <Image
                          src={imgUrl}
                          alt={product.name}
                          fill
                          sizes="100px"
                          className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Helper Text */}
        <div className="flex items-center justify-center gap-2 mt-4 sm:mt-6 text-center">
          <svg className="w-4 h-4 text-[#C59345] animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 15.5c0-1.5 1-3 2.5-3.5V6a2 2 0 114 0v6c1.5.5 2.5 2 2.5 3.5 0 2.5-2 4.5-4.5 4.5S7.5 18 7.5 15.5z" />
          </svg>
          <span className="text-[10px] sm:text-xs font-mono tracking-[0.2em] text-[#C59345]/80 uppercase">
            Drag or Swipe to Explore
          </span>
        </div>

        {/* View Details Link */}
        <div className="flex justify-center mt-2">
          <Link
            href={`/product/${displayProducts[activeIndex]?._id}`}
            className="inline-flex items-center gap-2 text-[10px] sm:text-xs font-mono uppercase tracking-[0.16em] text-[#E5D7C2]/70 hover:text-[#C59345] border-b border-transparent hover:border-[#C59345]/50 pb-0.5 transition-all duration-300"
          >
            <span>View Details</span>
            <span className="text-[#C59345]">→</span>
          </Link>
        </div>

      </div>
    </section>
  );
}
