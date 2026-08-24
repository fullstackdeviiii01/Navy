// app/(admin)/patrons/components/PatronDataTable.tsx
"use client";

import { Eye, ShieldBan, ShieldCheck } from "lucide-react";

interface Customer {
  _id: string;
  uid: string;
  email: string;
  name: string;
  phone?: string;
  role: string;
  is_active: boolean;
  is_banned: boolean;
  order_count: number;
  total_spent: number;
  customer_since: string;
  last_login_at: string;
  addresses: any[];
  cart: any[];
  wishlist: any[];
  preferred_currency?: string;
  marketing_opt_in?: boolean;
  isGuest?: boolean;
}

interface PatronDataTableProps {
  customers: Customer[];
  onViewCustomer: (customer: Customer) => void;
  onToggleStatus: (customerId: string, currentStatus: boolean) => void;
  onToggleBan: (customerId: string, currentBanStatus: boolean) => void;
}

export default function PatronDataTable({
  customers,
  onViewCustomer,
  onToggleStatus,
  onToggleBan,
}: PatronDataTableProps) {
  if (customers.length === 0) {
    return (
      <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-xl border border-theme-border-light dark:border-theme-border-dark p-12 text-center space-y-2">
        <p className="text-sm font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
          No customers found
        </p>
        <p className="text-xs text-theme-text-muted-light">
          Try clearing your search or adjusting your filters.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-xl border border-theme-border-light dark:border-theme-border-dark overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-theme-card-light/70 dark:bg-theme-card-dark/50 border-b border-theme-border-light dark:border-theme-border-dark text-[11px] uppercase tracking-wider text-theme-text-secondary-light dark:text-theme-text-secondary-dark font-semibold">
              <th className="py-3 px-4">Customer</th>
              <th className="py-3 px-4">Account Type</th>
              <th className="py-3 px-4">Total Orders</th>
              <th className="py-3 px-4">Total Spent</th>
              <th className="py-3 px-4">Joined Date</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-theme-border-light/60 dark:divide-theme-border-dark/60">
            {customers.map((c) => (
              <tr
                key={c._id}
                className="hover:bg-theme-card-light/40 dark:hover:bg-theme-card-dark/30 transition-colors"
              >
                {/* Customer Name & Email */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-800 dark:text-neutral-200 font-bold shrink-0">
                      {c.name ? c.name.charAt(0).toUpperCase() : "C"}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark truncate">
                        {c.name || "Customer"}
                      </p>
                      <p className="text-[11px] text-theme-text-muted-light truncate">
                        {c.email}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Account Type */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  {c.isGuest ? (
                    <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300">
                      Guest Customer
                    </span>
                  ) : (
                    <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300">
                      Registered Customer
                    </span>
                  )}
                </td>

                {/* Orders */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <span className="font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                    {c.order_count}
                  </span>{" "}
                  <span className="text-[10px] text-theme-text-muted-light">
                    orders
                  </span>
                </td>

                {/* Total Spent */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <span className="font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark font-serif">
                    Rs. {c.total_spent?.toLocaleString() || "0"}
                  </span>
                </td>

                {/* Joined Date */}
                <td className="py-3.5 px-4 whitespace-nowrap text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
                  {c.customer_since
                    ? new Date(c.customer_since).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "N/A"}
                </td>

                {/* Status Badges */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        c.is_active
                          ? "bg-green-100 dark:bg-green-950/60 text-green-800 dark:text-green-300"
                          : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                      }`}
                    >
                      {c.is_active ? "Active" : "Inactive"}
                    </span>

                    {c.is_banned && (
                      <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300">
                        Banned
                      </span>
                    )}
                  </div>
                </td>

                {/* Actions */}
                <td className="py-3.5 px-4 text-right whitespace-nowrap">
                  <div className="inline-flex items-center gap-1">
                    {/* View Details */}
                    <button
                      type="button"
                      onClick={() => onViewCustomer(c)}
                      className="p-1.5 text-theme-text-muted-light hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                      title="View Customer Profile"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>

                    {/* Ban / Unban Toggle (Non-guests) */}
                    {!c.isGuest && (
                      <button
                        type="button"
                        onClick={() => onToggleBan(c._id, c.is_banned)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          c.is_banned
                            ? "text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                            : "text-theme-text-muted-light hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        }`}
                        title={c.is_banned ? "Unban Customer" : "Ban / Block Customer"}
                      >
                        <ShieldBan className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
