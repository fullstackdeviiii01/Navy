"use client";

import Link from "next/link";
import { formatPrice } from "../../../lib/utils/formatPrice";

interface ProductCardProps {
  product: {
    _id: string;
    name: string;
    pricing: {
      price: number;
      compare_at_price?: number;
      currency?: string;
    };
    images: { url: string; alt_text?: string }[];
    hasVariants?: boolean;
    variants?: any[];
    variantPricing?: {
      minPrice: number;
      maxPrice: number;
      priceVaries: boolean;
    };
    variantInventory?: {
      totalStock: number;
      availableVariantCount: number;
    };
    inventory?: {
      stock_status: string;
    };
    category_id?: {
      name?: string;
      slug?: string;
    };
    [key: string]: any;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const hasVariants =
    Boolean(product.hasVariants) &&
    ((product.variants && product.variants.length > 0) || Boolean(product.variantPricing));

  const variantCount = product.variants?.length || 0;
  const firstImage = product.images?.[0]?.url;
  const categoryName = product.category_id?.name || "";

  // Calculate lowest price and compare price
  let price = product.pricing?.price || 0;
  let comparePrice = product.pricing?.compare_at_price;

  if (hasVariants) {
    if (product.variants && product.variants.length > 0) {
      const variantPrices = product.variants
        .map((v: any) => v.price ?? v.pricing?.price)
        .filter((p: any) => typeof p === "number" && !isNaN(p) && p > 0);

      if (variantPrices.length > 0) {
        price = Math.min(...variantPrices);
      } else if (product.variantPricing?.minPrice) {
        price = product.variantPricing.minPrice;
      }

      const variantComparePrices = product.variants
        .map((v: any) => v.compareAtPrice ?? v.compare_at_price ?? v.pricing?.compare_at_price)
        .filter((p: any) => typeof p === "number" && !isNaN(p) && p > 0);

      if (variantComparePrices.length > 0) {
        comparePrice = Math.max(...variantComparePrices);
      }
    } else if (product.variantPricing?.minPrice) {
      price = product.variantPricing.minPrice;
    }
  } else if (product.variantPricing?.minPrice && price === 0) {
    price = product.variantPricing.minPrice;
  }

  return (
    <Link
      href={`/product/${product._id}`}
      className="group flex flex-col h-full overflow-hidden"
    >
      {/* Sharp, Square-Edged Image Container */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-theme-card-light dark:bg-theme-card-dark border border-theme-border-light/60 dark:border-theme-border-dark/60">
        {firstImage ? (
          <img
            src={firstImage}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-theme-text-muted-light dark:text-theme-text-muted-dark text-xs sm:text-sm">
            No Image
          </div>
        )}

        {/* Variant Count Badge */}
        {hasVariants && variantCount > 0 && (
          <span className="absolute top-2.5 left-2.5 bg-theme-primary/80 dark:bg-theme-primary-dark/80 backdrop-blur-sm text-theme-btn-text text-[9px] sm:text-[10px] font-medium tracking-[0.12em] uppercase px-2 py-0.5">
            {variantCount} OPTIONS
          </span>
        )}
      </div>

      {/* Product Details */}
      <div className="pt-3 pb-1 flex-1 flex flex-col justify-between">
        <div>
          {/* Category Label */}
          {categoryName && (
            <p className="text-[10px] sm:text-[11px] font-medium tracking-[0.18em] uppercase text-theme-hover-light dark:text-theme-hover-dark mb-1 truncate">
              {categoryName}
            </p>
          )}

          <h3 className="text-xs sm:text-sm font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark leading-snug line-clamp-2 group-hover:text-theme-hover-light dark:group-hover:text-theme-hover-dark transition-colors">
            {product.name}
          </h3>
        </div>

        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-xs sm:text-sm font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
            {hasVariants && variantCount > 1 && (
              <span className="font-normal text-[11px] text-theme-text-secondary-light dark:text-theme-text-secondary-dark mr-0.5">
                From{" "}
              </span>
            )}
            {formatPrice(price)}
          </span>
          {comparePrice && comparePrice > price && (
            <span className="text-[11px] text-theme-text-muted-light dark:text-theme-text-muted-dark line-through">
              {formatPrice(comparePrice)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
