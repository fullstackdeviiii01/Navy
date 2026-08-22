// app/(admin)/access-control/components/StaffManagementTable.tsx
"use client";

import { Eye, ShieldCheck, ShieldAlert, CheckCircle, XCircle } from "lucide-react";

interface User {
  _id: string;
  uid: string;
  email: string;
  name: string;
  role: string;
  is_active: boolean;
  is_banned: boolean;
  order_count: number;
  total_spent: number;
  customer_since: string;
  last_login_at: string;
  cart: any[];
  wishlist: any[];
  addresses: any[];
  login_history: any[];
}

interface StaffManagementTableProps {
  users: User[];
  onViewDetails: (user: User) => void;
  onPromoteToAdmin: (userId: string) => void;
  onToggleStatus: (
    userId: string,
    action: "ban" | "unban" | "activate" | "deactivate"
  ) => void;
}

export default function StaffManagementTable({
  users,
  onViewDetails,
  onPromoteToAdmin,
  onToggleStatus,
}: StaffManagementTableProps) {
  if (users.length === 0) {
    return (
      <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-xl border border-theme-border-light dark:border-theme-border-dark p-12 text-center text-xs text-theme-text-muted-light">
        No accounts found matching your query.
      </div>
    );
  }

  return (
    <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-xl border border-theme-border-light dark:border-theme-border-dark overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-theme-card-light/70 dark:bg-theme-card-dark/50 border-b border-theme-border-light dark:border-theme-border-dark text-[11px] uppercase tracking-wider text-theme-text-secondary-light dark:text-theme-text-secondary-dark font-semibold">
              <th className="py-3 px-4">Account Profile</th>
              <th className="py-3 px-4">Role Permission</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Registered On</th>
              <th className="py-3 px-4 text-right">Access Controls</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-theme-border-light/60 dark:divide-theme-border-dark/60">
            {users.map((u) => {
              const isAdmin = u.role === "admin";

              return (
                <tr
                  key={u._id}
                  className="hover:bg-theme-card-light/40 dark:hover:bg-theme-card-dark/30 transition-colors"
                >
                  {/* Profile */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-800 dark:text-neutral-200 font-bold shrink-0">
                        {u.name ? u.name.charAt(0).toUpperCase() : "U"}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark truncate">
                          {u.name || "Unnamed User"}
                        </p>
                        <p className="text-[11px] text-theme-text-muted-light truncate">
                          {u.email}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Role */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                        isAdmin
                          ? "bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300"
                          : "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
                      }`}
                    >
                      {u.role || "user"}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          u.is_active
                            ? "bg-green-100 dark:bg-green-950/60 text-green-800 dark:text-green-300"
                            : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600"
                        }`}
                      >
                        {u.is_active ? "Active" : "Inactive"}
                      </span>
                      {u.is_banned && (
                        <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300">
                          Banned
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Date */}
                  <td className="py-3.5 px-4 whitespace-nowrap text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
                    {u.customer_since
                      ? new Date(u.customer_since).toLocaleDateString()
                      : "N/A"}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-1">
                      {/* View details */}
                      <button
                        type="button"
                        onClick={() => onViewDetails(u)}
                        className="p-1.5 text-theme-text-muted-light hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                        title="View Full Profile"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      {/* Promote to Admin if not admin */}
                      {!isAdmin && (
                        <button
                          type="button"
                          onClick={() => onPromoteToAdmin(u._id)}
                          className="p-1.5 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/40 rounded-lg transition-colors"
                          title="Elevate to Administrator"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Toggle active */}
                      <button
                        type="button"
                        onClick={() =>
                          onToggleStatus(
                            u._id,
                            u.is_active ? "deactivate" : "activate"
                          )
                        }
                        className="p-1.5 text-theme-text-muted-light hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                        title={u.is_active ? "Deactivate" : "Activate"}
                      >
                        {u.is_active ? (
                          <XCircle className="w-3.5 h-3.5 text-amber-500" />
                        ) : (
                          <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                        )}
                      </button>

                      {/* Toggle ban */}
                      <button
                        type="button"
                        onClick={() =>
                          onToggleStatus(u._id, u.is_banned ? "unban" : "ban")
                        }
                        className={`p-1.5 rounded-lg transition-colors ${
                          u.is_banned
                            ? "text-rose-600 hover:bg-rose-50"
                            : "text-theme-text-muted-light hover:text-rose-600"
                        }`}
                        title={u.is_banned ? "Remove Ban" : "Ban Account"}
                      >
                        <ShieldAlert className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
