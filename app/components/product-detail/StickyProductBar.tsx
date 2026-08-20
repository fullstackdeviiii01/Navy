// app/components/product-detail/StickyProductBar.tsx
"use client";

import Image from "next/image";
import AddToCartButton from "./AddToCartButton";
import ProductQuantity from "./ProductQuantity";
import { formatPrice } from "../../../lib/utils/formatPrice";

interface VariantAttribute {
  name: string;
  value: string;
}

interface ProductVariant {
  _id?: string;
  sku: string;
  attributes: VariantAttribute[];
  price: number;
  compareAtPrice?: number;
  stockQuantity: number;
  imageUrl?: string;
  isAvailable: boolean;
}

interface StickyProductBarProps {
  product: {
    _id: string;
    name: string;
    images?: { url: string; alt_text?: string }[];
    pricing?: { price: number; compare_at_price?: number };
    inventory?: { stock_quantity: number; stock_status: string };
    hasVariants?: boolean;
    variants?: ProductVariant[];
  };
  selectedVariant: ProductVariant | null;
  quantity: number;
  onQuantityChange: (qty: number) => void;
  isOutOfStock: boolean;
  variantOutOfStock: boolean;
  isVariableProduct: boolean;
  currentStock: number;
  totalPrice: number;
  isVisible: boolean;
  onScrollToOptions?: () => void;
}

export default function StickyProductBar({
  product,
  selectedVariant,
  quantity,
  onQuantityChange,
  isOutOfStock,
  variantOutOfStock,
  isVariableProduct,
  currentStock,
  totalPrice,
  isVisible,
  onScrollToOptions,
}: StickyProductBarProps) {
  const primaryImage =
    selectedVariant?.imageUrl ||
    product.images?.[0]?.url ||
    "/placeholder-image.png";

  const isReadyToBuy = !isVariableProduct || Boolean(selectedVariant);
  const isDisabled = isOutOfStock || (isVariableProduct && !selectedVariant) || variantOutOfStock;

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-theme-bg-dark/95 backdrop-blur border-t border-theme-border-light dark:border-theme-border-dark shadow-[0_-4px_20px_rgba(0,0,0,0.08)] transition-all duration-300 transform ${
        isVisible
          ? "translate-y-0 opacity-100"
          : "translate-y-full opacity-0 pointer-events-none"
      }`}
      role="region"
      aria-label="Sticky product action bar"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-2.5 sm:py-3">
        <div className="flex items-center justify-between gap-3 sm:gap-4 md:gap-6">
          {/* Left: Product Info Thumbnail + Name */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1 sm:flex-initial">
            <div className="relative w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden border border-theme-border-light dark:border-theme-border-dark">
              <Image
                src={primaryImage}
                alt={product.name}
                fill
                className="object-cover"
                sizes="48px"
              />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs sm:text-sm font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark truncate max-w-[150px] sm:max-w-xs md:max-w-md">
                {product.name}
              </h4>
              {selectedVariant ? (
                <p className="text-[11px] text-theme-text-muted-light dark:text-theme-text-muted-dark truncate">
                  {selectedVariant.attributes.map((a) => a.value).join(" / ")}
                </p>
              ) : isVariableProduct ? (
                <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                  Options required
                </p>
              ) : null}
            </div>
          </div>

          {/* Right: Quantity + Price + Add to Cart Button */}
          <div className="flex items-center gap-2.5 sm:gap-4 flex-shrink-0">
            {/* Price display */}
            <div className="text-right hidden sm:block">
              <p className="text-[10px] sm:text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark">
                Total
              </p>
              <p className="text-sm sm:text-base md:text-lg font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark whitespace-nowrap">
                {formatPrice(totalPrice)}
              </p>
            </div>

            {/* Quantity Selector (when ready to buy) */}
            {isReadyToBuy && !isOutOfStock && !variantOutOfStock && (
              <div className="hidden md:flex items-center">
                <ProductQuantity
                  quantity={quantity}
                  onQuantityChange={onQuantityChange}
                  max={currentStock}
                />
              </div>
            )}

            {/* Button */}
            {isVariableProduct && !selectedVariant ? (
              <button
                onClick={onScrollToOptions}
                className="px-3 sm:px-4 py-2 bg-theme-primary text-white font-semibold text-xs sm:text-sm rounded-lg hover:bg-theme-primary-hover transition-colors whitespace-nowrap"
              >
                Select Options
              </button>
            ) : (
              <div className="min-w-[120px] sm:min-w-[140px]">
                <AddToCartButton
                  productId={product._id}
                  quantity={quantity}
                  variantId={selectedVariant?._id}
                  disabled={isDisabled}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
