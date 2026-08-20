// app/components/cart/CartItem.tsx - PROFESSIONAL CART DESIGN
"use client";

import { useState } from "react";
import { Trash2, Minus, Plus, Video, PlayCircle } from "lucide-react";
import Link from "next/link";
import { formatPrice } from "../../../lib/utils/formatPrice";

interface CartItemProps {
  item: {
    _id: string;
    product_id: {
      _id: string;
      name: string;
      short_description?: string;
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

  const hasImages = item.product_id.images && item.product_id.images.length > 0;
  const hasVideos = item.product_id.videos && item.product_id.videos.length > 0;
  const primaryVideo =
    item.product_id.videos?.find((v) => v.is_primary) ||
    item.product_id.videos?.[0];
  const primaryImage = item.product_id.images?.[0];

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
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow">
      <div className="p-4">
        <div className="flex gap-4">
          {/* Product Image - Left Side */}
          <Link
            href={`/product/${item.product_id._id}`}
            className="flex-shrink-0"
          >
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden group">
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
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    No media
                  </span>
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
                  className="absolute bottom-1 right-1 p-1 bg-black/70 hover:bg-black/90 text-white rounded transition-colors"
                  title={showVideo ? "Show image" : "Show video"}
                >
                  {showVideo ? (
                    <span className="text-[10px] font-semibold px-0.5">
                      IMG
                    </span>
                  ) : (
                    <Video className="w-3 h-3" />
                  )}
                </button>
              )}
            </div>
          </Link>

          {/* Product Details - Right Side */}
          <div className="flex-1 min-w-0 flex flex-col">
            {/* Product Name and Remove Button */}
            <div className="flex justify-between gap-3 mb-1.5">
              <Link
                href={`/product/${item.product_id._id}`}
                className="flex-1 min-w-0"
              >
                <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-2">
                  {item.product_id.name}
                </h3>
              </Link>

              <button
                onClick={() => onRemove(item._id)}
                disabled={updating}
                className="flex-shrink-0 h-fit p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors disabled:opacity-50"
                title="Remove"
                aria-label="Remove item from cart"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Short Description */}
            {item.product_id.short_description && (
              <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                {item.product_id.short_description}
              </p>
            )}

            {/* Variants */}
            {item.variant_attributes && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {Object.entries(item.variant_attributes).map(([key, value]) => (
                  <span
                    key={key}
                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded"
                  >
                    <span className="font-medium">{key}:</span>
                    <span>{value}</span>
                  </span>
                ))}
              </div>
            )}

            {/* Stock Status */}
            {(isOutOfStock || isLowStock) && (
              <div className="mb-2">
                {isOutOfStock ? (
                  <span className="inline-block px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 text-xs font-semibold rounded">
                    Out of Stock
                  </span>
                ) : (
                  <span className="inline-block px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 text-xs font-semibold rounded">
                    Only {availableStock} left
                  </span>
                )}
              </div>
            )}

            {/* Bottom Section: Quantity & Price */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-auto">
              {/* Modern Quantity Selector */}
              <div className="flex items-center gap-2">
                <button
                  onClick={decrementQuantity}
                  disabled={updating || localQuantity <= 1 || isOutOfStock}
                  className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95"
                  aria-label="Decrease"
                >
                  <Minus className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-700 dark:text-gray-300" />
                </button>

                <div className="relative">
                  <input
                    type="number"
                    aria-label="Product quantity"
                    min="1"
                    max={availableStock}
                    value={localQuantity}
                    onChange={handleDirectInput}
                    disabled={updating || isOutOfStock}
                    className="w-12 sm:w-14 h-7 sm:h-8 text-center bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent disabled:opacity-40 transition-all"
                  />
                </div>

                <button
                  onClick={incrementQuantity}
                  disabled={
                    updating || localQuantity >= availableStock || isOutOfStock
                  }
                  className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95"
                  aria-label="Increase"
                >
                  <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-700 dark:text-gray-300" />
                </button>
              </div>

              {/* Price */}
              <div className="ml-auto">
                <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                  {formatPrice(item.price_at_addition * localQuantity)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 text-right">
                  {formatPrice(item.price_at_addition)} each
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
