// app/(admin)/returns/views/AdminReturnsDirectory.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  RotateCcw,
  Search,
  Filter,
  RefreshCw,
  Clock,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Landmark,
  Smartphone,
  Eye,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  Package,
} from "lucide-react";
import { adminReturnsApi } from "../../../../lib/api/returns";
import { formatPrice } from "../../../../lib/utils/formatPrice";
import AdminReturnDetailModal from "../components/AdminReturnDetailModal";

export default function AdminReturnsDirectory() {
  const [returns, setReturns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiedRma, setCopiedRma] = useState<string | null>(null);

  // Filters & Pagination
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1 });
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    refunded: 0,
    totalRefundedAmount: 0,
  });

  // Active Detail Modal
  const [selectedReturnId, setSelectedReturnId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchReturns();
  }, [statusFilter, page]);

  const fetchReturns = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await adminReturnsApi.getAll({
        status: statusFilter !== "all" ? statusFilter : undefined,
        search: searchQuery.trim() || undefined,
        page,
        limit: 15,
      });

      setReturns(data.returns || []);
      setPagination(data.pagination || { total: 0, totalPages: 1 });
      if (data.stats) {
        setStats(data.stats);
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch return claims");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchReturns();
  };

  const copyRma = (rma: string) => {
    navigator.clipboard.writeText(rma);
    setCopiedRma(rma);
    setTimeout(() => setCopiedRma(null), 2000);
  };

  const openDetail = (id: string) => {
    setSelectedReturnId(id);
    setIsModalOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300";
      case "refunded":
        return "bg-green-100 dark:bg-green-950/60 text-green-800 dark:text-green-300 border-green-300";
      case "rejected":
        return "bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-300";
      case "pending":
      default:
        return "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300";
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-theme-border-light dark:border-theme-border-dark">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark tracking-tight">
            Returns & Refunds Hub
          </h1>
          <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark mt-0.5">
            Review customer claims, verify returned packages, and disburse refund payouts.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchReturns}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark text-xs font-semibold hover:border-theme-hover-light transition-colors self-start sm:self-auto"
        >
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
          <span>Refresh</span>
        </button>
      </div>

      {/* 2. KPI Metric Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Claims */}
        <div className="p-4 rounded-xl border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark space-y-1">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-theme-text-muted-light">
            Total Claims
          </span>
          <p className="text-2xl font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark">
            {stats.total}
          </p>
        </div>

        {/* Pending Review */}
        <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 space-y-1">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-amber-700 dark:text-amber-300">
            Pending Review
          </span>
          <p className="text-2xl font-bold text-amber-800 dark:text-amber-200">
            {stats.pending}
          </p>
        </div>

        {/* Approved / Awaiting Payout */}
        <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 space-y-1">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-emerald-700 dark:text-emerald-300">
            Approved Claims
          </span>
          <p className="text-2xl font-bold text-emerald-800 dark:text-emerald-200">
            {stats.approved}
          </p>
        </div>

        {/* Total Refunded Sum */}
        <div className="p-4 rounded-xl border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark space-y-1">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-theme-text-muted-light">
            Settled Refunds
          </span>
          <p className="text-xl font-bold text-theme-hover-light dark:text-theme-hover-dark">
            {formatPrice(stats.totalRefundedAmount)}
          </p>
        </div>
      </div>

      {/* 3. Filter & Search Toolbar */}
      <div className="p-4 rounded-xl border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-text-muted-light" />
          <input
            type="text"
            placeholder="Search by RMA # or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-theme-bg-light dark:bg-theme-bg-dark border border-theme-border-light dark:border-theme-border-dark rounded-lg text-xs focus:outline-none focus:border-theme-hover-light"
          />
        </form>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
          {["all", "pending", "approved", "rejected", "refunded"].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => {
                setStatusFilter(st);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors whitespace-nowrap ${
                statusFilter === st
                  ? "bg-theme-card-light dark:bg-theme-card-dark text-theme-hover-light dark:text-theme-hover-dark border border-theme-hover-light/60 shadow-xs"
                  : "text-theme-text-secondary-light hover:text-theme-text-primary-light"
              }`}
            >
              {st === "all" ? "All Claims" : st}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Returns Manifest Table */}
      <div className="rounded-xl border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-theme-border-light dark:border-theme-border-dark bg-theme-bg-light/50 dark:bg-theme-bg-dark/30 text-[10px] uppercase font-bold text-theme-text-muted-light">
                <th className="py-3.5 px-4">RMA / Date</th>
                <th className="py-3.5 px-4">Order #</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Items / Reason</th>
                <th className="py-3.5 px-4">Refund Amount</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Payout Account</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-theme-border-light/60 dark:divide-theme-border-dark/60">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-theme-text-muted-light">
                    <RefreshCw size={20} className="animate-spin mx-auto mb-2 text-theme-hover-light" />
                    <span>Loading return claims...</span>
                  </td>
                </tr>
              ) : returns.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-theme-text-muted-light">
                    <Package size={24} className="mx-auto mb-2 opacity-50" />
                    <span>No return claims match the selected filters.</span>
                  </td>
                </tr>
              ) : (
                returns.map((ret: any) => (
                  <tr
                    key={ret._id}
                    className="hover:bg-theme-card-light/40 dark:hover:bg-theme-card-dark/30 transition-colors"
                  >
                    {/* RMA / Date */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                          {ret.rma_number}
                        </span>
                        <button
                          type="button"
                          onClick={() => copyRma(ret.rma_number)}
                          className="text-theme-text-muted-light hover:text-theme-text-primary-light"
                          title="Copy RMA"
                        >
                          {copiedRma === ret.rma_number ? (
                            <Check size={11} className="text-emerald-600" />
                          ) : (
                            <Copy size={11} />
                          )}
                        </button>
                      </div>
                      <span className="text-[10px] text-theme-text-muted-light block mt-0.5">
                        {new Date(ret.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </td>

                    {/* Order # */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <Link
                        href={`/admin/orders/${ret.order_id?._id || ret.order_id}`}
                        className="font-semibold text-theme-hover-light hover:underline"
                      >
                        #{ret.order_id?.order_number || "View Order"}
                      </Link>
                    </td>

                    {/* Customer */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <p className="font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark truncate max-w-[140px]">
                        {ret.user_id?.name || "Guest Customer"}
                      </p>
                      <p className="text-[10px] text-theme-text-muted-light truncate max-w-[140px]">
                        {ret.user_id?.email || ret.guest_email || "N/A"}
                      </p>
                    </td>

                    {/* Items / Reason */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark">
                        {ret.items?.length || 1} item{ret.items?.length !== 1 ? "s" : ""}
                      </span>
                      <span className="text-[10px] capitalize text-theme-text-muted-light block">
                        {ret.return_reason.replace("_", " ")}
                      </span>
                    </td>

                    {/* Refund Amount */}
                    <td className="py-3.5 px-4 whitespace-nowrap font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                      {formatPrice(ret.refund_amount)}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase border ${getStatusBadge(
                          ret.status
                        )}`}
                      >
                        {ret.status}
                      </span>
                    </td>

                    {/* Payout Account */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {ret.payout_details ? (
                        <div className="flex items-center gap-1.5 text-[11px]">
                          {ret.payout_details.method === "bank_transfer" ? (
                            <Landmark size={12} className="text-emerald-600" />
                          ) : (
                            <Smartphone size={12} className="text-rose-600" />
                          )}
                          <span className="font-medium truncate max-w-[120px]">
                            {ret.payout_details.bank_or_wallet_name}
                          </span>
                        </div>
                      ) : ret.status === "approved" ? (
                        <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-200">
                          Awaiting Bank Info
                        </span>
                      ) : (
                        <span className="text-[10px] text-theme-text-muted-light">—</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => openDetail(ret._id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900 rounded text-xs font-semibold transition-all shadow-xs"
                      >
                        <Eye size={12} />
                        <span>
                          {ret.status === "pending"
                            ? "Review"
                            : ret.status === "approved" && ret.payout_details
                            ? "Settle Payout"
                            : "Details"}
                        </span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 5. Pagination Footer */}
        {pagination.totalPages > 1 && (
          <div className="p-4 border-t border-theme-border-light dark:border-theme-border-dark flex items-center justify-between text-xs text-theme-text-muted-light">
            <span>
              Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} total claims)
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded border border-theme-border-light hover:text-theme-text-primary-light disabled:opacity-40"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={page === pagination.totalPages}
                className="p-1.5 rounded border border-theme-border-light hover:text-theme-text-primary-light disabled:opacity-40"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 6. Detail Modal */}
      {selectedReturnId && (
        <AdminReturnDetailModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedReturnId(null);
          }}
          returnId={selectedReturnId}
          onRefresh={fetchReturns}
        />
      )}
    </div>
  );
}
