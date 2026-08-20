// app/(admin)/components/reports/reports/SalesReport/SalesChart.tsx
"use client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface SalesChartProps {
  dailyData: Array<{ date: string; revenue: number; orders: number }>;
}

export default function SalesChart({ dailyData }: SalesChartProps) {
  return (
    <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg border border-theme-border-light dark:border-theme-border-dark p-4 sm:p-5 lg:p-6">
      <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark mb-3 sm:mb-4">
        Sales Trend
      </h3>
      <div className="h-48 sm:h-56 lg:h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={dailyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="date"
              tick={{ fill: "#9CA3AF", fontSize: 10 }}
              tickFormatter={(value) => new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            />
            <YAxis tick={{ fill: "#9CA3AF", fontSize: 10 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1F2937",
                border: "1px solid #374151",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              labelFormatter={(value) => new Date(value).toLocaleDateString()}
              formatter={(value) => [`$${value}`, "Revenue"]}
            />
            <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}