// app/components/product-detail/StickyProductBar.tsx
"use client";

import Image from "next/image";
import AddToCartButton from "./AddToCartButton";
import ProductQuantity from "./ProductQuantity";
import { formatPrice } from "../../../lib/utils/formatPrice";
import { getProductMainImage } from "../../../lib/utils/productImages";

interface VariantAttribute {
  name: string;
  value: string;
}

interface ProductVariant {
  _id?: string;
  sku?: string;
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
    getProductMainImage(product, selectedVariant?._id) ||
    "/placeholder-image.png";

  const isReadyToBuy = !isVariableProduct || Boolean(selectedVariant);
  const isDisabled = isOutOfStock || (isVariableProduct && !selectedVariant) || variantOutOfStock;

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-40 bg-theme-surface-light/95 dark:bg-theme-surface-dark/95 backdrop-blur-md border-t border-theme-border-light dark:border-theme-border-dark shadow-2xl transition-all duration-300 transform ${
        isVisible
          ? "translate-y-0 opacity-100"
          : "translate-y-full opacity-0 pointer-events-none"
      }`}
      role="region"
      aria-label="Sticky product action bar"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Product Thumbnail + Details */}
          <div className="flex items-center gap-3 min-w-0 flex-1 sm:flex-initial">
            <div className="relative w-12 h-12 flex-shrink-0 bg-theme-card-light dark:bg-theme-card-dark border border-theme-border-light dark:border-theme-border-dark overflow-hidden">
              <Image
                src={primaryImage}
                alt={product.name}
                fill
                className="object-cover"
                sizes="48px"
              />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs sm:text-sm font-serif text-theme-text-primary-light dark:text-theme-text-primary-dark truncate max-w-[160px] sm:max-w-xs md:max-w-md">
                {product.name}
              </h4>
              <p className="text-xs font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                {formatPrice(totalPrice)}
              </p>
            </div>
          </div>

          {/* Right: Quantity + Action */}
          <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
            {/* Quantity Selector */}
            {isReadyToBuy && !isOutOfStock && !variantOutOfStock && (
              <div className="hidden sm:flex items-center">
                <ProductQuantity
                  quantity={quantity}
                  onQuantityChange={onQuantityChange}
                  max={currentStock}
                />
              </div>
            )}

            {/* Action */}
            {isVariableProduct && !selectedVariant ? (
              <button
                onClick={onScrollToOptions}
                className="px-4 sm:px-6 py-3 sm:py-3.5 bg-theme-primary hover:bg-theme-hover-light dark:hover:bg-theme-hover-dark text-theme-btn-text font-medium text-[11px] sm:text-xs uppercase tracking-[0.15em] transition-colors whitespace-nowrap"
              >
                SELECT OPTIONS
              </button>
            ) : (
              <div className="min-w-[120px] sm:min-w-[180px]">
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
