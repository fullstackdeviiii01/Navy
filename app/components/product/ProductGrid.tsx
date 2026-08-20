// app/components/product/ProductGrid.tsx
"use client";

import ProductCard from "./ProductCard";

interface ProductGridProps {
  products: any[];
  loading?: boolean;
  activeCoupons?: any[];
}

export default function ProductGrid({ products, loading, activeCoupons = [] }: ProductGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="user-surface border user-border rounded-lg overflow-hidden animate-pulse">
            <div className="aspect-square bg-gray-300 dark:bg-gray-700" />
            <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
              <div className="h-3 sm:h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4" />
              <div className="h-2.5 sm:h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/2" />
              <div className="h-5 sm:h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/3" />
              <div className="h-9 sm:h-10 bg-gray-300 dark:bg-gray-700 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12 sm:py-16">
        <p className="user-text-muted text-base sm:text-lg">No products found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
      {products.map((product) => (
        <ProductCard 
          key={product._id} 
          product={product}
          activeCoupons={activeCoupons}
        />
      ))}
    </div>
  );
}