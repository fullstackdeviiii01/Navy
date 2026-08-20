"use client";

import { Trophy, TrendingUp } from 'lucide-react';

interface TopProductsProps {
  products: Array<{
    _id: string;
    name: string;
    revenue: number;
    quantity: number;
    image: string;
  }>;
}

export default function TopProducts({ products }: TopProductsProps) {
  return (
    <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg sm:rounded-xl shadow-sm border border-theme-border-light dark:border-theme-border-dark p-3 sm:p-4">
      <div className="mb-3">
        <h3 className="text-base sm:text-lg font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark flex items-center gap-2">
          <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" aria-hidden="true" />
          Top Selling Products
        </h3>
        <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-muted-dark mt-0.5">
          Best performers this period
        </p>
      </div>

      <div className="space-y-2">
        {products.slice(0, 5).map((product, index) => (
          <div
            key={product._id}
            className="flex items-center gap-2 sm:gap-3 p-2 sm:p-2.5 bg-theme-bg-light dark:bg-theme-bg-dark rounded-lg hover:bg-theme-hover-bg-light dark:hover:bg-theme-hover-bg-dark transition-colors"
          >
            {/* Rank Badge */}
            <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
              index === 0 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
              index === 1 ? 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400' :
              index === 2 ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
              'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
            }`}>
              {index + 1}
            </div>

            {/* Product Image — only if available */}
            {product.image ? (
              <div className="flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : null}

            {/* Product Info */}
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark truncate">
                {product.name}
              </p>
              <p className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark">
                {product.quantity} units sold
              </p>
            </div>

            {/* Revenue */}
            <div className="flex-shrink-0 text-right">
              <p className="text-xs sm:text-sm font-bold text-green-600 dark:text-green-400">
                ${product.revenue.toLocaleString()}
              </p>
              <div className="flex items-center justify-end gap-1 text-xs text-green-600 dark:text-green-400">
                <TrendingUp size={11} aria-hidden="true" />
                <span className="hidden sm:inline text-xs">Revenue</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center py-6">
          <Trophy className="h-8 w-8 text-theme-text-muted-light dark:text-theme-text-muted-dark mx-auto mb-2" aria-hidden="true" />
          <p className="text-sm text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
            No product sales data available
          </p>
        </div>
      )}
    </div>
  );
}