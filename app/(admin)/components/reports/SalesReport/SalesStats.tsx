// app/(admin)/components/reports/reports/SalesReport/SalesStats.tsx
"use client";
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart } from "lucide-react";

interface SalesStatsProps {
  summary: {
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
    revenueGrowth: number;
    ordersGrowth: number;
    previousRevenue: number;
    previousOrders: number;
  };
}

export default function SalesStats({ summary }: SalesStatsProps) {
  return (
    <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg border border-theme-border-light dark:border-theme-border-dark p-3 sm:p-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-1.5 sm:p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
            <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-muted-dark">
              Total Revenue
            </p>
            <p className="text-lg sm:text-xl font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark">
              ${summary.totalRevenue.toLocaleString()}
            </p>
            <div className="flex items-center gap-1 mt-1">
              {summary.revenueGrowth >= 0 ? (
                <TrendingUp className="w-3 h-3 text-green-600" />
              ) : (
                <TrendingDown className="w-3 h-3 text-red-600" />
              )}
              <span
                className={`text-xs font-medium ${
                  summary.revenueGrowth >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {Math.abs(summary.revenueGrowth).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg border border-theme-border-light dark:border-theme-border-dark p-3 sm:p-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-1.5 sm:p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
            <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-muted-dark">
              Total Orders
            </p>
            <p className="text-lg sm:text-xl font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark">
              {summary.totalOrders.toLocaleString()}
            </p>
            <div className="flex items-center gap-1 mt-1">
              {summary.ordersGrowth >= 0 ? (
                <TrendingUp className="w-3 h-3 text-green-600" />
              ) : (
                <TrendingDown className="w-3 h-3 text-red-600" />
              )}
              <span
                className={`text-xs font-medium ${
                  summary.ordersGrowth >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {Math.abs(summary.ordersGrowth).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg border border-theme-border-light dark:border-theme-border-dark p-3 sm:p-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-1.5 sm:p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
            <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-muted-dark">
              Avg Order Value
            </p>
            <p className="text-lg sm:text-xl font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark">
              ${summary.averageOrderValue.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg border border-theme-border-light dark:border-theme-border-dark p-3 sm:p-4">
        <div>
          <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-muted-dark mb-1.5 sm:mb-2">
            Previous Period
          </p>
          <p className="text-sm text-theme-text-primary-light dark:text-theme-text-primary-dark">
            Revenue: ${summary.previousRevenue.toLocaleString()}
          </p>
          <p className="text-sm text-theme-text-primary-light dark:text-theme-text-primary-dark">
            Orders: {summary.previousOrders.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}