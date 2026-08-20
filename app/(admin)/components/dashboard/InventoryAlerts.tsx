"use client";

import { AlertTriangle } from "lucide-react";

interface InventoryAlertsProps {
  products: Array<{
    _id: string;
    name: string;
    stock: number;
    threshold: number;
    image: string;
    isVariant?: boolean;
    lowVariantLabel?: string | null;
  }>;
}

export default function InventoryAlerts({ products }: InventoryAlertsProps) {
  const getStockStatus = (stock: number, threshold: number) => {
    if (stock === 0) {
      return {
        label: "Out of Stock",
        color: "text-red-700 dark:text-red-400",
        bgColor: "bg-red-100 dark:bg-red-900/30",
      };
    } else if (stock <= threshold) {
      return {
        label: "Low Stock",
        color: "text-orange-700 dark:text-orange-400",
        bgColor: "bg-orange-100 dark:bg-orange-900/30",
      };
    }
    return {
      label: "In Stock",
      color: "text-green-700 dark:text-green-400",
      bgColor: "bg-green-100 dark:bg-green-900/30",
    };
  };

  return (
    <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg sm:rounded-xl shadow-sm border border-theme-border-light dark:border-theme-border-dark p-3 sm:p-4">
      <div className="flex items-start justify-between mb-3 gap-3">
        <div className="min-w-0">
          <h3 className="text-base sm:text-lg font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500" aria-hidden="true" />
            Inventory Alerts
          </h3>
          <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-muted-dark mt-0.5">
            Products needing attention
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {products.slice(0, 5).map((product) => {
          const status = getStockStatus(product.stock, product.threshold);
          return (
            <div
              key={product._id}
              className="flex items-center gap-2 sm:gap-3 p-2 sm:p-2.5 bg-theme-bg-light dark:bg-theme-bg-dark rounded-lg hover:bg-theme-hover-bg-light dark:hover:bg-theme-hover-bg-dark transition-colors"
            >
              {/* Product Image */}
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
                <div className="flex items-center gap-1.5 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark truncate">
                    {product.name}
                  </p>
                  {product.isVariant && (
                    <span className="flex-shrink-0 text-[10px] font-medium px-1 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                      Variants
                    </span>
                  )}
                </div>

                {/* Show lowest-stock variant label if available */}
                {product.lowVariantLabel && (
                  <p className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark truncate mt-0.5">
                    Low: {product.lowVariantLabel}
                  </p>
                )}

                <div className="flex items-center gap-2 mt-0.5">
                  <span
                    className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${status.bgColor} ${status.color}`}
                  >
                    {status.label}
                  </span>
                  <span className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark">
                    {product.stock} {product.isVariant ? "total units" : "units left"}
                  </span>
                </div>
              </div>

              {/* Stock Progress */}
              <div className="flex-shrink-0 w-14 sm:w-16">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      product.stock === 0
                        ? "bg-red-500"
                        : product.stock <= product.threshold
                        ? "bg-orange-500"
                        : "bg-green-500"
                    }`}
                    style={{
                      width: `${Math.min(
                        (product.stock / Math.max(product.threshold * 2, 1)) * 100,
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {products.length === 0 && (
        <div className="text-center py-6">
          <AlertTriangle
            className="h-8 w-8 text-theme-text-muted-light dark:text-theme-text-muted-dark mx-auto mb-2"
            aria-hidden="true"
          />
          <p className="text-sm text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
            All products are well stocked
          </p>
        </div>
      )}
    </div>
  );
}