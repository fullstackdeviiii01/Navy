// app/components/home/CuratedProductCarousel.tsx
"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Heart, Loader2, Check, ArrowRight, ShoppingCart } from "lucide-react";
import { formatPrice } from "../../../lib/utils/formatPrice";
import { getProductMainImage } from "../../../lib/utils/productImages";
import { getProductUrl } from "../../../lib/utils/productUrl";
import { useUser } from "../../context/UserContext";
import { useWishlist } from "../../context/WishlistContext";

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
  hasVariants?: boolean;
  variants?: any[];
  images?: Array<{ url: string; alt_text?: string }>;
  category_id?: {
    name?: string;
    slug?: string;
  };
  [key: string]: any;
}

interface CuratedProductCarouselProps {
  title: string;
  products: ProductItem[];
  viewAllLink?: string;
  bgClass?: string;
}

export default function CuratedProductCarousel({
  title,
  products = [],
  viewAllLink = "/products",
  bgClass = "bg-[#F3EBDC] dark:bg-[#1E1610]",
}: CuratedProductCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { refreshCart, openCart } = useUser();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  
  const [addingId, setAddingId] = useState<string | null>(null);
  const [addedId, setAddedId] = useState<string | null>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const { scrollLeft, clientWidth } = scrollContainerRef.current;
      const scrollAmount = clientWidth * 0.75;
      scrollContainerRef.current.scrollTo({
        left: direction === "left" ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const handleAddToCart = async (product: ProductItem, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (product.hasVariants && product.variants && product.variants.length > 0) {
      if (window.innerWidth < 640) {
        window.location.href = getProductUrl(product);
      }
      return;
    }

    setAddingId(product._id);
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: product._id,
          quantity: 1,
        }),
      });

      if (res.ok) {
        await refreshCart();
        setAddedId(product._id);
        setTimeout(() => setAddedId(null), 1800);
        openCart();
      }
    } catch (err) {
      console.error("Failed to add to cart:", err);
    } finally {
      setAddingId(null);
    }
  };

  const handleWishlistToggle = async (productId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isInWishlist(productId)) {
      await removeFromWishlist(productId);
    } else {
      await addToWishlist(productId);
    }
  };

  if (!products || products.length === 0) return null;

  // On mobile screens: Show 3 rows with 2 products each (6 products total)
  const mobileProducts = products.slice(0, 6);

  return (
    <section className={`relative w-full py-8 sm:py-10 md:py-12 border-b border-[#E5DAC8] dark:border-[#38281B] transition-colors ${bgClass}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header: --- ♦ TITLE ♦ --- */}
        <div className="flex items-center justify-between gap-4 mb-5 sm:mb-8">
          
          {/* Centered / Left Title */}
          <div className="flex-1 flex items-center justify-center sm:justify-start gap-2 sm:gap-3">
            <span className="h-[1px] w-5 sm:w-12 bg-[#C59345]/50" />
            <span className="text-[#C59345] text-xs">♦</span>
            <h2 className="text-xs sm:text-sm md:text-base font-serif font-bold tracking-[0.16em] sm:tracking-[0.18em] text-[#241910] dark:text-[#F3EBDC] uppercase text-center sm:text-left">
              {title}
            </h2>
            <span className="text-[#C59345] text-xs">♦</span>
            <span className="h-[1px] w-5 sm:w-12 bg-[#C59345]/50 hidden sm:inline-block" />
          </div>

          {/* Carousel Navigation Arrows (Desktop / Tablet) */}
          <div className="hidden sm:flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => scroll("left")}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white dark:bg-[#2A1D13] border border-[#C59345]/40 hover:border-[#C59345] text-[#241910] dark:text-[#F3EBDC] hover:text-[#C59345] flex items-center justify-center shadow-sm transition-all duration-200 active:scale-95 cursor-pointer"
              aria-label="Previous items"
            >
              <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            <button
              type="button"
              onClick={() => scroll("right")}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white dark:bg-[#2A1D13] border border-[#C59345]/40 hover:border-[#C59345] text-[#241910] dark:text-[#F3EBDC] hover:text-[#C59345] flex items-center justify-center shadow-sm transition-all duration-200 active:scale-95 cursor-pointer"
              aria-label="Next items"
            >
              <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* 1. MOBILE VIEW (< 640px): 3 ROWS X 2 PRODUCTS (6 PRODUCTS GRID) */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-2 gap-3 sm:hidden">
          {mobileProducts.map((product) => {
            const imgUrl = getProductMainImage(product) || product.images?.[0]?.url || "/images/hero-atelier-lamp.jpg";
            const price = product.pricing?.price || product.variantPricing?.minPrice || 0;
            const inWishlist = isInWishlist(product._id);
            const isAdding = addingId === product._id;
            const isAdded = addedId === product._id;

            return (
              <div
                key={`mobile-${product._id}`}
                className="flex flex-col justify-between bg-white dark:bg-[#241A12] border border-[#E5DAC8] dark:border-[#3E2B1E] rounded-[2px] shadow-sm overflow-hidden group"
              >
                {/* Full-Bleed Product Image */}
                <Link
                  href={getProductUrl(product)}
                  className="relative aspect-square w-full bg-[#F7F3EC] dark:bg-[#1A120B] block overflow-hidden"
                >
                  <Image
                    src={imgUrl}
                    alt={product.name}
                    fill
                    sizes="50vw"
                    className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
                  />
                </Link>

                {/* Content: Title, Price & Action Button */}
                <div className="p-2.5 flex-1 flex flex-col justify-between">
                  <div>
                    <Link href={getProductUrl(product)}>
                      <h3 className="text-xs font-serif font-medium text-[#241910] dark:text-[#F3EBDC] group-hover:text-[#C59345] transition-colors line-clamp-1">
                        {product.name}
                      </h3>
                    </Link>
                    
                    <p className="text-xs font-sans font-bold text-[#241910] dark:text-[#F3EBDC] mt-1">
                      {formatPrice(price)}
                    </p>
                  </div>

                  {/* Bottom Action Row: Compact Single-Line "CART [Icon]" on Mobile */}
                  <div className="pt-1.5 flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={isAdding}
                      onClick={(e) => handleAddToCart(product, e)}
                      className="no-theme-hover flex-1 h-[28px] px-1.5 bg-[#B88636] hover:bg-[#C59345] text-[#120D09] text-[10px] font-bold uppercase tracking-[0.04em] rounded-[2px] transition-all duration-200 active:scale-95 flex items-center justify-center gap-1 cursor-pointer disabled:opacity-75 whitespace-nowrap overflow-hidden"
                    >
                      {isAdding ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : isAdded ? (
                        <Check className="w-3 h-3" />
                      ) : (
                        <span className="inline-flex items-center gap-1 whitespace-nowrap">
                          <span>CART</span>
                          <ShoppingCart className="w-3 h-3 shrink-0" />
                        </span>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={(e) => handleWishlistToggle(product._id, e)}
                      aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
                      className={`w-[28px] h-[28px] rounded-[2px] border transition-colors flex items-center justify-center shrink-0 cursor-pointer ${
                        inWishlist
                          ? "bg-red-500/10 border-red-500 text-red-500"
                          : "border-[#E5DAC8] dark:border-[#3E2B1E] text-[#7D6A5A] dark:text-[#A69E96] bg-white dark:bg-[#1A120B]"
                      }`}
                    >
                      <Heart className={`w-3 h-3 ${inWishlist ? "fill-current" : ""}`} />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

        {/* Mobile "View All" link button */}
        {viewAllLink && (
          <div className="mt-4 sm:hidden text-center">
            <Link
              href={viewAllLink}
              className="no-theme-hover inline-flex items-center justify-center gap-1.5 w-full py-2.5 border border-[#C59345]/50 bg-white/40 dark:bg-[#241A12]/40 text-[#241910] dark:text-[#F3EBDC] hover:text-[#C59345] text-xs font-semibold uppercase tracking-[0.14em] rounded-[2px] transition-colors"
            >
              <span>EXPLORE ALL</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 2. TABLET & DESKTOP VIEW (>= 640px): SMOOTH HORIZONTAL 6-PRODUCT ROW */}
        {/* ========================================================================= */}
        <div
          ref={scrollContainerRef}
          className="hidden sm:flex items-stretch gap-3 lg:gap-3 xl:gap-3.5 overflow-x-auto scrollbar-none pb-2 snap-x snap-mandatory"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {products.map((product) => {
            const imgUrl = getProductMainImage(product) || product.images?.[0]?.url || "/images/hero-atelier-lamp.jpg";
            const price = product.pricing?.price || product.variantPricing?.minPrice || 0;
            const inWishlist = isInWishlist(product._id);
            const isAdding = addingId === product._id;
            const isAdded = addedId === product._id;

            return (
              <div
                key={`desktop-${product._id}`}
                className="w-[180px] sm:w-[190px] md:w-[200px] lg:w-[calc((100%-5*12px)/6)] xl:w-[calc((100%-5*14px)/6)] shrink-0 snap-start flex flex-col justify-between bg-white dark:bg-[#241A12] border border-[#E5DAC8] dark:border-[#3E2B1E] rounded-[2px] shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group"
              >
                {/* Full-Bleed Product Image */}
                <Link
                  href={getProductUrl(product)}
                  className="relative aspect-square w-full bg-[#F7F3EC] dark:bg-[#1A120B] block overflow-hidden"
                >
                  <Image
                    src={imgUrl}
                    alt={product.name}
                    fill
                    sizes="225px"
                    className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                  />
                </Link>

                {/* Content: Title, Price & Actions */}
                <div className="p-3 flex-1 flex flex-col justify-between">
                  <div>
                    <Link href={getProductUrl(product)}>
                      <h3 className="text-xs sm:text-[13px] font-serif font-medium text-[#241910] dark:text-[#F3EBDC] group-hover:text-[#C59345] transition-colors line-clamp-1">
                        {product.name}
                      </h3>
                    </Link>
                    
                    <p className="text-xs sm:text-sm font-sans font-bold text-[#241910] dark:text-[#F3EBDC] mt-1">
                      {formatPrice(price)}
                    </p>
                  </div>

                  {/* Bottom Action Row: Single-line button */}
                  <div className="pt-2 flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={isAdding}
                      onClick={(e) => handleAddToCart(product, e)}
                      className="no-theme-hover flex-1 py-1.5 px-2.5 bg-[#B88636] hover:bg-[#C59345] text-[#120D09] text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.08em] rounded-[2px] shadow-sm transition-all duration-200 active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-75 whitespace-nowrap"
                    >
                      {isAdding ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : isAdded ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : (
                        <span>ADD TO CART</span>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={(e) => handleWishlistToggle(product._id, e)}
                      aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
                      className={`p-1.5 rounded-[2px] border transition-colors flex items-center justify-center shrink-0 cursor-pointer ${
                        inWishlist
                          ? "bg-red-500/10 border-red-500 text-red-500"
                          : "border-[#E5DAC8] dark:border-[#3E2B1E] hover:border-red-400 text-[#7D6A5A] dark:text-[#A69E96] hover:text-red-500 bg-white dark:bg-[#1A120B]"
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${inWishlist ? "fill-current" : ""}`} />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
