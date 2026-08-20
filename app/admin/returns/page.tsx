"use client";

import { useState, useEffect } from "react";
import { adminReturnsApi } from "../../../lib/api/returns";
import ReturnsTable from "../../(admin)/components/returns/ReturnsTable";
import ReturnFilters from "../../(admin)/components/returns/ReturnFilters";
import ReturnStats from "../../(admin)/components/returns/ReturnStats";
import Loader from "../../components/shared/Loader";

export default function AdminReturnsPage() {
  const [returns, setReturns] = useState<any[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    refunded: 0,
  });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    status: "all",
    search: "",
  });
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    totalPages: 0,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchReturns();
  }, [filters]);

  const fetchReturns = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await adminReturnsApi.getAllReturns(filters);
      setReturns(data.returns);
      setStats(data.stats);
      setPagination(data.pagination);
    } catch (err: any) {
      setError(err.message || "Failed to fetch returns");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (
    returnId: string,
    status: string,
    data?: any
  ) => {
    try {
      await adminReturnsApi.updateStatus(returnId, status as any, data);
      setSuccess(`Return ${status} successfully`);
      fetchReturns();
    } catch (err: any) {
      setError(err.message || "Failed to update return status");
    }
  };

  const handleRefundProcess = async (returnId: string) => {
    try {
      await adminReturnsApi.processRefund(returnId);
      setSuccess("Refund processed successfully");
      fetchReturns();
    } catch (err: any) {
      setError(err.message || "Failed to process refund");
    }
  };

  const handleCompleteBankTransfer = async (returnId: string) => {
    try {
      await adminReturnsApi.completeBankTransfer(returnId);
      setSuccess("Bank transfer marked as completed");
      fetchReturns();
    } catch (err: any) {
      setError(err.message || "Failed to complete bank transfer");
    }
  };

  const handleFilterChange = (newFilters: {
    search: string;
    status: string;
  }) => {
    setFilters({
      ...filters,
      ...newFilters,
      page: 1,
    });
  };

  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page });
  };

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError("");
        setSuccess("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  return (
    <div className="space-y-3 sm:space-y-4 lg:space-y-6 p-2 sm:p-4 lg:p-6">
      {/* Header */}
      <div>
        <h1 className="text-lg sm:text-xl lg:text-2xl md:text-3xl font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark">
          Returns & Refunds Management
        </h1>
        <p className="text-xs sm:text-sm text-theme-text-muted-light dark:text-theme-text-muted-dark mt-0.5 sm:mt-1">
          Review return requests and process refunds
        </p>
      </div>

      {/* Notifications */}
      {(error || success) && (
        <div className="fixed top-2 sm:top-4 right-2 sm:right-4 z-50 max-w-xs sm:max-w-md">
          {error && (
            <div className="p-2 sm:p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-xs sm:text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}
          {success && (
            <div className="p-2 sm:p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-xs sm:text-sm text-green-800 dark:text-green-200">
                {success}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Stats */}
      <ReturnStats stats={stats} />

      {/* Filters */}
      <ReturnFilters onFilterChange={handleFilterChange} />

      {/* Returns Table */}
      {loading ? (
        <div className="relative h-64">
          <Loader />
        </div>
      ) : (
        <div className="bg-theme-surface-light dark:bg-theme-surface-dark border border-theme-border-light dark:border-theme-border-dark rounded-xl overflow-hidden">
          <ReturnsTable
            returns={returns}
            onStatusUpdate={handleStatusUpdate}
            onRefundProcess={handleRefundProcess}
            onCompleteBankTransfer={handleCompleteBankTransfer}
          />

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row justify-between items-center p-2 sm:p-3 lg:p-4 border-t border-theme-border-light dark:border-theme-border-dark gap-2 sm:gap-0">
              <div className="text-xs sm:text-sm text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
                Page {pagination.page} of {pagination.totalPages}
              </div>
              <div className="flex gap-1 sm:gap-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-2 sm:px-3 lg:px-4 py-1.5 border border-theme-border-light dark:border-theme-border-dark rounded-lg text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-theme-hover-bg-light dark:hover:bg-theme-hover-bg-dark transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-2 sm:px-3 lg:px-4 py-1.5 border border-theme-border-light dark:border-theme-border-dark rounded-lg text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-theme-hover-bg-light dark:hover:bg-theme-hover-bg-dark transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}