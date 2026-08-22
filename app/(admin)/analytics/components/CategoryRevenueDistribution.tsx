// app/(admin)/analytics/components/CategoryRevenueDistribution.tsx
"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { PieChart as PieChartIcon } from "lucide-react";

interface CategoryRevenueDistributionProps {
  data: Array<{
    category: string;
    revenue: number;
    percentage: number;
  }>;
}

const LUXURY_PALETTE = [
  "#5D4037",
  "#A8752B",
  "#1B382B",
  "#0A192F",
  "#3E2723",
  "#D4A359",
  "#1A1A1A",
  "#7B1FA2",
];

export default function CategoryRevenueDistribution({ data }: CategoryRevenueDistributionProps) {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-neutral-900 text-white p-2.5 rounded-lg border border-neutral-700 shadow-xl text-xs">
          <p className="font-semibold">{payload[0].name}</p>
          <p className="text-emerald-400 font-mono mt-0.5">
            Rs. {payload[0].value.toLocaleString()}
          </p>
          <p className="text-neutral-400 text-[11px]">
            {payload[0].payload.percentage.toFixed(1)}% of total revenue
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-xl border border-theme-border-light dark:border-theme-border-dark p-4 sm:p-5 shadow-xs space-y-4">
      <div className="border-b border-theme-border-light/80 dark:border-theme-border-dark/80 pb-3">
        <h3 className="text-base font-serif font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark flex items-center gap-2">
          <PieChartIcon className="h-4 w-4 text-theme-hover-light dark:text-theme-hover-dark" />
          <span>Category Share & Distribution</span>
        </h3>
        <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark mt-0.5">
          Proportion of turnover generated across distinct lighting atelier collections.
        </p>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-6">
        {/* Donut Visualization */}
        <div className="w-full md:w-60 h-52 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data.slice(0, 8)}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                outerRadius="75%"
                innerRadius="42%"
                dataKey="revenue"
                nameKey="category"
              >
                {data.slice(0, 8).map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={LUXURY_PALETTE[index % LUXURY_PALETTE.length]}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Collection Breakdown List */}
        <div className="flex-1 w-full space-y-2.5 max-h-56 overflow-y-auto pr-1">
          {data.slice(0, 8).map((item, index) => (
            <div key={index} className="flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
                  style={{ backgroundColor: LUXURY_PALETTE[index % LUXURY_PALETTE.length] }}
                />
                <span className="font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark truncate">
                  {item.category}
                </span>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="hidden sm:block w-20 bg-black/10 dark:bg-white/10 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${item.percentage}%`,
                      backgroundColor: LUXURY_PALETTE[index % LUXURY_PALETTE.length],
                    }}
                  />
                </div>
                <div className="text-right">
                  <span className="font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark block">
                    Rs. {item.revenue.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-theme-text-muted-light">
                    {item.percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
