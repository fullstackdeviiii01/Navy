// lib/utils/productFilters.ts
import { ProductFilters } from "../../app/hooks/useProductFilters";

/**
 * Convert URL filters to API query parameters
 */
export function filtersToApiParams(filters: ProductFilters) {
  const params: Record<string, any> = {
    page: filters.page,
    limit: 20,
  };

  if (filters.category) {
  params.categorySlug = filters.category;
}

  // Search
  if (filters.search) {
    params.search = filters.search;
  }

  // Status (in stock filter)
  if (filters.inStock) {
    params.status = "active";
    params.inStock = true;
  }

  // ADD THESE BADGE FILTERS:
  if (filters.featured) {
    params.featured = true;
  }
  if (filters.bestseller) {
    params.bestseller = true;
  }
  if (filters.trending) {
    params.trending = true;
  }
  if (filters.sale) {
    params.sale = true;
  }

  // Sort
  const { sortBy, sortOrder } = parseSortBy(filters.sortBy);
  params.sortBy = sortBy;
  params.sortOrder = sortOrder;

  return params;
}

/**
 * Parse sortBy string into API parameters
 */
function parseSortBy(sortBy: string): { sortBy: string; sortOrder: string } {
  switch (sortBy) {
    case "price-asc":
      return { sortBy: "pricing.price", sortOrder: "asc" };
    case "price-desc":
      return { sortBy: "pricing.price", sortOrder: "desc" };
    case "name-asc":
      return { sortBy: "name", sortOrder: "asc" };
    case "name-desc":
      return { sortBy: "name", sortOrder: "desc" };
    case "newest":
      return { sortBy: "created_at", sortOrder: "desc" };
    case "rating":
      return { sortBy: "rating_average", sortOrder: "desc" };
    case "featured":
    default:
      return { sortBy: "created_at", sortOrder: "desc" };
  }
}

/**
 * Filter products client-side (for price, rating, brands)
 * These filters are applied after fetching from API
 */
export function applyClientSideFilters(products: any[], filters: ProductFilters) {
  let filtered = [...products];

  // Price range filter
  if (filters.minPrice > 0 || filters.maxPrice > 0) {
    filtered = filtered.filter((product) => {
      const price = product.pricing.price;
      const matchesMin = filters.minPrice > 0 ? price >= filters.minPrice : true;
      const matchesMax = filters.maxPrice > 0 ? price <= filters.maxPrice : true;
      return matchesMin && matchesMax;
    });
  }

  // Rating filter
  if (filters.rating > 0) {
    filtered = filtered.filter(
      (product) => product.rating_average >= filters.rating
    );
  }

  // Brands filter
  if (filters.brands.length > 0) {
    filtered = filtered.filter(
      (product) => product.brand && filters.brands.includes(product.brand)
    );
  }

  return filtered;
}

/**
 * Extract unique brands from products
 */
export function extractUniqueBrands(products: any[]): string[] {
  const brands = products
    .map((product) => product.brand)
    .filter(Boolean);
  return [...new Set(brands)].sort();
}