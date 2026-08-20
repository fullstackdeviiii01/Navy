// app/(admin)/components/aliexpress/AliexpressSearchBar.tsx
"use client";

import { FaSearch, FaSpinner, FaTimesCircle, FaCheckCircle, FaTag } from "react-icons/fa";
import { useRouter } from "next/navigation";

interface AlreadyImported { _id: string; name: string; }
interface ImportSuccess { _id: string; name: string; }
interface AliexpressSearchBarProps {
  productUrl: string;
  onChange: (val: string) => void;
  onPreview: () => void;
  previewing: boolean;
  error: string | null;
  importSuccess: ImportSuccess | null;
  alreadyImported: AlreadyImported | null;
}

export default function AliexpressSearchBar({
  productUrl, onChange, onPreview, previewing, error, importSuccess, alreadyImported,
}: AliexpressSearchBarProps) {
  const router = useRouter();

  return (
    <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg p-4 sm:p-6 space-y-4 border border-theme-border-light dark:border-theme-border-dark">
      <div>
        <h3 className="text-sm font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark mb-1">
          Product URL or ID
        </h3>
        <p className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark">
          Paste an AliExpress product URL or numeric product ID to preview before importing.
        </p>
      </div>

      {/* Input stacks on mobile, inline on sm+ */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <input
          type="text"
          value={productUrl}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onPreview()}
          placeholder="Paste URL or product ID…"
          className="w-full px-3 sm:px-4 py-2.5 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary min-w-0"
        />
        <button
          onClick={onPreview}
          disabled={previewing || !productUrl.trim()}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-theme-primary text-white rounded-lg hover:bg-theme-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm whitespace-nowrap w-full sm:w-auto flex-shrink-0"
        >
          {previewing ? <FaSpinner className="animate-spin w-3.5 h-3.5" /> : <FaSearch className="w-3.5 h-3.5" />}
          {previewing ? "Fetching…" : "Preview"}
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-300">
          <FaTimesCircle className="flex-shrink-0 w-4 h-4 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {importSuccess && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 sm:p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-start gap-2 text-green-700 dark:text-green-300 text-sm flex-1 min-w-0">
            <FaCheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span className="font-medium break-words">&ldquo;{importSuccess.name}&rdquo; imported successfully!</span>
          </div>
          <button
            onClick={() => router.push(`/admin/products/${importSuccess._id}/edit`)}
            className="text-sm px-4 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors w-full sm:w-auto text-center flex-shrink-0"
          >
            Edit Product
          </button>
        </div>
      )}

      {alreadyImported && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 sm:p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="flex items-start gap-2 text-yellow-700 dark:text-yellow-300 text-sm flex-1 min-w-0">
            <FaTag className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span className="break-words">Already imported as &ldquo;{alreadyImported.name}&rdquo;</span>
          </div>
          <button
            onClick={() => router.push(`/admin/products/${alreadyImported._id}`)}
            className="text-sm px-4 py-1.5 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors w-full sm:w-auto text-center flex-shrink-0"
          >
            View Product
          </button>
        </div>
      )}
    </div>
  );
}