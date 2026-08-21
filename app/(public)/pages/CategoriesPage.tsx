// app/(public)/pages/CategoriesPage.tsx
"use client";

import { useState, useEffect, Suspense } from "react";
import { categoriesApi } from "../../../lib/api/categories";
import CategoryGrid from "../../components/category/CategoryGrid";
import CategorySearchBar from "../../components/category/CategorySearchBar";
import { FaSearch } from "react-icons/fa";
import Loader from "../../components/shared/Loader";

function CategoriesPageContent() {
  const [allCategories, setAllCategories] = useState<any[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

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
      setAllCategories(categoriesData.categories);
    } catch (error) {
      console.error("Failed to fetch data:", error);
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

  const handleSearch = (search: string) => {
    setSearchQuery(search);
  };

  return (
    <div className="min-h-screen bg-theme-bg-light dark:bg-theme-bg-dark transition-colors">
      {/* Editorial Hero Header */}
      <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8 sm:pt-16 sm:pb-12 border-b border-theme-border-light dark:border-theme-border-dark">
        <div className="max-w-3xl">
          <p className="text-xs font-medium tracking-[0.25em] uppercase text-theme-hover-light dark:text-theme-hover-dark mb-3">
            COLLECTIONS
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif text-theme-text-primary-light dark:text-theme-text-primary-dark mb-4 leading-tight">
            The <span className="italic font-normal font-serif text-theme-hover-light dark:text-theme-hover-dark">categories</span>
          </h1>
          <p className="text-sm sm:text-base text-theme-text-secondary-light dark:text-theme-text-secondary-dark leading-relaxed mb-8">
            Explore our solid-wood lighting and decor collections, sculpted and finished entirely by hand for distinctive living spaces.
          </p>

          {/* Search Bar */}
          <CategorySearchBar
            value={searchQuery}
            onSearch={handleSearch}
            placeholder="Search categories by name or description..."
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Results Summary */}
        <div className="mb-8 flex items-center justify-between">
          <div role="status" aria-live="polite">
            {loading ? (
              <div className="relative h-6">
                <Loader size="sm" />
              </div>
            ) : (
              <p className="text-xs sm:text-sm uppercase tracking-[0.15em] text-theme-text-secondary-light dark:text-theme-text-secondary-dark font-medium">
                <span>{filteredCategories.length}</span>{" "}
                {filteredCategories.length === 1 ? "CATEGORY" : "CATEGORIES"}
                {searchQuery && (
                  <span className="text-theme-text-muted-light dark:text-theme-text-muted-dark">
                    {" "}
                    MATCHING &ldquo;{searchQuery}&rdquo;
                  </span>
                )}
              </p>
            )}
          </div>

          {searchQuery && !loading && (
            <button
              onClick={() => setSearchQuery("")}
              className="text-xs uppercase tracking-[0.15em] font-medium text-theme-hover-light dark:text-theme-hover-dark hover:text-theme-text-primary-light dark:hover:text-theme-text-primary-dark transition-colors px-2 py-1"
              aria-label="Clear search filters"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Categories Grid */}
        <CategoryGrid categories={filteredCategories} loading={loading} />

        {/* Empty State for Search */}
        {!loading && filteredCategories.length === 0 && searchQuery && (
          <div className="text-center py-16 border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark p-8 max-w-lg mx-auto" role="status">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-theme-card-light dark:bg-theme-card-dark border border-theme-border-light dark:border-theme-border-dark mb-4" aria-hidden="true">
              <FaSearch className="text-xl text-theme-text-muted-light dark:text-theme-text-muted-dark" />
            </div>
            <h2 className="font-serif italic text-2xl text-theme-text-primary-light dark:text-theme-text-primary-dark mb-2">
              No categories found
            </h2>
            <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-6 max-w-md mx-auto">
              We couldn&apos;t find any categories matching &ldquo;{searchQuery}&rdquo;. Try adjusting your search query.
            </p>
            <button
              onClick={() => setSearchQuery("")}
              className="inline-flex items-center px-6 py-3 bg-theme-primary hover:bg-theme-hover-light dark:hover:bg-theme-hover-dark text-theme-btn-text text-xs uppercase tracking-[0.2em] font-medium transition-colors"
              aria-label="View all categories"
            >
              VIEW ALL CATEGORIES
            </button>
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
          <div className="text-center">
            <Loader />
            <p className="text-xs uppercase tracking-[0.2em] text-theme-text-muted-light dark:text-theme-text-muted-dark mt-4">
              Loading categories...
            </p>
          </div>
        </div>
      }
    >
      <CategoriesPageContent />
    </Suspense>
  );
}