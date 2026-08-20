// // app/(admin)/components/customers/CustomerDetailsModal.tsx
"use client";

import { useState } from "react";
import {
  FaTimes,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaShoppingCart,
  FaHeart,
  FaCalendar,
  FaClock,
  FaDollarSign,
  FaBox,
  FaGlobe,
  FaBell,
  FaUserSecret,
} from "react-icons/fa";

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
  preferred_locale?: string;
  timezone?: string;
  marketing_opt_in?: boolean;
  email_notifications?: boolean;
  isGuest?: boolean;
}

interface CustomerDetailsModalProps {
  customer: Customer;
  onClose: () => void;
  onUpdate: () => void;
}

export default function CustomerDetailsModal({
  customer,
  onClose,
  onUpdate,
}: CustomerDetailsModalProps) {
  const [activeTab, setActiveTab] = useState <"overview" | "orders" | "addresses" | "activity">("overview");

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "orders", label: "Orders" },
    { id: "addresses", label: "Addresses" },
    { id: "activity", label: "Activity" },
  ];

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="customer-detail-name"
    >
      <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col mx-3 sm:mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-theme-border-light dark:border-theme-border-dark flex-shrink-0">
          <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
              {customer.isGuest ? (
                <FaUserSecret className="text-purple-600 dark:text-purple-400 text-base sm:text-xl" />
              ) : (
                <FaUser className="text-blue-600 dark:text-blue-400 text-base sm:text-xl" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h2 
                id="customer-detail-name"
                className="text-base sm:text-lg lg:text-xl font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark truncate"
              >
                {customer.name || "N/A"}
              </h2>
              <div className="flex flex-wrap gap-1 sm:gap-2 mt-1">
                {customer.isGuest ? (
                  <span className="inline-flex items-center px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                    Guest Customer
                  </span>
                ) : (
                  <>
                    <span
                      className={`inline-flex items-center px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-semibold ${
                        customer.is_active
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                      }`}
                    >
                      {customer.is_active ? "Active" : "Inactive"}
                    </span>
                    {customer.is_banned && (
                      <span className="inline-flex items-center px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                        Banned
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="text-theme-text-muted-light hover:text-theme-text-primary-light dark:text-theme-text-muted-dark dark:hover:text-theme-text-primary-dark ml-2 flex-shrink-0"
          >
            <FaTimes className="text-lg sm:text-xl" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-theme-border-light dark:border-theme-border-dark flex-shrink-0 overflow-x-auto">
          <div className="flex min-w-max px-1 sm:px-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-2 sm:px-4 lg:px-6 py-2 sm:py-3 text-xs sm:text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-theme-primary text-theme-primary"
                    : "border-transparent text-theme-text-muted-light dark:text-theme-text-muted-dark hover:text-theme-text-primary-light dark:hover:text-theme-text-primary-dark"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-3 sm:p-4 lg:p-6 overflow-y-auto flex-1">
          {activeTab === "overview" && (
            <div className="space-y-4 sm:space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-2 sm:p-3 lg:p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-between">
                    <FaBox className="text-blue-600 dark:text-blue-400 text-lg sm:text-xl lg:text-2xl" />
                    <div className="text-right">
                      <p className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {customer.order_count}
                      </p>
                      <p className="text-xs sm:text-sm text-blue-700 dark:text-blue-300">
                        Total Orders
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 dark:bg-green-900/20 p-2 sm:p-3 lg:p-4 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center justify-between">
                    <FaDollarSign className="text-green-600 dark:text-green-400 text-lg sm:text-xl lg:text-2xl" />
                    <div className="text-right">
                      <p className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600 dark:text-green-400">
                        ${customer.total_spent.toFixed(2)}
                      </p>
                      <p className="text-xs sm:text-sm text-green-700 dark:text-green-300">
                        Total Spent
                      </p>
                    </div>
                  </div>
                </div>

                {!customer.isGuest && (
                  <>
                    <div className="bg-purple-50 dark:bg-purple-900/20 p-2 sm:p-3 lg:p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                      <div className="flex items-center justify-between">
                        <FaShoppingCart className="text-purple-600 dark:text-purple-400 text-lg sm:text-xl lg:text-2xl" />
                        <div className="text-right">
                          <p className="text-lg sm:text-xl lg:text-2xl font-bold text-purple-600 dark:text-purple-400">
                            {customer.cart?.length || 0}
                          </p>
                          <p className="text-xs sm:text-sm text-purple-700 dark:text-purple-300">
                            Cart Items
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-pink-50 dark:bg-pink-900/20 p-2 sm:p-3 lg:p-4 rounded-lg border border-pink-200 dark:border-pink-800">
                      <div className="flex items-center justify-between">
                        <FaHeart className="text-pink-600 dark:text-pink-400 text-lg sm:text-xl lg:text-2xl" />
                        <div className="text-right">
                          <p className="text-lg sm:text-xl lg:text-2xl font-bold text-pink-600 dark:text-pink-400">
                            {customer.wishlist?.length || 0}
                          </p>
                          <p className="text-xs sm:text-sm text-pink-700 dark:text-pink-300">
                            Wishlist
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Contact Information */}
              <div className="bg-theme-bg-light dark:bg-theme-bg-dark p-3 sm:p-4 rounded-lg border border-theme-border-light dark:border-theme-border-dark">
                <h3 className="font-semibold text-sm sm:text-base text-theme-text-primary-light dark:text-theme-text-primary-dark mb-2 sm:mb-3">
                  Contact Information
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 lg:gap-4">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <FaUser className="text-theme-text-muted-light dark:text-theme-text-muted-dark flex-shrink-0 text-sm sm:text-base" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark">
                        Name
                      </p>
                      <p className="text-xs sm:text-sm font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark truncate">
                        {customer.name || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <FaEnvelope className="text-theme-text-muted-light dark:text-theme-text-muted-dark flex-shrink-0 text-sm sm:text-base" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark">
                        Email
                      </p>
                      <p className="text-xs sm:text-sm font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark truncate">
                        {customer.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <FaPhone className="text-theme-text-muted-light dark:text-theme-text-muted-dark flex-shrink-0 text-sm sm:text-base" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark">
                        Phone
                      </p>
                      <p className="text-xs sm:text-sm font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark truncate">
                        {customer.phone || "Not provided"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Preferences - Only for registered users */}
              {!customer.isGuest && (
                <div className="bg-theme-bg-light dark:bg-theme-bg-dark p-3 sm:p-4 rounded-lg border border-theme-border-light dark:border-theme-border-dark">
                  <h3 className="font-semibold text-sm sm:text-base text-theme-text-primary-light dark:text-theme-text-primary-dark mb-2 sm:mb-3">
                    Preferences
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 lg:gap-4">
                    <div className="flex items-start space-x-2 sm:space-x-3">
                      <FaDollarSign className="text-theme-text-muted-light dark:text-theme-text-muted-dark mt-0.5 sm:mt-1 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark">
                          Currency
                        </p>
                        <p className="text-xs sm:text-sm font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark truncate">
                          {customer.preferred_currency || "PKR"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-2 sm:space-x-3">
                      <FaGlobe className="text-theme-text-muted-light dark:text-theme-text-muted-dark mt-0.5 sm:mt-1 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark">
                          Locale
                        </p>
                        <p className="text-xs sm:text-sm font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark truncate">
                          {customer.preferred_locale || "en-US"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-2 sm:space-x-3">
                      <FaClock className="text-theme-text-muted-light dark:text-theme-text-muted-dark mt-0.5 sm:mt-1 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark">
                          Timezone
                        </p>
                        <p className="text-xs sm:text-sm font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark truncate">
                          {customer.timezone || "UTC"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-2 sm:space-x-3">
                      <FaBell className="text-theme-text-muted-light dark:text-theme-text-muted-dark mt-0.5 sm:mt-1 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark">
                          Notifications
                        </p>
                        <p className="text-xs sm:text-sm font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark">
                          {customer.email_notifications ? "Enabled" : "Disabled"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Account Information */}
              <div className="bg-theme-bg-light dark:bg-theme-bg-dark p-3 sm:p-4 rounded-lg border border-theme-border-light dark:border-theme-border-dark">
                <h3 className="font-semibold text-sm sm:text-base text-theme-text-primary-light dark:text-theme-text-primary-dark mb-2 sm:mb-3">
                  Account Information
                </h3>
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-start space-x-2 sm:space-x-3">
                    <FaCalendar className="text-theme-text-muted-light dark:text-theme-text-muted-dark mt-0.5 sm:mt-1 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark">
                        {customer.isGuest ? "First Order" : "Customer Since"}
                      </p>
                      <p className="text-xs sm:text-sm font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark">
                        {formatDate(customer.customer_since)}
                      </p>
                    </div>
                  </div>

                  {!customer.isGuest && (
                    <div className="flex items-start space-x-2 sm:space-x-3">
                      <FaClock className="text-theme-text-muted-light dark:text-theme-text-muted-dark mt-0.5 sm:mt-1 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark">
                          Last Login
                        </p>
                        <p className="text-xs sm:text-sm font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark">
                          {customer.last_login_at
                            ? formatDate(customer.last_login_at)
                            : "Never"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Guest User Notice */}
              {customer.isGuest && (
                <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3 sm:p-4">
                  <div className="flex items-start gap-2 sm:gap-3">
                    <FaUserSecret className="text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-purple-800 dark:text-purple-200 mb-1">
                        Guest Customer
                      </p>
                      <p className="text-xs text-purple-700 dark:text-purple-300">
                        This customer checked out without creating an account. Limited
                        information and actions are available for guest customers.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "orders" && (
            <div className="text-center py-8 sm:py-12">
              <FaBox className="mx-auto text-3xl sm:text-4xl text-theme-text-muted-light dark:text-theme-text-muted-dark mb-2 sm:mb-3" />
              <p className="text-sm sm:text-base text-theme-text-muted-light dark:text-theme-text-muted-dark">
                Order history will be displayed here
              </p>
              <p className="text-xs sm:text-sm text-theme-text-muted-light dark:text-theme-text-muted-dark mt-1 sm:mt-2">
                Total Orders: {customer.order_count}
              </p>
            </div>
          )}

          {activeTab === "addresses" && (
            <div>
              {!customer.isGuest && customer.addresses && customer.addresses.length > 0 ? (
                <div className="space-y-3 sm:space-y-4">
                  {customer.addresses.map((address, index) => (
                    <div
                      key={index}
                      className="bg-theme-bg-light dark:bg-theme-bg-dark p-3 sm:p-4 rounded-lg border border-theme-border-light dark:border-theme-border-dark"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2 min-w-0">
                          <FaMapMarkerAlt className="text-theme-primary flex-shrink-0" />
                          <span className="font-semibold text-sm sm:text-base text-theme-text-primary-light dark:text-theme-text-primary-dark truncate">
                            {address.label || `Address ${index + 1}`}
                          </span>
                        </div>
                        {address.is_default_shipping && (
                          <span className="text-xs px-2 py-0.5 sm:py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded flex-shrink-0 ml-2">
                            Default Shipping
                          </span>
                        )}
                      </div>
                      <div className="text-xs sm:text-sm text-theme-text-primary-light dark:text-theme-text-primary-dark space-y-0.5 sm:space-y-1">
                        <p className="break-words">{address.full_name}</p>
                        <p className="text-theme-text-muted-light dark:text-theme-text-muted-dark break-words">
                          {address.line1}
                          {address.line2 && `, ${address.line2}`}
                        </p>
                        <p className="text-theme-text-muted-light dark:text-theme-text-muted-dark break-words">
                          {address.city}, {address.state} {address.postal_code}
                        </p>
                        <p className="text-theme-text-muted-light dark:text-theme-text-muted-dark break-words">
                          {address.country}
                        </p>
                        {address.phone && (
                          <p className="text-theme-text-muted-light dark:text-theme-text-muted-dark mt-1 sm:mt-2 break-words">
                            Phone: {address.phone}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 sm:py-12">
                  <FaMapMarkerAlt className="mx-auto text-3xl sm:text-4xl text-theme-text-muted-light dark:text-theme-text-muted-dark mb-2 sm:mb-3" />
                  <p className="text-sm sm:text-base text-theme-text-muted-light dark:text-theme-text-muted-dark">
                    {customer.isGuest
                      ? "Guest customers don't have saved addresses"
                      : "No addresses saved"}
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === "activity" && (
            <div className="text-center py-8 sm:py-12">
              <FaClock className="mx-auto text-3xl sm:text-4xl text-theme-text-muted-light dark:text-theme-text-muted-dark mb-2 sm:mb-3" />
              <p className="text-sm sm:text-base text-theme-text-muted-light dark:text-theme-text-muted-dark">
                Activity log will be displayed here
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-3 sm:p-4 lg:p-6 border-t border-theme-border-light dark:border-theme-border-dark flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 sm:px-6 py-1.5 sm:py-2 bg-theme-primary text-white rounded-lg hover:bg-theme-primary-hover transition-colors text-xs sm:text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}