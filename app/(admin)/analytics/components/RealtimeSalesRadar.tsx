// app/(admin)/analytics/components/RealtimeSalesRadar.tsx
"use client";

import { PieChart, Layers } from "lucide-react";
import { useRouter } from "next/navigation";

interface CategorySales {
  category: string;
  revenue: number;
  percentage: number;
}

interface RealtimeSalesRadarProps {
  data: CategorySales[];
}

const CATEGORY_COLORS = [
  "bg-emerald-500",
  "bg-amber-500",
  "bg-blue-500",
  "bg-purple-500",
  "bg-rose-500",
  "bg-indigo-500",
];

export default function RealtimeSalesRadar({ data = [] }: RealtimeSalesRadarProps) {
  const router = useRouter();

  const totalRevenue = data.reduce((sum, item) => sum + (item.revenue || 0), 0);

  return (
    <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-2xl border border-theme-border-light dark:border-theme-border-dark p-5 sm:p-6 shadow-xs space-y-4 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-theme-border-light/80 dark:border-theme-border-dark/80">
          <div>
            <h3 className="text-base font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark flex items-center gap-2">
              <PieChart className="w-4 h-4 text-theme-hover-light dark:text-theme-hover-dark" />
              <span>Sales by Category</span>
            </h3>
            <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark mt-0.5">
              Revenue distribution across lamp collections.
            </p>
          </div>
          <button
            type="button"
            onClick={() => router.push("/admin/categories")}
            className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
          >
            Categories →
          </button>
        </div>

        {/* Multi-segmented Progress Bar */}
        {data.length > 0 && (
          <div className="my-4">
            <div className="w-full h-3 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden flex gap-0.5">
              {data.map((cat, idx) => (
                <div
                  key={idx}
                  className={`${CATEGORY_COLORS[idx % CATEGORY_COLORS.length]} h-full transition-all`}
                  style={{ width: `${Math.max(2, cat.percentage)}%` }}
                  title={`${cat.category}: ${Math.round(cat.percentage)}%`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Category List Breakdown */}
        <div className="space-y-3 pt-1">
          {data.map((item, idx) => {
            const colorClass = CATEGORY_COLORS[idx % CATEGORY_COLORS.length];
            return (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${colorClass}`} />
                    <span className="font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark truncate capitalize">
                      {item.category || "Uncategorized"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-right shrink-0">
                    <span className="text-[11px] text-theme-text-muted-light">
                      {Math.round(item.percentage)}%
                    </span>
                    <span className="font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                      Rs. {item.revenue.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {data.length === 0 && (
          <div className="text-center py-10 text-xs text-theme-text-muted-light">
            No category sales recorded yet.
          </div>
        )}
      </div>

      {totalRevenue > 0 && (
        <div className="pt-3 border-t border-theme-border-light/60 dark:border-theme-border-dark/60 flex items-center justify-between text-xs">
          <span className="text-theme-text-muted-light font-medium">Total Category Revenue</span>
          <span className="font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark">
            Rs. {totalRevenue.toLocaleString()}
          </span>
        </div>
      )}
    </div>
  );
}
