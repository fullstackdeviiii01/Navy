// app/(public)/pages/CategoriesPage.tsx
"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { categoriesApi } from "../../../lib/api/categories";
import CategoryGrid from "../../components/category/CategoryGrid";
import CategorySearchBar from "../../components/category/CategorySearchBar";
import Loader from "../../components/shared/Loader";
import { LayoutGrid, List, ChevronRight, Search } from "lucide-react";

function CategoriesPageContent() {
  const [allCategories, setAllCategories] = useState<any[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterCategories();
  }, [allCategories, searchQuery]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const categoriesData = await categoriesApi.getAll(false);
      setAllCategories(categoriesData.categories || []);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterCategories = () => {
    let filtered = [...allCategories];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (cat) =>
          cat.name.toLowerCase().includes(query) ||
          cat.description?.toLowerCase().includes(query) ||
          cat.slug.toLowerCase().includes(query),
      );
    }

    setFilteredCategories(filtered);
  };

  const totalPieces = allCategories.reduce(
    (acc, cat) => acc + (cat.product_count || 0),
    0
  );

  return (
    <div className="min-h-screen bg-theme-bg-light dark:bg-theme-bg-dark transition-colors">
      {/* Top Breadcrumb & Hero Header */}
      <header className="border-b border-theme-border-light dark:border-theme-border-dark py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] mb-8" aria-label="Breadcrumb">
            <Link
              href="/"
              className="text-theme-text-muted-light dark:text-theme-text-muted-dark hover:text-theme-text-primary-light dark:hover:text-theme-text-primary-dark transition-colors"
            >
              HOME
            </Link>
            <ChevronRight className="w-3 h-3 text-theme-text-muted-light dark:text-theme-text-muted-dark" />
            <span className="text-theme-text-primary-light dark:text-theme-text-primary-dark font-medium">
              COLLECTIONS
            </span>
          </nav>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div className="max-w-3xl">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-medium tracking-[0.25em] uppercase text-theme-hover-light dark:text-theme-hover-dark">
                  ARCHITECTURAL ARCHETYPES
                </span>
                <span className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark font-mono">
                  • {allCategories.length} CATEGORIES ({totalPieces} PIECES)
                </span>
              </div>
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-serif font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark leading-tight tracking-tight">
                Curated Categories
              </h1>
              <p className="text-xs sm:text-sm text-theme-text-secondary-light dark:text-theme-text-secondary-dark mt-3 leading-relaxed max-w-2xl">
                Explore our distinct luminaire families, from monumental arc floor lamps and hand-carved timber table lights to authentic Louis Comfort Tiffany stained glass works.
              </p>
            </div>

            {/* View Switcher Controls */}
            <div className="flex items-center gap-2 self-start lg:self-end">
              <div className="inline-flex border border-theme-border-light dark:border-theme-border-dark p-1 bg-theme-surface-light dark:bg-theme-surface-dark">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] font-medium transition-colors ${
                    viewMode === "grid"
                      ? "bg-theme-primary text-theme-btn-text"
                      : "text-theme-text-secondary-light dark:text-theme-text-secondary-dark hover:text-theme-text-primary-light"
                  }`}
                  aria-label="Mosaic Gallery Grid View"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">MOSAIC</span>
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] font-medium transition-colors ${
                    viewMode === "list"
                      ? "bg-theme-primary text-theme-btn-text"
                      : "text-theme-text-secondary-light dark:text-theme-text-secondary-dark hover:text-theme-text-primary-light"
                  }`}
                  aria-label="Minimal Index List View"
                >
                  <List className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">INDEX</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Search & Category Pills */}
          <div className="mt-8 pt-8 border-t border-theme-border-light/60 dark:border-theme-border-dark/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CategorySearchBar
              value={searchQuery}
              onSearch={setSearchQuery}
              placeholder="Search collections (e.g. table lamp, floor lamp, tiffany)..."
            />

            {/* Quick Jumps */}
            {!loading && allCategories.length > 0 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full scrollbar-hide text-xs">
                <span className="text-[10px] uppercase tracking-[0.2em] text-theme-text-muted-light dark:text-theme-text-muted-dark whitespace-nowrap mr-1">
                  JUMP TO:
                </span>
                {allCategories.map((cat) => (
                  <Link
                    key={cat._id}
                    href={`/products?category=${cat.slug}`}
                    className="px-3 py-1.5 border border-theme-border-light dark:border-theme-border-dark text-[11px] uppercase tracking-[0.15em] text-theme-text-secondary-light dark:text-theme-text-secondary-dark hover:border-theme-hover-light hover:text-theme-text-primary-light whitespace-nowrap transition-colors bg-theme-surface-light dark:bg-theme-surface-dark"
                  >
                    {cat.name} ({cat.product_count})
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Showcase */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {/* Results Counter */}
        <div className="mb-8 flex items-center justify-between">
          <div role="status" aria-live="polite">
            {!loading && (
              <p className="text-xs uppercase tracking-[0.2em] text-theme-text-muted-light dark:text-theme-text-muted-dark font-mono">
                SHOWING {filteredCategories.length} OF {allCategories.length} COLLECTIONS
                {searchQuery && (
                  <span className="text-theme-hover-light dark:text-theme-hover-dark font-sans ml-2">
                    MATCHING &ldquo;{searchQuery}&rdquo;
                  </span>
                )}
              </p>
            )}
          </div>

          {searchQuery && !loading && (
            <button
              onClick={() => setSearchQuery("")}
              className="text-xs uppercase tracking-[0.18em] font-medium text-theme-hover-light dark:text-theme-hover-dark hover:underline"
            >
              CLEAR SEARCH
            </button>
          )}
        </div>

        {/* Categories Presentation */}
        <CategoryGrid
          categories={filteredCategories}
          loading={loading}
          viewMode={viewMode}
        />

        {/* Empty Search Result Fallback */}
        {!loading && filteredCategories.length === 0 && searchQuery && (
          <div className="text-center py-20 border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark p-8 max-w-lg mx-auto space-y-4" role="status">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-theme-card-light dark:bg-theme-card-dark border border-theme-border-light dark:border-theme-border-dark">
              <Search className="w-6 h-6 text-theme-text-muted-light dark:text-theme-text-muted-dark" />
            </div>
            <h2 className="font-serif font-medium text-2xl text-theme-text-primary-light dark:text-theme-text-primary-dark">
              No matching collections
            </h2>
            <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark max-w-md mx-auto leading-relaxed">
              We couldn&apos;t find any collections matching &ldquo;{searchQuery}&rdquo;. Try another search term or explore all pieces.
            </p>
            <div className="pt-2">
              <button
                onClick={() => setSearchQuery("")}
                className="px-6 py-3 bg-theme-primary hover:bg-theme-hover-light text-theme-btn-text text-xs uppercase tracking-[0.2em] font-medium transition-colors"
              >
                SHOW ALL COLLECTIONS
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function CategoriesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-theme-bg-light dark:bg-theme-bg-dark flex items-center justify-center">
          <Loader text="LOADING COLLECTIONS..." />
        </div>
      }
    >
      <CategoriesPageContent />
    </Suspense>
  );
}