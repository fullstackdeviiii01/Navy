// app/(admin)/intelligence/components/InventoryValuationStudio.tsx
"use client";

import { useState, useEffect } from "react";
import { Download, Package, AlertTriangle, XCircle, DollarSign } from "lucide-react";
import { reportsApi } from "../../../../lib/api/reports";
import { exportToPDF } from "../../components/reports/export/exportUtils";
import Loader from "../../../components/shared/Loader";

export default function InventoryValuationStudio() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const response = await reportsApi.getInventoryReport();
      setData(response);
    } catch (error) {
      console.error("Failed to fetch inventory report:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (!data) return;
    exportToPDF("inventory", data, "current");
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
            Inventory & Stock Analysis
          </h2>
          <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark mt-0.5">
            Current stock levels, total inventory value, and low-stock alerts.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExport}
          className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900 rounded-lg text-xs font-semibold shadow-xs hover:shadow active:scale-[0.99] transition-all self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Inventory PDF</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        <div className="p-4 rounded-xl border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark space-y-1.5 shadow-xs">
          <span className="text-[11px] uppercase font-semibold text-theme-text-muted-light">
            Total Stock Units
          </span>
          <p className="text-xl sm:text-2xl font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark">
            {report.totalStock?.toLocaleString() || 0}
          </p>
          <p className="text-[11px] text-theme-text-secondary-light">
            All products in stock
          </p>
        </div>

        <div className="p-4 rounded-xl border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark space-y-1.5 shadow-xs">
          <span className="text-[11px] uppercase font-semibold text-theme-text-muted-light">
            Total Inventory Value
          </span>
          <p className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            Rs. {Math.round(report.totalValue || 0).toLocaleString()}
          </p>
          <p className="text-[11px] text-theme-text-secondary-light">
            Estimated retail value
          </p>
        </div>

        <div className="p-4 rounded-xl border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark space-y-1.5 shadow-xs">
          <span className="text-[11px] uppercase font-semibold text-theme-text-muted-light">
            Low Stock Alerts
          </span>
          <p className="text-xl sm:text-2xl font-bold text-amber-600 dark:text-amber-400">
            {report.lowStockCount || 0}
          </p>
          <p className="text-[11px] text-theme-text-secondary-light">
            Items below threshold
          </p>
        </div>

        <div className="p-4 rounded-xl border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark space-y-1.5 shadow-xs">
          <span className="text-[11px] uppercase font-semibold text-theme-text-muted-light">
            Out of Stock Items
          </span>
          <p className="text-xl sm:text-2xl font-bold text-rose-600 dark:text-rose-400">
            {report.outOfStockCount || 0}
          </p>
          <p className="text-[11px] text-theme-text-secondary-light">
            Currently unavailable
          </p>
        </div>
      </div>

      {/* Out of Stock Section */}
      {report.outOfStockProducts && report.outOfStockProducts.length > 0 && (
        <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-xl border border-theme-border-light dark:border-theme-border-dark overflow-hidden shadow-xs">
          <div className="p-4 border-b border-theme-border-light dark:border-theme-border-dark">
            <h3 className="text-sm font-semibold text-rose-600 dark:text-rose-400">
              Out of Stock Products
            </h3>
          </div>
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-theme-card-light/70 dark:bg-theme-card-dark/50 border-b border-theme-border-light dark:border-theme-border-dark text-[11px] uppercase tracking-wider text-theme-text-secondary-light font-semibold">
                <th className="py-2.5 px-4">Product Name</th>
                <th className="py-2.5 px-4">Category</th>
                <th className="py-2.5 px-4 text-right">Price</th>
                <th className="py-2.5 px-4 text-right">Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-theme-border-light/60 dark:divide-theme-border-dark/60">
              {report.outOfStockProducts.map((p: any, i: number) => (
                <tr key={i} className="hover:bg-theme-card-light/30">
                  <td className="py-3 px-4 font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                    {p.name}
                  </td>
                  <td className="py-3 px-4 text-theme-text-secondary-light">
                    {p.category || "Standard"}
                  </td>
                  <td className="py-3 px-4 text-right">
                    Rs. {p.price?.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-rose-600 dark:text-rose-400">
                    0 units
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
