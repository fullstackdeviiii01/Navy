// app/(admin)/analytics/components/InventoryHealthRadar.tsx
"use client";

import { AlertTriangle, ArrowRight, Package } from "lucide-react";
import { useRouter } from "next/navigation";

interface StockProduct {
  _id: string;
  name: string;
  stock: number;
  threshold: number;
  image: string;
  isVariant?: boolean;
  lowVariantLabel?: string | null;
}

interface InventoryHealthRadarProps {
  products: StockProduct[];
}

export default function InventoryHealthRadar({ products = [] }: InventoryHealthRadarProps) {
  const router = useRouter();

  return (
    <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-2xl border border-theme-border-light dark:border-theme-border-dark p-5 sm:p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-theme-border-light/80 dark:border-theme-border-dark/80">
        <div>
          <h3 className="text-base font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span>Low Stock Alerts</span>
          </h3>
          <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark mt-0.5">
            Products that require inventory reordering.
          </p>
        </div>
        <button
          type="button"
          onClick={() => router.push("/admin/products")}
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
        >
          <span>Inventory</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      <div className="space-y-2.5">
        {products.slice(0, 5).map((product) => {
          const isOut = product.stock === 0;
          const isLow = product.stock <= product.threshold;

          return (
            <div
              key={product._id}
              onClick={() => router.push(`/admin/products/${product._id}`)}
              className="flex items-center gap-3.5 p-3 rounded-xl border border-theme-border-light/70 dark:border-theme-border-dark/70 bg-theme-bg-light/40 dark:bg-theme-bg-dark/40 hover:border-neutral-900 dark:hover:border-neutral-100 transition-all cursor-pointer group"
            >
              {/* Product Thumbnail */}
              {product.image ? (
                <div className="w-11 h-11 rounded-lg overflow-hidden border border-theme-border-light dark:border-theme-border-dark bg-black/5 shrink-0">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ) : (
                <div className="w-11 h-11 rounded-lg border border-theme-border-light dark:border-theme-border-dark bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-400 shrink-0">
                  <Package className="w-5 h-5" />
                </div>
              )}

              {/* Information */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 min-w-0">
                  <p className="text-xs sm:text-sm font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark truncate group-hover:text-theme-hover-light transition-colors">
                    {product.name}
                  </p>
                  {product.isVariant && (
                    <span className="shrink-0 text-[9px] font-semibold px-1.5 py-0.2 rounded bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
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
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      isOut
                        ? "bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300"
                        : "bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300"
                    }`}
                  >
                    {isOut ? "Out of Stock" : "Low Stock"}
                  </span>
                  <span className="text-[11px] text-theme-text-muted-light">
                    {product.stock} {product.isVariant ? "total units" : "units left"}
                  </span>
                </div>
              </div>

              {/* Progress Gauge */}
              <div className="w-16 shrink-0 text-right">
                <div className="w-full bg-black/10 dark:bg-white/10 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      isOut ? "bg-rose-500" : isLow ? "bg-amber-500" : "bg-emerald-500"
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
        <div className="text-center py-10 text-xs text-theme-text-muted-light">
          All catalog products are well stocked.
        </div>
      )}
    </div>
  );
}
