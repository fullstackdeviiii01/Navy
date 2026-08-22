// app/(admin)/analytics/views/ExecutiveCommandDashboard.tsx
"use client";

import { useState, useEffect } from "react";
import RevenueVelocityMetrics from "../components/RevenueVelocityMetrics";
import SalesTrajectoryChart from "../components/SalesTrajectoryChart";
import CategoryRevenueDistribution from "../components/CategoryRevenueDistribution";
import TopPerformingLuminaires from "../components/TopPerformingLuminaires";
import StockDepletionAlerts from "../components/StockDepletionAlerts";
import RecentOrdersLedger from "../components/RecentOrdersLedger";
import { adminDashboardApi } from "../../../../lib/api/adminDashboard";
import Loader from "../../../components/shared/Loader";
import BuildTriggerButton from "../../components/BuildTriggerButton";
import { FaSync, FaShieldAlt } from "react-icons/fa";

interface DashboardData {
  stats: {
    totalRevenue: number;
    totalOrders: number;
    totalCustomers: number;
    activeProducts: number;
    revenueGrowth: number;
    ordersGrowth: number;
    customersGrowth: number;
    productsGrowth: number;
  };
  salesData: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
  recentOrders: Array<any>;
  topProducts: Array<{
    _id: string;
    name: string;
    revenue: number;
    quantity: number;
    image: string;
  }>;
  customerMetrics: {
    newCustomers: number;
    returningCustomers: number;
    averageOrderValue: number;
    customerLifetimeValue: number;
  };
  revenueByCategory: Array<{
    category: string;
    revenue: number;
    percentage: number;
  }>;
  lowStockProducts: Array<{
    _id: string;
    name: string;
    stock: number;
    threshold: number;
    image: string;
  }>;
}

export default function ExecutiveCommandDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("7d");

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const dashboardData = await adminDashboardApi.getDashboardData(timeRange);
      setData(dashboardData);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[350px] flex items-center justify-center bg-theme-surface-light dark:bg-theme-surface-dark rounded-xl border border-theme-border-light dark:border-theme-border-dark p-12">
        <Loader />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-64 p-8 bg-theme-surface-light dark:bg-theme-surface-dark rounded-xl border border-theme-border-light dark:border-theme-border-dark text-center">
        <div className="max-w-md space-y-3">
          <p className="text-sm text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
            Failed to load dashboard data.
          </p>
          <button
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900 rounded-lg text-xs font-semibold shadow-xs"
          >
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-theme-border-light/80 dark:border-theme-border-dark/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-serif font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark tracking-tight">
              Dashboard Overview
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
              <FaShieldAlt className="w-2.5 h-2.5" />
              Live Store
            </span>
          </div>
          <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark mt-0.5">
            Overview of store sales, recent orders, and stock updates.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          {/* Time Range Selector */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 text-xs border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-neutral-500/40 cursor-pointer"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last Year</option>
          </select>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={fetchDashboardData}
            className="inline-flex items-center gap-1.5 px-3 py-2 border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark text-xs font-semibold text-theme-text-secondary-light hover:text-theme-text-primary-light hover:border-theme-hover-light rounded-lg transition-all"
          >
            <FaSync className="w-3 h-3" />
            <span>Refresh</span>
          </button>

          {/* Rebuild Trigger Button */}
          <BuildTriggerButton />
        </div>
      </div>

      {/* 1. Core Financial & Metric Ribbon */}
      <RevenueVelocityMetrics stats={data.stats} />

      {/* 2. Sales Trajectory & Orders Chart */}
      <SalesTrajectoryChart data={data.salesData} timeRange={timeRange} />

      {/* 3. Category Share Distribution */}
      <CategoryRevenueDistribution data={data.revenueByCategory} />

      {/* 4. Top Selling Models & Inventory Warnings Split */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        <TopPerformingLuminaires products={data.topProducts} />
        <StockDepletionAlerts products={data.lowStockProducts} />
      </div>

      {/* 5. Recent Orders Table */}
      <RecentOrdersLedger orders={data.recentOrders} />
    </div>
  );
}
