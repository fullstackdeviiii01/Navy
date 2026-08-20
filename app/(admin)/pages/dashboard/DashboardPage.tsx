"use client";

import { useState, useEffect } from "react";
import DashboardStats from "../../components/dashboard/DashboardStats";
import SalesChart from "../../components/dashboard/SalesChart";
import RecentOrders from "../../components/dashboard/RecentOrders";
import TopProducts from "../../components/dashboard/TopProducts";
import RevenueBreakdown from "../../components/dashboard/RevenueBreakdown";
import InventoryAlerts from "../../components/dashboard/InventoryAlerts";
import { adminDashboardApi } from "../../../../lib/api/adminDashboard";
import Loader from "../../../components/shared/Loader";
import BuildTriggerButton from "../../components/BuildTriggerButton";

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

export default function DashboardPage() {
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
      <div className="relative h-48 sm:h-64">
        <Loader />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-64 sm:min-h-96 p-4">
        <div className="text-center p-3 sm:p-4 max-w-md mx-auto">
          <div className="text-red-500 dark:text-red-400 mb-3">
            <svg
              className="h-12 w-12 sm:h-16 sm:w-16 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <p className="text-sm sm:text-base text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-3 sm:mb-4">
            Failed to load dashboard data. Please check your connection and try
            again.
          </p>
          <button
            onClick={fetchDashboardData}
            aria-label="retry fetching dashboard"
            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-theme-primary text-white rounded-lg hover:bg-theme-primary-hover transition-colors text-xs sm:text-sm font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Header Section */}
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark">
            Dashboard Overview
          </h1>
          <p className="text-xs sm:text-sm text-theme-text-secondary-light dark:text-theme-text-secondary-dark mt-1 sm:mt-2">
            Welcome back! Here's what's happening with your store.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 sm:px-4 py-1.5 sm:py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-theme-primary text-xs sm:text-sm w-full sm:w-auto"
            aria-label="Select time range"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>

          <button
            onClick={fetchDashboardData}
            aria-label="refresh the dashboard"
            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-theme-primary text-white rounded-lg hover:bg-theme-primary-hover transition-colors text-xs sm:text-sm font-medium whitespace-nowrap"
          >
            Refresh
          </button>

          {/* Rebuild button with tooltip */}
          <div className="relative group">
            <BuildTriggerButton />
            <div className="absolute right-0 top-full mt-2 w-56 bg-gray-800 text-white text-xs rounded-lg px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-lg">
              Run after uploading products, categories, or images to apply
              changes to the live site.
              <div className="absolute -top-1.5 right-4 w-3 h-3 bg-gray-800 rotate-45" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Stats */}
      <DashboardStats stats={data.stats} />

      {/* Sales Chart — full width */}
      <SalesChart data={data.salesData} timeRange={timeRange} />

      {/* Revenue by Category — full width, internal split layout */}
      <RevenueBreakdown data={data.revenueByCategory} />

      {/* Top Products & Inventory Alerts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        <TopProducts products={data.topProducts} />
        <InventoryAlerts products={data.lowStockProducts} />
      </div>

      {/* Recent Orders */}
      <RecentOrders orders={data.recentOrders} />
    </div>
  );
}
