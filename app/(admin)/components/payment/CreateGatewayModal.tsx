// app/(admin)/components/payment/CreateGatewayModal.tsx
"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { FaCcStripe, FaPaypal, FaMoneyBillWave } from "react-icons/fa";

interface CreateGatewayModalProps {
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
}

export default function CreateGatewayModal({
  onClose,
  onSave,
}: CreateGatewayModalProps) {
  const [loading, setLoading] = useState(false);
  const [selectedGateway, setSelectedGateway] = useState<string>("");

  const availableGateways = [
    {
      name: "stripe",
      display_name: "Stripe",
      description: "Accept cards, wallets, and more",
      icon: FaCcStripe,
    },
    {
      name: "paypal",
      display_name: "PayPal",
      description: "Accept PayPal and cards",
      icon: FaPaypal,
    },
    {
      name: "cod",
      display_name: "Cash on Delivery",
      description: "Collect payment upon delivery",
      icon: FaMoneyBillWave,
    },
  ];

  const handleCreate = async () => {
    if (!selectedGateway) return;

    setLoading(true);
    try {
      const gateway = availableGateways.find((g) => g.name === selectedGateway);
      const baseData = {
        name: selectedGateway,
        display_name: gateway?.display_name || selectedGateway,
        is_enabled: false,
        is_test_mode: selectedGateway !== "cod",
        credentials: {},
        settings: {
          currency: "USD",
          accepted_currencies: ["USD"],
        },
      };

      if (selectedGateway === "cod") {
        baseData.settings = {
          ...baseData.settings,
          min_order_amount: 0,
          max_order_amount: null,
          allow_all_orders: true,
          instructions: "Please keep the exact amount ready. Our delivery partner will collect payment upon delivery.",
        } as any;
      }

      await onSave(baseData);
      onClose();
    } catch (error) {
      console.error("Create failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const titleId = "create-gateway-title";

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-3 md:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg sm:rounded-xl w-full max-w-xs sm:max-w-sm md:max-w-md mx-2 sm:mx-auto">
        <div className="flex items-center justify-between p-3 sm:p-4 md:p-6 border-b border-theme-border-light dark:border-theme-border-dark">
          <h2 id={titleId} className="text-lg sm:text-xl font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
            Add Payment Gateway
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-theme-text-muted-light hover:text-theme-text-primary-light dark:text-theme-text-muted-dark dark:hover:text-theme-text-primary-dark p-1"
          >
            <X size={20} className="sm:w-6 sm:h-6" />
          </button>
        </div>

        <div className="p-3 sm:p-4 md:p-6">
          <p className="text-xs sm:text-sm text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-3 sm:mb-4">
            Select a payment gateway to add to your store
          </p>

          <div className="space-y-2 sm:space-y-3">
            {availableGateways.map((gateway) => {
              const inputId = `gateway-${gateway.name}`;
              return (
                <label
                  key={gateway.name}
                  htmlFor={inputId}
                  className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-3 md:p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedGateway === gateway.name
                      ? "border-theme-primary bg-blue-50 dark:bg-blue-900/20"
                      : "border-theme-border-light dark:border-theme-border-dark hover:bg-theme-hover-bg-light dark:hover:bg-theme-hover-bg-dark"
                  }`}
                >
                  <input
                    id={inputId}
                    type="radio"
                    name="gateway"
                    value={gateway.name}
                    checked={selectedGateway === gateway.name}
                    onChange={(e) => setSelectedGateway(e.target.value)}
                    className="w-4 h-4 text-theme-primary focus:ring-theme-primary flex-shrink-0"
                  />
                  <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-lg sm:text-xl md:text-2xl">
                    <gateway.icon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" aria-hidden="true" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm sm:text-base font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark truncate">
                      {gateway.display_name}
                    </h3>
                    <p className="text-xs sm:text-sm text-theme-text-muted-light dark:text-theme-text-muted-dark truncate">
                      {gateway.description}
                    </p>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 p-3 sm:p-4 md:p-6 border-t border-theme-border-light dark:border-theme-border-dark">
          <button
            type="button"
            onClick={onClose}
            className="px-3 sm:px-4 py-1.5 sm:py-2 border border-theme-border-light dark:border-theme-border-dark text-theme-text-primary-light dark:text-theme-text-primary-dark rounded-lg hover:bg-theme-hover-bg-light dark:hover:bg-theme-hover-bg-dark transition-colors text-xs sm:text-sm w-full sm:w-auto"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!selectedGateway || loading}
            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-theme-primary text-white rounded-lg hover:bg-theme-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm w-full sm:w-auto"
          >
            {loading ? "Creating..." : "Add Gateway"}
          </button>
        </div>
      </div>
    </div>
  );
}