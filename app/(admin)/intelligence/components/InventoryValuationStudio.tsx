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
          <h2 className="text-base font-serif font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
            Atelier Stock Valuation & Depletion Analysis
          </h2>
          <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark mt-0.5">
            Real-time physical asset valuation, low-stock thresholds, and reorder alerts.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExport}
          className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900 rounded-lg text-xs font-semibold shadow-xs hover:shadow active:scale-[0.99] transition-all self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Valuation PDF</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        <div className="p-4 rounded-xl border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark space-y-1.5 shadow-xs">
          <span className="text-[11px] font-mono uppercase font-semibold text-theme-text-muted-light">
            Total Inventory Units
          </span>
          <p className="text-xl sm:text-2xl font-serif font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark">
            {report.totalStock?.toLocaleString() || 0}
          </p>
          <p className="text-[11px] text-theme-text-secondary-light">
            Combined active units
          </p>
        </div>

        <div className="p-4 rounded-xl border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark space-y-1.5 shadow-xs">
          <span className="text-[11px] font-mono uppercase font-semibold text-theme-text-muted-light">
            Asset Inventory Valuation
          </span>
          <p className="text-xl sm:text-2xl font-serif font-bold text-emerald-600 dark:text-emerald-400">
            Rs. {Math.round(report.totalValue || 0).toLocaleString()}
          </p>
          <p className="text-[11px] text-theme-text-secondary-light">
            Retail replacement value
          </p>
        </div>

        <div className="p-4 rounded-xl border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark space-y-1.5 shadow-xs">
          <span className="text-[11px] font-mono uppercase font-semibold text-theme-text-muted-light">
            Low Stock Alerts
          </span>
          <p className="text-xl sm:text-2xl font-serif font-bold text-amber-600 dark:text-amber-400">
            {report.lowStockCount || 0}
          </p>
          <p className="text-[11px] text-theme-text-secondary-light">
            Below replenishment threshold
          </p>
        </div>

        <div className="p-4 rounded-xl border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark space-y-1.5 shadow-xs">
          <span className="text-[11px] font-mono uppercase font-semibold text-theme-text-muted-light">
            Out of Stock Models
          </span>
          <p className="text-xl sm:text-2xl font-serif font-bold text-rose-600 dark:text-rose-400">
            {report.outOfStockCount || 0}
          </p>
          <p className="text-[11px] text-theme-text-secondary-light">
            0 units remaining
          </p>
        </div>
      </div>

      {/* Low Stock Models Table */}
      {report.lowStockProducts && report.lowStockProducts.length > 0 && (
        <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-xl border border-theme-border-light dark:border-theme-border-dark overflow-hidden shadow-xs">
          <div className="p-4 border-b border-theme-border-light dark:border-theme-border-dark">
            <h3 className="text-sm font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
              Critical Inventory Depletion Registry
            </h3>
          </div>
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-theme-card-light/70 dark:bg-theme-card-dark/50 border-b border-theme-border-light dark:border-theme-border-dark text-[11px] uppercase tracking-wider text-theme-text-secondary-light font-semibold">
                <th className="py-2.5 px-4">Luminaire Design</th>
                <th className="py-2.5 px-4">Remaining Units</th>
                <th className="py-2.5 px-4">Threshold</th>
                <th className="py-2.5 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-theme-border-light/60 dark:divide-theme-border-dark/60">
              {report.lowStockProducts.map((prod: any, i: number) => (
                <tr key={i} className="hover:bg-theme-card-light/30">
                  <td className="py-3 px-4 font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                    {prod.name}
                  </td>
                  <td className="py-3 px-4 font-bold text-rose-600 dark:text-rose-400">
                    {prod.stock} units
                  </td>
                  <td className="py-3 px-4 text-theme-text-secondary-light">
                    {prod.threshold || 10} units
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300">
                      {prod.stock === 0 ? "Out of Stock" : "Low Stock"}
                    </span>
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
