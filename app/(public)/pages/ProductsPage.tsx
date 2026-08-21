// app/(public)/pages/ProductsPage.tsx
"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { categoriesApi } from "../../../lib/api/categories";
import { productsApi } from "../../../lib/api/products";

import { useProductFilters } from "../../hooks/useProductFilters";
import {
  filtersToApiParams,
  applyClientSideFilters,
  extractUniqueBrands,
} from "../../../lib/utils/productFilters";
import ProductGrid from "../../components/product/ProductGrid";
import ProductFilters from "../../components/product/ProductFilters";
import ProductSort from "../../components/product/ProductSort";
import ProductSearchBar from "../../components/product/ProductSearchBar";
import ProductsPerPageSelector from "../../components/product/ProductsPerPageSelector";
import ProductProgressBar from "../../components/product/ProductProgressBar";
import ActiveFilters from "../../components/product/ActiveFilters";
import LoadMoreButton from "../../components/product/LoadMoreButton";
import { SlidersHorizontal } from "lucide-react";

function ProductsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [displayedProducts, setDisplayedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [availableBrands, setAvailableBrands] = useState<string[]>([]);
  const [productsPerPage, setProductsPerPage] = useState(
    parseInt(searchParams.get("perPage") || "12")
  );

  const PRODUCTS_PER_PAGE = productsPerPage;

  const {
    filters,
    setCategory,
    setPriceRange,
    setInStock,
    setRating,
    setBrands,
    setSortBy,
    setSearch,
    clearFilters,
  } = useProductFilters();

  const handleProductsPerPageChange = (newPerPage: number) => {
    setProductsPerPage(newPerPage);
    const params = new URLSearchParams(searchParams.toString());
    params.set("perPage", newPerPage.toString());
    router.push(`/products?${params.toString()}`, { scroll: false });
  };

  // Sync state if perPage in URL changes externally
  useEffect(() => {
    const urlPerPage = searchParams.get("perPage");
    if (urlPerPage && parseInt(urlPerPage) !== productsPerPage) {
      setProductsPerPage(parseInt(urlPerPage));
    }
  }, [searchParams]);

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch products when filters change (reset to page 1)
  useEffect(() => {
    setCurrentPage(1);
    setDisplayedProducts([]);
    fetchProducts(1, true);
  }, [
    filters.category,
    filters.search,
    filters.inStock,
    filters.sortBy,
    filters.featured,
    filters.bestseller,
    filters.trending,
    filters.sale,
  ]);

  // Apply client-side filters when products or filters change
  useEffect(() => {
    const filtered = applyClientSideFilters(allProducts, filters);
    setFilteredProducts(filtered);

    const brands = extractUniqueBrands(allProducts);
    setAvailableBrands(brands);
  }, [allProducts, filters]);

  // Update displayed products when filtered products or current page changes
  useEffect(() => {
    const endIndex = currentPage * PRODUCTS_PER_PAGE;
    setDisplayedProducts(filteredProducts.slice(0, endIndex));
    setHasMore(filteredProducts.length > endIndex);
  }, [filteredProducts, currentPage, PRODUCTS_PER_PAGE]);

  const fetchProducts = async (page: number = 1, resetProducts: boolean = false) => {
    if (resetProducts) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const apiParams = {
        ...filtersToApiParams(filters),
        page: 1,
        limit: 1000,
      };
      const data = await productsApi.getAll(apiParams);
      setAllProducts(data.products);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await categoriesApi.getAll(false);
      setCategories(data.categories);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const handleLoadMore = () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
  };

  const handleRemoveFilter = (filterType: string, value?: any) => {
    switch (filterType) {
      case "category":
        setCategory("");
        break;
      case "search":
        setSearch("");
        break;
      case "minPrice":
        setPriceRange(0, 0);
        break;
      case "rating":
        setRating(0);
        break;
      case "inStock":
        setInStock(false);
        break;
      case "brands":
        if (value) {
          setBrands(filters.brands.filter((b) => b !== value));
        }
        break;
    }
  };

  return (
    <div className="min-h-screen bg-theme-bg-light dark:bg-theme-bg-dark transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16">
        {/* Editorial Header */}
        <header className="mb-10 sm:mb-12 border-b border-theme-border-light dark:border-theme-border-dark pb-8 sm:pb-10">
          <p className="text-xs font-medium tracking-[0.25em] uppercase text-theme-hover-light dark:text-theme-hover-dark mb-3">
            SHOP
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif text-theme-text-primary-light dark:text-theme-text-primary-dark mb-4 leading-tight">
            The <span className="italic font-normal font-serif text-theme-hover-light dark:text-theme-hover-dark">fine pieces</span>
          </h1>
          <p className="text-sm sm:text-base text-theme-text-secondary-light dark:text-theme-text-secondary-dark max-w-2xl leading-relaxed">
            Sculptural lighting, turned and finished entirely by hand. Filter, search and find the piece for your space.
          </p>

          {/* Search Bar */}
          <div className="mt-8 mb-6" role="search" aria-label="Product search">
            <ProductSearchBar
              value={filters.search}
              onSearch={setSearch}
              placeholder="Search by name, category, or description..."
            />
          </div>

          {/* Active Filters */}
          <section aria-label="Active filters">
            <ActiveFilters
              filters={filters}
              categories={categories}
              onRemoveFilter={handleRemoveFilter}
              onClearAll={clearFilters}
            />
          </section>
        </header>

        {/* Mobile Filter Toggle */}
        <div className="lg:hidden mb-6 flex items-center justify-between gap-4">
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="flex items-center gap-2 px-4 py-2.5 border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark text-xs uppercase tracking-[0.15em] font-medium hover:bg-theme-card-light dark:hover:bg-theme-card-dark transition-colors"
            aria-label={showMobileFilters ? "Hide product filters" : "Show product filters"}
            aria-expanded={showMobileFilters}
            aria-controls="mobile-filters"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{showMobileFilters ? "Hide Filters" : "Filters"}</span>
          </button>

          <ProductSort sortBy={filters.sortBy} onSortChange={setSortBy} />
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Filters Sidebar */}
          <aside
            id="mobile-filters"
            className={`lg:block lg:w-64 flex-shrink-0 ${
              showMobileFilters ? "block" : "hidden"
            }`}
            aria-label="Product filters"
            role="complementary"
          >
            <ProductFilters
              categories={categories}
              selectedCategory={filters.category}
              onCategoryChange={setCategory}
              priceRange={{
                min: filters.minPrice,
                max: filters.maxPrice,
              }}
              onPriceChange={(range) => setPriceRange(range.min, range.max)}
              inStock={filters.inStock}
              onStockChange={setInStock}
              selectedRating={filters.rating}
              onRatingChange={setRating}
              selectedBrands={filters.brands}
              onBrandChange={setBrands}
              availableBrands={availableBrands}
            />
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0" role="main" aria-label="Product listing">
            {/* Sort & Results Count */}
            <div className="hidden lg:flex items-center justify-between mb-8 pb-4 border-b border-theme-border-light dark:border-theme-border-dark">
              <p className="text-xs uppercase tracking-[0.15em] font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark" role="status" aria-live="polite">
                {loading
                  ? "Loading collection..."
                  : `Showing ${displayedProducts.length} of ${filteredProducts.length} ${
                      filteredProducts.length === 1 ? "piece" : "pieces"
                    }`}
              </p>
              <div className="flex items-center gap-6">
                <ProductsPerPageSelector
                  value={productsPerPage}
                  onChange={handleProductsPerPageChange}
                />
                <ProductSort sortBy={filters.sortBy} onSortChange={setSortBy} />
              </div>
            </div>

            {/* Product Grid */}
            <section aria-label="Product results">
              <ProductGrid 
                products={displayedProducts} 
                loading={loading}
              />
            </section>

            {/* Load More Button */}
            {!loading && hasMore && (
              <div className="mt-12 space-y-6">
                <LoadMoreButton
                  onClick={handleLoadMore}
                  loading={loadingMore}
                  remainingCount={filteredProducts.length - displayedProducts.length}
                />
                <div className="flex justify-center" role="status" aria-label="Loading progress">
                  <div className="w-full max-w-xs">
                    <ProductProgressBar
                      current={displayedProducts.length}
                      total={filteredProducts.length}
                    />
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-theme-bg-light dark:bg-theme-bg-dark flex items-center justify-center" role="status" aria-live="polite">
          <p className="text-xs uppercase tracking-[0.2em] text-theme-text-muted-light dark:text-theme-text-muted-dark">
            Loading pieces...
          </p>
        </div>
      }
    >
      <ProductsPageContent />
    </Suspense>
  );
}