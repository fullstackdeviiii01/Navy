"use client";

import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useState } from 'react';
import { TrendingUp } from 'lucide-react';

interface SalesChartProps {
  data: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
  timeRange: string;
}

export default function SalesChart({ data, timeRange }: SalesChartProps) {
  const [chartType, setChartType] = useState<'area' | 'line'>('area');

  const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const formatXAxis = (date: string) => {
    const d = new Date(date);
    if (timeRange === '7d') {
      return d.toLocaleDateString('en-US', { weekday: 'short' });
    } else if (timeRange === '30d') {
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } else {
      return d.toLocaleDateString('en-US', { month: 'short' });
    }
  };

  const formatTooltip = (value: number, name: string) => {
    if (name === 'revenue') {
      return [`$${value.toLocaleString()}`, 'Revenue'];
    }
    return [value.toLocaleString(), 'Orders'];
  };

  const getTickInterval = () => {
    const length = sortedData.length;
    if (length <= 7) return 0;
    if (length <= 14) return 1;
    if (length <= 30) return Math.floor(length / 5);
    return Math.floor(length / 8);
  };

  return (
    <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg sm:rounded-xl shadow-sm border border-theme-border-light dark:border-theme-border-dark p-3 sm:p-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 gap-2">
        <div className="min-w-0">
          <h3 className="text-base sm:text-lg font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark flex items-center gap-2">
            <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-theme-primary" />
            Sales Overview
          </h3>
          <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-muted-dark mt-0.5">
            Revenue and orders trend
          </p>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setChartType('area')}
            aria-label='area chart button'
            className={`px-2 sm:px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
              chartType === 'area'
                ? 'bg-theme-primary text-white'
                : 'bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-secondary-light dark:text-theme-text-secondary-dark hover:bg-theme-hover-bg-light dark:hover:bg-theme-hover-bg-dark'
            }`}
          >
            Area
          </button>
          <button
            onClick={() => setChartType('line')}
            aria-label='line chart button'
            className={`px-2 sm:px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
              chartType === 'line'
                ? 'bg-theme-primary text-white'
                : 'bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-secondary-light dark:text-theme-text-secondary-dark hover:bg-theme-hover-bg-light dark:hover:bg-theme-hover-bg-dark'
            }`}
          >
            Line
          </button>
        </div>
      </div>

      <div className="w-full h-56 sm:h-64 md:h-72 -mx-1 sm:mx-0">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'area' ? (
            <AreaChart data={sortedData} margin={{ top: 5, right: 20, left: 0, bottom: 20 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" vertical={true} />
              <XAxis
                dataKey="date"
                tickFormatter={formatXAxis}
                stroke="#9ca3af"
                tick={{ fontSize: 11, fill: '#6b7280' }}
                interval={getTickInterval()}
                angle={sortedData.length > 7 ? -45 : 0}
                textAnchor={sortedData.length > 7 ? 'end' : 'middle'}
                height={sortedData.length > 7 ? 60 : 30}
              />
              <YAxis
                yAxisId="left"
                stroke="#9ca3af"
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                tick={{ fontSize: 11, fill: '#6b7280' }}
                width={45}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#9ca3af"
                tick={{ fontSize: 11, fill: '#6b7280' }}
                width={35}
              />
              <Tooltip
                formatter={formatTooltip}
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.96)',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  fontSize: '12px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}
                labelStyle={{ color: '#1f2937', fontWeight: '600' }}
              />
              <Legend
                wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }}
                verticalAlign="bottom"
                height={16}
              />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="revenue"
                stroke="#3b82f6"
                fillOpacity={1}
                fill="url(#colorRevenue)"
                strokeWidth={2.5}
                isAnimationActive={false}
              />
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="orders"
                stroke="#10b981"
                fillOpacity={1}
                fill="url(#colorOrders)"
                strokeWidth={2.5}
                isAnimationActive={false}
              />
            </AreaChart>
          ) : (
            <LineChart data={sortedData} margin={{ top: 5, right: 20, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" vertical={true} />
              <XAxis
                dataKey="date"
                tickFormatter={formatXAxis}
                stroke="#9ca3af"
                tick={{ fontSize: 11, fill: '#6b7280' }}
                interval={getTickInterval()}
                angle={sortedData.length > 7 ? -45 : 0}
                textAnchor={sortedData.length > 7 ? 'end' : 'middle'}
                height={sortedData.length > 7 ? 60 : 30}
              />
              <YAxis
                yAxisId="left"
                stroke="#9ca3af"
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                tick={{ fontSize: 11, fill: '#6b7280' }}
                width={45}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#9ca3af"
                tick={{ fontSize: 11, fill: '#6b7280' }}
                width={35}
              />
              <Tooltip
                formatter={formatTooltip}
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.96)',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  fontSize: '12px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}
                labelStyle={{ color: '#1f2937', fontWeight: '600' }}
              />
              <Legend
                wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }}
                verticalAlign="bottom"
                height={16}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="revenue"
                stroke="#3b82f6"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5 }}
                isAnimationActive={false}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="orders"
                stroke="#10b981"
                strokeWidth={2.5}
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