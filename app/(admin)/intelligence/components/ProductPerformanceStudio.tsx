// app/(admin)/intelligence/components/ProductPerformanceStudio.tsx
"use client";

import { useState, useEffect } from "react";
import { Download, Package } from "lucide-react";
import { reportsApi } from "../../../../lib/api/reports";
import { exportToPDF } from "../../components/reports/export/exportUtils";
import Loader from "../../../components/shared/Loader";

function ProductThumbnailItem({ src, alt }: { src?: string; alt: string }) {
  const [imgError, setImgError] = useState(false);

  if (!src || imgError) {
    return (
      <div className="w-8 h-8 rounded-lg border border-theme-border-light dark:border-theme-border-dark bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-400 shrink-0">
        <Package className="w-3.5 h-3.5 text-neutral-400" />
      </div>
    );
  }

  return (
    <div className="w-8 h-8 rounded-lg overflow-hidden border border-theme-border-light dark:border-theme-border-dark bg-black/5 shrink-0">
      <img
        src={src}
        alt={alt}
        onError={() => setImgError(true)}
        className="w-full h-full object-cover"
      />
    </div>
  );
}

interface ProductPerformanceStudioProps {
  dateRange: string;
  customDates: { startDate: string; endDate: string };
}

export default function ProductPerformanceStudio({
  dateRange,
  customDates,
}: ProductPerformanceStudioProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReport();
  }, [dateRange, customDates]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const params =
        dateRange === "custom"
          ? { startDate: customDates.startDate, endDate: customDates.endDate }
          : { range: dateRange };

      const response = await reportsApi.getProductReport(params);
      setData(response);
    } catch (error) {
      console.error("Failed to fetch product report:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (!data) return;
    exportToPDF("products", data, dateRange);
  };

  if (loading) {
    return (
      <div className="min-h-[300px] flex items-center justify-center bg-theme-surface-light dark:bg-theme-surface-dark rounded-xl border border-theme-border-light dark:border-theme-border-dark p-12">
        <Loader />
      </div>
    );
  }

  if (!data || !data.data) return null;

  const report = data.data;

  return (
    <div className="space-y-6">
      {/* Header with Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-theme-surface-light dark:bg-theme-surface-dark p-4 rounded-xl border border-theme-border-light dark:border-theme-border-dark shadow-xs">
        <div>
          <h2 className="text-base font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
            Product Sales & Performance
          </h2>
          <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark mt-0.5">
            Unit sales, category performance, and itemized revenue tracking.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExport}
          className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900 rounded-lg text-xs font-semibold shadow-xs hover:shadow active:scale-[0.99] transition-all self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Product PDF</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
        <div className="p-4 rounded-xl border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark space-y-1 shadow-xs">
          <span className="text-[11px] uppercase font-semibold text-theme-text-muted-light">
            Products Sold
          </span>
          <p className="text-xl sm:text-2xl font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark">
            {report.totalProducts || 0}
          </p>
        </div>

        <div className="p-4 rounded-xl border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark space-y-1 shadow-xs">
          <span className="text-[11px] uppercase font-semibold text-theme-text-muted-light">
            Total Units Sold
          </span>
          <p className="text-xl sm:text-2xl font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark">
            {report.totalUnitsSold || 0}
          </p>
        </div>

        <div className="p-4 rounded-xl border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark space-y-1 shadow-xs">
          <span className="text-[11px] uppercase font-semibold text-theme-text-muted-light">
            Total Product Revenue
          </span>
          <p className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            Rs. {Math.round(report.totalRevenue || 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Top Models Table */}
      {report.products && report.products.length > 0 ? (
        <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-xl border border-theme-border-light dark:border-theme-border-dark overflow-hidden shadow-xs">
          <div className="p-4 border-b border-theme-border-light dark:border-theme-border-dark">
            <h3 className="text-sm font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
              Product Sales Breakdown
            </h3>
          </div>
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-theme-card-light/70 dark:bg-theme-card-dark/50 border-b border-theme-border-light dark:border-theme-border-dark text-[11px] uppercase tracking-wider text-theme-text-secondary-light font-semibold">
                <th className="py-2.5 px-4">Product Name</th>
                <th className="py-2.5 px-4">Category</th>
                <th className="py-2.5 px-4">Units Sold</th>
                <th className="py-2.5 px-4 text-right">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-theme-border-light/60 dark:divide-theme-border-dark/60">
              {report.products.slice(0, 20).map((prod: any, i: number) => (
                <tr key={i} className="hover:bg-theme-card-light/30">
                  <td className="py-3 px-4 font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark flex items-center gap-2.5">
                    <ProductThumbnailItem src={prod.image} alt={prod.name} />
                    <span className="truncate">{prod.name}</span>
                  </td>
                  <td className="py-3 px-4 text-theme-text-secondary-light">
                    {prod.category || "Handcrafted Lighting"}
                  </td>
                  <td className="py-3 px-4 text-theme-text-secondary-light font-medium">
                    {prod.unitsSold || prod.quantity || 0} units
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400">
                    Rs. {Math.round(prod.revenue || 0).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-8 text-center bg-theme-surface-light dark:bg-theme-surface-dark rounded-xl border border-theme-border-light dark:border-theme-border-dark text-xs text-theme-text-muted-light">
          No product sales recorded for this reporting period.
        </div>
      )}
    </div>
  );
}
