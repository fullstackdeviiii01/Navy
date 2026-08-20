"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { PieChartIcon } from "lucide-react";

interface RevenueBreakdownProps {
  data: Array<{
    category: string;
    revenue: number;
    percentage: number;
  }>;
}

const COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
];

export default function RevenueBreakdown({ data }: RevenueBreakdownProps) {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-2 sm:p-3 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg">
          <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
            {payload[0].name}
          </p>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            ${payload[0].value.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            {payload[0].payload.percentage.toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg sm:rounded-xl shadow-sm border border-theme-border-light dark:border-theme-border-dark p-3 sm:p-4 lg:p-6">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <h3 className="text-base sm:text-lg font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark flex items-center gap-2">
          <PieChartIcon className="h-4 w-4 sm:h-5 sm:w-5 text-theme-primary" />
          Revenue by Category
        </h3>
        <p className="text-xs sm:text-sm text-theme-text-secondary-light dark:text-theme-text-muted-dark mt-1">
          Category performance breakdown
        </p>
      </div>

      {/* Split layout: chart left, list right */}
      <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-8">
        {/* Donut Chart */}
        <div className="flex-shrink-0 w-full md:w-56 lg:w-64 h-52 sm:h-56">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data.slice(0, 6)}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                outerRadius="70%"
                innerRadius="38%"
                dataKey="revenue"
                nameKey="category"
              >
                {data.slice(0, 6).map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Category List */}
        <div className="flex-1 min-w-0">
          <div className="space-y-2 sm:space-y-3 max-h-52 overflow-y-auto pr-1">
            {data.slice(0, 8).map((item, index) => (
              <div key={index} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-xs sm:text-sm text-theme-text-secondary-light dark:text-theme-text-secondary-dark truncate">
                    {item.category}
                  </span>
                </div>
                <div className="text-right flex-shrink-0 flex items-center gap-3">
                  {/* Progress bar */}
                  <div className="hidden sm:block w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${item.percentage}%`,
                        backgroundColor: COLORS[index % COLORS.length],
                      }}
                    />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark whitespace-nowrap">
                      ${item.revenue.toLocaleString()}
                    </p>
                    <p className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark text-right">
                      {item.percentage.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}