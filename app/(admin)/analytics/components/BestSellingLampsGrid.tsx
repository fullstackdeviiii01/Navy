// app/(admin)/analytics/components/BestSellingLampsGrid.tsx
"use client";

import { useState } from "react";
import { Trophy, TrendingUp, ArrowRight, Package, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

interface ProductItem {
  _id: string;
  name: string;
  revenue: number;
  quantity: number;
  image?: string;
  isDeleted?: boolean;
}

interface BestSellingLampsGridProps {
  products: ProductItem[];
}

function ProductThumbnail({
  src,
  alt,
  isDeleted,
}: {
  src?: string;
  alt: string;
  isDeleted?: boolean;
}) {
  const [imgError, setImgError] = useState(false);

  if (isDeleted || !src || imgError) {
    return (
      <div className="w-11 h-11 rounded-lg border border-theme-border-light dark:border-theme-border-dark bg-neutral-100 dark:bg-neutral-800 flex flex-col items-center justify-center text-neutral-400 shrink-0 p-0.5 text-center">
        {isDeleted ? (
          <>
            <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-[7px] font-bold uppercase text-amber-600 dark:text-amber-400 leading-tight mt-0.5">
              Deleted
            </span>
          </>
        ) : (
          <Package className="w-4 h-4 text-neutral-400" />
        )}
      </div>
    );
  }

  return (
    <div className="w-11 h-11 rounded-lg overflow-hidden border border-theme-border-light dark:border-theme-border-dark bg-black/5 shrink-0">
      <img
        src={src}
        alt={alt}
        onError={() => setImgError(true)}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
      />
    </div>
  );
}

export default function BestSellingLampsGrid({ products = [] }: BestSellingLampsGridProps) {
  const router = useRouter();

  return (
    <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-2xl border border-theme-border-light dark:border-theme-border-dark p-5 sm:p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-theme-border-light/80 dark:border-theme-border-dark/80">
        <div>
          <h3 className="text-base font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>Top Selling Products</span>
          </h3>
          <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark mt-0.5">
            Leading sales and revenue contributors.
          </p>
        </div>
        <button
          type="button"
          onClick={() => router.push("/admin/products")}
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
        >
          <span>All Products</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      <div className="space-y-2.5">
        {products.slice(0, 5).map((product, idx) => (
          <div
            key={product._id || idx}
            onClick={() => {
              if (product._id && !product.isDeleted) {
                router.push(`/admin/products/${product._id}`);
              }
            }}
            className={`flex items-center gap-3.5 p-3 rounded-xl border border-theme-border-light/70 dark:border-theme-border-dark/70 bg-theme-bg-light/40 dark:bg-theme-bg-dark/40 transition-all ${
              product.isDeleted
                ? "opacity-85 cursor-default"
                : "hover:border-neutral-900 dark:hover:border-neutral-100 cursor-pointer group"
            }`}
          >
            {/* Rank Badge */}
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                idx === 0
                  ? "bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-300"
                  : idx === 1
                  ? "bg-neutral-200 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200"
                  : idx === 2
                  ? "bg-orange-100 text-orange-900 dark:bg-orange-950/80 dark:text-orange-300"
                  : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800/60 dark:text-neutral-400"
              }`}
            >
              {idx + 1}
            </div>

            {/* Thumbnail with robust error fallback */}
            <ProductThumbnail
              src={product.image}
              alt={product.name}
              isDeleted={product.isDeleted}
            />

            {/* Title & Units */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <p className="text-xs sm:text-sm font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark truncate group-hover:text-theme-hover-light transition-colors">
                  {product.name}
                </p>
                {product.isDeleted && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-300 font-semibold border border-amber-500/30">
                    Deleted
                  </span>
                )}
              </div>
              <p className="text-[11px] text-theme-text-muted-light mt-0.5">
                {product.quantity} units sold
              </p>
            </div>

            {/* Total Revenue Contribution */}
            <div className="text-right shrink-0">
              <p className="text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400">
                Rs. {Math.round(product.revenue || 0).toLocaleString()}
              </p>
              <div className="flex items-center justify-end gap-1 text-[10px] text-theme-text-muted-light">
                <TrendingUp className="w-3 h-3 text-emerald-500" />
                <span>Revenue</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center py-10 text-xs text-theme-text-muted-light">
          No product sales recorded for this period.
        </div>
      )}
    </div>
  );
}
