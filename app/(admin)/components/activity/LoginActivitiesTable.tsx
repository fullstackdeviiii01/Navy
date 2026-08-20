// components/activity/LoginActivitiesTable.tsx
"use client"

import { FaEye, FaChevronLeft, FaChevronRight } from "react-icons/fa"
import { formatIp } from "../../../../lib/utils/formatIp"

interface LoginActivity {
  _id: string
  email: string
  name: string
  login_at: string
  ip: string
  method: string
  user_agent?: string
}

interface LoginActivitiesTableProps {
  activities: LoginActivity[]
  onViewUserDetails: (user: LoginActivity) => void
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

const getMethodBadgeColor = (method: string) => {
  switch (method) {
    case "google":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
    case "password":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
  }
}

export default function LoginActivitiesTable({
  activities,
  onViewUserDetails,
  currentPage,
  totalPages,
  onPageChange,
}: LoginActivitiesTableProps) {

  // Build page number list with ellipsis
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
    .reduce<(number | string)[]>((acc, p, idx, arr) => {
      if (idx > 0 && (p as number) - (arr[idx - 1] as number) > 1) acc.push("...")
      acc.push(p)
      return acc
    }, [])

  if (activities.length === 0) {
    return (
      <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg shadow border border-theme-border-light dark:border-theme-border-dark">
        <div className="text-center py-8 sm:py-12 text-sm text-theme-text-muted-light dark:text-theme-text-muted-dark">
          No login activities found.
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg shadow overflow-hidden border border-theme-border-light dark:border-theme-border-dark">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-theme-border-light dark:divide-theme-border-dark">
            <thead className="bg-theme-bg-light dark:bg-theme-bg-dark">
              <tr>
                <th className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-theme-text-muted-light dark:text-theme-text-secondary-dark uppercase tracking-wider">
                  User
                </th>
                <th className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-theme-text-muted-light dark:text-theme-text-secondary-dark uppercase tracking-wider">
                  Login Time
                </th>
                <th className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-theme-text-muted-light dark:text-theme-text-secondary-dark uppercase tracking-wider">
                  Method
                </th>
                <th className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-theme-text-muted-light dark:text-theme-text-secondary-dark uppercase tracking-wider">
                  IP Address
                </th>
                <th className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-theme-text-muted-light dark:text-theme-text-secondary-dark uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-theme-surface-light dark:bg-theme-surface-dark divide-y divide-theme-border-light dark:divide-theme-border-dark">
              {activities.map((activity, index) => (
                <tr key={index} className="hover:bg-theme-hover-bg-light dark:hover:bg-theme-hover-bg-dark">
                  <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark truncate">
                        {activity.name || "No name"}
                      </div>
                      <div className="text-xs sm:text-sm text-theme-text-muted-light dark:text-theme-text-muted-dark truncate">
                        {activity.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-theme-text-primary-light dark:text-theme-text-primary-dark">
                    <div className="hidden lg:block">
                      {new Date(activity.login_at).toLocaleString()}
                    </div>
                    <div className="lg:hidden">
                      <div>{new Date(activity.login_at).toLocaleDateString()}</div>
                      <div className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark">
                        {new Date(activity.login_at).toLocaleTimeString()}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap">
                    <span className={`inline-flex px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs font-semibold rounded-full ${getMethodBadgeColor(activity.method)}`}>
                      {activity.method.charAt(0).toUpperCase() + activity.method.slice(1)}
                    </span>
                  </td>
                  <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-theme-text-primary-light dark:text-theme-text-primary-dark">
                    {formatIp(activity.ip)}
                  </td>
                  <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => onViewUserDetails(activity)}
                      className="text-theme-primary hover:text-theme-primary-hover dark:text-theme-primary dark:hover:text-theme-primary-hover text-base sm:text-lg"
                      title="View User Details"
                      aria-label={`View details for ${activity.name || activity.email}`}
                    >
                      <FaEye />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-1">
          <p className="text-xs sm:text-sm text-theme-text-muted-light dark:text-theme-text-muted-dark">
            Page{" "}
            <span className="font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
              {currentPage}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
              {totalPages}
            </span>
          </p>
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-1.5 sm:p-2 rounded-lg border border-theme-border-light dark:border-theme-border-dark text-theme-text-secondary-light dark:text-theme-text-secondary-dark hover:bg-theme-hover-bg-light dark:hover:bg-theme-hover-bg-dark disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Previous page"
            >
              <FaChevronLeft className="text-xs sm:text-sm" />
            </button>

            {pageNumbers.map((p, idx) =>
              p === "..." ? (
                <span key={`ellipsis-${idx}`} className="px-1 text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark">
                  ...
                </span>
              ) : (
                <button
                  key={p}
                  onClick={() => onPageChange(p as number)}
                  className={`min-w-[28px] sm:min-w-[32px] h-7 sm:h-8 px-1.5 sm:px-2 rounded-lg text-xs sm:text-sm font-medium border transition-colors ${
                    currentPage === p
                      ? "bg-theme-primary text-white border-theme-primary"
                      : "border-theme-border-light dark:border-theme-border-dark text-theme-text-secondary-light dark:text-theme-text-secondary-dark hover:bg-theme-hover-bg-light dark:hover:bg-theme-hover-bg-dark"
                  }`}
                  aria-label={`Page ${p}`}
                  aria-current={currentPage === p ? "page" : undefined}
                >
                  {p}
                </button>
              )
            )}

            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-1.5 sm:p-2 rounded-lg border border-theme-border-light dark:border-theme-border-dark text-theme-text-secondary-light dark:text-theme-text-secondary-dark hover:bg-theme-hover-bg-light dark:hover:bg-theme-hover-bg-dark disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Next page"
            >
              <FaChevronRight className="text-xs sm:text-sm" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}