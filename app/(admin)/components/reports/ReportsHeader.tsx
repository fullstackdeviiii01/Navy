// app/(admin)/components/reports/ReportsHeader.tsx
"use client";

import { FileText, ShoppingBag, Users, Package } from "lucide-react";

interface ReportsHeaderProps {
  activeReport: string;
  onReportChange: (report: "sales" | "products" | "customers" | "inventory") => void;
  dateRange: string;
  onDateRangeChange: (range: string) => void;
  customDates: { startDate: string; endDate: string };
  onCustomDatesChange: (dates: { startDate: string; endDate: string }) => void;
}

export default function ReportsHeader({
  activeReport,
  onReportChange,
  dateRange,
  onDateRangeChange,
  customDates,
  onCustomDatesChange,
}: ReportsHeaderProps) {
  const reports = [
    { id: "sales", label: "Sales Report", icon: FileText },
    { id: "products", label: "Product Performance", icon: ShoppingBag },
    { id: "customers", label: "Customer Analytics", icon: Users },
    { id: "inventory", label: "Inventory Report", icon: Package },
  ];

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark">
            Reports & Analytics
          </h1>
          <p className="text-xs sm:text-sm text-theme-text-secondary-light dark:text-theme-text-secondary-dark mt-1">
            Generate and export detailed business reports
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={dateRange}
            onChange={(e) => onDateRangeChange(e.target.value)}
            className="px-3 sm:px-4 py-1.5 sm:py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-theme-primary text-xs sm:text-sm w-full sm:w-auto"
            aria-label="Select date range"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>
      </div>

      {dateRange === "custom" && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-3 sm:p-4 bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg border border-theme-border-light dark:border-theme-border-dark">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            <label className="text-xs sm:text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
              From:
            </label>
            <input
              type="date"
              value={customDates.startDate}
              onChange={(e) =>
                onCustomDatesChange({ ...customDates, startDate: e.target.value })
              }
              className="px-3 py-1.5 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-theme-primary text-sm"
              aria-label="Start date"
            />
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            <label className="text-xs sm:text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
              To:
            </label>
            <input
              type="date"
              value={customDates.endDate}
              onChange={(e) =>
                onCustomDatesChange({ ...customDates, endDate: e.target.value })
              }
              className="px-3 py-1.5 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-theme-primary text-sm"
              aria-label="End date"
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        {reports.map((report) => {
          const Icon = report.icon;
          const isActive = activeReport === report.id;

          return (
            <button
              key={report.id}
              onClick={() => onReportChange(report.id as any)}
              className={`flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg border-2 transition-all ${
                isActive
                  ? "border-theme-primary bg-theme-primary/5 dark:bg-theme-primary/10"
                  : "border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark hover:border-theme-primary/50"
              }`}
            >
              <div
                className={`p-1.5 sm:p-2 rounded-lg ${
                  isActive
                    ? "bg-theme-primary text-white"
                    : "bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-secondary-light dark:text-theme-text-secondary-dark"
                }`}
              >
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <span
                className={`text-xs sm:text-sm font-medium text-left flex-1 ${
                  isActive
                    ? "text-theme-primary"
                    : "text-theme-text-primary-light dark:text-theme-text-primary-dark"
                }`}
              >
                <span className="hidden sm:inline">{report.label}</span>
                <span className="sm:hidden">
                  {report.id === "sales" && "Sales"}
                  {report.id === "products" && "Products"}
                  {report.id === "customers" && "Customers"}
                  {report.id === "inventory" && "Inventory"}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}