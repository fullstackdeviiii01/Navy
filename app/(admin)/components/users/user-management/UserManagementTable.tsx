// UserManagementTable.tsx
"use client";

import { FaEye, FaUserShield, FaBan, FaCheck } from "react-icons/fa";

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
}

interface UserManagementTableProps {
  users: User[];
  onViewDetails: (user: User) => void;
  onPromoteToAdmin: (userId: string) => void;
  onToggleStatus: (
    userId: string,
    action: "ban" | "unban" | "activate" | "deactivate"
  ) => void;
}

export default function UserManagementTable({
  users,
  onViewDetails,
  onPromoteToAdmin,
  onToggleStatus,
}: UserManagementTableProps) {
  if (users.length === 0) {
    return (
      <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg shadow overflow-hidden border border-theme-border-light dark:border-theme-border-dark">
        <div className="text-center py-8 sm:py-10 lg:py-12">
          <p className="text-theme-text-muted-light dark:text-theme-text-muted-dark text-sm sm:text-base">
            No users found matching your criteria.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg shadow overflow-hidden border border-theme-border-light dark:border-theme-border-dark">
      <div className="overflow-x-auto -mx-2 sm:mx-0">
        <div className="min-w-full inline-block align-middle">
          <table className="min-w-full divide-y divide-theme-border-light dark:divide-theme-border-dark">
            <thead className="bg-theme-bg-light dark:bg-theme-bg-dark">
              <tr>
                <th
                  scope="col"
                  className="py-2 px-3 sm:py-3 sm:px-4 lg:px-6 text-left text-xs font-medium text-theme-text-muted-light dark:text-theme-text-secondary-dark uppercase tracking-wider whitespace-nowrap"
                >
                  User
                </th>
                <th
                  scope="col"
                  className="py-2 px-3 sm:py-3 sm:px-4 lg:px-6 text-left text-xs font-medium text-theme-text-muted-light dark:text-theme-text-secondary-dark uppercase tracking-wider hidden md:table-cell"
                >
                  Role
                </th>
                <th
                  scope="col"
                  className="py-2 px-3 sm:py-3 sm:px-4 lg:px-6 text-left text-xs font-medium text-theme-text-muted-light dark:text-theme-text-secondary-dark uppercase tracking-wider whitespace-nowrap"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="py-2 px-3 sm:py-3 sm:px-4 lg:px-6 text-left text-xs font-medium text-theme-text-muted-light dark:text-theme-text-secondary-dark uppercase tracking-wider hidden sm:table-cell"
                >
                  Orders
                </th>
                <th
                  scope="col"
                  className="py-2 px-3 sm:py-3 sm:px-4 lg:px-6 text-left text-xs font-medium text-theme-text-muted-light dark:text-theme-text-secondary-dark uppercase tracking-wider hidden lg:table-cell"
                >
                  Total Spent
                </th>
                <th
                  scope="col"
                  className="py-2 px-3 sm:py-3 sm:px-4 lg:px-6 text-left text-xs font-medium text-theme-text-muted-light dark:text-theme-text-secondary-dark uppercase tracking-wider whitespace-nowrap"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-theme-surface-light dark:bg-theme-surface-dark divide-y divide-theme-border-light dark:divide-theme-border-dark">
              {users.map((user) => (
                <tr
                  key={user._id}
                  className="hover:bg-theme-hover-bg-light dark:hover:bg-theme-hover-bg-dark"
                >
                  <td className="py-2 px-3 sm:py-3 sm:px-4 lg:px-6 min-w-0">
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark truncate">
                        {user.name || "No name"}
                      </div>
                      <div className="text-xs sm:text-sm text-theme-text-muted-light dark:text-theme-text-muted-dark truncate">
                        {user.email}
                      </div>
                      <div className="md:hidden mt-1">
                        <span
                          className={`inline-flex px-1.5 py-0.5 text-xs font-semibold rounded-full ${
                            user.role === "admin"
                              ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          }`}
                        >
                          {user.role}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-2 px-3 sm:py-3 sm:px-4 lg:px-6 whitespace-nowrap hidden md:table-cell">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.role === "admin"
                          ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="py-2 px-3 sm:py-3 sm:px-4 lg:px-6 whitespace-nowrap">
                    <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-1 sm:space-y-0">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.is_active
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        }`}
                      >
                        {user.is_active ? "Active" : "Inactive"}
                      </span>
                      {user.is_banned && (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                          Banned
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-2 px-3 sm:py-3 sm:px-4 lg:px-6 whitespace-nowrap text-sm text-theme-text-primary-light dark:text-theme-text-primary-dark hidden sm:table-cell">
                    {user.order_count}
                  </td>
                  <td className="py-2 px-3 sm:py-3 sm:px-4 lg:px-6 whitespace-nowrap text-sm text-theme-text-primary-light dark:text-theme-text-primary-dark hidden lg:table-cell">
                    ${user.total_spent.toFixed(2)}
                  </td>
                  <td className="py-2 px-3 sm:py-3 sm:px-4 lg:px-6 whitespace-nowrap">
                    <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
                      <button
                        onClick={() => onViewDetails(user)}
                        className="text-theme-primary hover:text-theme-primary-hover dark:text-theme-primary dark:hover:text-theme-primary-hover p-1 sm:p-1.5 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        title="View Details"
                        aria-label="View user details"
                      >
                        <FaEye
                          className="text-sm sm:text-base"
                        />
                      </button>
                      {user.role !== "admin" && (
                        <button
                          onClick={() => onPromoteToAdmin(user._id)}
                          className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300 p-1 sm:p-1.5 rounded hover:bg-purple-50 dark:hover:bg-purple-900/20"
                          title="Promote to Admin"
                          aria-label="Promote to admin"
                        >
                          <FaUserShield
                            className="text-sm sm:text-base"
                          />
                        </button>
                      )}
                      {user.role !== "admin" && (
                        <button
                          onClick={() =>
                            onToggleStatus(
                              user._id,
                              user.is_banned ? "unban" : "ban"
                            )
                          }
                          className={`p-1 sm:p-1.5 rounded ${
                            user.is_banned
                              ? "text-green-600 hover:text-green-900 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"
                              : "text-red-600 hover:text-red-900 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                          }`}
                          title={user.is_banned ? "Unban User" : "Ban User"}
                          aria-label={user.is_banned ? "Unban user" : "Ban user"}
                        >
                          {user.is_banned ? (
                            <FaCheck
                              className="text-sm sm:text-base"
                              
                            />
                          ) : (
                            <FaBan
                              className="text-sm sm:text-base"
                              
                            />
                          )}
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
    </div>
  );
}