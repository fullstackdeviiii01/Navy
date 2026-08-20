// app/hooks/useProductFilters.ts
"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useMemo } from "react";

export interface ProductFilters {
  category: string;
  minPrice: number;
  maxPrice: number;
  inStock: boolean;
  rating: number;
  brands: string[];
  sortBy: string;
  page: number;
  search: string;
  featured: boolean;
  bestseller: boolean;
  trending: boolean;
  sale: boolean;
}

export function useProductFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Parse current filters from URL
  const filters = useMemo((): ProductFilters => {
    const brands = searchParams.get("brands");

    return {
      category: searchParams.get("category") || "",
      minPrice: parseFloat(searchParams.get("minPrice") || "0"),
      maxPrice: parseFloat(searchParams.get("maxPrice") || "0"),
      inStock: searchParams.get("inStock") === "true",
      rating: parseInt(searchParams.get("rating") || "0"),
      brands: brands ? brands.split(",").filter(Boolean) : [],
      sortBy: searchParams.get("sortBy") || "featured",
      page: parseInt(searchParams.get("page") || "1"),
      search: searchParams.get("search") || "",
      featured: searchParams.get("featured") === "true",
      bestseller: searchParams.get("bestseller") === "true",
      trending: searchParams.get("trending") === "true",
      sale: searchParams.get("sale") === "true",
    };
  }, [searchParams]);

  // Update URL with new filters
  const updateFilters = useCallback(
    (updates: Partial<ProductFilters>) => {
      const params = new URLSearchParams(searchParams.toString());

      // Merge updates with current filters
      const newFilters = { ...filters, ...updates };

      // Reset to page 1 when filters change (except when page itself is being updated)
      if (!updates.hasOwnProperty("page")) {
        newFilters.page = 1;
      }

      // Set or delete each param
      Object.entries(newFilters).forEach(([key, value]) => {
        if (key === "brands") {
          const brandsArray = value as string[];
          if (brandsArray.length > 0) {
            params.set(key, brandsArray.join(","));
          } else {
            params.delete(key);
          }
        } else if (key === "minPrice" || key === "maxPrice") {
          if (value && value !== 0) {
            params.set(key, String(value));
          } else {
            params.delete(key);
          }
        } else if (key === "inStock") {
          if (value === true) {
            params.set(key, "true");
          } else {
            params.delete(key);
          }
        } else if (key === "featured" || key === "bestseller" || key === "trending" || key === "sale") {
  if (value === true) {
    params.set(key, "true");
  } else {
    params.delete(key);
  }} else if (key === "rating") {
          if (value && value !== 0) {
            params.set(key, String(value));
          } else {
            params.delete(key);
          }
        } else if (key === "page") {
          if (value && value !== 1) {
            params.set(key, String(value));
          } else {
            params.delete(key);
          }
        } else if (key === "sortBy") {
          if (value && value !== "featured") {
            params.set(key, String(value));
          } else {
            params.delete(key);
          }
        } else if (key === "category") {
  if (value) {
    params.set(key, String(value)); // This will now be slug instead of ID
  } else {
    params.delete(key);
  }
} else if (key === "search") {
  if (value) {
    params.set(key, String(value));
  } else {
    params.delete(key);
  }
}
      });

      // Update URL
      const newUrl = params.toString()
        ? `${pathname}?${params.toString()}`
        : pathname;
      router.push(newUrl, { scroll: false });
    },
    [filters, pathname, router, searchParams]
  );

  // Clear all filters
  const clearFilters = useCallback(() => {
    router.push(pathname, { scroll: false });
  }, [pathname, router]);

  // Individual filter setters
  const setCategory = useCallback(
    (category: string) => updateFilters({ category }),
    [updateFilters]
  );

  const setPriceRange = useCallback(
    (minPrice: number, maxPrice: number) =>
      updateFilters({ minPrice, maxPrice }),
    [updateFilters]
  );

  const setInStock = useCallback(
    (inStock: boolean) => updateFilters({ inStock }),
    [updateFilters]
  );

  const setRating = useCallback(
    (rating: number) => updateFilters({ rating }),
    [updateFilters]
  );

  const setBrands = useCallback(
    (brands: string[]) => updateFilters({ brands }),
    [updateFilters]
  );

  const setSortBy = useCallback(
    (sortBy: string) => updateFilters({ sortBy }),
    [updateFilters]
  );

  const setPage = useCallback(
    (page: number) => updateFilters({ page }),
    [updateFilters]
  );

  const setSearch = useCallback(
    (search: string) => updateFilters({ search }),
    [updateFilters]
  );

  return {
    filters,
    updateFilters,
    clearFilters,
    setCategory,
    setPriceRange,
    setInStock,
    setRating,
    setBrands,
    setSortBy,
    setPage,
    setSearch,
  };
}
