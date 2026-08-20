// app/components/product-detail/ProductInfo.tsx
"use client";

import Rating from "../shared/Rating";
import { useCurrency } from "../../context/CurrencyContext";

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
    short_description?: string;
    inventory: {
      stock_status: string;
      stock_quantity: number;
    };
    badges?: {
      is_featured?: boolean;
      is_bestseller?: boolean;
      is_on_sale?: boolean;
      is_trending?: boolean;
    };
    unit_of_measure?: string;
    hasVariants?: boolean;
  };
}

export default function ProductInfo({ product }: ProductInfoProps) {
  const { convertPrice, formatPrice, selectedCurrency } = useCurrency();
  
  const isVariableProduct = product.hasVariants && product.variantPricing;

  // Base prices from product
  const basePrice = isVariableProduct 
    ? product.variantPricing!.minPrice 
    : product.pricing.price;
  const comparePrice = isVariableProduct 
    ? undefined 
    : product.pricing.compare_at_price;
  const baseCurrency = product.pricing.currency;

  // Display price based on product type
  const displayPrice = formatPrice(basePrice, baseCurrency);
  const maxPrice = isVariableProduct && product.variantPricing!.priceVaries
    ? formatPrice(product.variantPricing!.maxPrice, baseCurrency)
    : null;

  const isOutOfStock = product.inventory.stock_status === "out_of_stock";
  const isLowStock = product.inventory.stock_status === "low_stock";

  // Calculate savings if compare price exists
  const hasSavings = !isVariableProduct && comparePrice && comparePrice > basePrice;
  const savingsAmount = hasSavings 
    ? convertPrice(comparePrice!, baseCurrency) - convertPrice(basePrice, baseCurrency)
    : 0;
  const savingsPercent = hasSavings 
    ? Math.round(((comparePrice! - basePrice) / comparePrice!) * 100)
    : 0;

  return (
    <div className="space-y-1.5 sm:space-y-2 md:space-y-2.5">
      {/* Brand */}
      {product.brand && (
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="text-xs sm:text-sm text-theme-text-muted-light dark:text-theme-text-muted-dark">
            Brand:
          </span>
          <span className="text-xs sm:text-sm font-semibold text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
            {product.brand}
          </span>
        </div>
      )}

      {/* Product Name */}
      <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark leading-tight">
        {product.name}
      </h1>

      {/* Rating & Badges */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 md:gap-4">
        <Rating rating={product.rating_average} count={product.rating_count} size="sm" />
        
        {(product.badges?.is_featured || product.badges?.is_bestseller || product.badges?.is_on_sale || product.badges?.is_trending) && (
          <>
            <span className="hidden sm:inline text-theme-text-muted-light dark:text-theme-text-muted-dark" aria-hidden="true">|</span>
            <div className="flex gap-1.5 sm:gap-2 flex-wrap" role="list" aria-label="Product badges">
              {product.badges?.is_featured && (
                <span className="inline-flex items-center px-2 py-0.5 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 text-[10px] sm:text-xs font-semibold rounded-full" role="listitem">
                  Featured
                </span>
              )}
              {product.badges?.is_bestseller && (
                <span className="inline-flex items-center px-2 py-0.5 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 text-[10px] sm:text-xs font-semibold rounded-full" role="listitem">
                  Bestseller
                </span>
              )}
              {product.badges?.is_on_sale && (
                <span className="inline-flex items-center px-2 py-0.5 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 text-[10px] sm:text-xs font-semibold rounded-full" role="listitem">
                  Sale
                </span>
              )}
              {product.badges?.is_trending && (
                <span className="inline-flex items-center px-2 py-0.5 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-[10px] sm:text-xs font-semibold rounded-full" role="listitem">
                  Trending
                </span>
              )}
            </div>
          </>
        )}
      </div>

      {/* Price Section */}
      <div className="py-2 sm:py-3 md:py-4 border-y border-theme-border-light dark:border-theme-border-dark">
        <div className="flex items-baseline gap-2 sm:gap-2.5 md:gap-3 flex-wrap">
          <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark" aria-label={`Price: ${displayPrice}`}>
            {displayPrice}
          </span>
          {maxPrice && (
            <>
              <span className="text-lg sm:text-xl md:text-2xl text-theme-text-secondary-light dark:text-theme-text-secondary-dark" aria-hidden="true">
                -
              </span>
              <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark" aria-label={`Maximum price: ${maxPrice}`}>
                {maxPrice}
              </span>
            </>
          )}
          {!isVariableProduct && comparePrice && (
            <>
              <span className="text-base sm:text-lg md:text-xl text-theme-text-muted-light dark:text-theme-text-muted-dark line-through" aria-label={`Original price: ${formatPrice(comparePrice, baseCurrency)}`}>
                {formatPrice(comparePrice, baseCurrency)}
              </span>
              <span className="px-2 sm:px-2.5 md:px-3 py-0.5 sm:py-1 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 text-xs sm:text-sm font-bold rounded-lg" aria-label={`Save ${savingsPercent} percent`}>
                Save {savingsPercent}%
              </span>
            </>
          )}
        </div>

        {/* Show original price if currency is converted */}
        {selectedCurrency !== baseCurrency && (
          <div className="mt-1.5 sm:mt-2">
            <p className="text-xs sm:text-sm text-theme-text-muted-light dark:text-theme-text-muted-dark">
              {isVariableProduct ? (
                <>
                  Original price range: {baseCurrency} {product.variantPricing!.minPrice.toFixed(2)}
                  {product.variantPricing!.priceVaries && ` - ${baseCurrency} ${product.variantPricing!.maxPrice.toFixed(2)}`}
                </>
              ) : (
                <>
                  Original price: {baseCurrency} {basePrice.toFixed(2)}
                  {comparePrice && ` (was ${baseCurrency} ${comparePrice.toFixed(2)})`}
                </>
              )}
            </p>
          </div>
        )}

        {isVariableProduct && (
          <p className="text-xs sm:text-sm text-theme-text-muted-light dark:text-theme-text-muted-dark mt-1.5 sm:mt-2">
            Price varies by selected options
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 md:gap-3 mt-1.5 sm:mt-2">
          {product.unit_of_measure && !isVariableProduct && (
            <p className="text-xs sm:text-sm text-theme-text-muted-light dark:text-theme-text-muted-dark">
              Per {product.unit_of_measure}
            </p>
          )}

          {isOutOfStock && !isVariableProduct && (
            <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-[10px] sm:text-xs font-semibold rounded-md border border-red-200 dark:border-red-800" role="status" aria-label="Out of stock">
              Out of Stock
            </span>
          )}

          {isLowStock && !isOutOfStock && !isVariableProduct && (
            <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 text-[10px] sm:text-xs font-semibold rounded-md border border-yellow-200 dark:border-yellow-800" role="status" aria-label={`Only ${product.inventory.stock_quantity} items left in stock`}>
              Only {product.inventory.stock_quantity} left
            </span>
          )}
        </div>
      </div>

      {/* Short Description */}
      {product.short_description && (
        <p className="text-sm sm:text-base text-theme-text-secondary-light dark:text-theme-text-secondary-dark leading-relaxed break-words">
          {product.short_description}
        </p>
      )}

      {/* Currency Disclaimer */}
      {selectedCurrency !== baseCurrency && (
        <div className="p-2 sm:p-2.5 md:p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg" role="note">
          <p className="text-[10px] sm:text-xs text-blue-800 dark:text-blue-200">
            <strong>Note:</strong> Prices shown in {selectedCurrency} are converted from {baseCurrency} based on current exchange rates. 
            Final charges may vary slightly based on the exchange rate at the time of payment.
          </p>
        </div>
      )}
    </div>
  );
}