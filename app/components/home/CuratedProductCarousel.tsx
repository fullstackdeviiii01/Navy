// app/components/home/CuratedProductCarousel.tsx
"use client";

import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, Loader2, Check, ChevronLeft, ChevronRight, ShoppingCart, Plus } from "lucide-react";
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
  topButtonText?: string;
  bgClass?: string;
}

// Safe price resolver
const getProductPrice = (prod?: ProductItem): number => {
  if (!prod) return 0;
  const raw =
    prod.pricing?.price ??
    prod.price ??
    prod.variantPricing?.minPrice ??
    prod.variants?.[0]?.pricing?.price ??
    prod.variants?.[0]?.price ??
    0;
  const num = typeof raw === "number" ? raw : parseFloat(String(raw).replace(/[^0-9.-]+/g, ""));
  return !isNaN(num) && num > 0 ? num : 0;
};

// Individual Product Grid Card
function ProductGridCard({
  product,
  isAdding,
  isAdded,
  onAddToCart,
  onWishlistToggle,
  inWishlist,
  className = "flex",
}: {
  product: ProductItem;
  isAdding: boolean;
  isAdded: boolean;
  onAddToCart: (p: ProductItem, e: React.MouseEvent) => void;
  onWishlistToggle: (id: string, e: React.MouseEvent) => void;
  inWishlist: boolean;
  className?: string;
}) {
  const mainImage = getProductMainImage(product) || product.images?.[0]?.url || "/images/hero-atelier-lamp.jpg";
  const price = getProductPrice(product);

  return (
    <div
      className={`${className} flex flex-col justify-between bg-[#E5E5E5] dark:bg-[#241A12] border border-[#C2B29F] dark:border-[#3E2B1E] rounded-[2px] shadow-2xs hover:shadow-md transition-all duration-300 overflow-hidden group min-w-0`}
    >
      {/* Full-Bleed Product Image with Clean Link */}
      <Link
        href={getProductUrl(product)}
        className="relative aspect-square w-full bg-[#E5E5E5] dark:bg-[#1A120B] block overflow-hidden"
      >
        <Image
          src={mainImage}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 33vw, (max-width: 1024px) 25vw, 20vw"
          className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
        />
      </Link>

      {/* Content: Title, Price & Actions */}
      <div className="p-1.5 xs:p-2 sm:p-2.5 md:p-3 flex-1 flex flex-col justify-between min-w-0">
        <div>
          <Link href={getProductUrl(product)}>
            <h3 className="text-[9.5px] xs:text-[10.5px] sm:text-xs md:text-[13px] font-serif font-medium text-[#241910] dark:text-[#F3EBDC] group-hover:text-[#C59345] transition-colors line-clamp-1 truncate">
              {product.name}
            </h3>
          </Link>

          <p
            suppressHydrationWarning
            className="text-[9px] xs:text-[10px] sm:text-xs md:text-sm font-sans font-bold text-[#A8752B] dark:text-[#C59345] mt-0.5 sm:mt-1 truncate"
          >
            {formatPrice(price)}
          </p>
        </div>

        {/* Bottom Action Row: Responsive Add to Cart & Heart */}
        <div className="pt-1.5 sm:pt-2 flex items-center gap-1 sm:gap-1.5">
          <button
            type="button"
            disabled={isAdding}
            onClick={(e) => onAddToCart(product, e)}
            className="no-theme-hover flex-1 h-6 sm:h-7 lg:h-8 px-1 sm:px-2 bg-[#B88636] hover:bg-[#A8752B] text-white !text-white text-[9px] sm:text-[10px] lg:text-[11px] font-bold uppercase tracking-tight rounded-[2px] shadow-2xs transition-all duration-200 active:scale-95 flex items-center justify-center cursor-pointer disabled:opacity-75 whitespace-nowrap overflow-hidden"
            title="Add to cart"
          >
            {isAdding ? (
              <Loader2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 animate-spin" />
            ) : isAdded ? (
              <span className="flex items-center justify-center gap-1">
                <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span className="hidden sm:inline text-[9px] sm:text-[10px]">Added</span>
              </span>
            ) : (
              <>
                {/* 1. Mobile (< sm): Cart Plus Icon */}
                <span className="sm:hidden relative inline-flex items-center justify-center">
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <Plus className="w-2 h-2 absolute -top-1 -right-1 stroke-[3]" />
                </span>

                {/* 2. Tablet (sm to lg): Cart Icon + "Cart" text */}
                <span className="hidden sm:inline-flex lg:hidden items-center justify-center gap-1 text-[10px] font-bold">
                  <ShoppingCart className="w-3.5 h-3.5 shrink-0" />
                  <span>Cart</span>
                </span>

                {/* 3. Laptop / Desktop (lg+): "Add to cart" with NO icon */}
                <span className="hidden lg:inline text-[11px] font-semibold tracking-wider whitespace-nowrap">
                  Add to cart
                </span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={(e) => onWishlistToggle(product._id, e)}
            aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
            className={`h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 rounded-[2px] border transition-colors flex items-center justify-center shrink-0 cursor-pointer ${
              inWishlist
                ? "bg-red-500/10 border-red-500 text-red-500"
                : "border-[#D6CEC2] dark:border-[#3E2B1E] hover:border-red-400 text-[#7D6A5A] dark:text-[#A69E96] hover:text-red-500 bg-white dark:bg-[#1A120B]"
            }`}
          >
            <Heart className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${inWishlist ? "fill-current" : ""}`} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CuratedProductCarousel({
  title,
  products = [],
  bgClass = "bg-[#E5E5E5] dark:bg-[#1A120B]",
}: CuratedProductCarouselProps) {
  const { refreshCart, updateCart, openCart } = useUser();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();

  const [addingId, setAddingId] = useState<string | null>(null);
  const [addedId, setAddedId] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

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

  // Strict Deduplication Safeguard
  const uniqueProducts = useMemo(() => {
    const seen = new Set<string>();
    return (products || []).filter((p) => {
      const id = p?._id ? String(p._id) : null;
      if (!id || seen.has(id)) return false;
      seen.add(id);
      return true;
    });
  }, [products]);

  // Compute smooth scroll step
  const getScrollStep = useCallback(() => {
    if (!scrollContainerRef.current) return 200;
    const container = scrollContainerRef.current;
    const firstCard = container.firstElementChild as HTMLElement;
    if (firstCard) {
      const cardRect = firstCard.getBoundingClientRect();
      // Calculate gap between cards if available
      const secondCard = firstCard.nextElementSibling as HTMLElement;
      if (secondCard) {
        const gap = secondCard.getBoundingClientRect().left - cardRect.right;
        return cardRect.width + gap;
      }
      return cardRect.width + 12;
    }
    return container.clientWidth / 3;
  }, []);

  const handleScrollRight = useCallback(() => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const step = getScrollStep();
    const maxScroll = container.scrollWidth - container.clientWidth;

    if (container.scrollLeft >= maxScroll - 8) {
      container.scrollTo({ left: 0, behavior: "smooth" });
    } else {
      container.scrollBy({ left: step, behavior: "smooth" });
    }
  }, [getScrollStep]);

  const handleScrollLeft = useCallback(() => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const step = getScrollStep();

    if (container.scrollLeft <= 8) {
      const maxScroll = container.scrollWidth - container.clientWidth;
      container.scrollTo({ left: maxScroll, behavior: "smooth" });
    } else {
      container.scrollBy({ left: -step, behavior: "smooth" });
    }
  }, [getScrollStep]);

  // Auto-scroll every 3.5 seconds with pause on interaction
  useEffect(() => {
    if (!uniqueProducts || uniqueProducts.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      handleScrollRight();
    }, 3500);

    return () => clearInterval(interval);
  }, [uniqueProducts, isPaused, handleScrollRight]);

  if (!uniqueProducts || uniqueProducts.length === 0) return null;

  return (
    <section
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
      className={`relative w-full py-6 sm:py-10 md:py-12 border-b border-[#B8A894] dark:border-[#38281B] transition-colors select-none ${bgClass}`}
    >
      <div className="max-w-7xl mx-auto px-1.5 xs:px-2.5 sm:px-6 lg:px-8">

        {/* Section Header: --- TITLE ---------------------------- [<] [>] */}
        <div className="flex items-center justify-between gap-1.5 sm:gap-3 mb-3 sm:mb-6 md:mb-8">
          
          {/* Decorative Framing Title */}
          <div className="flex items-center gap-1.5 sm:gap-3 flex-1 min-w-0">
            <span className="h-[1px] w-2 sm:w-8 bg-[#B8A894] shrink-0" />
            <h2 className="text-[9px] xs:text-[10.5px] sm:text-sm md:text-base font-serif font-bold tracking-[0.05em] sm:tracking-[0.16em] text-[#241910] dark:text-[#F3EBDC] uppercase whitespace-nowrap shrink-0">
              {title}
            </h2>
            <span className="h-[1px] flex-1 bg-[#B8A894]" />
          </div>

          {/* Tiny Circular Left & Right Arrow Buttons (Replaces "Show all pieces" button) */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              type="button"
              onClick={handleScrollLeft}
              aria-label="Scroll left"
              className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 rounded-full border border-[#C59345]/70 hover:border-[#C59345] bg-white dark:bg-[#2A1D13] hover:bg-[#C59345] text-[#A8752B] hover:text-white dark:text-[#E5B568] dark:hover:text-white flex items-center justify-center transition-all duration-200 shadow-2xs active:scale-90 cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
            </button>
            <button
              type="button"
              onClick={handleScrollRight}
              aria-label="Scroll right"
              className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 rounded-full border border-[#C59345]/70 hover:border-[#C59345] bg-white dark:bg-[#2A1D13] hover:bg-[#C59345] text-[#A8752B] hover:text-white dark:text-[#E5B568] dark:hover:text-white flex items-center justify-center transition-all duration-200 shadow-2xs active:scale-90 cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* Butter-Smooth Horizontal Scrolling Product Showcase */}
        {/* 3 visible on mobile (<sm), 4 on tablet (sm), 5 on desktop (lg) */}
        <div
          ref={scrollContainerRef}
          className="flex gap-2 xs:gap-2.5 sm:gap-3 md:gap-4 lg:gap-5 overflow-x-auto scroll-smooth snap-x snap-mandatory py-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {uniqueProducts.map((product) => (
            <div
              key={`product-${product._id}`}
              className="shrink-0 snap-start w-[calc((100%-16px)/3)] sm:w-[calc((100%-36px)/4)] lg:w-[calc((100%-80px)/5)]"
            >
              <ProductGridCard
                product={product}
                isAdding={addingId === product._id}
                isAdded={addedId === product._id}
                onAddToCart={handleAddToCart}
                onWishlistToggle={handleWishlistToggle}
                inWishlist={isInWishlist(product._id)}
                className="w-full h-full"
              />
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
