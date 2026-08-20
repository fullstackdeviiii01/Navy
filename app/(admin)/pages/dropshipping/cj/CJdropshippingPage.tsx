"use client";

/**
 * app/(admin)/dropshipping/cj/page.tsx
 *
 * CJ Dropshipping Import Page.
 * Mirrors AliexpressImportPage — same structure, same UX.
 *
 * Components:
 *   CJCredentialsPanel  — view/save/remove DB credentials
 *   CJSearchPanel       — keyword search + paginated results
 *   CJPreviewInput      — manual PID/SKU entry
 *   CJProductPreview    — product detail + import settings
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { categoriesApi } from "../../../../../lib/api/categories";
import { cjApi } from "../../../../../lib/api/cj"

import CJCredentialsPanel from "../../../components/dropshipping/cj/CJCredentialsPanel";
import CJSearchPanel from "../../../components/dropshipping/cj/CJSearchPanel";
import CJPreviewInput from "../../../components/dropshipping/cj/CJPreviewInput";
import CJProductPreview, { PreviewData } from "../../../components/dropshipping/cj/CJProductPreview";

interface Category {
  _id: string;
  name: string;
  slug: string;
}

export default function CJImportPage() {
  const router = useRouter();

  // ── Shared state ──────────────────────────────────────────────────────────
  const [categories, setCategories] = useState<Category[]>([]);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [alreadyImported, setAlreadyImported] = useState<{ _id: string; name: string } | null>(null);
  const [previewing, setPreviewing] = useState(false);
  const [loadingPid, setLoadingPid] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<{ _id: string; name: string } | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await categoriesApi.getAll(false);
      setCategories(data.categories);
    } catch {
      // Non-critical
    }
  };

  // ── Preview handler (shared by search grid + manual input) ────────────────
  const handlePreview = async (id: string) => {
    setError(null);
    setPreviewData(null);
    setAlreadyImported(null);
    setImportSuccess(null);
    setPreviewing(true);
    setLoadingPid(id);

    try {
      const result = await cjApi.previewProduct(id);
      setPreviewData(result.data);
      setAlreadyImported(result.alreadyImported);
    } catch (err: any) {
      setError(err.message || "Failed to fetch product preview.");
    } finally {
      setPreviewing(false);
      setLoadingPid(null);
    }
  };

  const handleImportSuccess = (result: { _id: string; name: string }) => {
    setImportSuccess(result);
    setPreviewData(null);
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-5xl mx-auto px-2 sm:px-0">
      {/* ── Header ── */}
      <div>
        <h2 className="text-xl sm:text-2xl font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
          Import from CJ Dropshipping
        </h2>
        <p className="text-sm text-theme-text-muted-light dark:text-theme-text-muted-dark mt-1">
          Search products or paste a CJ product PID / SKU to preview and import into your store.
        </p>
      </div>

      {/* ── Credentials ── */}
      <CJCredentialsPanel />

      {/* ── Global error ── */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-300">
          <FaTimesCircle className="flex-shrink-0" />
          {error}
        </div>
      )}

      {/* ── Import success ── */}
      {importSuccess && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
            <FaCheckCircle />
            <span className="font-medium text-sm">
              &ldquo;{importSuccess.name}&rdquo; imported successfully!
            </span>
          </div>
          <button
            onClick={() => router.push(`/admin/products/${importSuccess._id}/edit`)}
            className="text-sm px-4 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 self-start sm:self-auto"
          >
            Edit Product
          </button>
        </div>
      )}

      {/* ── Search ── */}
      <CJSearchPanel
        onPreview={handlePreview}
        loadingPid={loadingPid}
        hasPreview={!!previewData}
      />

      {/* ── Manual PID/SKU input ── */}
      <CJPreviewInput onPreview={handlePreview} previewing={previewing} />

      {/* ── Product preview + import ── */}
      {previewData && (
        <CJProductPreview
          previewData={previewData}
          alreadyImported={alreadyImported}
          categories={categories}
          onImportSuccess={handleImportSuccess}
          onError={setError}
        />
      )}
    </div>
  );
}