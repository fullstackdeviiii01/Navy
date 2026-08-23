// app/components/cart/CartItem.tsx
"use client";

import { useState } from "react";
import { Trash2, Minus, Plus, Video, PlayCircle } from "lucide-react";
import Link from "next/link";
import { formatPrice } from "../../../lib/utils/formatPrice";
import { getItemImage } from "../../../lib/utils/productImages";

interface CartItemProps {
  item: {
    _id: string;
    product_id: {
      _id: string;
      name: string;
      images: Array<{ url: string }>;
      videos?: Array<{ url: string; is_primary?: boolean }>;
      inventory?: {
        stock_quantity: number;
        stock_status: string;
      };
      hasVariants?: boolean;
      variants?: Array<{
        _id: string;
        stockQuantity: number;
        attributes: Array<{ name: string; value: string }>;
      }>;
    };
    variant_id?: string;
    variant_attributes?: { [key: string]: string };
    quantity: number;
    price_at_addition: number;
  };
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemove: (itemId: string) => void;
  updating: boolean;
}

export default function CartItem({
  item,
  onUpdateQuantity,
  onRemove,
  updating,
}: CartItemProps) {
  const [localQuantity, setLocalQuantity] = useState(item.quantity);
  const [showVideo, setShowVideo] = useState(false);

  const getAvailableStock = (): number => {
    if (item.product_id.hasVariants && item.variant_id) {
      const variant = item.product_id.variants?.find(
        (v) => v._id === item.variant_id,
      );
      return variant?.stockQuantity || 0;
    }
    return item.product_id.inventory?.stock_quantity || 0;
  };

  const availableStock = getAvailableStock();
  const isOutOfStock = availableStock === 0;
  const isLowStock = availableStock > 0 && availableStock <= 5;

  const resolvedImageUrl = getItemImage(item);
  const primaryImage = resolvedImageUrl ? { url: resolvedImageUrl } : null;
  const hasImages = Boolean(resolvedImageUrl);
  const hasVideos = item.product_id.videos && item.product_id.videos.length > 0;
  const primaryVideo =
    item.product_id.videos?.find((v) => v.is_primary) ||
    item.product_id.videos?.[0];

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) return;
    if (newQuantity > availableStock) {
      alert(`Only ${availableStock} items available in stock`);
      return;
    }
    setLocalQuantity(newQuantity);
    onUpdateQuantity(item._id, newQuantity);
  };

  const incrementQuantity = () => {
    if (localQuantity >= availableStock) {
      alert(`Only ${availableStock} items available in stock`);
      return;
    }
    handleQuantityChange(localQuantity + 1);
  };

  const decrementQuantity = () => {
    if (localQuantity > 1) {
      handleQuantityChange(localQuantity - 1);
    }
  };

  const handleDirectInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 1;
    if (value > availableStock) {
      alert(`Only ${availableStock} items available in stock`);
      setLocalQuantity(availableStock);
      onUpdateQuantity(item._id, availableStock);
    } else if (value < 1) {
      setLocalQuantity(1);
      onUpdateQuantity(item._id, 1);
    } else {
      setLocalQuantity(value);
      onUpdateQuantity(item._id, value);
    }
  };

  return (
    <div className="border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark p-4 sm:p-5 transition-colors">
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
        {/* Product Image */}
        <Link
          href={`/product/${item.product_id._id}`}
          className="flex-shrink-0"
        >
          <div className="relative aspect-[4/5] w-24 sm:w-28 md:w-32 bg-theme-card-light dark:bg-theme-card-dark border border-theme-border-light/60 dark:border-theme-border-dark/60 overflow-hidden group">
            {showVideo && hasVideos && primaryVideo ? (
              <>
                <video
                  aria-label={`${item.product_id.name} product video`}
                  src={primaryVideo.url}
                  className="w-full h-full object-cover"
                  muted
                  loop
                  playsInline
                  onMouseEnter={(e) => e.currentTarget.play()}
                  onMouseLeave={(e) => {
                    e.currentTarget.pause();
                    e.currentTarget.currentTime = 0;
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
                  <PlayCircle className="text-white w-6 h-6" />
                </div>
              </>
            ) : hasImages && primaryImage ? (
              <img
                aria-label={`View ${item.product_id.name} details`}
                src={primaryImage.url}
                alt={item.product_id.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-theme-text-muted-light dark:text-theme-text-muted-dark text-xs">
                No media
              </div>
            )}

            {hasImages && hasVideos && (
              <button
                aria-label={
                  showVideo
                    ? "Switch to product image"
                    : "Switch to product video"
                }
                onClick={(e) => {
                  e.preventDefault();
                  setShowVideo(!showVideo);
                }}
                className="absolute bottom-1 right-1 p-1 bg-black/70 hover:bg-black/90 text-white text-[10px] uppercase font-medium transition-colors"
                title={showVideo ? "Show image" : "Show video"}
              >
                {showVideo ? "IMG" : <Video className="w-3 h-3" />}
              </button>
            )}
          </div>
        </Link>

        {/* Product Details */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-4 mb-2">
              <Link
                href={`/product/${item.product_id._id}`}
                className="group/title flex-1 min-w-0"
              >
                <h3 className="text-base sm:text-lg font-serif text-theme-text-primary-light dark:text-theme-text-primary-dark group-hover/title:text-theme-hover-light dark:group-hover/title:text-theme-hover-dark transition-colors line-clamp-2">
                  {item.product_id.name}
                </h3>
              </Link>

              <button
                onClick={() => onRemove(item._id)}
                disabled={updating}
                className="text-theme-text-muted-light dark:text-theme-text-muted-dark hover:text-red-600 dark:hover:text-red-400 p-1 transition-colors disabled:opacity-50"
                title="Remove item"
                aria-label="Remove item from cart"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Variant Attributes */}
            {item.variant_attributes && Object.keys(item.variant_attributes).length > 0 && (
              <div className="flex flex-wrap gap-x-4 gap-y-1 mb-2 text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
                {Object.entries(item.variant_attributes).map(([key, value]) => (
                  <span key={key}>
                    <span className="text-theme-text-muted-light dark:text-theme-text-muted-dark">{key}:</span> {value}
                  </span>
                ))}
              </div>
            )}

            {/* Stock Alerts */}
            {(isOutOfStock || isLowStock) && (
              <div className="mb-2">
                {isOutOfStock ? (
                  <span className="text-[11px] uppercase tracking-wider text-red-600 dark:text-red-400 font-medium">
                    Out of Stock
                  </span>
                ) : (
                  <span className="text-[11px] uppercase tracking-wider text-amber-600 dark:text-amber-400 font-medium">
                    Only {availableStock} left in stock
                  </span>
                )}
              </div>
            )}

            <p className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark">
              {formatPrice(item.price_at_addition)} each
            </p>
          </div>

          {/* Quantity and Total */}
          <div className="flex items-center justify-between gap-4 mt-4 pt-3 border-t border-theme-border-light/60 dark:border-theme-border-dark/60">
            {/* Square Quantity Selector */}
            <div className="inline-flex items-center border border-theme-border-light dark:border-theme-border-dark bg-theme-bg-light dark:bg-theme-bg-dark">
              <button
                onClick={decrementQuantity}
                disabled={updating || localQuantity <= 1 || isOutOfStock}
                className="w-8 h-8 flex items-center justify-center text-theme-text-primary-light dark:text-theme-text-primary-dark hover:bg-theme-card-light dark:hover:bg-theme-card-dark disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                aria-label="Decrease quantity"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>

              <input
                type="number"
                aria-label="Product quantity"
                min="1"
                max={availableStock}
                value={localQuantity}
                onChange={handleDirectInput}
                disabled={updating || isOutOfStock}
                className="w-12 h-8 text-center bg-transparent border-x border-theme-border-light dark:border-theme-border-dark text-xs sm:text-sm font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none disabled:opacity-40 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />

              <button
                onClick={incrementQuantity}
                disabled={updating || localQuantity >= availableStock || isOutOfStock}
                className="w-8 h-8 flex items-center justify-center text-theme-text-primary-light dark:text-theme-text-primary-dark hover:bg-theme-card-light dark:hover:bg-theme-card-dark disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                aria-label="Increase quantity"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Total price */}
            <div className="text-right">
              <span className="block text-[10px] uppercase tracking-[0.2em] text-theme-text-muted-light dark:text-theme-text-muted-dark">
                ITEM TOTAL
              </span>
              <span className="text-sm sm:text-base font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                {formatPrice(item.price_at_addition * localQuantity)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
