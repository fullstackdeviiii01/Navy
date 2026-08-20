// // app/(admin)/components/payment/PaymentGatewayCard.tsx
"use client";

import { useState } from "react";
import {
  FaCreditCard,
  FaToggleOn,
  FaToggleOff,
  FaCog,
  FaTrash,
} from "react-icons/fa";
import {
  FaCcStripe,
  FaPaypal,
  FaMoneyBillWave,
  FaWallet,
} from "react-icons/fa";

interface PaymentGatewayCardProps {
  gateway: any;
  onConfigure: (gateway: any) => void;
  onToggle: (name: string, enabled: boolean) => void;
  onDelete: (name: string) => void;
}

export default function PaymentGatewayCard({
  gateway,
  onConfigure,
  onToggle,
  onDelete,
}: PaymentGatewayCardProps) {
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    await onToggle(gateway.name, !gateway.is_enabled);
    setLoading(false);
  };
  const gatewayIcons: Record<
    string,
    React.ComponentType<{ className?: string }>
  > = {
    stripe: FaCcStripe,
    paypal: FaPaypal,
    cod: FaMoneyBillWave,
    default: FaWallet,
  };

  const GatewayIcon = gatewayIcons[gateway.name] || gatewayIcons.default;

  const getGatewayBadge = () => {
    if (gateway.name === "cod") {
      if (gateway.settings?.allow_all_orders) {
        return (
          <span className="inline-flex px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 whitespace-nowrap">
            All Orders
          </span>
        );
      }
      return (
        <span className="inline-flex px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 whitespace-nowrap">
          Limited Range
        </span>
      );
    }
    return null;
  };

  return (
    <div className="bg-theme-surface-light dark:bg-theme-surface-dark border border-theme-border-light dark:border-theme-border-dark rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 hover:shadow-lg transition-shadow">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3 sm:mb-4 gap-3">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
            <GatewayIcon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm sm:text-base md:text-lg font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark truncate">
              {gateway.display_name}
            </h3>
            <p className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark truncate">
              {gateway.name.toUpperCase()}
            </p>
          </div>
        </div>

        <button
          onClick={handleToggle}
          disabled={loading}
          className={`flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors flex-shrink-0 ${
            gateway.is_enabled
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
              : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
          } disabled:opacity-50`}
        >
          {gateway.is_enabled ? (
            <>
              <FaToggleOn size={14} className="sm:w-4 sm:h-4" />
              <span>Enabled</span>
            </>
          ) : (
            <>
              <FaToggleOff size={14} className="sm:w-4 sm:h-4" />
              <span>Disabled</span>
            </>
          )}
        </button>
      </div>

      <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4">
        {gateway.name !== "cod" && (
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
              Mode
            </span>
            <span
              className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs font-medium whitespace-nowrap ${
                gateway.is_test_mode
                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                  : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
              }`}
            >
              {gateway.is_test_mode ? "Test Mode" : "Live Mode"}
            </span>
          </div>
        )}

        {gateway.name === "cod" && gateway.settings && (
          <>
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
                Configuration
              </span>
              {getGatewayBadge()}
            </div>
            {!gateway.settings.allow_all_orders && (
              <div className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark truncate">
                Min: ${gateway.settings.min_order_amount || 0}
                {gateway.settings.max_order_amount &&
                  ` | Max: $${gateway.settings.max_order_amount}`}
              </div>
            )}
          </>
        )}

        {gateway.name !== "cod" && (
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
              Currency
            </span>
            <span className="text-theme-text-primary-light dark:text-theme-text-primary-dark font-medium">
              {gateway.settings?.currency || "USD"}
            </span>
          </div>
        )}
      </div>

      <div className="flex gap-1.5 sm:gap-2 pt-3 sm:pt-4 border-t border-theme-border-light dark:border-theme-border-dark">
        <button
          onClick={() => onConfigure(gateway)}
          className="flex-1 flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-theme-primary text-white rounded-lg hover:bg-theme-primary-hover transition-colors text-xs sm:text-sm"
        >
          <FaCog size={12} className="sm:w-3.5 sm:h-3.5" />
          <span className="truncate">Configure</span>
        </button>
        <button
          onClick={() => onDelete(gateway.name)}
          className="px-2 sm:px-3 py-1.5 sm:py-2 border border-red-300 text-red-600 dark:border-red-700 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          title="Delete"
          aria-label="Delete gateway"
        >
          <FaTrash size={12} className="sm:w-3.5 sm:h-3.5" />
        </button>
      </div>
    </div>
  );
}