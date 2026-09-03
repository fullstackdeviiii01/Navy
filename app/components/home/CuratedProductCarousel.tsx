// app/components/home/CuratedProductCarousel.tsx
"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, Loader2, Check, ArrowRight, ShoppingCart } from "lucide-react";
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

// Extract all valid images for product card hover cycling
const getCardImages = (prod?: ProductItem): string[] => {
  if (!prod) return ["/images/hero-atelier-lamp.jpg"];
  const urls: string[] = [];
  const main = getProductMainImage(prod);
  if (main) urls.push(main);

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

  return urls.length > 0 ? urls : [main || "/images/hero-atelier-lamp.jpg"];
};

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

// Individual Product Grid Card with Multi-Image Hover Cycling
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
  const images = useMemo(() => getCardImages(product), [product]);
  const [imgIndex, setImgIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Auto-cycle through product images when hovered
  useEffect(() => {
    if (!isHovered || images.length <= 1) {
      setImgIndex(0);
      return;
    }
    const interval = setInterval(() => {
      setImgIndex((prev) => (prev + 1) % images.length);
    }, 1300);
    return () => clearInterval(interval);
  }, [isHovered, images.length]);

  const price = getProductPrice(product);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setImgIndex(0);
      }}
      className={`${className} flex-col justify-between bg-[#E5E5E5] dark:bg-[#241A12] border border-[#C2B29F] dark:border-[#3E2B1E] rounded-[2px] shadow-2xs hover:shadow-md transition-all duration-300 overflow-hidden group min-w-0`}
    >
      {/* Full-Bleed Product Image with Multi-Image Changing */}
      <Link
        href={getProductUrl(product)}
        className="relative aspect-square w-full bg-[#E5E5E5] dark:bg-[#1A120B] block overflow-hidden"
      >
        <Image
          src={images[imgIndex] || images[0]}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
        />

        {/* Subtle Image Progress Dots (if product has multiple images) */}
        {images.length > 1 && (
          <div className="absolute bottom-2 inset-x-0 flex items-center justify-center gap-1 z-10 pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity">
            {images.slice(0, 5).map((_, i) => (
              <span
                key={i}
                className={`h-1 rounded-full transition-all duration-300 ${
                  i === imgIndex ? "w-3 bg-[#C59345]" : "w-1 bg-white/70 shadow-xs"
                }`}
              />
            ))}
          </div>
        )}
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

        {/* Bottom Action Row */}
        <div className="pt-1.5 sm:pt-2 flex items-center gap-1 sm:gap-1.5">
          <button
            type="button"
            disabled={isAdding}
            onClick={(e) => onAddToCart(product, e)}
            className="no-theme-hover flex-1 h-6 xs:h-7 sm:h-7 md:h-8 px-1 sm:px-2 bg-[#B88636] hover:bg-[#A8752B] text-white !text-white text-[8px] xs:text-[9px] sm:text-[10px] md:text-[11px] font-bold uppercase tracking-tight rounded-[2px] shadow-2xs transition-all duration-200 active:scale-95 flex items-center justify-center gap-1 cursor-pointer disabled:opacity-75 whitespace-nowrap overflow-hidden"
            title="Add to cart"
          >
            {isAdding ? (
              <Loader2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 animate-spin" />
            ) : isAdded ? (
              <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            ) : (
              <>
                <ShoppingCart className="w-2.5 h-2.5 xs:w-3 xs:h-3 shrink-0" />
                <span className="hidden xs:inline text-[7.5px] xs:text-[8.5px] sm:text-[10px]">ADD</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={(e) => onWishlistToggle(product._id, e)}
            aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
            className={`w-6 h-6 xs:w-7 xs:h-7 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-[2px] border transition-colors flex items-center justify-center shrink-0 cursor-pointer ${
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
  viewAllLink = "/products",
  topButtonText = "Show all products",
  bgClass = "bg-[#E5E5E5] dark:bg-[#1A120B]",
}: CuratedProductCarouselProps) {
  const { refreshCart, updateCart, openCart } = useUser();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();

  const [addingId, setAddingId] = useState<string | null>(null);
  const [addedId, setAddedId] = useState<string | null>(null);

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

  // Exactly 5 products as requested by client
  const displayProducts = products.slice(0, 5);

  return (
    <section className={`relative w-full py-6 sm:py-10 md:py-12 border-b border-[#B8A894] dark:border-[#38281B] transition-colors select-none ${bgClass}`}>
      <div className="max-w-7xl mx-auto px-1.5 xs:px-2.5 sm:px-6 lg:px-8">

        {/* Section Header: --- TITLE ---------------------------- [Show all products ->] */}
        <div className="flex items-center justify-between gap-1.5 sm:gap-3 mb-3 sm:mb-6 md:mb-8">
          
          {/* Decorative Framing Title */}
          <div className="flex items-center gap-1.5 sm:gap-3 flex-1 min-w-0">
            <span className="h-[1px] w-2 sm:w-8 bg-[#B8A894] shrink-0" />
            <h2 className="text-[9px] xs:text-[10.5px] sm:text-sm md:text-base font-serif font-bold tracking-[0.05em] sm:tracking-[0.16em] text-[#241910] dark:text-[#F3EBDC] uppercase whitespace-nowrap shrink-0">
              {title}
            </h2>
            <span className="h-[1px] flex-1 bg-[#B8A894]" />
          </div>

          {/* Top Button: "Show all products" */}
          <Link
            href={viewAllLink}
            className="no-theme-hover inline-flex items-center gap-1 px-2 xs:px-2.5 sm:px-4 py-1 sm:py-2 rounded-[2px] border border-[#C59345]/70 hover:border-[#C59345] bg-white dark:bg-[#2A1D13] hover:bg-[#C59345] dark:hover:bg-[#C59345] text-[#A8752B] hover:text-white dark:text-[#E5B568] dark:hover:text-white text-[8px] xs:text-[9.5px] sm:text-xs font-bold uppercase tracking-[0.05em] sm:tracking-[0.1em] transition-all duration-200 shadow-2xs active:scale-95 shrink-0"
          >
            <span>{topButtonText}</span>
            <ArrowRight className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
          </Link>
        </div>

        {/* 3 in a Row on Mobile / 4 on Tablet / 5 on Laptop */}
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2 xs:gap-2.5 sm:gap-3 md:gap-4 lg:gap-5">
          {displayProducts.map((product, idx) => (
            <ProductGridCard
              key={product._id}
              product={product}
              isAdding={addingId === product._id}
              isAdded={addedId === product._id}
              onAddToCart={handleAddToCart}
              onWishlistToggle={handleWishlistToggle}
              inWishlist={isInWishlist(product._id)}
              className={
                idx === 3
                  ? "hidden sm:flex"
                  : idx === 4
                  ? "hidden lg:flex"
                  : "flex"
              }
            />
          ))}
        </div>

      </div>
    </section>
  );
}
