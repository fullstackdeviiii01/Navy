// app/components/product-detail/ProductInfo.tsx
"use client";

import Rating from "../shared/Rating";
import ProductWishlistButton from "./ProductWishlistButton";
import { formatDetailPrice } from "../../../lib/utils/formatPrice";

interface ProductInfoProps {
  product: {
    _id?: string;
    name: string;
    brand?: string;
    short_description?: string;
    subtitle?: string;
    tagline?: string;
    pricing: {
      price: number;
      compare_at_price?: number;
      currency: string;
    };
    variantPricing?: {
      minPrice: number;
      maxPrice: number;
      priceVaries: boolean;
    };
    rating_average: number;
    rating_count: number;
    sku?: string;
    inventory: {
      sku?: string;
      stock_status: string;
      stock_quantity: number;
    };
    hasVariants?: boolean;
    category_id?: {
      name?: string;
      slug?: string;
    };
  };
  selectedVariant?: {
    sku?: string;
    price: number;
    compareAtPrice?: number;
    stockQuantity: number;
    lowStockThreshold?: number;
  } | null;
}

export default function ProductInfo({ product, selectedVariant }: ProductInfoProps) {
  const isVariableProduct = Boolean(
    product.hasVariants && (product.variantPricing || (product as any).variants?.length)
  );

  const minVariantPrice = product.variantPricing?.minPrice ?? (product as any).variants?.[0]?.price;
  const maxVariantPrice = product.variantPricing?.maxPrice;

  const basePrice = selectedVariant
    ? selectedVariant.price
    : minVariantPrice !== undefined
      ? minVariantPrice
      : product.pricing?.price || 0;

  const comparePrice = selectedVariant
    ? selectedVariant.compareAtPrice
    : product.pricing?.compare_at_price;

  const displayPrice = formatDetailPrice(basePrice);
  const maxPrice =
    !selectedVariant &&
    isVariableProduct &&
    product.variantPricing?.priceVaries &&
    maxVariantPrice &&
    maxVariantPrice !== minVariantPrice
      ? formatDetailPrice(maxVariantPrice)
      : null;

  const isOutOfStock = selectedVariant
    ? selectedVariant.stockQuantity === 0
    : (product as any).variants?.length
      ? (product as any).variants.every((v: any) => v.stockQuantity === 0 || v.isAvailable === false)
      : product.inventory?.stock_status === "out_of_stock";

  const categoryName = product.category_id?.name || "Table Lamp";
  const currentSku = selectedVariant?.sku || product.sku || product.inventory?.sku || (product as any).variants?.[0]?.sku;
  const discountPercent = comparePrice && comparePrice > basePrice
    ? Math.round(((comparePrice - basePrice) / comparePrice) * 100)
    : null;

  return (
    <div className="space-y-2.5 pb-3">
      {/* Title & Wishlist Button Row */}
      <div className="flex items-start justify-between gap-3">
        <h1 className="text-2xl sm:text-3xl font-sans font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark leading-snug">
          {product.name}
        </h1>
        {product._id && (
          <ProductWishlistButton
            productId={product._id}
            className="h-9 w-9 border-none bg-transparent hover:bg-black/5 dark:hover:bg-white/5 rounded-full"
          />
        )}
      </div>

      {/* Reviews Row */}
      <div className="flex items-center gap-2 pt-0.5">
        <Rating rating={product.rating_average || 0} count={product.rating_count || 0} size="sm" showCount={false} />
        <span className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm font-sans font-normal">
          {product.rating_count > 0
            ? `${product.rating_count} ${product.rating_count === 1 ? "review" : "reviews"}`
            : "No reviews yet"}
        </span>
      </div>

      {/* Optional Tagline / Short Description */}
      {(product.short_description || product.subtitle || product.tagline) && (
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-sans pt-0.5">
          {product.short_description || product.subtitle || product.tagline}
        </p>
      )}

      {/* Price Block with Compare Price & Save Badge - Clean Responsive Single Line */}
      <div className="flex items-center gap-2 sm:gap-2.5 flex-nowrap whitespace-nowrap pt-1.5">
        {comparePrice && comparePrice > basePrice && (
          <span className="text-xs xs:text-sm sm:text-base text-gray-400 dark:text-gray-500 line-through font-sans whitespace-nowrap shrink-0">
            {formatDetailPrice(comparePrice)}
          </span>
        )}
        <span
          className={`text-xl xs:text-2xl sm:text-3xl font-sans font-bold tracking-tight whitespace-nowrap shrink-0 ${
            comparePrice && comparePrice > basePrice
              ? "text-[#D32F2F] dark:text-[#FF5252]"
              : "text-[#4A2E18] dark:text-[#F3EBE1]"
          }`}
          aria-label={`Price: ${displayPrice}`}
        >
          {displayPrice}
        </span>
        {maxPrice && (
          <>
            <span className="text-sm sm:text-base font-sans text-gray-400 dark:text-gray-500 shrink-0">
              —
            </span>
            <span className="text-xl xs:text-2xl sm:text-3xl font-sans font-bold text-[#D32F2F] dark:text-[#FF5252] whitespace-nowrap shrink-0" aria-label={`Maximum price: ${maxPrice}`}>
              {maxPrice}
            </span>
          </>
        )}
        {discountPercent && discountPercent > 0 && (
          <span className="inline-flex items-center px-1.5 py-0.5 sm:px-2 rounded text-[10px] xs:text-[11px] sm:text-xs font-semibold font-sans bg-[#FCE8E6] text-[#D93025] dark:bg-red-950/60 dark:text-red-300 whitespace-nowrap shrink-0">
            Save {discountPercent}%
          </span>
        )}
      </div>

      {/* Meta Details: SKU -> AVAILABILITY -> PRODUCT TYPE */}
      <div className="pt-3 pb-1 border-t border-theme-border-light/60 dark:border-theme-border-dark/60 space-y-1.5 text-xs font-sans">
        {currentSku && (
          <div className="flex items-center gap-1.5">
            <span className="uppercase tracking-wider text-gray-400 dark:text-gray-500 font-medium">
              SKU:
            </span>
            <span className="text-gray-800 dark:text-gray-200 font-semibold">
              {currentSku}
            </span>
          </div>
        )}

        <div className="flex items-center gap-1.5">
          <span className="uppercase tracking-wider text-gray-400 dark:text-gray-500 font-medium">
            AVAILABILITY:
          </span>
          <span className={`font-semibold ${isOutOfStock ? "text-red-600 dark:text-red-400" : "text-teal-600 dark:text-teal-400"}`}>
            {isOutOfStock ? "Out of Stock" : "In Stock"}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="uppercase tracking-wider text-gray-400 dark:text-gray-500 font-medium">
            PRODUCT TYPE:
          </span>
          <span className="text-gray-800 dark:text-gray-200 font-semibold capitalize">
            {categoryName}
          </span>
        </div>
      </div>
    </div>
  );
}