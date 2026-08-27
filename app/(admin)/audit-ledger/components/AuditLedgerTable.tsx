// app/(admin)/audit-ledger/components/AuditLedgerTable.tsx
"use client";

import { Eye, Shield, Globe, Clock, ChevronLeft, ChevronRight } from "lucide-react";

interface LoginActivity {
  _id: string;
  email: string;
  name: string;
  login_at: string;
  ip: string;
  method: string;
  user_agent?: string;
}

interface AuditLedgerTableProps {
  activities: LoginActivity[];
  onViewUserDetails: (user: LoginActivity) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function AuditLedgerTable({
  activities,
  onViewUserDetails,
  currentPage,
  totalPages,
  onPageChange,
}: AuditLedgerTableProps) {
  if (activities.length === 0) {
    return (
      <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-xl border border-theme-border-light dark:border-theme-border-dark p-12 text-center text-xs text-theme-text-muted-light">
        No authentication events found for the selected interval.
      </div>
    );
  }

  return (
    <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-xl border border-theme-border-light dark:border-theme-border-dark overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-theme-card-light/70 dark:bg-theme-card-dark/50 border-b border-theme-border-light dark:border-theme-border-dark text-[11px] uppercase tracking-wider text-theme-text-secondary-light dark:text-theme-text-secondary-dark font-semibold">
              <th className="py-3 px-4">User / Customer</th>
              <th className="py-3 px-4">Login Method</th>
              <th className="py-3 px-4">IP Address</th>
              <th className="py-3 px-4">Browser / Device</th>
              <th className="py-3 px-4">Login Time</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-theme-border-light/60 dark:divide-theme-border-dark/60">
            {activities.map((a, i) => (
              <tr
                key={a._id || i}
                className="hover:bg-theme-card-light/40 dark:hover:bg-theme-card-dark/30 transition-colors"
              >
                {/* User */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-800 dark:text-neutral-200 font-bold shrink-0">
                      {a.name ? a.name.charAt(0).toUpperCase() : "U"}
                    </div>
                    <div>
                      <p className="font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                        {a.name || "Member"}
                      </p>
                      <p className="text-[11px] text-theme-text-muted-light">
                        {a.email}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Method */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                    {a.method || "password"}
                  </span>
                </td>

                {/* IP */}
                <td className="py-3.5 px-4 whitespace-nowrap text-[11px] text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
                  {a.ip || "127.0.0.1"}
                </td>

                {/* Agent */}
                <td className="py-3.5 px-4 max-w-[200px] truncate text-[11px] text-theme-text-muted-light" title={a.user_agent}>
                  {a.user_agent || "Browser Client"}
                </td>

                {/* Timestamp */}
                <td className="py-3.5 px-4 whitespace-nowrap text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
                  {a.login_at ? new Date(a.login_at).toLocaleString() : "Recent"}
                </td>

                {/* Action */}
                <td className="py-3.5 px-4 text-right whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => onViewUserDetails(a)}
                    className="p-1.5 text-theme-text-muted-light hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                    title="View User Details"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 sm:p-4 border-t border-theme-border-light dark:border-theme-border-dark text-xs">
          <span className="text-theme-text-muted-light">
            Page {currentPage} of {totalPages}
          </span>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="px-3 py-1.5 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-secondary-light disabled:opacity-40 disabled:cursor-not-allowed hover:border-theme-hover-light transition-colors inline-flex items-center gap-1"
            >
              <ChevronLeft className="w-3 h-3" />
              <span>Previous</span>
            </button>
            <button
              type="button"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
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
