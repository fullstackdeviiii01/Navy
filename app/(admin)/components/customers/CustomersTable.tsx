// // app/(admin)/components/customers/CustomersTable.tsx
"use client";

import { FaEye, FaBan, FaCheckCircle, FaTimesCircle, FaUserSecret } from "react-icons/fa";

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
  isGuest?: boolean;
}

interface CustomersTableProps {
  customers: Customer[];
  onViewCustomer: (customer: Customer) => void;
  onToggleStatus: (customerId: string, currentStatus: boolean) => void;
  onToggleBan: (customerId: string, currentBanStatus: boolean) => void;
}

export default function CustomersTable({
  customers,
  onViewCustomer,
  onToggleStatus,
  onToggleBan,
}: CustomersTableProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = (customer: Customer) => {
    if (customer.isGuest) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 sm:py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
          <FaUserSecret className="mr-0.5 sm:mr-1" size={10} />
          Guest
        </span>
      );
    }
    if (customer.is_banned) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 sm:py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
          <FaBan className="mr-0.5 sm:mr-1" size={10} />
          Banned
        </span>
      );
    }
    if (customer.is_active) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 sm:py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
          <FaCheckCircle className="mr-0.5 sm:mr-1" size={10} />
          Active
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 sm:py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
        <FaTimesCircle className="mr-0.5 sm:mr-1" size={10} />
        Inactive
      </span>
    );
  };

  if (customers.length === 0) {
    return (
      <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg shadow border border-theme-border-light dark:border-theme-border-dark p-6 sm:p-8 lg:p-12 text-center">
        <p className="text-sm sm:text-base text-theme-text-muted-light dark:text-theme-text-muted-dark">
          No customers found matching your criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg shadow border border-theme-border-light dark:border-theme-border-dark overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="min-w-full divide-y divide-theme-border-light dark:divide-theme-border-dark">
          <thead className="bg-theme-bg-light dark:bg-theme-bg-dark">
            <tr>
              <th className="px-4 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-theme-text-muted-light dark:text-theme-text-secondary-dark uppercase tracking-wider">
                Customer
              </th>
              <th className="px-4 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-theme-text-muted-light dark:text-theme-text-secondary-dark uppercase tracking-wider">
                Contact
              </th>
              <th className="px-4 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-theme-text-muted-light dark:text-theme-text-secondary-dark uppercase tracking-wider">
                Orders
              </th>
              <th className="px-4 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-theme-text-muted-light dark:text-theme-text-secondary-dark uppercase tracking-wider">
                Total Spent
              </th>
              <th className="px-4 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-theme-text-muted-light dark:text-theme-text-secondary-dark uppercase tracking-wider">
                Joined
              </th>
              <th className="px-4 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-theme-text-muted-light dark:text-theme-text-secondary-dark uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-theme-text-muted-light dark:text-theme-text-secondary-dark uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-theme-surface-light dark:bg-theme-surface-dark divide-y divide-theme-border-light dark:divide-theme-border-dark">
            {customers.map((customer) => (
              <tr
                key={customer._id}
                className="hover:bg-theme-hover-bg-light dark:hover:bg-theme-hover-bg-dark transition-colors"
              >
                <td className="px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap">
                  <div className="text-xs sm:text-sm font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark truncate">
                    {customer.name || "N/A"}
                  </div>
                </td>
                <td className="px-4 lg:px-6 py-3 sm:py-4">
                  <div className="text-xs sm:text-sm">
                    <div className="text-theme-text-primary-light dark:text-theme-text-primary-dark truncate">
                      {customer.email}
                    </div>
                    {customer.phone && (
                      <div className="text-theme-text-muted-light dark:text-theme-text-muted-dark text-xs mt-0.5 sm:mt-1 truncate">
                        {customer.phone}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap">
                  <div className="text-xs sm:text-sm font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark">
                    {customer.order_count}
                  </div>
                </td>
                <td className="px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap">
                  <div className="text-xs sm:text-sm font-semibold text-green-600 dark:text-green-400">
                    ${customer.total_spent.toFixed(2)}
                  </div>
                </td>
                <td className="px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap">
                  <div className="text-xs sm:text-sm text-theme-text-primary-light dark:text-theme-text-primary-dark">
                    {formatDate(customer.customer_since)}
                  </div>
                </td>
                <td className="px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap">
                  {getStatusBadge(customer)}
                </td>
                <td className="px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <button
                      onClick={() => onViewCustomer(customer)}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1"
                      title="View Details"
                      aria-label={`View details for ${customer.name || "customer"}`}
                    >
                      <FaEye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                    {!customer.isGuest && (
                      <>
                        {/* <button
                          onClick={() =>
                            onToggleStatus(customer._id, customer.is_active)
                          }
                          className={`p-1 ${
                            customer.is_active
                              ? "text-orange-600 hover:text-orange-900 dark:text-orange-400"
                              : "text-green-600 hover:text-green-900 dark:text-green-400"
                          }`}
                          title={customer.is_active ? "Deactivate" : "Activate"}
                          aria-label={customer.is_active ? `Deactivate ${customer.name || "customer"}` : `Activate ${customer.name || "customer"}`}
                        >
                          {customer.is_active ? (
                            <FaTimesCircle aria-hidden="true" className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          ) : (
                            <FaCheckCircle aria-hidden="true" className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          )}
                        </button> */}
                        <button
                          onClick={() =>
                            onToggleBan(customer._id, customer.is_banned)
                          }
                          className={`p-1 ${
                            customer.is_banned
                              ? "text-green-600 hover:text-green-900 dark:text-green-400"
                              : "text-red-600 hover:text-red-900 dark:text-red-400"
                          }`}
                          title={customer.is_banned ? "Unban" : "Ban"}
                          aria-label={customer.is_banned ? `Unban ${customer.name || "customer"}` : `Ban ${customer.name || "customer"}`}
                        >
                          <FaBan className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                      </>
                    )}
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
          {customers.map((customer) => (
            <div
              key={customer._id}
              className="p-3 sm:p-4 hover:bg-theme-hover-bg-light dark:hover:bg-theme-hover-bg-dark transition-colors"
            >
              <div className="flex justify-between items-start mb-2 sm:mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark truncate">
                    {customer.name || "N/A"}
                  </h3>
                  <p className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark truncate mt-0.5">
                    {customer.email}
                  </p>
                </div>
                <div className="ml-2 flex-shrink-0">{getStatusBadge(customer)}</div>
              </div>

              <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-2 sm:mb-3 text-xs sm:text-sm">
                <div className="text-center">
                  <p className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark">
                    Orders
                  </p>
                  <p className="font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark">
                    {customer.order_count}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark">
                    Spent
                  </p>
                  <p className="font-semibold text-green-600 dark:text-green-400">
                    ${customer.total_spent.toFixed(2)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark">
                    Joined
                  </p>
                  <p className="text-theme-text-primary-light dark:text-theme-text-primary-dark">
                    {formatDate(customer.customer_since)}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-center space-x-2 sm:space-x-3 pt-2 sm:pt-3 border-t border-theme-border-light dark:border-theme-border-dark">
                <button
                  onClick={() => onViewCustomer(customer)}
                  className="flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-medium text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 dark:text-blue-400 dark:border-blue-400 dark:hover:bg-blue-900/20"
                >
                  <FaEye className="w-3 h-3" />
                  View
                </button>
                {!customer.isGuest && (
                  <>
                    <button
                      onClick={() =>
                        onToggleStatus(customer._id, customer.is_active)
                      }
                      className={`flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-medium rounded-lg border ${
                        customer.is_active
                          ? "text-orange-600 border-orange-600 hover:bg-orange-50 dark:text-orange-400 dark:border-orange-400 dark:hover:bg-orange-900/20"
                          : "text-green-600 border-green-600 hover:bg-green-50 dark:text-green-400 dark:border-green-400 dark:hover:bg-green-900/20"
                      }`}
                    >
                      {customer.is_active ? (
                        <FaTimesCircle aria-hidden="true" className="w-3 h-3" />
                      ) : (
                        <FaCheckCircle aria-hidden="true" className="w-3 h-3" />
                      )}
                      {customer.is_active ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      onClick={() =>
                        onToggleBan(customer._id, customer.is_banned)
                      }
                      className={`flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-medium rounded-lg border ${
                        customer.is_banned
                          ? "text-green-600 border-green-600 hover:bg-green-50 dark:text-green-400 dark:border-green-400 dark:hover:bg-green-900/20"
                          : "text-red-600 border-red-600 hover:bg-red-50 dark:text-red-400 dark:border-red-400 dark:hover:bg-red-900/20"
                      }`}
                    >
                      <FaBan className="w-3 h-3" />
                      {customer.is_banned ? "Unban" : "Ban"}
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden divide-y divide-theme-border-light dark:divide-theme-border-dark">
        {customers.map((customer) => (
          <div
            key={customer._id}
            className="p-3 hover:bg-theme-hover-bg-light dark:hover:bg-theme-hover-bg-dark transition-colors"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark truncate">
                    {customer.name || "N/A"}
                  </h3>
                  {getStatusBadge(customer)}
                </div>
                <p className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark truncate">
                  {customer.email}
                </p>
                {customer.phone && (
                  <p className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark mt-0.5 truncate">
                    {customer.phone}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
              <div>
                <span className="text-theme-text-muted-light dark:text-theme-text-muted-dark">
                  Orders:
                </span>
                <span className="ml-1 font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark">
                  {customer.order_count}
                </span>
              </div>
              <div>
                <span className="text-theme-text-muted-light dark:text-theme-text-muted-dark">
                  Spent:
                </span>
                <span className="ml-1 font-semibold text-green-600 dark:text-green-400">
                  ${customer.total_spent.toFixed(2)}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-theme-text-muted-light dark:text-theme-text-muted-dark">
                  Joined:
                </span>
                <span className="ml-1 text-theme-text-primary-light dark:text-theme-text-primary-dark">
                  {formatDate(customer.customer_since)}
                </span>
              </div>
            </div>

            <div
              className={`grid ${customer.isGuest ? "grid-cols-1" : "grid-cols-3"} gap-1.5 pt-3 border-t border-theme-border-light dark:border-theme-border-dark`}
            >
              <button
                onClick={() => onViewCustomer(customer)}
                className="flex flex-col items-center justify-center gap-1 px-1 py-1.5 text-[10px] font-medium text-blue-600 border border-blue-600 rounded hover:bg-blue-50 dark:text-blue-400 dark:border-blue-400 dark:hover:bg-blue-900/20"
              >
                <FaEye className="w-3 h-3" />
                View
              </button>
              {!customer.isGuest && (
                <>
                  {/* <button
                    onClick={() =>
                      onToggleStatus(customer._id, customer.is_active)
                    }
                    className={`flex flex-col items-center justify-center gap-1 px-1 py-1.5 text-[10px] font-medium rounded border ${
                      customer.is_active
                        ? "text-orange-600 border-orange-600 hover:bg-orange-50 dark:text-orange-400 dark:border-orange-400 dark:hover:bg-orange-900/20"
                        : "text-green-600 border-green-600 hover:bg-green-50 dark:text-green-400 dark:border-green-400 dark:hover:bg-green-900/20"
                    }`}
                  >
                    {customer.is_active ? (
                      <FaTimesCircle aria-hidden="true" className="w-3 h-3" />
                    ) : (
                      <FaCheckCircle aria-hidden="true" className="w-3 h-3" />
                    )}
                    {customer.is_active ? "Deactivate" : "Activate"}
                  </button> */}
                  <button
                    onClick={() => onToggleBan(customer._id, customer.is_banned)}
                    className={`flex flex-col items-center justify-center gap-1 px-1 py-1.5 text-[10px] font-medium rounded border ${
                      customer.is_banned
                        ? "text-green-600 border-green-600 hover:bg-green-50 dark:text-green-400 dark:border-green-400 dark:hover:bg-green-900/20"
                        : "text-red-600 border-red-600 hover:bg-red-50 dark:text-red-400 dark:border-red-400 dark:hover:bg-red-900/20"
                    }`}
                  >
                    <FaBan className="w-3 h-3" />
                    {customer.is_banned ? "Unban" : "Ban"}
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}