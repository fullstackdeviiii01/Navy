// app/(admin)/analytics/views/StoreExecutiveDashboard.tsx
"use client";

import { useState, useEffect } from "react";
import { adminDashboardApi } from "../../../../lib/api/adminDashboard";
import DashboardHeaderStats from "../components/DashboardHeaderStats";
import InteractiveRevenueChart from "../components/InteractiveRevenueChart";
import QuickActionHub from "../components/QuickActionHub";
import RealtimeSalesRadar from "../components/RealtimeSalesRadar";
import BestSellingLampsGrid from "../components/BestSellingLampsGrid";
import InventoryHealthRadar from "../components/InventoryHealthRadar";
import LiveOrdersPulse from "../components/LiveOrdersPulse";
import Loader from "../../../components/shared/Loader";
import { RefreshCw, Sparkles } from "lucide-react";

export default function StoreExecutiveDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState("30d");

  useEffect(() => {
    fetchDashboard(false);

    // Silent background auto-sync every 15 seconds (no full page reload or flashing)
    const interval = setInterval(() => {
      adminDashboardApi
        .getDashboardData(timeRange)
        .then((freshData) => {
          if (freshData) setData(freshData);
        })
        .catch(() => {});
    }, 15000);

    // Also re-sync silently when the admin switches back to this browser tab
    const handleFocus = () => {
      adminDashboardApi
        .getDashboardData(timeRange)
        .then((freshData) => {
          if (freshData) setData(freshData);
        })
        .catch(() => {});
    };
    window.addEventListener("focus", handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
    };
  }, [timeRange]);

  const fetchDashboard = async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await adminDashboardApi.getDashboardData(timeRange);
      setData(response);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const ranges = [
    { id: "7d", label: "7 Days" },
    { id: "30d", label: "30 Days" },
    { id: "90d", label: "90 Days" },
    { id: "1y", label: "1 Year" },
  ];

  if (loading) {
    return (
      <div className="min-h-[500px] flex items-center justify-center bg-theme-surface-light dark:bg-theme-surface-dark rounded-2xl border border-theme-border-light dark:border-theme-border-dark p-12">
        <Loader />
      </div>
    );
  }

  const stats = data?.stats || {
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    activeProducts: 0,
    revenueGrowth: 0,
    ordersGrowth: 0,
    customersGrowth: 0,
    productsGrowth: 0,
  };

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-200">
      {/* Executive Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-theme-border-light/80 dark:border-theme-border-dark/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark tracking-tight">
              Store Dashboard
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
              <Sparkles className="w-3 h-3" />
              Live Store
            </span>
          </div>
          <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark mt-0.5">
            Real-time sales performance, store activity, and inventory health overview.
          </p>
        </div>

        {/* Controls: Time Range Selector & Refresh */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center bg-theme-surface-light dark:bg-theme-surface-dark p-1 rounded-xl border border-theme-border-light dark:border-theme-border-dark shadow-2xs">
            {ranges.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setTimeRange(r.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  timeRange === r.id
                    ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 shadow-xs"
                    : "text-theme-text-secondary-light hover:text-theme-text-primary-light"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => fetchDashboard(true)}
            disabled={refreshing}
            className="p-2.5 rounded-xl border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-secondary-light hover:text-theme-text-primary-light hover:border-neutral-900 dark:hover:border-neutral-100 transition-all shadow-2xs disabled:opacity-50 cursor-pointer"
            title="Refresh Dashboard"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Top 4 Key Performance Metric Cards */}
      <DashboardHeaderStats stats={stats} />

      {/* Quick Actions Bar */}
      <QuickActionHub />

      {/* Primary Analytics Section: Sales Trends Chart (2/3) + Category Breakdown (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <InteractiveRevenueChart
            data={data?.salesChart || data?.salesData || []}
            timeRange={timeRange}
          />
        </div>
        <div>
          <RealtimeSalesRadar data={data?.revenueByCategory || []} />
        </div>
      </div>

      {/* Products & Inventory Section: Top Selling (1/2) + Low Stock Alerts (1/2) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BestSellingLampsGrid products={data?.topProducts || []} />
        <InventoryHealthRadar products={data?.lowStockProducts || []} />
      </div>

      {/* Recent Orders Live Pulse Feed */}
      <LiveOrdersPulse orders={data?.recentOrders || []} />
    </div>
  );
}
