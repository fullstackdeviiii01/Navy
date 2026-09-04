// app/components/product-detail/ProductInfo.tsx
"use client";

import Rating from "../shared/Rating";
import { formatPrice } from "../../../lib/utils/formatPrice";

interface ProductInfoProps {
  product: {
    name: string;
    brand?: string;
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
  const isVariableProduct = product.hasVariants && product.variantPricing;

  const basePrice = selectedVariant
    ? selectedVariant.price
    : isVariableProduct
      ? product.variantPricing!.minPrice
      : product.pricing.price;

  const comparePrice = selectedVariant
    ? selectedVariant.compareAtPrice
    : isVariableProduct
      ? undefined
      : product.pricing.compare_at_price;

  const displayPrice = formatPrice(basePrice);
  const maxPrice = !selectedVariant && isVariableProduct && product.variantPricing!.priceVaries
    ? formatPrice(product.variantPricing!.maxPrice)
    : null;

  const stockQuantity = selectedVariant
    ? selectedVariant.stockQuantity
    : product.inventory.stock_quantity;

  const isOutOfStock = selectedVariant
    ? selectedVariant.stockQuantity === 0
    : product.inventory.stock_status === "out_of_stock";

  const isLowStock = selectedVariant
    ? selectedVariant.stockQuantity > 0 && selectedVariant.stockQuantity <= (selectedVariant.lowStockThreshold || 5)
    : product.inventory.stock_status === "low_stock";

  const categoryName = product.category_id?.name || "Solid Wood Lamp";
  const currentSku = selectedVariant?.sku || product.sku || product.inventory?.sku;
  const discountPercent = comparePrice && comparePrice > basePrice
    ? Math.round(((comparePrice - basePrice) / comparePrice) * 100)
    : null;

  return (
    <div className="space-y-3 pb-4 border-b border-theme-border-light dark:border-theme-border-dark">
      {/* Reviews & Handmade Craftsmanship Badge */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs">
          <Rating rating={product.rating_average || 0} count={product.rating_count || 0} size="sm" showCount={false} />
          <span className="text-theme-text-muted-light dark:text-theme-text-muted-dark text-[11px] font-medium">
            {product.rating_count > 0
              ? `${product.rating_count} ${product.rating_count === 1 ? "review" : "reviews"}`
              : "No reviews yet"}
          </span>
        </div>

        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#8A5E22]/10 border border-[#8A5E22]/25 text-theme-hover-light dark:text-theme-hover-dark text-[10px] font-semibold tracking-wider uppercase">
          ✦ 100% Solid Wood
        </span>
      </div>

      {/* Title & Price Group */}
      <div className="space-y-1">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-serif text-theme-text-primary-light dark:text-theme-text-primary-dark leading-tight">
          {product.name}
        </h1>

        {/* Price Block with Discount Tag */}
        <div className="flex flex-wrap items-baseline gap-2.5 pt-0.5">
          {comparePrice && comparePrice > basePrice && (
            <span className="text-sm sm:text-base text-theme-text-muted-light dark:text-theme-text-muted-dark line-through font-serif">
              {formatPrice(comparePrice)}
            </span>
          )}
          <span
            className="text-2xl sm:text-3xl font-serif font-bold text-red-600 dark:text-red-400"
            aria-label={`Price: ${displayPrice}`}
          >
            {displayPrice}
          </span>
          {maxPrice && (
            <>
              <span className="text-base font-serif text-theme-text-muted-light dark:text-theme-text-muted-dark">
                —
              </span>
              <span className="text-2xl sm:text-3xl font-serif font-bold text-red-600 dark:text-red-400" aria-label={`Maximum price: ${maxPrice}`}>
                {maxPrice}
              </span>
            </>
          )}
          {discountPercent && discountPercent > 0 && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900/60 ml-1">
              Save {discountPercent}%
            </span>
          )}
        </div>
      </div>

      {/* Clean Meta Details (SKU, Availability, Product Type) */}
      <div className="pt-3 pb-1 border-t border-theme-border-light/60 dark:border-theme-border-dark/60 space-y-2 text-xs font-mono">
        {currentSku && (
          <div className="flex items-center gap-3">
            <span className="w-32 uppercase tracking-wider text-theme-text-muted-light dark:text-theme-text-muted-dark text-[11px] font-semibold">
              SKU:
            </span>
            <span className="text-theme-text-primary-light dark:text-theme-text-primary-dark font-bold">
              {currentSku}
            </span>
          </div>
        )}

        <div className="flex items-center gap-3">
          <span className="w-32 uppercase tracking-wider text-theme-text-muted-light dark:text-theme-text-muted-dark text-[11px] font-semibold">
            AVAILABILITY:
          </span>
          <span className="text-emerald-600 dark:text-emerald-400 font-bold tracking-wide">
            In Stock
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="w-32 uppercase tracking-wider text-theme-text-muted-light dark:text-theme-text-muted-dark text-[11px] font-semibold">
            PRODUCT TYPE:
          </span>
          <span className="text-theme-text-primary-light dark:text-theme-text-primary-dark font-medium capitalize font-sans">
            {categoryName}
          </span>
        </div>
      </div>
    </div>
  );
}