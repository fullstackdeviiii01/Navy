// app/(admin)/components/aliexpress/AliexpressImportSettings.tsx
"use client";

import { FaDownload, FaSpinner } from "react-icons/fa";

interface Category { _id: string; name: string; slug: string; }
interface AliexpressImportSettingsProps {
  categories: Category[];
  selectedCategoryId: string;
  onCategoryChange: (id: string) => void;
  markupPercent: number;
  onMarkupChange: (val: number) => void;
  downloadImages: boolean;
  onDownloadImagesChange: (val: boolean) => void;
  basePrice: number;
  currency: string;
  onImport: () => void;
  importing: boolean;
}

export default function AliexpressImportSettings({
  categories, selectedCategoryId, onCategoryChange,
  markupPercent, onMarkupChange,
  downloadImages, onDownloadImagesChange,
  basePrice, currency, onImport, importing,
}: AliexpressImportSettingsProps) {
  const finalPrice =
    markupPercent > 0
      ? (basePrice * (1 + markupPercent / 100)).toFixed(2)
      : basePrice.toFixed(2);

  return (
    <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg border border-theme-border-light dark:border-theme-border-dark overflow-hidden">
      <div className="px-4 sm:px-5 py-4 border-b border-theme-border-light dark:border-theme-border-dark bg-theme-bg-light dark:bg-theme-bg-dark">
        <h4 className="text-sm font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
          Import Settings
        </h4>
        <p className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark mt-0.5">
          Configure before importing the product into your store
        </p>
      </div>

      <div className="p-4 sm:p-5 space-y-5">
        {/* Category + Markup — always stack on mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1.5">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedCategoryId}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="w-full px-3 py-2.5 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary"
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Markup */}
          <div>
            <label className="block text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1.5">
              Markup %
              <span className="ml-1.5 text-xs font-normal text-theme-text-muted-light dark:text-theme-text-muted-dark">
                (applied to all variant prices)
              </span>
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="0"
                max="500"
                value={markupPercent}
                onChange={(e) => onMarkupChange(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-24 px-3 py-2.5 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary"
              />
              {basePrice > 0 && (
                <span className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark">
                  →{" "}
                  <strong className="text-theme-text-primary-light dark:text-theme-text-primary-dark">
                    {currency} {finalPrice}
                  </strong>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Download images toggle */}
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={downloadImages}
            onChange={(e) => onDownloadImagesChange(e.target.checked)}
            className="rounded mt-0.5 flex-shrink-0"
          />
          <div>
            <span className="text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
              Download & localise images
            </span>
            <p className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark mt-0.5 leading-relaxed">
              Recommended. Downloads, compresses, and stores images locally. Disabling keeps
              AliExpress CDN URLs which may break if CDN changes.
            </p>
          </div>
        </label>

        {/* Import Button — full width on mobile */}
        <div className="pt-1 space-y-2">
          <button
            onClick={onImport}
            disabled={importing || !selectedCategoryId}
            className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold text-sm shadow-sm"
          >
            {importing ? (
              <><FaSpinner className="animate-spin w-3.5 h-3.5" />Importing…</>
            ) : (
              <><FaDownload className="w-3.5 h-3.5" />Import Product</>
            )}
          </button>
          {importing && (
            <p className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark">
              Downloading images and saving to database. Please do not close this page.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}