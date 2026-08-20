// RoleManagementTable.tsx
"use client";

import { FaUserShield, FaUser } from "react-icons/fa";

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

interface RoleManagementTableProps {
  users: RoleUser[];
  onPromoteClick: (user: RoleUser) => void;
}

export default function RoleManagementTable({
  users,
  onPromoteClick,
}: RoleManagementTableProps) {
  if (users.length === 0) {
    return (
      <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg shadow overflow-hidden border border-theme-border-light dark:border-theme-border-dark">
        <div className="text-center py-6 sm:py-8 lg:py-12">
          <p className="text-xs sm:text-sm text-theme-text-muted-light dark:text-theme-text-muted-dark px-4">
            No users found matching your criteria.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg shadow overflow-hidden border border-theme-border-light dark:border-theme-border-dark">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-theme-border-light dark:divide-theme-border-dark">
          <thead className="bg-theme-bg-light dark:bg-theme-bg-dark">
            <tr>
              <th className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-theme-text-muted-light dark:text-theme-text-secondary-dark uppercase tracking-wider">
                User
              </th>
              <th className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-theme-text-muted-light dark:text-theme-text-secondary-dark uppercase tracking-wider">
                Current Role
              </th>
              <th className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-theme-text-muted-light dark:text-theme-text-secondary-dark uppercase tracking-wider">
                Status
              </th>
              <th className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-theme-text-muted-light dark:text-theme-text-secondary-dark uppercase tracking-wider">
                Activity
              </th>
              <th className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-theme-text-muted-light dark:text-theme-text-secondary-dark uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-theme-surface-light dark:bg-theme-surface-dark divide-y divide-theme-border-light dark:divide-theme-border-dark">
            {users.map((user) => (
              <tr key={user._id} className="hover:bg-theme-hover-bg-light dark:hover:bg-theme-hover-bg-dark">
                <td className="px-2 sm:px-3 lg:px-6 py-2 sm:py-4 whitespace-nowrap">
                  <div className="min-w-0">
                    <div className="text-xs sm:text-sm font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark truncate max-w-[120px] sm:max-w-[150px] md:max-w-none">
                      {user.name || "No name"}
                    </div>
                    <div className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark truncate max-w-[120px] sm:max-w-[150px] md:max-w-none">
                      {user.email}
                    </div>
                  </div>
                </td>
                <td className="px-2 sm:px-3 lg:px-6 py-2 sm:py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {user.role === "admin" ? (
                      <FaUserShield className="mr-1.5 sm:mr-2 text-purple-600 dark:text-purple-400 text-xs sm:text-sm" aria-hidden="true" />
                    ) : (
                      <FaUser className="mr-1.5 sm:mr-2 text-blue-600 dark:text-blue-400 text-xs sm:text-sm" aria-hidden="true" />
                    )}
                    <span
                      className={`inline-flex px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold rounded-full ${
                        user.role === "admin"
                          ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                          : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                      }`}
                    >
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                  </div>
                </td>
                <td className="px-2 sm:px-3 lg:px-6 py-2 sm:py-4 whitespace-nowrap">
                  <div className="flex flex-wrap gap-1 sm:gap-2">
                    <span
                      className={`inline-flex px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold rounded-full ${
                        user.is_active
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                      }`}
                    >
                      {user.is_active ? "Active" : "Inactive"}
                    </span>
                    {user.is_banned && (
                      <span className="inline-flex px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                        Banned
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-2 sm:px-3 lg:px-6 py-2 sm:py-4 whitespace-nowrap">
                  <div className="min-w-0">
                    <div className="text-xs sm:text-sm text-theme-text-primary-light dark:text-theme-text-primary-dark truncate">
                      {user.order_count} orders
                    </div>
                    <div className="text-[10px] sm:text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark truncate">
                      ${user.total_spent.toFixed(2)} spent
                    </div>
                  </div>
                </td>
                <td className="px-2 sm:px-3 lg:px-6 py-2 sm:py-4 whitespace-nowrap">
                  <div className="min-w-0">
                    {user.role !== "admin" && (
                      <button
                        onClick={() => onPromoteClick(user)}
                        className="inline-flex items-center justify-center gap-1 px-2 sm:px-3 py-1 border border-transparent text-[10px] sm:text-xs font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-purple-500 w-full sm:w-auto relative after:absolute after:inset-[-4px] after:content-['']"
                      >
                        <FaUserShield className="text-[10px] sm:text-xs" />
                        <span className="truncate">Promote</span>
                      </button>
                    )}
                    {user.role === "admin" && (
                      <span className="text-[10px] sm:text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark truncate block">
                        Admin (Cannot demote)
                      </span>
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