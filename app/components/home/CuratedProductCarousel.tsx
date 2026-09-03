// app/components/home/CuratedProductCarousel.tsx
"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Heart, Loader2, Check, ArrowRight, ShoppingCart } from "lucide-react";
import { formatPrice } from "../../../lib/utils/formatPrice";
import { getProductMainImage } from "../../../lib/utils/productImages";
import { getProductUrl } from "../../../lib/utils/productUrl";
import { trackAddToCart } from "../../../lib/meta/pixel";
import { cartApi } from "../../../lib/api/cart";
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
  const { refreshCart, updateCart, openCart } = useUser();
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

    const defaultVariant = product.hasVariants && product.variants?.length ? product.variants[0] : null;
    const variantId = defaultVariant?._id || undefined;
    const variantAttributes = defaultVariant?.attributes
      ? Object.fromEntries(defaultVariant.attributes.map((a: any) => [a.name, a.value]))
      : undefined;

    setAddingId(product._id);
    try {
      const data = await cartApi.addItem(
        product._id,
        1,
        variantId,
        variantAttributes,
        product.name,
        getProductMainImage(product) || product.images?.[0]?.url
      );

      if (data?.cart) {
        updateCart?.(data.cart);
      }
      await refreshCart();
      setAddedId(product._id);

      const itemPrice = defaultVariant?.price || product.pricing?.price || product.variantPricing?.minPrice || 0;
      trackAddToCart({
        content_ids: [product._id],
        content_name: product.name,
        value: itemPrice,
        currency: "PKR",
        quantity: 1,
      });

      setTimeout(() => setAddedId(null), 1800);
      openCart();
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

  return (
    <section className={`relative w-full py-8 sm:py-10 md:py-12 border-b border-[#E5DAC8] dark:border-[#38281B] transition-colors ${bgClass}`}>
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8">

        {/* Section Header: --- ♦ TITLE ♦ --- */}
        <div className="flex items-center justify-between gap-1.5 sm:gap-4 mb-4 sm:mb-6 md:mb-8">

          {/* Title with min-w-0 and wrap so it never pushes the buttons */}
          <div className="flex-1 min-w-0 flex items-center justify-start gap-1 sm:gap-2.5">
            <span className="h-[1px] w-2 sm:w-10 bg-[#C59345]/50 shrink-0" />
            <span className="text-[#C59345] text-[8px] sm:text-xs shrink-0">♦</span>
            <h2 className="text-[10px] xs:text-[11px] sm:text-sm md:text-base font-serif font-bold tracking-[0.06em] xs:tracking-[0.1em] sm:tracking-[0.16em] text-[#241910] dark:text-[#F3EBDC] uppercase text-left break-words leading-tight">
              {title}
            </h2>
            <span className="text-[#C59345] text-[8px] sm:text-xs shrink-0">♦</span>
            <span className="h-[1px] w-2 sm:w-10 bg-[#C59345]/50 hidden sm:inline-block shrink-0" />
          </div>

          {/* Carousel Navigation Arrows (Always visible, firmly positioned on the right) */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 ml-auto pl-1">
            <button
              type="button"
              onClick={() => scroll("left")}
              className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white dark:bg-[#2A1D13] border border-[#C59345]/40 hover:border-[#C59345] text-[#241910] dark:text-[#F3EBDC] hover:text-[#C59345] flex items-center justify-center shadow-sm transition-all duration-200 active:scale-95 cursor-pointer"
              aria-label="Previous items"
            >
              <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
            <button
              type="button"
              onClick={() => scroll("right")}
              className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white dark:bg-[#2A1D13] border border-[#C59345]/40 hover:border-[#C59345] text-[#241910] dark:text-[#F3EBDC] hover:text-[#C59345] flex items-center justify-center shadow-sm transition-all duration-200 active:scale-95 cursor-pointer"
              aria-label="Next items"
            >
              <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          </div>

        </div>

        {/* Single Row Horizontal Scroll Carousel on ALL screen sizes (displays ~3 to 3.5 in view on mobile, 6 on desktop) */}
        <div
          ref={scrollContainerRef}
          className="flex items-stretch gap-2 sm:gap-3 lg:gap-3.5 overflow-x-auto scrollbar-none pb-2 snap-x snap-mandatory"
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
                key={`carousel-${product._id}`}
                className="w-[106px] xs:w-[114px] sm:w-[165px] md:w-[185px] lg:w-[calc((100%-5*12px)/6)] xl:w-[calc((100%-5*14px)/6)] shrink-0 snap-start flex flex-col justify-between bg-white dark:bg-[#241A12] border border-[#E5DAC8] dark:border-[#3E2B1E] rounded-[2px] shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group"
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
                    sizes="(max-width: 640px) 115px, (max-width: 1024px) 185px, 225px"
                    className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                  />
                </Link>

                {/* Content: Title, Price & Actions */}
                <div className="p-1.5 xs:p-2 sm:p-3 flex-1 flex flex-col justify-between">
                  <div>
                    <Link href={getProductUrl(product)}>
                      <h3 className="text-[9.5px] xs:text-[10.5px] sm:text-xs md:text-[13px] font-serif font-medium text-[#241910] dark:text-[#F3EBDC] group-hover:text-[#C59345] transition-colors line-clamp-1">
                        {product.name}
                      </h3>
                    </Link>

                    <p className="text-[10px] xs:text-[11px] sm:text-xs md:text-sm font-sans font-bold text-[#241910] dark:text-[#F3EBDC] mt-0.5 sm:mt-1">
                      {formatPrice(price)}
                    </p>
                  </div>

                  {/* Bottom Action Row: Single-line button */}
                  <div className="pt-1.5 sm:pt-2 flex items-center gap-1 sm:gap-1.5">
                    <button
                      type="button"
                      disabled={isAdding}
                      onClick={(e) => handleAddToCart(product, e)}
                      className="no-theme-hover flex-1 h-[26px] xs:h-[28px] sm:h-[32px] px-1 sm:px-2.5 bg-[#B88636] hover:bg-[#C59345] text-[#120D09] text-[8px] xs:text-[9px] sm:text-[10px] md:text-[11px] font-bold uppercase tracking-tight sm:tracking-[0.08em] rounded-[2px] shadow-sm transition-all duration-200 active:scale-95 flex items-center justify-center gap-1 cursor-pointer disabled:opacity-75 whitespace-nowrap overflow-hidden"
                    >
                      {isAdding ? (
                        <Loader2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 animate-spin" />
                      ) : isAdded ? (
                        <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      ) : (
                        <span>ADD TO CART</span>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={(e) => handleWishlistToggle(product._id, e)}
                      aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
                      className={`w-[26px] h-[26px] xs:w-[28px] xs:h-[28px] sm:w-[32px] sm:h-[32px] rounded-[2px] border transition-colors flex items-center justify-center shrink-0 cursor-pointer ${inWishlist
                          ? "bg-red-500/10 border-red-500 text-red-500"
                          : "border-[#E5DAC8] dark:border-[#3E2B1E] hover:border-red-400 text-[#7D6A5A] dark:text-[#A69E96] hover:text-red-500 bg-white dark:bg-[#1A120B]"
                        }`}
                    >
                      <Heart className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${inWishlist ? "fill-current" : ""}`} />
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
