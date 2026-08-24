// app/(admin)/intelligence/components/SalesReportStudio.tsx
"use client";

import { useState, useEffect } from "react";
import { Download, TrendingUp, DollarSign, ShoppingCart, Percent } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { reportsApi } from "../../../../lib/api/reports";
import { exportToPDF } from "../../components/reports/export/exportUtils";
import Loader from "../../../components/shared/Loader";

interface SalesReportStudioProps {
  dateRange: string;
  customDates: { startDate: string; endDate: string };
}

export default function SalesReportStudio({
  dateRange,
  customDates,
}: SalesReportStudioProps) {
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

      const response = await reportsApi.getSalesReport(params);
      setData(response);
    } catch (error) {
      console.error("Failed to fetch sales report:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (!data) return;
    exportToPDF("sales", data, dateRange);
  };

  if (loading) {
    return (
      <div className="min-h-[300px] flex items-center justify-center bg-theme-surface-light dark:bg-theme-surface-dark rounded-xl border border-theme-border-light dark:border-theme-border-dark p-12">
        <Loader />
      </div>
    );
  }

  if (!data || !data.data) return null;

  const { summary, dailyData, topProducts } = data.data;

  return (
    <div className="space-y-6">
      {/* Header with Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-theme-surface-light dark:bg-theme-surface-dark p-4 rounded-xl border border-theme-border-light dark:border-theme-border-dark shadow-xs">
        <div>
          <h2 className="text-base font-serif font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
            Fiscal Turnover & Margin Ledger
          </h2>
          <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark mt-0.5">
            Consolidated financial telemetry for selected reporting interval.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExport}
          className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900 rounded-lg text-xs font-semibold shadow-xs hover:shadow active:scale-[0.99] transition-all self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Executive PDF</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        <div className="p-4 rounded-xl border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark space-y-1.5 shadow-xs">
          <span className="text-[11px] font-mono uppercase font-semibold text-theme-text-muted-light">
            Total Revenue
          </span>
          <p className="text-xl sm:text-2xl font-serif font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark">
            Rs. {Math.round(summary?.totalRevenue || 0).toLocaleString()}
          </p>
          <p className="text-[11px] text-theme-text-secondary-light">
            Gross invoiced turnover
          </p>
        </div>

        <div className="p-4 rounded-xl border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark space-y-1.5 shadow-xs">
          <span className="text-[11px] font-mono uppercase font-semibold text-theme-text-muted-light">
            Total Orders
          </span>
          <p className="text-xl sm:text-2xl font-serif font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark">
            {summary?.totalOrders || 0}
          </p>
          <p className="text-[11px] text-theme-text-secondary-light">
            Fulfilled customer orders
          </p>
        </div>

        <div className="p-4 rounded-xl border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark space-y-1.5 shadow-xs">
          <span className="text-[11px] font-mono uppercase font-semibold text-theme-text-muted-light">
            Avg. Order Value
          </span>
          <p className="text-xl sm:text-2xl font-serif font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark">
            Rs. {Math.round(summary?.averageOrderValue || 0).toLocaleString()}
          </p>
          <p className="text-[11px] text-theme-text-secondary-light">
            Average spent per order
          </p>
        </div>

        <div className="p-4 rounded-xl border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark space-y-1.5 shadow-xs">
          <span className="text-[11px] font-mono uppercase font-semibold text-theme-text-muted-light">
            Net Margin Estimate
          </span>
          <p className="text-xl sm:text-2xl font-serif font-bold text-emerald-600 dark:text-emerald-400">
            Rs. {Math.round((summary?.totalRevenue || 0) * 0.42).toLocaleString()}
          </p>
          <p className="text-[11px] text-theme-text-secondary-light">
            Estimated ~42% margin
          </p>
        </div>
      </div>

      {/* Chart */}
      {dailyData && dailyData.length > 0 && (
        <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-xl border border-theme-border-light dark:border-theme-border-dark p-4 sm:p-5 shadow-xs space-y-4">
          <div className="border-b border-theme-border-light/80 dark:border-theme-border-dark/80 pb-3">
            <h3 className="text-sm font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
              Daily Revenue Trajectory
            </h3>
          </div>
          <div className="h-64 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <defs>
                  <linearGradient id="colorDailyRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#88888820" vertical={false} />
                <XAxis dataKey="date" stroke="#88888880" tick={{ fontSize: 11 }} />
                <YAxis
                  stroke="#88888880"
                  tickFormatter={(val) => `Rs.${(val / 1000).toFixed(0)}k`}
                  tick={{ fontSize: 11 }}
                  width={55}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(20, 20, 20, 0.95)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                    fontSize: "12px",
                    color: "#fff",
                  }}
                  formatter={(val: number) => [`Rs. ${val.toLocaleString()}`, "Revenue"]}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="url(#colorDailyRev)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Top Models Table */}
      {topProducts && topProducts.length > 0 && (
        <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-xl border border-theme-border-light dark:border-theme-border-dark overflow-hidden shadow-xs">
          <div className="p-4 border-b border-theme-border-light dark:border-theme-border-dark">
            <h3 className="text-sm font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
              Top Selling Products
            </h3>
          </div>
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-theme-card-light/70 dark:bg-theme-card-dark/50 border-b border-theme-border-light dark:border-theme-border-dark text-[11px] uppercase tracking-wider text-theme-text-secondary-light font-semibold">
                <th className="py-2.5 px-4">Product Name</th>
                <th className="py-2.5 px-4">Units Sold</th>
                <th className="py-2.5 px-4 text-right">Revenue Generated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-theme-border-light/60 dark:divide-theme-border-dark/60">
              {topProducts.map((prod: any, i: number) => (
                <tr key={i} className="hover:bg-theme-card-light/30">
                  <td className="py-3 px-4 font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                    {prod.name}
                  </td>
                  <td className="py-3 px-4 text-theme-text-secondary-light">
                    {prod.quantity} units
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400">
                    Rs. {prod.revenue?.toLocaleString()}
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
