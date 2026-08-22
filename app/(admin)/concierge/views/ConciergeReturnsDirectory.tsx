// app/(admin)/concierge/views/ConciergeReturnsDirectory.tsx
"use client";

import { useState, useEffect } from "react";
import { adminReturnsApi } from "../../../../lib/api/returns";
import ReturnsKpiRibbon from "../components/ReturnsKpiRibbon";
import ReturnsFilterToolbar from "../components/ReturnsFilterToolbar";
import ReturnsManifestTable from "../components/ReturnsManifestTable";
import Loader from "../../../components/shared/Loader";
import { RotateCcw, AlertCircle, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";

export default function ConciergeReturnsDirectory() {
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
    limit: 15,
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
    try {
      setLoading(true);
      const data = await adminReturnsApi.getAllReturns(filters);
      setReturns(data.returns || []);
      setStats(data.stats || { total: 0, pending: 0, approved: 0, rejected: 0, refunded: 0 });
      setPagination(data.pagination || { total: 0, page: 1, totalPages: 1 });
    } catch (err: any) {
      setError(err.message || "Failed to load returns.");
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
      setSuccess("Return status updated successfully.");
      fetchReturns();
    } catch (err: any) {
      setError(err.message || "Failed to update return status.");
    }
  };

  const handleProcessRefund = async (returnId: string) => {
    try {
      await adminReturnsApi.processRefund(returnId);
      setSuccess("Refund processed successfully.");
      fetchReturns();
    } catch (err: any) {
      setError(err.message || "Failed to process refund.");
    }
  };

  const handleFilterChange = (newFilters: any) => {
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
            <h1 className="text-xl sm:text-2xl font-serif font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark tracking-tight">
              Returns & Refunds
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300">
              <RotateCcw className="w-3 h-3" />
              Customer Returns
            </span>
          </div>
          <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark mt-0.5">
            Process customer return requests, check returned items, and issue refunds.
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

      {/* KPI Stats Ribbon */}
      <ReturnsKpiRibbon stats={stats} />

      {/* Filter Toolbar */}
      <ReturnsFilterToolbar
        filters={filters}
        onFilterChange={handleFilterChange}
      />

      {/* Main Table */}
      {loading && filters.page === 1 ? (
        <div className="min-h-[300px] flex items-center justify-center bg-theme-surface-light dark:bg-theme-surface-dark rounded-xl border border-theme-border-light dark:border-theme-border-dark p-12">
          <Loader />
        </div>
      ) : returns.length === 0 ? (
        <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-xl border border-theme-border-light dark:border-theme-border-dark p-12 text-center space-y-2">
          <p className="text-sm font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
            No return requests found
          </p>
          <p className="text-xs text-theme-text-muted-light">
            Try adjusting your search criteria or status filters.
          </p>
        </div>
      ) : (
        <ReturnsManifestTable
          returns={returns}
          onStatusUpdate={handleStatusUpdate}
          onRefundProcess={handleProcessRefund}
          onRefresh={fetchReturns}
        />
      )}

      {/* Pagination Footer */}
      {pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-theme-surface-light dark:bg-theme-surface-dark p-3.5 sm:p-4 rounded-xl border border-theme-border-light dark:border-theme-border-dark text-xs">
          <span className="text-theme-text-muted-light">
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} total returns)
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
