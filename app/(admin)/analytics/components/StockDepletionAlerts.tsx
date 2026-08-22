// app/(admin)/analytics/components/StockDepletionAlerts.tsx
"use client";

import { AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";

interface StockDepletionAlertsProps {
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

export default function StockDepletionAlerts({ products }: StockDepletionAlertsProps) {
  const router = useRouter();

  const getStockStatus = (stock: number, threshold: number) => {
    if (stock === 0) {
      return {
        label: "Out of Stock",
        color: "text-rose-700 dark:text-rose-300",
        bgColor: "bg-rose-100 dark:bg-rose-950/60",
      };
    } else if (stock <= threshold) {
      return {
        label: "Low Stock",
        color: "text-amber-800 dark:text-amber-300",
        bgColor: "bg-amber-100 dark:bg-amber-950/60",
      };
    }
    return {
      label: "In Stock",
      color: "text-green-800 dark:text-green-300",
      bgColor: "bg-green-100 dark:bg-green-950/60",
    };
  };

  return (
    <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-xl border border-theme-border-light dark:border-theme-border-dark p-4 sm:p-5 shadow-xs space-y-4">
      <div className="border-b border-theme-border-light/80 dark:border-theme-border-dark/80 pb-3 flex items-center justify-between">
        <div>
          <h3 className="text-base font-serif font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <span>Low Stock Alerts</span>
          </h3>
          <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark mt-0.5">
            Products that need to be reordered soon.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {products.slice(0, 5).map((product) => {
          const status = getStockStatus(product.stock, product.threshold);
          return (
            <div
              key={product._id}
              onClick={() => router.push(`/admin/products/${product._id}`)}
              className="flex items-center gap-3 p-2.5 rounded-xl border border-theme-border-light/60 dark:border-theme-border-dark/60 bg-theme-bg-light/50 dark:bg-theme-bg-dark/40 hover:border-theme-hover-light cursor-pointer transition-all group"
            >
              {/* Product Image */}
              {product.image ? (
                <div className="w-10 h-10 rounded-lg overflow-hidden border border-theme-border-light dark:border-theme-border-dark bg-black/5 shrink-0">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ) : null}

              {/* Product Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 min-w-0">
                  <p className="text-xs sm:text-sm font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark truncate group-hover:text-theme-hover-light transition-colors">
                    {product.name}
                  </p>
                  {product.isVariant && (
                    <span className="shrink-0 text-[9px] font-semibold px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
                      Variants
                    </span>
                  )}
                </div>

                {product.lowVariantLabel && (
                  <p className="text-[11px] text-theme-text-muted-light truncate mt-0.5">
                    Low option: {product.lowVariantLabel}
                  </p>
                )}

                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${status.bgColor} ${status.color}`}
                  >
                    {status.label}
                  </span>
                  <span className="text-[11px] text-theme-text-muted-light">
                    {product.stock} {product.isVariant ? "total units" : "units left"}
                  </span>
                </div>
              </div>

              {/* Stock Progress Bar */}
              <div className="w-14 sm:w-16 shrink-0">
                <div className="w-full bg-black/10 dark:bg-white/10 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      product.stock === 0
                        ? "bg-rose-500"
                        : product.stock <= product.threshold
                        ? "bg-amber-500"
                        : "bg-emerald-500"
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
        <div className="text-center py-8 text-xs text-theme-text-muted-light">
          All products are well stocked.
        </div>
      )}
    </div>
  );
}
