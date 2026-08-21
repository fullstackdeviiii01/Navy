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
      className="group block"
    >
      {/* Image */}
      <div className="relative aspect-[3/4] overflow-hidden bg-[#2E2214]">
        {firstImage ? (
          <img
            src={firstImage}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#D7D3CF]/40 text-sm">
            No Image
          </div>
        )}

        {/* Variant Count Badge */}
        {hasVariants && variantCount > 0 && (
          <span className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white text-[10px] sm:text-[11px] font-medium tracking-[0.15em] uppercase px-2.5 py-1">
            {variantCount} OPTIONS
          </span>
        )}
      </div>

      {/* Info */}
      <div className="pt-4 pb-2">
        {/* Category Label */}
        {categoryName && (
          <p className="text-[10px] sm:text-[11px] font-medium tracking-[0.2em] uppercase text-[#A8752B] mb-1.5">
            {categoryName}
          </p>
        )}

        <h3 className="text-sm sm:text-base font-medium text-[#F3EBDC] leading-snug mb-1 line-clamp-2 group-hover:text-[#D4A359] transition-colors">
          {product.name}
        </h3>

        <div className="flex items-center gap-2">
          <span className="text-sm text-[#D7D3CF]/80">
            {hasVariants && variantCount > 1 && (
              <span className="mr-0.5">From </span>
            )}
            {formatPrice(price)}
          </span>
          {comparePrice && comparePrice > price && (
            <span className="text-xs text-[#D7D3CF]/40 line-through">
              {formatPrice(comparePrice)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
