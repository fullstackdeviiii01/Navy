"use client";

/**
 * app/(admin)/dropshipping/cj/components/CJProductPreview.tsx
 *
 * Shows the transformed CJ product preview with variants, images,
 * import settings (category + markup), and the import button.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  FaDownload,
  FaSpinner,
  FaTag,
  FaImages,
  FaLayerGroup,
  FaShoppingCart,
} from "react-icons/fa";
import { cjApi } from "../../../../../lib/api/cj";
import { categoriesApi } from "../../../../../lib/api/categories";

interface PreviewVariant {
  sku: string;
  cjVid: string;
  cjVariantSku: string;
  attributes: { name: string; value: string }[];
  price: number;
  compareAtPrice: number;
  stockQuantity: number;
  isAvailable: boolean;
}

export interface PreviewData {
  cjProductId: string;
  cjProductSku: string;
  cjSupplierName?: string;
  name: string;
  short_description: string;
  brand: string;
  images: { url: string; is_primary: boolean }[];
  hasVariants: boolean;
  variantOptions: { displayName: string; values: string[] }[];
  variants: PreviewVariant[];
  basePrice: number;
  baseCompareAtPrice: number;
  currency: string;
  totalStock: number;
  inStockVariantCount: number;
  listedNum: number;
  categoryName: string;
}

interface Category {
  _id: string;
  name: string;
  slug: string;
}

interface Props {
  previewData: PreviewData;
  alreadyImported: { _id: string; name: string } | null;
  categories: Category[];
  onImportSuccess: (result: { _id: string; name: string }) => void;
  onError: (msg: string) => void;
}

export default function CJProductPreview({
  previewData,
  alreadyImported,
  categories,
  onImportSuccess,
  onError,
}: Props) {
  const router = useRouter();
  const [importing, setImporting] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [markupPercent, setMarkupPercent] = useState(30);
  const [downloadImages, setDownloadImages] = useState(true);

  const finalPrice =
    markupPercent > 0
      ? (previewData.basePrice * (1 + markupPercent / 100)).toFixed(2)
      : previewData.basePrice.toFixed(2);

  const handleImport = async () => {
    if (!selectedCategoryId) {
      onError("Please select a category before importing.");
      return;
    }

    setImporting(true);
    try {
      const result = await cjApi.importProduct({
        productId: previewData.cjProductSku || previewData.cjProductId,
        categoryId: selectedCategoryId,
        markupPercent,
        downloadImages,
      });
      onImportSuccess({ _id: result.product._id, name: result.product.name });
    } catch (err: any) {
      onError(err.message || "Import failed.");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Already imported warning */}
      {alreadyImported && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-300 text-sm">
            <FaTag />
            Already in your store as &ldquo;{alreadyImported.name}&rdquo;.
          </div>
          <button
            onClick={() => router.push(`/admin/products/${alreadyImported._id}`)}
            className="text-sm px-4 py-1.5 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 self-start sm:self-auto"
          >
            View Product
          </button>
        </div>
      )}

      {/* Product overview */}
      <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
          {/* Image */}
          <div className="flex-shrink-0 flex justify-center sm:justify-start">
            {previewData.images.length > 0 ? (
              <img
                src={previewData.images[0].url}
                alt={previewData.name}
                className="w-32 h-32 sm:w-40 sm:h-40 object-cover rounded-lg border border-theme-border-light dark:border-theme-border-dark"
              />
            ) : (
              <div className="w-32 h-32 sm:w-40 sm:h-40 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                <FaImages className="text-4xl text-gray-400" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 space-y-3">
            <h3 className="text-base sm:text-lg font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark leading-snug">
              {previewData.name}
            </h3>

            <div className="flex flex-wrap gap-3 text-xs sm:text-sm text-theme-text-muted-light dark:text-theme-text-muted-dark">
              <span className="flex items-center gap-1">
                <FaTag />
                SKU: {previewData.cjProductSku}
              </span>
              {previewData.cjSupplierName && (
                <span>By {previewData.cjSupplierName}</span>
              )}
              {previewData.categoryName && (
                <span>{previewData.categoryName}</span>
              )}
            </div>

            <div className="flex items-baseline gap-2 sm:gap-3">
              <span className="text-xl sm:text-2xl font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                ${previewData.basePrice.toFixed(2)}
              </span>
              <span className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark">
                CJ price (before markup)
              </span>
            </div>

            <div className="flex flex-wrap gap-3 text-sm">
              <span className="flex items-center gap-1.5 text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
                <FaImages />
                {previewData.images.length} image{previewData.images.length !== 1 ? "s" : ""}
              </span>
              {previewData.hasVariants && (
                <span className="flex items-center gap-1.5 text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
                  <FaLayerGroup />
                  {previewData.variants.length} variants
                </span>
              )}
              <span className="flex items-center gap-1.5 text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
                <FaShoppingCart />
                {previewData.totalStock.toLocaleString()} in stock
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Variant options */}
      {previewData.hasVariants && previewData.variantOptions.length > 0 && (
        <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg p-4 sm:p-6">
          <h4 className="text-sm font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark mb-4">
            Variants ({previewData.variants.length} combinations)
          </h4>
          <div className="space-y-3">
            {previewData.variantOptions.map((opt, i) => (
              <div key={i}>
                <span className="text-xs font-medium text-theme-text-muted-light dark:text-theme-text-muted-dark uppercase tracking-wider">
                  {opt.displayName}
                </span>
                <div className="flex flex-wrap gap-2 mt-1.5">
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
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm text-blue-700 dark:text-blue-300">
            Price range:{" "}
            <strong>
              ${Math.min(...previewData.variants.map((v) => v.price)).toFixed(2)}
            </strong>{" "}
            —{" "}
            <strong>
              ${Math.max(...previewData.variants.map((v) => v.price)).toFixed(2)}
            </strong>
            <span className="ml-2 text-blue-500 dark:text-blue-400">
              ({previewData.inStockVariantCount} variants in stock)
            </span>
          </div>
        </div>
      )}

      {/* Import settings */}
      <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg p-4 sm:p-6 space-y-5">
        <h4 className="text-base sm:text-lg font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark border-b border-theme-border-light dark:border-theme-border-dark pb-2">
          Import Settings
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-2">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              className="w-full px-3 py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-theme-primary text-sm"
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Markup */}
          <div>
            <label className="block text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-2">
              Markup %
              <span className="ml-2 text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark font-normal">
                (applied to all variant prices)
              </span>
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="0"
                max="500"
                value={markupPercent}
                onChange={(e) =>
                  setMarkupPercent(Math.max(0, parseInt(e.target.value) || 0))
                }
                className="w-24 px-3 py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-theme-primary text-sm"
              />
              <span className="text-sm text-theme-text-muted-light dark:text-theme-text-muted-dark">
                Base →{" "}
                <strong className="text-theme-text-primary-light dark:text-theme-text-primary-dark">
                  ${finalPrice}
                </strong>
              </span>
            </div>
          </div>
        </div>

        {/* Download images toggle */}
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={downloadImages}
            onChange={(e) => setDownloadImages(e.target.checked)}
            className="rounded mt-0.5"
          />
          <div>
            <span className="text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
              Download & localise images
            </span>
            <p className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark mt-0.5">
              Recommended. Downloads, compresses, and stores images locally. Disabling keeps CJ CDN URLs.
            </p>
          </div>
        </label>

        {/* Import button */}
        <div className="flex flex-col sm:flex-row sm:justify-end gap-3 pt-1">
          <button
            onClick={handleImport}
            disabled={importing || !selectedCategoryId}
            className="flex items-center justify-center gap-2 px-6 sm:px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold text-sm shadow-sm hover:shadow-md"
          >
            {importing ? (
              <>
                <FaSpinner className="animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <FaDownload />
                Import Product
              </>
            )}
          </button>
        </div>

        {importing && (
          <p className="text-xs text-center text-theme-text-muted-light dark:text-theme-text-muted-dark">
            Downloading images and saving to database. Please do not close this page.
          </p>
        )}
      </div>
    </div>
  );
}