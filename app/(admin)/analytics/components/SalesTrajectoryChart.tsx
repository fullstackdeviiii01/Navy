// app/(admin)/analytics/components/SalesTrajectoryChart.tsx
"use client";

import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useState } from "react";
import { TrendingUp } from "lucide-react";

interface SalesTrajectoryChartProps {
  data: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
  timeRange: string;
}

export default function SalesTrajectoryChart({ data, timeRange }: SalesTrajectoryChartProps) {
  const [chartType, setChartType] = useState<"area" | "line">("area");

  const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const formatXAxis = (date: string) => {
    const d = new Date(date);
    if (timeRange === "7d") {
      return d.toLocaleDateString("en-US", { weekday: "short" });
    } else if (timeRange === "30d") {
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } else {
      return d.toLocaleDateString("en-US", { month: "short" });
    }
  };

  const formatTooltip = (value: number, name: string) => {
    if (name === "revenue") {
      return [`Rs. ${value.toLocaleString()}`, "Gross Revenue"];
    }
    return [value.toLocaleString(), "Order Volume"];
  };

  const getTickInterval = () => {
    const length = sortedData.length;
    if (length <= 7) return 0;
    if (length <= 14) return 1;
    if (length <= 30) return Math.floor(length / 5);
    return Math.floor(length / 8);
  };

  return (
    <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-xl border border-theme-border-light dark:border-theme-border-dark p-4 sm:p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3 border-b border-theme-border-light/80 dark:border-theme-border-dark/80 pb-3">
        <div>
          <h3 className="text-base font-serif font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-theme-hover-light dark:text-theme-hover-dark" />
            <span>Revenue Trajectory & Order Pacing</span>
          </h3>
          <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark mt-0.5">
            Temporal analysis of monetary transactions and fulfillment demand.
          </p>
        </div>

        <div className="inline-flex rounded-lg border border-theme-border-light dark:border-theme-border-dark bg-theme-bg-light dark:bg-theme-bg-dark p-0.5">
          <button
            type="button"
            onClick={() => setChartType("area")}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
              chartType === "area"
                ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 shadow-xs"
                : "text-theme-text-secondary-light hover:text-theme-text-primary-light"
            }`}
          >
            Area View
          </button>
          <button
            type="button"
            onClick={() => setChartType("line")}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
              chartType === "line"
                ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 shadow-xs"
                : "text-theme-text-secondary-light hover:text-theme-text-primary-light"
            }`}
          >
            Line View
          </button>
        </div>
      </div>

      <div className="w-full h-64 sm:h-72 md:h-80">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === "area" ? (
            <AreaChart data={sortedData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#88888820" vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={formatXAxis}
                stroke="#88888880"
                tick={{ fontSize: 11 }}
                interval={getTickInterval()}
                angle={sortedData.length > 7 ? -45 : 0}
                textAnchor={sortedData.length > 7 ? "end" : "middle"}
                height={sortedData.length > 7 ? 60 : 30}
              />
              <YAxis
                yAxisId="left"
                stroke="#88888880"
                tickFormatter={(value) => `Rs.${(value / 1000).toFixed(0)}k`}
                tick={{ fontSize: 11 }}
                width={55}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#88888880"
                tick={{ fontSize: 11 }}
                width={35}
              />
              <Tooltip
                formatter={formatTooltip}
                contentStyle={{
                  backgroundColor: "rgba(20, 20, 20, 0.95)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  padding: "8px 12px",
                  fontSize: "12px",
                  color: "#fff",
                }}
                labelStyle={{ color: "#e5e7eb", fontWeight: "600" }}
              />
              <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} verticalAlign="bottom" height={16} />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="revenue"
                name="revenue"
                stroke="#10b981"
                fillOpacity={1}
                fill="url(#colorRevenue)"
                strokeWidth={2}
                isAnimationActive={false}
              />
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="orders"
                name="orders"
                stroke="#8b5cf6"
                fillOpacity={1}
                fill="url(#colorOrders)"
                strokeWidth={2}
                isAnimationActive={false}
              />
            </AreaChart>
          ) : (
            <LineChart data={sortedData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#88888820" vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={formatXAxis}
                stroke="#88888880"
                tick={{ fontSize: 11 }}
                interval={getTickInterval()}
                angle={sortedData.length > 7 ? -45 : 0}
                textAnchor={sortedData.length > 7 ? "end" : "middle"}
                height={sortedData.length > 7 ? 60 : 30}
              />
              <YAxis
                yAxisId="left"
                stroke="#88888880"
                tickFormatter={(value) => `Rs.${(value / 1000).toFixed(0)}k`}
                tick={{ fontSize: 11 }}
                width={55}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#88888880"
                tick={{ fontSize: 11 }}
                width={35}
              />
              <Tooltip
                formatter={formatTooltip}
                contentStyle={{
                  backgroundColor: "rgba(20, 20, 20, 0.95)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  padding: "8px 12px",
                  fontSize: "12px",
                  color: "#fff",
                }}
                labelStyle={{ color: "#e5e7eb", fontWeight: "600" }}
              />
              <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} verticalAlign="bottom" height={16} />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="revenue"
                name="revenue"
                stroke="#10b981"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5 }}
                isAnimationActive={false}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="orders"
                name="orders"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5 }}
                isAnimationActive={false}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
