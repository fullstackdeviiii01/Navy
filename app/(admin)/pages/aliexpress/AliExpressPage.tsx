"use client";

import { useState, useEffect } from "react";
import { FaKey, FaDownload } from "react-icons/fa";
import { aliexpressApi } from "../../../../lib/api/aliexpress";
import { categoriesApi } from "../../../../lib/api/categories";
import AliexpressCredentialsPanel from "../../components/aliexpress/AliexpressCredentialsPanel";
import AliexpressSearchBar from "../../components/aliexpress/AliexpressSearchBar";
import AliexpressProductPreview from "../../components/aliexpress/AliexpressProductPreview";
import AliexpressImportSettings from "../../components/aliexpress/AliexpressImportSettings";

interface Category { _id: string; name: string; slug: string; }
interface PreviewVariant {
  sku: string; aliexpressSkuId?: string; aliexpressSkuAttr?: string;
  attributes: { name: string; value: string }[];
  price: number; compareAtPrice: number; stockQuantity: number;
  isAvailable: boolean; position: number;
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

function extractProductId(input: string): string | null {
  const trimmed = input.trim();
  if (/^\d+$/.test(trimmed)) return trimmed;
  const match = trimmed.match(/\/item\/(\d+)\.html/);
  if (match) return match[1];
  const numMatch = trimmed.match(/\b(\d{10,})\b/);
  if (numMatch) return numMatch[1];
  return null;
}

type Tab = "import" | "configuration";

export default function AliexpressImportPage() {
  const [activeTab, setActiveTab] = useState<Tab>("import");
  const [productUrl, setProductUrl] = useState("");
  const [previewing, setPreviewing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [alreadyImported, setAlreadyImported] = useState<{ _id: string; name: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [markupPercent, setMarkupPercent] = useState(30);
  const [downloadImages, setDownloadImages] = useState(true);
  const [importSuccess, setImportSuccess] = useState<{ _id: string; name: string } | null>(null);

  useEffect(() => { fetchCategories(); }, []);

  const fetchCategories = async () => {
    try {
      const data = await categoriesApi.getAll(false);
      setCategories(data.categories);
    } catch {}
  };

  const handlePreview = async () => {
    setError(null); setPreviewData(null); setAlreadyImported(null); setImportSuccess(null);
    const productId = extractProductId(productUrl);
    if (!productId) { setError("Please enter a valid AliExpress product URL or ID."); return; }
    setPreviewing(true);
    try {
      const result = await aliexpressApi.previewProduct(productId);
      setPreviewData(result.data); setAlreadyImported(result.alreadyImported);
    } catch (err: any) { setError(err.message || "Failed to fetch product preview."); }
    finally { setPreviewing(false); }
  };

  const handleImport = async () => {
    if (!previewData) return;
    if (!selectedCategoryId) { setError("Please select a category before importing."); return; }
    setError(null); setImporting(true);
    try {
      const result = await aliexpressApi.importProduct({
        productId: previewData.aliexpressProductId,
        categoryId: selectedCategoryId, markupPercent, downloadImages,
      });
      setImportSuccess({ _id: result.product._id, name: result.product.name });
      setPreviewData(null); setProductUrl("");
    } catch (err: any) { setError(err.message || "Import failed."); }
    finally { setImporting(false); }
  };

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "import", label: "Import Product", icon: <FaDownload className="w-3.5 h-3.5" /> },
    { key: "configuration", label: "API Configuration", icon: <FaKey className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="space-y-3 sm:space-y-5 w-full mx-auto px-0">
      {/* Page Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
          AliExpress Import
        </h2>
        <p className="text-xs sm:text-sm text-theme-text-muted-light dark:text-theme-text-muted-dark mt-1">
          Import products from AliExpress directly into your store.
        </p>
      </div>

      {/* Tabs — scrollable on mobile */}
      <div className="border-b border-theme-border-light dark:border-theme-border-dark overflow-x-auto">
        <div className="flex min-w-max">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 sm:px-5 py-3 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.key
                  ? "border-theme-primary text-theme-primary"
                  : "border-transparent text-theme-text-muted-light dark:text-theme-text-muted-dark hover:text-theme-text-primary-light dark:hover:text-theme-text-primary-dark"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab: Import */}
      {activeTab === "import" && (
        <div className="space-y-4 sm:space-y-5">
          <AliexpressSearchBar
            productUrl={productUrl} onChange={setProductUrl} onPreview={handlePreview}
            previewing={previewing} error={error} importSuccess={importSuccess}
            alreadyImported={alreadyImported}
          />
          {previewData && (
            <div className="space-y-4">
              <AliexpressProductPreview previewData={previewData} />
              <AliexpressImportSettings
                categories={categories} selectedCategoryId={selectedCategoryId}
                onCategoryChange={setSelectedCategoryId} markupPercent={markupPercent}
                onMarkupChange={setMarkupPercent} downloadImages={downloadImages}
                onDownloadImagesChange={setDownloadImages} basePrice={previewData.basePrice}
                currency={previewData.currency} onImport={handleImport} importing={importing}
              />
            </div>
          )}
        </div>
      )}

      {/* Tab: Configuration */}
      {activeTab === "configuration" && <AliexpressCredentialsPanel />}
    </div>
  );
}