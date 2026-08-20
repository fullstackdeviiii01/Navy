// components/users/user-management/UserDetailsModal.tsx
import { useId } from "react";
import { formatIp } from "../../../../../lib/utils/formatIp";

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

interface UserDetailsModalProps {
  isOpen: boolean;
  user: User | null;
  onClose: () => void;
}

export default function UserDetailsModal({
  isOpen,
  user,
  onClose,
}: UserDetailsModalProps) {
  const titleId = useId();

  if (!isOpen || !user) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg p-4 sm:p-5 lg:p-6 max-w-2xl lg:max-w-4xl w-full mx-2 sm:mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4 sm:mb-5 lg:mb-6">
          <h3
            id={titleId}
            className="text-base sm:text-lg lg:text-xl font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark"
          >
            User Details
          </h3>
          <button
            onClick={onClose}
            className="text-theme-text-muted-light hover:text-theme-hover-light dark:text-theme-text-muted-dark dark:hover:text-theme-text-secondary-dark text-xl sm:text-2xl p-1"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 lg:gap-6">
          <div className="space-y-3 sm:space-y-4">
            <div>
              <h4 className="font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark mb-1.5 sm:mb-2 text-sm sm:text-base">
                Basic Information
              </h4>
              <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                <p className="break-words">
                  <span className="font-medium">Name:</span>{" "}
                  {user.name || "Not provided"}
                </p>
                <p className="break-words">
                  <span className="font-medium">Email:</span>{" "}
                  {user.email}
                </p>
                <p>
                  <span className="font-medium">Role:</span>{" "}
                  <span
                    className={`px-1.5 py-0.5 text-xs font-semibold rounded-full ${
                      user.role === "admin"
                        ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                    }`}
                  >
                    {user.role}
                  </span>
                </p>
                <p>
                  <span className="font-medium">Customer Since:</span>{" "}
                  {new Date(user.customer_since).toLocaleDateString()}
                </p>
                <p>
                  <span className="font-medium">Last Login:</span>{" "}
                  {user.last_login_at
                    ? new Date(user.last_login_at).toLocaleString()
                    : "Never"}
                </p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark mb-1.5 sm:mb-2 text-sm sm:text-base">
                Shopping Activity
              </h4>
              <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                <p>
                  <span className="font-medium">Total Orders:</span>{" "}
                  {user.order_count}
                </p>
                <p>
                  <span className="font-medium">Total Spent:</span> $
                  {user.total_spent.toFixed(2)}
                </p>
                <p>
                  <span className="font-medium">Cart Items:</span>{" "}
                  {user.cart.length}
                </p>
                <p>
                  <span className="font-medium">Wishlist Items:</span>{" "}
                  {user.wishlist.length}
                </p>
                <p>
                  <span className="font-medium">Saved Addresses:</span>{" "}
                  {user.addresses.length}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <div>
              <h4 className="font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark mb-1.5 sm:mb-2 text-sm sm:text-base">
                Account Status
              </h4>
              <div className="space-y-2 text-xs sm:text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Active:</span>
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      user.is_active
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                    }`}
                  >
                    {user.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Banned:</span>
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      user.is_banned
                        ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                    }`}
                  >
                    {user.is_banned ? "Yes" : "No"}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark mb-1.5 sm:mb-2 text-sm sm:text-base">
                Recent Login History
              </h4>
              <div className="max-h-40 sm:max-h-48 overflow-y-auto border border-theme-border-light dark:border-theme-border-dark rounded-lg p-2">
                {user.login_history.length > 0 ? (
                  user.login_history
                    .slice(-5)
                    .reverse()
                    .map((login, index) => (
                      <div
                        key={index}
                        className="text-xs py-1.5 border-b border-theme-border-light dark:border-theme-border-dark last:border-b-0"
                      >
                        <p className="truncate">
                          <span className="font-medium">Date:</span>{" "}
                          {new Date(login.at).toLocaleDateString()}
                        </p>
                        <p>
                          <span className="font-medium">Method:</span>{" "}
                          {login.method}
                        </p>
                        <p className="truncate">
                          <span className="font-medium">IP:</span>{" "}
                          {formatIp(login.ip)}
                        </p>
                      </div>
                    ))
                ) : (
                  <p className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark text-center py-2">
                    No login history
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}