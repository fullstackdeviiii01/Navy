// app/(admin)/intelligence/components/IntelligenceFilterToolbar.tsx
"use client";

import { TrendingUp, ShoppingBag, Users, Package } from "lucide-react";

interface IntelligenceFilterToolbarProps {
  activeReport: "sales" | "products" | "customers" | "inventory";
  onReportChange: (report: "sales" | "products" | "customers" | "inventory") => void;
  dateRange: string;
  onDateRangeChange: (range: string) => void;
  customDates: { startDate: string; endDate: string };
  onCustomDatesChange: (dates: { startDate: string; endDate: string }) => void;
}

export default function IntelligenceFilterToolbar({
  activeReport,
  onReportChange,
  dateRange,
  onDateRangeChange,
  customDates,
  onCustomDatesChange,
}: IntelligenceFilterToolbarProps) {
  const tabs = [
    { id: "sales", label: "Sales Reports", icon: TrendingUp },
    { id: "products", label: "Product Performance", icon: ShoppingBag },
    { id: "customers", label: "Customer Analytics", icon: Users },
    { id: "inventory", label: "Inventory Stock", icon: Package },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-theme-border-light/80 dark:border-theme-border-dark/80">
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark tracking-tight">
            Reports & Analytics
          </h1>
          <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark mt-0.5">
            Analyze sales revenue, top products, customer growth, and inventory stock.
          </p>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-2">
          <select
            value={dateRange}
            onChange={(e) => onDateRangeChange(e.target.value)}
            className="px-3.5 py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-neutral-500/40 text-xs cursor-pointer"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last 1 Year</option>
            <option value="custom">Custom Date Range</option>
          </select>
        </div>
      </div>

      {/* Custom Dates Picker */}
      {dateRange === "custom" && (
        <div className="flex flex-wrap items-center gap-3 p-3.5 bg-theme-surface-light dark:bg-theme-surface-dark rounded-xl border border-theme-border-light dark:border-theme-border-dark text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-theme-text-secondary-light">From:</span>
            <input
              type="date"
              value={customDates.startDate}
              onChange={(e) =>
                onCustomDatesChange({ ...customDates, startDate: e.target.value })
              }
              className="px-3 py-1.5 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-theme-text-secondary-light">To:</span>
            <input
              type="date"
              value={customDates.endDate}
              onChange={(e) =>
                onCustomDatesChange({ ...customDates, endDate: e.target.value })
              }
              className="px-3 py-1.5 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark"
            />
          </div>
        </div>
      )}

      {/* Domain Report Tabs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeReport === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onReportChange(tab.id as any)}
              className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                isActive
                  ? "border-neutral-900 bg-neutral-900 text-white dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-900 shadow-xs"
                  : "border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-secondary-light dark:text-theme-text-secondary-dark hover:border-theme-hover-light"
              }`}
            >
              <div
                className={`p-2 rounded-lg ${
                  isActive
                    ? "bg-white/10 dark:bg-black/10 text-white dark:text-neutral-900"
                    : "bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200"
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold truncate flex-1">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
