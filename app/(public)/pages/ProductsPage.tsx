// // app/products/page.tsx
"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { categoriesApi } from "../../../lib/api/categories";
import { productsApi } from "../../../lib/api/products";
import { couponsApi } from "../../../lib/api/coupons";
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
import ScrollToTopButton from "../../components/product/ScrollToTopButton";
import { FaFilter } from "react-icons/fa";

function ProductsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [displayedProducts, setDisplayedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCoupons, setActiveCoupons] = useState([]);
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

  // Update URL when productsPerPage changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("perPage", productsPerPage.toString());
    router.push(`/products?${params.toString()}`, { scroll: false });
  }, [productsPerPage, router]);

  // Fetch categories and coupons on mount
  useEffect(() => {
    fetchCategories();
    fetchActiveCoupons();
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

    // Extract brands from all products (not filtered)
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
        limit: 1000, // Fetch all products
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

  const fetchActiveCoupons = async () => {
    try {
      const data = await couponsApi.getActiveCoupons();
      setActiveCoupons(data.coupons || []);
    } catch (error) {
      console.error("Failed to fetch active coupons:", error);
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
    <div className="min-h-screen user-bg">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header with Search */}
        <header className="mb-8">
          <h1 className="user-text-primary text-3xl font-bold mb-4">
            All Products
          </h1>

          {/* Search Bar */}
          <div className="mb-6" role="search" aria-label="Product search">
            <ProductSearchBar
              value={filters.search}
              onSearch={setSearch}
              placeholder="Search by name, brand, SKU, or description..."
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
        <div className="lg:hidden mb-4">
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="flex items-center gap-2 px-4 py-2 border user-border rounded-lg user-text-secondary hover:bg-theme-hover-bg-light dark:hover:bg-theme-hover-bg-dark transition-colors min-h-[44px] min-w-[44px]"
            aria-label={showMobileFilters ? "Hide product filters" : "Show product filters"}
            aria-expanded={showMobileFilters}
            aria-controls="mobile-filters"
          >
            <FaFilter />
            <span>{showMobileFilters ? "Hide Filters" : "Show Filters"}</span>
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
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
          <main className="flex-1" role="main" aria-label="Product listing">
            {/* Sort & Results Count */}
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
              <p className="user-text-secondary" role="status" aria-live="polite" aria-atomic="true">
                {loading
                  ? "Loading..."
                  : `Showing ${displayedProducts.length} of ${filteredProducts.length} ${
                      filteredProducts.length === 1 ? "product" : "products"
                    }`}
              </p>
              <div className="flex items-center gap-4">
                <ProductsPerPageSelector
                  value={productsPerPage}
                  onChange={setProductsPerPage}
                />
                <ProductSort sortBy={filters.sortBy} onSortChange={setSortBy} />
              </div>
            </div>

            {/* Product Grid */}
            <section aria-label="Product results">
              <ProductGrid 
                products={displayedProducts} 
                loading={loading}
                activeCoupons={activeCoupons}
              />
            </section>

            {/* Load More Button */}
            {!loading && hasMore && (
              <>
                <div className="mt-8">
                  <LoadMoreButton
                    onClick={handleLoadMore}
                    loading={loadingMore}
                    remainingCount={filteredProducts.length - displayedProducts.length}
                  />
                </div>
                {/* Progress Bar */}
                <div className="mt-8 flex justify-center" role="status" aria-label="Loading progress">
                  <div className="w-1/3">
                    <ProductProgressBar
                      current={displayedProducts.length}
                      total={filteredProducts.length}
                    />
                  </div>
                </div>
              </>
            )}
          </main>
        </div>
      </div>

      {/* Scroll to Top Button */}
      {/* <ScrollToTopButton /> */}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen user-bg flex items-center justify-center" role="status" aria-live="polite">
          <p className="user-text-primary">Loading products...</p>
        </div>
      }
    >
      <ProductsPageContent />
    </Suspense>
  );
}