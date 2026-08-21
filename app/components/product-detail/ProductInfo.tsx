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
}

export default function ProductInfo({ product }: ProductInfoProps) {
  const isVariableProduct = product.hasVariants && product.variantPricing;

  const basePrice = isVariableProduct 
    ? product.variantPricing!.minPrice 
    : product.pricing.price;
  const comparePrice = isVariableProduct 
    ? undefined 
    : product.pricing.compare_at_price;

  const displayPrice = formatPrice(basePrice);
  const maxPrice = isVariableProduct && product.variantPricing!.priceVaries
    ? formatPrice(product.variantPricing!.maxPrice)
    : null;

  const isOutOfStock = product.inventory.stock_status === "out_of_stock";
  const isLowStock = product.inventory.stock_status === "low_stock";
  const stockQuantity = product.inventory.stock_quantity;

  const categoryName = product.category_id?.name;

  return (
    <div className="space-y-3 pb-6 border-b border-theme-border-light dark:border-theme-border-dark">
      {/* Category / Craftsmanship Tag */}
      <div className="flex items-center gap-2 text-xs font-medium tracking-[0.25em] uppercase text-theme-hover-light dark:text-theme-hover-dark">
        {categoryName && <span>{categoryName}</span>}
        {categoryName && <span>•</span>}
        <span>HANDCRAFTED</span>
      </div>

      {/* Product Title */}
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif text-theme-text-primary-light dark:text-theme-text-primary-dark leading-tight">
        {product.name}
      </h1>

      {/* Brand */}
      {product.brand && (
        <p className="text-xs uppercase tracking-[0.2em] text-theme-text-muted-light dark:text-theme-text-muted-dark">
          BY {product.brand}
        </p>
      )}

      {/* Rating */}
      <div className="flex items-center gap-3 pt-1">
        <Rating rating={product.rating_average} count={product.rating_count} size="sm" />
        <span className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark">
          {product.rating_count > 0 ? `${product.rating_count} reviews` : "Be the first to review"}
        </span>
      </div>

      {/* Price & Stock */}
      <div className="pt-3 flex flex-wrap items-baseline gap-4">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-serif text-theme-text-primary-light dark:text-theme-text-primary-dark" aria-label={`Price: ${displayPrice}`}>
            {displayPrice}
          </span>
          {maxPrice && (
            <>
              <span className="text-lg font-serif text-theme-text-muted-light dark:text-theme-text-muted-dark">
                —
              </span>
              <span className="text-2xl sm:text-3xl font-serif text-theme-text-primary-light dark:text-theme-text-primary-dark" aria-label={`Maximum price: ${maxPrice}`}>
                {maxPrice}
              </span>
            </>
          )}
          {comparePrice && comparePrice > basePrice && (
            <span className="text-sm text-theme-text-muted-light dark:text-theme-text-muted-dark line-through ml-2">
              {formatPrice(comparePrice)}
            </span>
          )}
        </div>

        {/* Stock Badge */}
        <div>
          {isOutOfStock ? (
            <span className="inline-block px-3 py-1 bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-[11px] uppercase tracking-wider font-medium">
              Out of Stock
            </span>
          ) : isLowStock ? (
            <span className="inline-block px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-[11px] uppercase tracking-wider font-medium">
              Low Stock • Only {stockQuantity} left
            </span>
          ) : (
            <span className="inline-block px-3 py-1 bg-green-500/10 border border-green-500/30 text-green-700 dark:text-green-300 text-[11px] uppercase tracking-wider font-medium">
              In Stock • {stockQuantity} units
            </span>
          )}
        </div>
      </div>
    </div>
  );
}