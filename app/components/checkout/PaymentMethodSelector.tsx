// // app/components/checkout/PaymentMethodSelector.tsx - FULLY RESPONSIVE
"use client";

import { useState, useEffect } from "react";
import { FaCreditCard, FaPaypal, FaMoneyBillWave } from "react-icons/fa";
import { paymentApi } from "../../../lib/api/payment";
import { useCurrency } from "../../context/CurrencyContext";
import Loader from "../shared/Loader";

interface PaymentMethodSelectorProps {
  selectedMethod: string;
  onMethodChange: (method: string) => void;
  orderTotal: number;
}

export default function PaymentMethodSelector({
  selectedMethod,
  onMethodChange,
  orderTotal,
}: PaymentMethodSelectorProps) {
  const [gateways, setGateways] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { selectedCurrency, formatPrice } = useCurrency();

  useEffect(() => {
    fetchActiveGateways();
  }, []);

  const fetchActiveGateways = async () => {
    try {
      const data = await paymentApi.getActiveGateways();
      
      const availableGateways = data.gateways.filter((gateway: any) => {
        if (gateway.name === "cod") {
          if (gateway.settings?.allow_all_orders) {
            return true;
          }
          
          const minAmount = gateway.settings?.min_order_amount || 0;
          const maxAmount = gateway.settings?.max_order_amount;
          
          if (orderTotal < minAmount) {
            return false;
          }
          
          if (maxAmount && orderTotal > maxAmount) {
            return false;
          }
        }
        return true;
      });

      setGateways(availableGateways);

      if (availableGateways.length > 0 && !selectedMethod) {
        onMethodChange(availableGateways[0].name);
      }
    } catch (error) {
      console.error("Failed to fetch payment gateways:", error);
    } finally {
      setLoading(false);
    }
  };

  const getGatewayIcon = (name: string) => {
    const iconClass = "w-5 h-5 sm:w-6 sm:h-6";
    switch (name) {
      case "stripe":
        return <FaCreditCard className={iconClass}/>;
      case "paypal":
        return <FaPaypal className={iconClass}/>;
      case "cod":
        return <FaMoneyBillWave className={iconClass}/>;
      default:
        return <FaCreditCard className={iconClass}/>;
    }
  };

  if (loading) {
    return (
      <div className="relative py-6 sm:py-8">
        <Loader />
      </div>
    );
  }

  if (gateways.length === 0) {
    return (
      <div className="text-center py-6 sm:py-8">
        <p className="text-xs sm:text-sm text-theme-text-muted-light dark:text-theme-text-muted-dark">
          No payment methods available for this order amount
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2.5 sm:space-y-3">
      <h3 className="text-base sm:text-lg font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark mb-3 sm:mb-4">
        Select Payment Method
      </h3>

      {gateways.map((gateway) => (
        <label
          key={gateway.name}
          className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-3.5 md:p-4 border rounded-lg cursor-pointer transition-all active:scale-[0.98] ${
            selectedMethod === gateway.name
              ? "border-theme-primary bg-blue-50 dark:bg-blue-900/20 shadow-sm"
              : "border-theme-border-light dark:border-theme-border-dark hover:bg-theme-hover-bg-light dark:hover:bg-theme-hover-bg-dark"
          }`}
        >
          <input
            type="radio"
            name="paymentMethod"
            value={gateway.name}
            checked={selectedMethod === gateway.name}
            onChange={(e) => onMethodChange(e.target.value)}
            className="w-4 h-4 text-theme-primary focus:ring-theme-primary flex-shrink-0"
          />

          <div className="flex items-center gap-2.5 sm:gap-3 flex-1 min-w-0">
            <div
              className={`flex-shrink-0 ${selectedMethod === gateway.name ? "text-theme-primary" : "text-theme-text-secondary-light dark:text-theme-text-secondary-dark"}`}
            >
              {getGatewayIcon(gateway.name)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark text-sm sm:text-base truncate">
                {gateway.display_name}
              </p>
              {gateway.name === "cod" && gateway.settings?.instructions && (
                <p className="text-[10px] sm:text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark mt-0.5 sm:mt-1 line-clamp-2">
                  {gateway.settings.instructions}
                </p>
              )}
              {gateway.name !== "cod" && (
                <p className="text-[10px] sm:text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark mt-0.5">
                  Pay in {selectedCurrency}
                </p>
              )}
              {gateway.name !== "cod" && gateway.is_test_mode && (
                <span className="inline-block text-[10px] sm:text-xs text-yellow-600 dark:text-yellow-400 mt-0.5">
                  Test Mode
                </span>
              )}
            </div>
          </div>
        </label>
      ))}
    </div>
  );
}