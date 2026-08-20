// app/admin/orders/page.tsx
"use client";

import { useState, useEffect } from "react";
import { adminOrdersApi } from "../../../lib/api/orders"
import OrdersTable from "../../(admin)/components/orders/OrdersTable";
import { OrderStats } from "../../(admin)/components/orders/OrderStats";
import OrderFilters from "../../(admin)/components/orders/OrderFilters";
import { Package } from "lucide-react";

export default function AdminOrdersPage() {
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
    limit: 10,
  });
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    totalPages: 1,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchOrders();
  }, [filters]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await adminOrdersApi.getAll(filters);
      setOrders(data.orders);
      setPagination(data.pagination);
      
      // Calculate stats
      const statsData = {
        total: data.pagination.total,
        pending: 0,
        confirmed: 0,
        processing: 0,
        shipped: 0,
        delivered: 0,
        cancelled: 0,
      };
      
      data.orders.forEach((order: any) => {
        if (statsData[order.status] !== undefined) {
          statsData[order.status]++;
        }
      });
      
      setStats(statsData);
    } catch (error: any) {
      setError(error.message || "Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters({ ...filters, ...newFilters, page: 1 });
  };

  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page });
  };

  const handleUpdateStatus = async (orderId: string, status: string, trackingData?: any) => {
  try {
    // Pass tracking data along with status
    await adminOrdersApi.updateStatus(orderId, status, trackingData);
    setSuccess("Order status updated successfully");
    fetchOrders();
  } catch (error: any) {
    setError(error.message || "Failed to update order status");
  }
};

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError("");
        setSuccess("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  if (loading && filters.page === 1) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-theme-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark">
            Order Management
          </h1>
          <p className="text-theme-text-muted-light dark:text-theme-text-muted-dark mt-2">
            Manage and track customer orders
          </p>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl px-3 py-2 shadow-lg min-w-[180px]">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-1.5 rounded-lg bg-white/20">
              <Package className="h-4 w-4 text-white" />
            </div>
            <p className="text-blue-100 text-xs sm:text-sm font-medium">Total Orders</p>
          </div>
          <p className="text-xl sm:text-3xl text-center font-bold text-white">{stats.total}</p>
        </div>
      </div>

      {/* Notifications */}
      {(error || success) && (
        <div className="fixed top-4 right-4 z-50 max-w-md">
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}
          {success && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-sm text-green-800 dark:text-green-200">
                {success}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Stats */}
      <OrderStats stats={stats} />

      {/* Filters */}
      <OrderFilters filters={filters} onFilterChange={handleFilterChange} />

      {/* Orders Table */}
      {orders.length === 0 ? (
        <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg border border-theme-border-light dark:border-theme-border-dark p-12 text-center">
          <Package
            size={48}
            className="mx-auto text-theme-text-muted-light dark:text-theme-text-muted-dark mb-3"
          />
          <p className="text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
            No orders found
          </p>
        </div>
      ) : (
        <OrdersTable
          orders={orders}
          onUpdateStatus={handleUpdateStatus}
          onRefresh={fetchOrders}
        />
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <button
            onClick={() => handlePageChange(filters.page - 1)}
            disabled={filters.page === 1}
            className="px-4 py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-theme-hover-bg-light dark:hover:bg-theme-hover-bg-dark"
          >
            Previous
          </button>
          <span className="text-theme-text-primary-light dark:text-theme-text-primary-dark">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            onClick={() => handlePageChange(filters.page + 1)}
            disabled={filters.page === pagination.totalPages}
            className="px-4 py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-theme-hover-bg-light dark:hover:bg-theme-hover-bg-dark"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}