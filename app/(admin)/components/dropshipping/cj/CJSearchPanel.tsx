"use client";

/**
 * app/(admin)/dropshipping/cj/components/CJSearchPanel.tsx
 *
 * Keyword search for CJ products with paginated results grid.
 */

import { useState } from "react";
import { FaSearch, FaSpinner, FaBoxOpen } from "react-icons/fa";
import { cjApi } from "../../../../../lib/api/cj";

interface SearchResult {
  pid: string;
  productSku: string;
  nameEn: string;
  bigImage: string;
  sellPrice: number;
  nowPrice: number;
  categoryId: string;
  threeCategoryName: string;
  addMarkStatus: number;
  listedNum: number;
  warehouseInventoryNum: number;
}

interface Props {
  onPreview: (productSku: string) => void;
  loadingPid: string | null;
  hasPreview: boolean;
}

export default function CJSearchPanel({ onPreview, loadingPid, hasPreview }: Props) {
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchPagination, setSearchPagination] = useState<{
    page: number;
    totalPages: number;
    totalRecords: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (page = 1) => {
    if (!searchKeyword.trim()) return;

    setError(null);
    setSearching(true);

    try {
      const result = await cjApi.searchProducts({
        keyword: searchKeyword.trim(),
        page,
        pageSize: 20,
      });
      setSearchResults(result.products || []);
      setSearchPagination(result.pagination || null);
    } catch (err: any) {
      setError(err.message || "Search failed.");
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg p-4 sm:p-6 space-y-4">
      <h3 className="text-sm font-semibold text-theme-text-secondary-light dark:text-theme-text-secondary-dark uppercase tracking-wide">
        Search Products
      </h3>

      {/* Search bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="e.g. hoodie, phone case, LED lights..."
          className="flex-1 px-4 py-3 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-theme-primary text-sm"
        />
        <button
          onClick={() => handleSearch()}
          disabled={searching || !searchKeyword.trim()}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-theme-primary text-white rounded-lg hover:bg-theme-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm whitespace-nowrap"
        >
          {searching ? <FaSpinner className="animate-spin" /> : <FaSearch />}
          {searching ? "Searching..." : "Search"}
        </button>
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      {/* Results */}
      {searchResults.length > 0 && !hasPreview && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark">
              {searchPagination?.totalRecords.toLocaleString()} products found
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {searchResults.map((product) => (
              <div
                key={product.pid}
                className="border border-theme-border-light dark:border-theme-border-dark rounded-lg overflow-hidden hover:border-theme-primary transition-colors cursor-pointer group"
                onClick={() => onPreview(product.productSku)}
              >
                <div className="relative aspect-square bg-gray-100 dark:bg-gray-800">
                  {product.bigImage ? (
                    <img
                      src={product.bigImage}
                      alt={product.nameEn}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FaBoxOpen className="text-3xl text-gray-400" />
                    </div>
                  )}
                  {product.addMarkStatus === 1 && (
                    <span className="absolute top-1.5 left-1.5 bg-green-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                      Free Ship
                    </span>
                  )}
                </div>
                <div className="p-2 space-y-1">
                  <p className="text-[11px] text-theme-text-primary-light dark:text-theme-text-primary-dark line-clamp-2 leading-snug">
                    {product.nameEn}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                      ${product.nowPrice > 0 ? product.nowPrice.toFixed(2) : product.sellPrice.toFixed(2)}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onPreview(product.productSku);
                    }}
                    disabled={loadingPid === product.productSku}
                    className="w-full py-1 bg-theme-primary text-white rounded text-[11px] font-medium hover:bg-theme-primary-hover transition-colors disabled:opacity-50"
                  >
                    {loadingPid === product.productSku ? "Loading..." : "Preview"}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {searchPagination && searchPagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-1">
              <button
                onClick={() => handleSearch(searchPagination.page - 1)}
                disabled={searchPagination.page <= 1 || searching}
                className="px-3 py-1.5 border border-theme-border-light dark:border-theme-border-dark rounded-lg text-xs disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark">
                Page {searchPagination.page} of {searchPagination.totalPages}
              </span>
              <button
                onClick={() => handleSearch(searchPagination.page + 1)}
                disabled={searchPagination.page >= searchPagination.totalPages || searching}
                className="px-3 py-1.5 border border-theme-border-light dark:border-theme-border-dark rounded-lg text-xs disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}