"use client";

import { useState, useMemo } from "react";
import { FaTimes, FaMinus, FaPlus } from "react-icons/fa";
import ProductVariantSelector from "./ProductVariantSelector";
import AddToCartButton from "./AddToCartButton";
import BuyNowButton from "./BuyNowButton";
import { formatPrice } from "../../../lib/utils/formatPrice";

interface VariantAttribute {
  name: string;
  value: string;
}

interface ProductVariant {
  _id?: string;
  sku: string;
  aliexpressSkuId?: string;
  aliexpressSkuAttr?: string;
  attributes: VariantAttribute[];
  price: number;
  compareAtPrice?: number;
  stockQuantity: number;
  isAvailable: boolean;
  position: number;
  imageUrl?: string;
}

interface VariantOption {
  name: string;
  displayName: string;
  values: string[];
  position: number;
}

interface VariantSelection {
  [key: string]: string;
}

interface VariantSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (variant: ProductVariant, quantity: number) => void;
  product: {
    _id: string;
    name: string;
    images: Array<{ url: string }>;
    variants?: ProductVariant[];
    variantOptions?: VariantOption[];
    pricing: { currency: string };
  };
  pendingAction?: "add-to-cart" | "buy-now" | null;
}

export default function VariantSelectionModal({
  isOpen,
  onClose,
  onConfirm,
  product,
  pendingAction = null,
}: VariantSelectionModalProps) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selection, setSelection] = useState<VariantSelection>({});
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState("");
  
  const availableAttributes = useMemo(() => {
    const availableAttrs = new Set<string>();
    product.variants?.forEach((variant) => {
      if (variant.isAvailable && variant.stockQuantity > 0) {
        variant.attributes.forEach((attr) => {
          availableAttrs.add(attr.name);
        });
      }
    });
    return (product.variantOptions || []).filter((opt) =>
      availableAttrs.has(opt.name)
    );
  }, [product.variants, product.variantOptions]);

  if (!isOpen) return null;

  const handleSelectionChange = (
    newSelection: VariantSelection,
    variant: ProductVariant | null,
  ) => {
    setSelection(newSelection);
    setSelectedVariant(variant);
    setError("");
    // Reset quantity to 1 whenever selection changes
    setQuantity(1);
  };

  const handleQuantityDecrease = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const handleQuantityIncrease = () => {
    if (selectedVariant && quantity < selectedVariant.stockQuantity) {
      setQuantity(quantity + 1);
    }
  };

  const previewImageUrl =
    selectedVariant?.imageUrl ||
    product.images?.[0]?.url ||
    "/placeholder.png";

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-3 md:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="variant-modal-title"
    >
      <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg sm:rounded-xl shadow-2xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="sticky top-0 bg-theme-surface-light dark:bg-theme-surface-dark border-b border-theme-border-light dark:border-theme-border-dark p-2.5 sm:p-3 md:p-4 flex justify-between items-center z-10">
          <h3
            id="variant-modal-title"
            className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark pr-2 line-clamp-1"
          >
            Select Product Options
          </h3>
          <button
            onClick={onClose}
            className="p-1 sm:p-1.5 md:p-2 hover:bg-theme-hover-bg-light dark:hover:bg-theme-hover-bg-dark rounded-lg transition-colors flex-shrink-0"
            aria-label="Close modal"
            style={{ minWidth: "44px", minHeight: "44px" }}
          >
            <FaTimes className="text-theme-text-muted-light dark:text-theme-text-muted-dark text-sm sm:text-base md:text-lg" />
          </button>
        </div>

        {/* Content */}
        <div className="p-2.5 sm:p-3 md:p-4 lg:p-6 space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-6">
          
          {/* Product Preview */}
          <div className="p-2.5 sm:p-3 md:p-4 bg-theme-bg-light dark:bg-theme-bg-dark rounded-lg">
            <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 md:gap-4">
              <div className="flex-shrink-0 self-center sm:self-start">
                <img
                  src={previewImageUrl}
                  alt={
                    selectedVariant
                      ? selectedVariant.attributes.map((a) => a.value).join(" / ")
                      : product.name
                  }
                  className="w-24 h-24 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 object-cover rounded-lg border border-theme-border-light dark:border-theme-border-dark transition-all duration-300"
                />
              </div>

              <div className="flex-1 min-w-0 space-y-2 sm:space-y-2.5 md:space-y-3">
                <h4 className="font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark text-xs sm:text-sm md:text-base line-clamp-2">
                  {product.name}
                </h4>

                {selectedVariant ? (
                  <div className="space-y-2">
                    {/* Price row */}
                    <div className="flex flex-wrap items-baseline gap-2">
                      <div>
                        <p className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark font-medium mb-0.5">
                          Price
                        </p>
                        <p className="text-lg sm:text-xl md:text-2xl font-bold text-theme-primary">
                          {formatPrice(selectedVariant.price)}
                        </p>
                      </div>
                      {selectedVariant.compareAtPrice && (
                        <p className="text-xs sm:text-sm line-through text-theme-text-muted-light dark:text-theme-text-muted-dark mt-auto">
                          {formatPrice(selectedVariant.compareAtPrice)}
                        </p>
                      )}
                    </div>

                    {/* Stock info */}
                    <p className="text-[10px] sm:text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark" role="status">
                      {selectedVariant.stockQuantity > 0
                        ? `${selectedVariant.stockQuantity} in stock`
                        : "Out of stock"}
                    </p>

                    {/* ── Quantity Control ── */}
                    {selectedVariant.stockQuantity > 0 && (
                      <div className="pt-1 space-y-1.5">
                        <div className="flex items-center gap-3">
                          <span className="text-xs sm:text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark" id="modal-qty-label">
                            Quantity:
                          </span>
                          <div
                            className="flex items-center border border-theme-border-light dark:border-theme-border-dark rounded-lg"
                            role="group"
                            aria-labelledby="modal-qty-label"
                          >
                            <button
                              onClick={handleQuantityDecrease}
                              disabled={quantity <= 1}
                              className="p-2 hover:bg-theme-hover-bg-light dark:hover:bg-theme-hover-bg-dark disabled:opacity-40 disabled:cursor-not-allowed transition-colors rounded-l-lg"
                              aria-label="Decrease quantity"
                              style={{ minWidth: "36px", minHeight: "36px" }}
                            >
                              <FaMinus className="text-theme-text-secondary-light dark:text-theme-text-secondary-dark text-[10px]" />
                            </button>
                            <span
                              className="w-10 text-center text-sm font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark border-x border-theme-border-light dark:border-theme-border-dark py-1.5"
                              aria-label={`Quantity: ${quantity}`}
                            >
                              {quantity}
                            </span>
                            <button
                              onClick={handleQuantityIncrease}
                              disabled={quantity >= selectedVariant.stockQuantity}
                              className="p-2 hover:bg-theme-hover-bg-light dark:hover:bg-theme-hover-bg-dark disabled:opacity-40 disabled:cursor-not-allowed transition-colors rounded-r-lg"
                              aria-label="Increase quantity"
                              style={{ minWidth: "36px", minHeight: "36px" }}
                            >
                              <FaPlus className="text-theme-text-secondary-light dark:text-theme-text-secondary-dark text-[10px]" />
                            </button>
                          </div>
                          <span className="text-[10px] sm:text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark">
                            {selectedVariant.stockQuantity} available
                          </span>
                        </div>

                        {/* Total price */}
                        <div className="flex items-center justify-between pt-1 border-t border-theme-border-light dark:border-theme-border-dark">
                          <span className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
                            Total:
                          </span>
                          <span className="text-base sm:text-lg font-bold text-theme-primary">
                            {formatPrice(selectedVariant.price * quantity)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark">
                    Select options to see price and availability.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Variant Selector */}
          <div className="border-t border-theme-border-light dark:border-theme-border-dark pt-3 sm:pt-4 md:pt-5 lg:pt-6">
            <ProductVariantSelector
              variants={product.variants || []}
              variantAttributes={availableAttributes}
              onSelectionChange={handleSelectionChange}
              selectedVariant={selectedVariant}
            />
          </div>

          {/* Error */}
          {error && (
            <div className="p-2 sm:p-2.5 md:p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg" role="alert">
              <p className="text-xs sm:text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-theme-surface-light dark:bg-theme-surface-dark border-t border-theme-border-light dark:border-theme-border-dark p-2.5 sm:p-3 md:p-4 flex flex-col sm:flex-row justify-end gap-2">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-3 sm:px-4 md:px-5 lg:px-6 py-2 sm:py-2.5 border border-theme-border-light dark:border-theme-border-dark rounded-lg text-theme-text-secondary-light dark:text-theme-text-secondary-dark hover:bg-theme-hover-bg-light dark:hover:bg-theme-hover-bg-dark font-medium text-xs sm:text-sm md:text-base transition-colors"
            aria-label="Cancel and close modal"
            style={{ minHeight: "44px" }}
          >
            Cancel
          </button>
          {pendingAction === "buy-now" ? (
            <BuyNowButton
              productId={product._id}
              quantity={quantity}
              variantId={selectedVariant?._id}
              disabled={!selectedVariant || selectedVariant.stockQuantity === 0}
              onSuccess={onClose}
            />
          ) : (
            <AddToCartButton
              productId={product._id}
              quantity={quantity}
              variantId={selectedVariant?._id}
              disabled={!selectedVariant || selectedVariant.stockQuantity === 0}
              onSuccess={onClose}
            />
          )}
        </div>
      </div>
    </div>
  );
}