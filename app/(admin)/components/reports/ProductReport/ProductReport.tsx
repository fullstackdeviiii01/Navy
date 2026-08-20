// app/(admin)/components/reports/reports/ProductReport.tsx
"use client";

import { useState, useEffect } from "react";
import { Download, Package, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { reportsApi } from "../../../../../lib/api/reports";
import { exportToPDF } from "../export/exportUtils";
import Loader from "../../../../components/shared/Loader";

interface ProductReportProps {
  dateRange: string;
  customDates: { startDate: string; endDate: string };
}

export default function ProductReport({ dateRange, customDates }: ProductReportProps) {
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
      <div className="relative h-64">
        <Loader />
      </div>
    );
  }

  if (!data) return null;

  const report = data.data;

  return (
    <div className="space-y-4 sm:space-y-5 lg:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
          Product Performance Report
        </h2>
        <button
          onClick={handleExport}
          className="flex items-center justify-center sm:justify-start gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-theme-primary text-white rounded-lg hover:bg-theme-primary-hover transition-colors text-sm font-medium w-full sm:w-auto"
        >
          <Download className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="hidden xs:inline">Export PDF</span>
          <span className="xs:hidden">Export</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg border border-theme-border-light dark:border-theme-border-dark p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <Package className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-muted-dark">
                Products Sold
              </p>
              <p className="text-lg sm:text-xl font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                {report.totalProducts}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg border border-theme-border-light dark:border-theme-border-dark p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-muted-dark">
                Units Sold
              </p>
              <p className="text-lg sm:text-xl font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                {report.totalUnitsSold.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg border border-theme-border-light dark:border-theme-border-dark p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-muted-dark">
                Total Revenue
              </p>
              <p className="text-lg sm:text-xl font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                ${report.totalRevenue.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg border border-theme-border-light dark:border-theme-border-dark p-4 sm:p-5 lg:p-6">
        <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark mb-3 sm:mb-4">
          Top 10 Products by Revenue
        </h3>
        <div className="h-48 sm:h-56 lg:h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={report.topPerformers}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="name"
                tick={{ fill: "#9CA3AF", fontSize: 10 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis tick={{ fill: "#9CA3AF", fontSize: 10 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1F2937",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                formatter={(value) => [`$${value}`, "Revenue"]}
              />
              <Bar dataKey="revenue" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg border border-theme-border-light dark:border-theme-border-dark p-4 sm:p-5 lg:p-6">
        <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark mb-3 sm:mb-4">
          Detailed Product Performance
        </h3>
        <div className="overflow-x-auto -mx-2 sm:mx-0">
          <div className="min-w-full inline-block align-middle">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-theme-border-light dark:border-theme-border-dark">
                  <th className="text-left py-2 px-3 sm:py-3 sm:px-4 text-xs font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark whitespace-nowrap">
                    Rank
                  </th>
                  <th className="text-left py-2 px-3 sm:py-3 sm:px-4 text-xs font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark whitespace-nowrap min-w-[150px]">
                    Product
                  </th>
                  <th className="text-right py-2 px-3 sm:py-3 sm:px-4 text-xs font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark whitespace-nowrap">
                    Units Sold
                  </th>
                  <th className="text-right py-2 px-3 sm:py-3 sm:px-4 text-xs font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark whitespace-nowrap">
                    Orders
                  </th>
                  <th className="text-right py-2 px-3 sm:py-3 sm:px-4 text-xs font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark whitespace-nowrap">
                    Revenue
                  </th>
                </tr>
              </thead>
              <tbody>
                {report.products.slice(0, 20).map((product: any, index: number) => (
                  <tr
                    key={index}
                    className="border-b border-theme-border-light dark:border-theme-border-dark hover:bg-theme-hover-bg-light dark:hover:bg-theme-hover-bg-dark"
                  >
                    <td className="py-2 px-3 sm:py-3 sm:px-4">
                      <span className="inline-flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-theme-primary/10 text-theme-primary text-xs font-semibold">
                        {index + 1}
                      </span>
                    </td>
                    <td className="py-2 px-3 sm:py-3 sm:px-4">
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                        {product.image && (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-8 h-8 sm:w-10 sm:h-10 rounded object-cover flex-shrink-0"
                          />
                        )}
                        <span className="text-sm text-theme-text-primary-light dark:text-theme-text-primary-dark truncate">
                          {product.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-2 px-3 sm:py-3 sm:px-4 text-right text-sm text-theme-text-primary-light dark:text-theme-text-primary-dark whitespace-nowrap">
                      {product.unitsSold}
                    </td>
                    <td className="py-2 px-3 sm:py-3 sm:px-4 text-right text-sm text-theme-text-primary-light dark:text-theme-text-primary-dark whitespace-nowrap">
                      {product.orders}
                    </td>
                    <td className="py-2 px-3 sm:py-3 sm:px-4 text-right text-sm font-semibold text-green-600 dark:text-green-400 whitespace-nowrap">
                      ${product.revenue.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}