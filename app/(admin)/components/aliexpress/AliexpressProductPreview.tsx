// app/(admin)/components/aliexpress/AliexpressProductPreview.tsx
"use client";

import { FaStar, FaTag, FaImages, FaLayerGroup, FaShoppingCart } from "react-icons/fa";

interface PreviewVariant {
  sku: string; aliexpressSkuId?: string;
  attributes: { name: string; value: string }[];
  price: number; compareAtPrice: number; stockQuantity: number; isAvailable: boolean;
}
interface PreviewData {
  aliexpressProductId: number; aliexpressStoreName: string; name: string;
  short_description: string; brand: string;
  images: { url: string; is_primary: boolean }[];
  hasVariants: boolean; variantOptions: { displayName: string; values: string[] }[];
  variants: PreviewVariant[]; basePrice: number; baseCompareAtPrice: number;
  currency: string; totalStock: number; inStockVariantCount: number;
  salesCount: number; avgRating: number;
}

export default function AliexpressProductPreview({ previewData }: { previewData: PreviewData }) {
  const showPriceRange =
    previewData.hasVariants &&
    previewData.variants.length > 0 &&
    Math.min(...previewData.variants.map((v) => v.price)) !==
      Math.max(...previewData.variants.map((v) => v.price));

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Product Overview */}
      <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg p-4 sm:p-5 border border-theme-border-light dark:border-theme-border-dark">
        {/* On mobile: image on top, info below. On sm+: side by side */}
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-5">
          {/* Primary Image */}
          <div className="flex-shrink-0 flex justify-center sm:justify-start">
            {previewData.images.length > 0 ? (
              <img
                src={previewData.images[0].url}
                alt={previewData.name}
                className="w-28 h-28 sm:w-36 sm:h-36 object-cover rounded-lg border border-theme-border-light dark:border-theme-border-dark"
              />
            ) : (
              <div className="w-28 h-28 sm:w-36 sm:h-36 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                <FaImages className="text-3xl sm:text-4xl text-gray-400" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 space-y-2.5">
            <h3 className="text-sm font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark leading-snug line-clamp-3">
              {previewData.name}
            </h3>

            <div className="flex flex-wrap gap-x-3 gap-y-1.5 text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark">
              <span className="flex items-center gap-1">
                <FaStar className="text-yellow-400 w-3 h-3" />
                {previewData.avgRating.toFixed(1)} ({previewData.salesCount} sold)
              </span>
              {previewData.brand && (
                <span className="flex items-center gap-1">
                  <FaTag className="w-3 h-3" />
                  {previewData.brand}
                </span>
              )}
              <span>By {previewData.aliexpressStoreName}</span>
            </div>

            <div className="flex flex-wrap items-baseline gap-2">
              <span className="text-lg sm:text-xl font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                {previewData.currency} {previewData.basePrice.toFixed(2)}
              </span>
              {previewData.baseCompareAtPrice > 0 && (
                <span className="text-sm text-theme-text-muted-light dark:text-theme-text-muted-dark line-through">
                  {previewData.currency} {previewData.baseCompareAtPrice.toFixed(2)}
                </span>
              )}
              <span className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark">
                AliExpress price
              </span>
            </div>

            <div className="flex flex-wrap gap-x-3 gap-y-1.5 text-xs">
              <span className="flex items-center gap-1.5 text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
                <FaImages className="w-3 h-3" />
                {previewData.images.length} images
              </span>
              {previewData.hasVariants && (
                <span className="flex items-center gap-1.5 text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
                  <FaLayerGroup className="w-3 h-3" />
                  {previewData.variants.length} variants
                </span>
              )}
              <span className="flex items-center gap-1.5 text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
                <FaShoppingCart className="w-3 h-3" />
                {previewData.totalStock} in stock
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Image Strip */}
      {previewData.images.length > 1 && (
        <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg p-3 sm:p-4 border border-theme-border-light dark:border-theme-border-dark">
          <p className="text-xs font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-2.5">
            All Images ({previewData.images.length})
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1 -mb-1">
            {previewData.images.map((img, i) => (
              <img
                key={i}
                src={img.url}
                alt={`Image ${i + 1}`}
                className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded flex-shrink-0 border border-theme-border-light dark:border-theme-border-dark"
              />
            ))}
          </div>
        </div>
      )}

      {/* Variant Options */}
      {previewData.hasVariants && previewData.variantOptions.length > 0 && (
        <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg p-4 sm:p-5 border border-theme-border-light dark:border-theme-border-dark space-y-3">
          <h4 className="text-sm font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
            Variants ({previewData.variants.length} combinations)
          </h4>
          <div className="space-y-3">
            {previewData.variantOptions.map((opt, i) => (
              <div key={i}>
                <p className="text-xs font-medium text-theme-text-muted-light dark:text-theme-text-muted-dark uppercase tracking-wider mb-1.5">
                  {opt.displayName}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {opt.values.map((val) => (
                    <span
                      key={val}
                      className="px-2.5 py-1 bg-theme-bg-light dark:bg-theme-bg-dark border border-theme-border-light dark:border-theme-border-dark rounded-full text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark"
                    >
                      {val}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {showPriceRange && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-xs text-blue-700 dark:text-blue-300">
              Price range:{" "}
              <strong>{previewData.currency} {Math.min(...previewData.variants.map((v) => v.price)).toFixed(2)}</strong>
              {" — "}
              <strong>{previewData.currency} {Math.max(...previewData.variants.map((v) => v.price)).toFixed(2)}</strong>
              <span className="ml-2 text-blue-500 dark:text-blue-400">
                ({previewData.inStockVariantCount} in stock)
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}