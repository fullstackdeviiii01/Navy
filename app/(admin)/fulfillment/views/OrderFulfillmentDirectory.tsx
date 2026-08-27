// app/(admin)/fulfillment/views/OrderFulfillmentDirectory.tsx
"use client";

import { useState, useEffect } from "react";
import { adminOrdersApi } from "../../../../lib/api/orders";
import FulfillmentStatsRibbon from "../components/FulfillmentStatsRibbon";
import FulfillmentFilterToolbar from "../components/FulfillmentFilterToolbar";
import FulfillmentDataTable from "../components/FulfillmentDataTable";
import Loader from "../../../components/shared/Loader";
import { ChevronLeft, ChevronRight, PackageCheck, AlertCircle, CheckCircle2 } from "lucide-react";

export default function OrderFulfillmentDirectory() {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
  });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: "all",
    payment_status: "all",
    search: "",
    page: 1,
    limit: 15,
  });
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    totalPages: 1,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchOrders(false);

    // Silent background auto-sync every 15 seconds (no full page reload or flashing)
    const interval = setInterval(() => {
      fetchOrders(true);
    }, 15000);

    // Also re-sync silently when the admin switches back to this browser tab
    const handleFocus = () => {
      fetchOrders(true);
    };
    window.addEventListener("focus", handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
    };
  }, [filters]);

  const fetchOrders = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const data = await adminOrdersApi.getAll(filters);
      setOrders(data.orders || []);
      setPagination(data.pagination || { total: 0, page: 1, totalPages: 1 });

      const statsData = {
        total: data.pagination?.total || 0,
        pending: 0,
        confirmed: 0,
        processing: 0,
        shipped: 0,
        delivered: 0,
        cancelled: 0,
      };

      (data.orders || []).forEach((order: any) => {
        if ((statsData as any)[order.status] !== undefined) {
          (statsData as any)[order.status]++;
        }
      });

      setStats(statsData);
    } catch (err: any) {
      if (!silent) setError(err.message || "Failed to load orders.");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters({ ...filters, ...newFilters, page: 1 });
  };

  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page });
  };

  const handleUpdateStatus = async (
    orderId: string,
    status: string,
    trackingData?: any
  ) => {
    try {
      await adminOrdersApi.updateStatus(orderId, status, trackingData);
      setSuccess("Order status updated successfully.");
      fetchOrders();
    } catch (err: any) {
      setError(err.message || "Failed to update order status.");
    }
  };

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError("");
        setSuccess("");
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  return (
    <div className="space-y-6 pb-16">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-theme-border-light/80 dark:border-theme-border-dark/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark tracking-tight">
              Orders & Deliveries
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300">
              <PackageCheck className="w-3 h-3" />
              All Orders
            </span>
          </div>
          <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark mt-0.5">
            View customer orders, update shipping status, and manage deliveries.
          </p>
        </div>
      </div>

      {/* Floating Status Feedback */}
      {(error || success) && (
        <div className="fixed top-5 right-5 z-50 max-w-sm animate-in slide-in-from-top-3">
          {error && (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 rounded-xl shadow-lg flex items-center gap-2 text-xs text-rose-800 dark:text-rose-200">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 rounded-xl shadow-lg flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-200">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{success}</span>
            </div>
          )}
        </div>
      )}

      {/* KPI Ribbon */}
      <FulfillmentStatsRibbon stats={stats} />

      {/* Filter Toolbar */}
      <FulfillmentFilterToolbar
        filters={filters}
        onFilterChange={handleFilterChange}
      />

      {/* Table Content */}
      {loading && filters.page === 1 ? (
        <div className="min-h-[300px] flex items-center justify-center bg-theme-surface-light dark:bg-theme-surface-dark rounded-xl border border-theme-border-light dark:border-theme-border-dark p-12">
          <Loader />
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-xl border border-theme-border-light dark:border-theme-border-dark p-12 text-center space-y-2">
          <p className="text-sm font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
            No matching orders found
          </p>
          <p className="text-xs text-theme-text-muted-light">
            Try adjusting your search criteria or filters.
          </p>
        </div>
      ) : (
        <FulfillmentDataTable
          orders={orders}
          onUpdateStatus={handleUpdateStatus}
          onRefresh={fetchOrders}
        />
      )}

      {/* Pagination Footer */}
      {pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-theme-surface-light dark:bg-theme-surface-dark p-3.5 sm:p-4 rounded-xl border border-theme-border-light dark:border-theme-border-dark text-xs">
          <span className="text-theme-text-muted-light">
            Page <strong className="text-theme-text-primary-light dark:text-theme-text-primary-dark">{pagination.page}</strong> of{" "}
            <strong className="text-theme-text-primary-light dark:text-theme-text-primary-dark">{pagination.totalPages}</strong> ({pagination.total} total orders)
          </span>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="px-3 py-1.5 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-secondary-light disabled:opacity-40 disabled:cursor-not-allowed hover:border-theme-hover-light transition-colors inline-flex items-center gap-1"
            >
              <ChevronLeft className="w-3 h-3" />
              <span>Previous</span>
            </button>
            <button
              type="button"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="px-3 py-1.5 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-secondary-light disabled:opacity-40 disabled:cursor-not-allowed hover:border-theme-hover-light transition-colors inline-flex items-center gap-1"
            >
              <span>Next</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
