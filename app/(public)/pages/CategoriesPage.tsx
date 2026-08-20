// app/categories/page.tsx
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <header className="max-w-7xl mx-auto px-4 py-12 md:py-10">
        <div className="max-w-3xl">
          <h1 className="user-text-primary text-3xl font-bold mb-4">
            Explore Our Categories
          </h1>

          {/* Search Bar */}
          <CategorySearchBar
            value={searchQuery}
            onSearch={handleSearch}
            placeholder="Search by category name and description"
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4">
        {/* Results Summary */}
        <div className="mb-6 flex items-center justify-between">
          <div role="status" aria-live="polite">
            {loading ? (
              <div className="relative h-6">
                <Loader size="sm" />
              </div>
            ) : (
              <p className="text-gray-600 dark:text-gray-400 text-base">
                <span className="font-semibold text-gray-900 dark:text-white">
                  {filteredCategories.length}
                </span>{" "}
                {filteredCategories.length === 1 ? "category" : "categories"}
                {searchQuery && (
                  <span className="text-gray-500 dark:text-gray-500">
                    {" "}
                    matching "{searchQuery}"
                  </span>
                )}
              </p>
            )}
          </div>

          {searchQuery && !loading && (
            <button
              onClick={() => setSearchQuery("")}
              className="text-theme-primary hover:text-theme-primary/80 text-sm font-medium transition-colors min-h-[44px] px-3"
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
          <div className="text-center py-16" role="status">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full mb-6" aria-hidden="true">
              <FaSearch className="text-3xl text-gray-400 dark:text-gray-600" />
            </div>
            <h2 className="text-gray-900 dark:text-white text-xl font-semibold mb-2">
              No categories found
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
              We couldn't find any categories matching "{searchQuery}". Try
              adjusting your search terms.
            </p>
            <button
              onClick={() => setSearchQuery("")}
              className="inline-flex items-center px-6 py-3 bg-theme-primary hover:bg-theme-primary/90 text-white font-medium rounded-lg transition-colors min-h-[44px]"
              aria-label="View all categories"
            >
              View All Categories
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
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-theme-primary mb-4" role="status" aria-label="Loading"></div>
            <p className="text-gray-600 dark:text-gray-400">
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