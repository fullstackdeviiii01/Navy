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
    inventory: {
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

  const categoryName = product.category_id?.name;

  return (
    <div className="space-y-2.5 pb-4 border-b border-theme-border-light dark:border-theme-border-dark">
      {/* Category / Handmade Craftsmanship Badges */}
      <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium tracking-[0.22em] uppercase">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-[#8A5E22]/15 border border-[#8A5E22]/35 text-theme-hover-light dark:text-theme-hover-dark font-semibold">
          ✦ 100% SOLID WOOD HANDMADE
        </span>
        {categoryName && (
          <span className="text-theme-text-muted-light dark:text-theme-text-muted-dark">
            {categoryName}
          </span>
        )}
      </div>

      {/* Product Title */}
      <h1 className="text-xl sm:text-2xl md:text-3xl font-serif text-theme-text-primary-light dark:text-theme-text-primary-dark leading-tight">
        {product.name}
      </h1>

      {/* Brand & Rating Inline */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-0.5 text-xs">
        <span className="uppercase tracking-[0.18em] text-theme-text-muted-light dark:text-theme-text-muted-dark font-medium">
          BY TALAL WOODEN LAMP
        </span>
        <span className="text-theme-text-muted-light/40 dark:text-theme-text-muted-dark/40">•</span>
        <div className="flex items-center gap-1.5">
          <Rating rating={product.rating_average} count={product.rating_count} size="sm" showCount={false} />
          <span className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark">
            {product.rating_count > 0 ? `(${product.rating_count} reviews)` : "Be the first to review"}
          </span>
        </div>
      </div>

      {/* Price & Stock */}
      <div className="pt-2 flex flex-wrap items-baseline gap-3">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-serif text-theme-text-primary-light dark:text-theme-text-primary-dark" aria-label={`Price: ${displayPrice}`}>
            {displayPrice}
          </span>
          {maxPrice && (
            <>
              <span className="text-base font-serif text-theme-text-muted-light dark:text-theme-text-muted-dark">
                —
              </span>
              <span className="text-2xl sm:text-3xl font-serif text-theme-text-primary-light dark:text-theme-text-primary-dark" aria-label={`Maximum price: ${maxPrice}`}>
                {maxPrice}
              </span>
            </>
          )}
          {comparePrice && comparePrice > basePrice && (
            <span className="text-xs sm:text-sm text-theme-text-muted-light dark:text-theme-text-muted-dark line-through ml-1.5">
              {formatPrice(comparePrice)}
            </span>
          )}
        </div>

        {/* Stock Badge */}
        <div>
          {isOutOfStock ? (
            <span className="inline-block px-2.5 py-0.5 bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-[10px] uppercase tracking-wider font-medium">
              Out of Stock
            </span>
          ) : isLowStock ? (
            <span className="inline-block px-2.5 py-0.5 bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-[10px] uppercase tracking-wider font-medium">
              Low Stock • Only {stockQuantity} left
            </span>
          ) : (
            <span className="inline-block px-2.5 py-0.5 bg-green-500/10 border border-green-500/30 text-green-700 dark:text-green-300 text-[10px] uppercase tracking-wider font-medium">
              In Stock • {stockQuantity} units
            </span>
          )}
        </div>
      </div>
    </div>
  );
}