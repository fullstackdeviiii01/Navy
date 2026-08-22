// app/(admin)/access-control/components/RoleGovernanceTable.tsx
"use client";

import { Shield, ShieldCheck, UserCheck } from "lucide-react";

interface RoleUser {
  _id: string;
  uid: string;
  email: string;
  name: string;
  role: string;
  is_active: boolean;
  is_banned: boolean;
  customer_since: string;
  last_login_at: string;
  order_count: number;
  total_spent: number;
}

interface RoleGovernanceTableProps {
  users: RoleUser[];
  onPromoteClick: (user: RoleUser) => void;
}

export default function RoleGovernanceTable({
  users,
  onPromoteClick,
}: RoleGovernanceTableProps) {
  if (users.length === 0) {
    return (
      <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-xl border border-theme-border-light dark:border-theme-border-dark p-12 text-center text-xs text-theme-text-muted-light">
        No accounts match the role filter.
      </div>
    );
  }

  return (
    <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-xl border border-theme-border-light dark:border-theme-border-dark overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-theme-card-light/70 dark:bg-theme-card-dark/50 border-b border-theme-border-light dark:border-theme-border-dark text-[11px] uppercase tracking-wider text-theme-text-secondary-light dark:text-theme-text-secondary-dark font-semibold">
              <th className="py-3 px-4">Member</th>
              <th className="py-3 px-4">Current Permission Tier</th>
              <th className="py-3 px-4">Account Status</th>
              <th className="py-3 px-4">Created Date</th>
              <th className="py-3 px-4 text-right">Role Elevation</th>
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
                  {/* Member */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-800 dark:text-neutral-200 font-bold shrink-0">
                        {u.name ? u.name.charAt(0).toUpperCase() : "U"}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark truncate">
                          {u.name || "Unnamed"}
                        </p>
                        <p className="text-[11px] text-theme-text-muted-light truncate">
                          {u.email}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Tier */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                        isAdmin
                          ? "bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300"
                          : "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
                      }`}
                    >
                      {isAdmin ? <ShieldCheck className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
                      {u.role || "user"}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        u.is_active && !u.is_banned
                          ? "bg-green-100 dark:bg-green-950/60 text-green-800 dark:text-green-300"
                          : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600"
                      }`}
                    >
                      {u.is_banned ? "Restricted" : u.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>

                  {/* Date */}
                  <td className="py-3.5 px-4 whitespace-nowrap text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
                    {u.customer_since
                      ? new Date(u.customer_since).toLocaleDateString()
                      : "N/A"}
                  </td>

                  {/* Elevation Action */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    {isAdmin ? (
                      <span className="text-[11px] text-theme-text-muted-light font-medium italic">
                        Administrator
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onPromoteClick(u)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900 text-xs font-semibold shadow-xs hover:shadow active:scale-[0.99] transition-all"
                      >
                        <UserCheck className="w-3 h-3" />
                        <span>Promote to Admin</span>
                      </button>
                    )}
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
