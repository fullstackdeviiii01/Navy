// app/(admin)/analytics/components/TopPerformingLuminaires.tsx
"use client";

import { Trophy, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";

interface TopPerformingLuminairesProps {
  products: Array<{
    _id: string;
    name: string;
    revenue: number;
    quantity: number;
    image: string;
  }>;
}

export default function TopPerformingLuminaires({ products }: TopPerformingLuminairesProps) {
  const router = useRouter();

  return (
    <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-xl border border-theme-border-light dark:border-theme-border-dark p-4 sm:p-5 shadow-xs space-y-4">
      <div className="border-b border-theme-border-light/80 dark:border-theme-border-dark/80 pb-3 flex items-center justify-between">
        <div>
          <h3 className="text-base font-serif font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark flex items-center gap-2">
            <Trophy className="h-4 w-4 text-amber-500" />
            <span>Top Selling Products</span>
          </h3>
          <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark mt-0.5">
            Best selling products in this period.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {products.slice(0, 5).map((product, index) => (
          <div
            key={product._id}
            onClick={() => router.push(`/admin/products/${product._id}`)}
            className="flex items-center gap-3 p-2.5 rounded-xl border border-theme-border-light/60 dark:border-theme-border-dark/60 bg-theme-bg-light/50 dark:bg-theme-bg-dark/40 hover:border-theme-hover-light cursor-pointer transition-all group"
          >
            {/* Rank Monogram */}
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                index === 0
                  ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                  : index === 1
                  ? "bg-neutral-200 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-300"
                  : index === 2
                  ? "bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300"
                  : "bg-neutral-100 text-neutral-700 dark:bg-neutral-800/60 dark:text-neutral-400"
              }`}
            >
              {index + 1}
            </div>

            {/* Thumbnail */}
            {product.image ? (
              <div className="w-10 h-10 rounded-lg overflow-hidden border border-theme-border-light dark:border-theme-border-dark bg-black/5 shrink-0">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            ) : null}

            {/* Product Meta */}
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark truncate group-hover:text-theme-hover-light transition-colors">
                {product.name}
              </p>
              <p className="text-[11px] text-theme-text-muted-light">
                {product.quantity} units sold
              </p>
            </div>

            {/* Revenue Contribution */}
            <div className="text-right shrink-0">
              <p className="text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400">
                Rs. {product.revenue.toLocaleString()}
              </p>
              <div className="flex items-center justify-end gap-1 text-[10px] text-emerald-600 dark:text-emerald-400">
                <TrendingUp size={10} />
                <span>Sales</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center py-8 text-xs text-theme-text-muted-light">
          No product sales recorded for this period.
        </div>
      )}
    </div>
  );
}
