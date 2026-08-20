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
      currency: string;
    };
    images: { url: string; alt_text?: string }[];
    hasVariants?: boolean;
    variants?: { stockQuantity: number; isAvailable: boolean }[];
    variantInventory?: {
      totalStock: number;
      availableVariantCount: number;
    };
    inventory: {
      stock_status: string;
    };
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const hasVariants =
    product.hasVariants &&
    product.variants &&
    product.variants.length > 0;

  const variantCount = hasVariants ? product.variants!.length : 0;
  const firstImage = product.images?.[0]?.url;
  const price = product.pricing?.price || 0;
  const comparePrice = hasVariants ? undefined : product.pricing?.compare_at_price;

  return (
    <Link
      href={`/product/${product._id}`}
      className="group block bg-theme-surface-light dark:bg-theme-surface-dark border border-theme-border-light dark:border-theme-border-dark overflow-hidden rounded-lg transition-shadow hover:shadow-lg"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-800">
        {firstImage ? (
          <img
            src={firstImage}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No Image
          </div>
        )}

        {/* Variant Count Badge */}
        {hasVariants && variantCount > 0 && (
          <span className="absolute top-2 left-2 bg-black/70 text-white text-[10px] sm:text-xs font-medium px-2 py-1 rounded">
            {variantCount} options
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="text-sm sm:text-base font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark line-clamp-2 leading-snug mb-1">
          {product.name}
        </h3>

        <div className="flex items-center gap-2">
          <span className="text-sm sm:text-base font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark">
            {formatPrice(price)}
          </span>
          {comparePrice && comparePrice > price && (
            <span className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark line-through">
              {formatPrice(comparePrice)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
