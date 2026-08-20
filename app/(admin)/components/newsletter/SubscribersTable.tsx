"use client";

import { FaEdit, FaTrash, FaEye, FaEyeSlash } from "react-icons/fa";

interface Subscriber {
  _id: string;
  email: string;
  name?: string;
  is_active: boolean;
  source: string;
  subscribed_at: string;
  unsubscribed_at?: string;
}

interface SubscribersTableProps {
  subscribers: Subscriber[];
  onEdit: (subscriber: Subscriber) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (subscriber: Subscriber) => void;
}

export default function SubscribersTable({
  subscribers,
  onEdit,
  onDelete,
  onToggleStatus,
}: SubscribersTableProps) {
  if (subscribers.length === 0) {
    return (
      <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg shadow p-6 sm:p-8 md:p-12 text-center border border-theme-border-light dark:border-theme-border-dark">
        <p className="text-sm sm:text-base text-theme-text-muted-light dark:text-theme-text-muted-dark">
          No subscribers found.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg shadow overflow-hidden border border-theme-border-light dark:border-theme-border-dark">
      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="min-w-full divide-y divide-theme-border-light dark:divide-theme-border-dark">
          <thead className="bg-theme-bg-light dark:bg-theme-bg-dark">
            <tr>
              <th className="px-4 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-theme-text-muted-light dark:text-theme-text-secondary-dark uppercase tracking-wider">
                Email
              </th>
              <th className="px-4 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-theme-text-muted-light dark:text-theme-text-secondary-dark uppercase tracking-wider">
                Name
              </th>
              <th className="px-4 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-theme-text-muted-light dark:text-theme-text-secondary-dark uppercase tracking-wider">
                Source
              </th>
              <th className="px-4 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-theme-text-muted-light dark:text-theme-text-secondary-dark uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-theme-text-muted-light dark:text-theme-text-secondary-dark uppercase tracking-wider">
                Subscribed
              </th>
              <th className="px-4 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-theme-text-muted-light dark:text-theme-text-secondary-dark uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-theme-surface-light dark:bg-theme-surface-dark divide-y divide-theme-border-light dark:divide-theme-border-dark">
            {subscribers.map((subscriber) => (
              <tr
                key={subscriber._id}
                className="hover:bg-theme-hover-bg-light dark:hover:bg-theme-hover-bg-dark"
              >
                <td className="px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap">
                  <div className="text-xs sm:text-sm font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark truncate max-w-[200px]">
                    {subscriber.email}
                  </div>
                </td>
                <td className="px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap">
                  <div className="text-xs sm:text-sm text-theme-text-secondary-light dark:text-theme-text-secondary-dark truncate max-w-[150px]">
                    {subscriber.name || "-"}
                  </div>
                </td>
                <td className="px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap">
                  <span className="px-2 py-0.5 sm:py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 capitalize truncate max-w-[100px] inline-block">
                    {subscriber.source}
                  </span>
                </td>
                <td className="px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap">
                  <button
                    onClick={() => onToggleStatus(subscriber)}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 sm:py-1 text-xs font-semibold rounded-full ${
                      subscriber.is_active
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                    } relative after:absolute after:inset-[-4px] after:content-['']`}
                    title={subscriber.is_active ? "Deactivate" : "Activate"}
                    aria-label={`${subscriber.is_active ? "Deactivate" : "Activate"} subscriber`}
                  >
                    {subscriber.is_active ? <FaEye /> : <FaEyeSlash />}
                    <span className="hidden sm:inline">
                      {subscriber.is_active ? "Active" : "Inactive"}
                    </span>
                    <span className="sm:hidden">
                      {subscriber.is_active ? "Act" : "Inact"}
                    </span>
                  </button>
                </td>
                <td className="px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-theme-text-primary-light dark:text-theme-text-primary-dark">
                  {new Date(subscriber.subscribed_at).toLocaleDateString()}
                </td>
                <td className="px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <button
                      onClick={() => onEdit(subscriber)}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1 relative after:absolute after:inset-[-4px] after:content-['']"
                      title="Edit"
                      aria-label="Edit subscriber"
                    >
                      <FaEdit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(subscriber._id)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1 relative after:absolute after:inset-[-4px] after:content-['']"
                      title="Delete"
                      aria-label="Delete subscriber"
                    >
                      <FaTrash className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tablet View */}
      <div className="hidden md:block lg:hidden">
        <div className="divide-y divide-theme-border-light dark:divide-theme-border-dark">
          {subscribers.map((subscriber) => (
            <div
              key={subscriber._id}
              className="p-3 sm:p-4 hover:bg-theme-hover-bg-light dark:hover:bg-theme-hover-bg-dark"
            >
              <div className="flex justify-between items-start mb-2 sm:mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark truncate">
                      {subscriber.email}
                    </h3>
                    <button
                      onClick={() => onToggleStatus(subscriber)}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full flex-shrink-0 ${
                        subscriber.is_active
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                      } relative after:absolute after:inset-[-4px] after:content-['']`}
                      title={subscriber.is_active ? "Deactivate" : "Activate"}
                      aria-label={`${subscriber.is_active ? "Deactivate" : "Activate"} subscriber`}
                    >
                      {subscriber.is_active ? <FaEye /> : <FaEyeSlash />}
                      {subscriber.is_active ? "Active" : "Inactive"}
                    </button>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
                    <span className="truncate">
                      {subscriber.name || "No name"}
                    </span>
                    <span className="px-1.5 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 capitalize">
                      {subscriber.source}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 sm:pt-3 border-t border-theme-border-light dark:border-theme-border-dark">
                <div className="text-xs sm:text-sm text-theme-text-primary-light dark:text-theme-text-primary-dark">
                  Subscribed: {new Date(subscriber.subscribed_at).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  <button
                    onClick={() => onEdit(subscriber)}
                    className="flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-medium text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 dark:text-blue-400 dark:border-blue-400 dark:hover:bg-blue-900/20 relative after:absolute after:inset-[-4px] after:content-['']"
                    aria-label="Edit subscriber"
                  >
                    <FaEdit className="w-3 h-3" />
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(subscriber._id)}
                    className="flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-medium text-red-600 border border-red-600 rounded-lg hover:bg-red-50 dark:text-red-400 dark:border-red-400 dark:hover:bg-red-900/20 relative after:absolute after:inset-[-4px] after:content-['']"
                    aria-label="Delete subscriber"
                  >
                    <FaTrash className="w-3 h-3" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden divide-y divide-theme-border-light dark:divide-theme-border-dark">
        {subscribers.map((subscriber) => (
          <div
            key={subscriber._id}
            className="p-3 hover:bg-theme-hover-bg-light dark:hover:bg-theme-hover-bg-dark"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark truncate">
                    {subscriber.email}
                  </h3>
                  <button
                    onClick={() => onToggleStatus(subscriber)}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full flex-shrink-0 ${
                      subscriber.is_active
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                    } relative after:absolute after:inset-[-4px] after:content-['']`}
                    title={subscriber.is_active ? "Deactivate" : "Activate"}
                    aria-label={`${subscriber.is_active ? "Deactivate" : "Activate"} subscriber`}
                  >
                    {subscriber.is_active ? <FaEye /> : <FaEyeSlash />}
                    {subscriber.is_active ? "Act" : "Inact"}
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
                  {subscriber.name && (
                    <span className="truncate">{subscriber.name}</span>
                  )}
                  <span className="px-1.5 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 capitalize">
                    {subscriber.source}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-theme-border-light dark:border-theme-border-dark">
              <div className="text-xs text-theme-text-primary-light dark:text-theme-text-primary-dark">
                {new Date(subscriber.subscribed_at).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onEdit(subscriber)}
                  className="flex items-center justify-center gap-1 px-1.5 py-1 text-xs font-medium text-blue-600 border border-blue-600 rounded hover:bg-blue-50 dark:text-blue-400 dark:border-blue-400 dark:hover:bg-blue-900/20 relative after:absolute after:inset-[-4px] after:content-['']"
                  aria-label="Edit subscriber"
                >
                  <FaEdit className="w-3 h-3" />
                  Edit
                </button>
                <button
                  onClick={() => onDelete(subscriber._id)}
                  className="flex items-center justify-center gap-1 px-1.5 py-1 text-xs font-medium text-red-600 border border-red-600 rounded hover:bg-red-50 dark:text-red-400 dark:border-red-400 dark:hover:bg-red-900/20 relative after:absolute after:inset-[-4px] after:content-['']"
                  aria-label="Delete subscriber"
                >
                  <FaTrash className="w-3 h-3" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}