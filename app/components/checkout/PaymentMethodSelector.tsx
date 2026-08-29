// app/components/checkout/PaymentMethodSelector.tsx
"use client";

import { Banknote, Building2, Smartphone } from "lucide-react";

export interface StaticPaymentMethod {
  id: string;
  name: string;
  shortName: string;
  description: string;
  requiresProof: boolean;
  details?: {
    bank_name?: string;
    recipient_name?: string;
    account_title?: string;
    account_number?: string;
    mobile_number?: string;
    iban?: string;
    qr_code?: string;
    instructions?: string;
  };
}

export const STATIC_PAYMENT_METHODS: StaticPaymentMethod[] = [
  {
    id: "cod",
    name: "Cash on Delivery",
    shortName: "COD",
    description: "Pay in cash when your order is delivered to your doorstep.",
    requiresProof: false,
  },
  {
    id: "bank_transfer",
    name: "Direct Bank Transfer",
    shortName: "Bank Transfer",
    description: "Transfer to our Meezan Bank account and upload payment screenshot.",
    requiresProof: true,
    details: {
      bank_name: "Meezan Bank",
      recipient_name: "Talal Trading Company",
      account_number: "2105-0106552077",
      // iban: "PK00300112798032", // Client will provide later
      // qr_code: "/QR/BankQR.png", // Client will provide later
      instructions: "Transfer the exact order total to our Meezan Bank account and upload the payment receipt below.",
    },
  },
  {
    id: "jazzcash",
    name: "JazzCash",
    shortName: "JazzCash",
    description: "Send payment via JazzCash mobile account and upload screenshot.",
    requiresProof: true,
    details: {
      account_title: "Muhammad Aslam Khan",
      mobile_number: "0322 7040106",
      // qr_code: "/QR/JazzCashQR.png", // Client will provide later
      instructions: "Send the total amount to our JazzCash account, then upload the receipt screenshot below.",
    },
  },
];

interface PaymentMethodSelectorProps {
  selectedMethod: string;
  onMethodChange: (method: string) => void;
  orderTotal: number;
}

export default function PaymentMethodSelector({
  selectedMethod,
  onMethodChange,
}: PaymentMethodSelectorProps) {
  const getMethodIcon = (id: string) => {
    switch (id) {
      case "bank_transfer":
        return <Building2 className="w-4 h-4 shrink-0" />;
      case "jazzcash":
        return <Smartphone className="w-4 h-4 shrink-0" />;
      case "cod":
      default:
        return <Banknote className="w-4 h-4 shrink-0" />;
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
        Select Payment Method
      </h3>

      <div className="grid grid-cols-1 gap-3">
        {STATIC_PAYMENT_METHODS.map((method) => {
          const isSelected = selectedMethod === method.id;
          return (
            <label
              key={method.id}
              className={`flex items-start gap-3 sm:gap-4 p-3.5 sm:p-4 border cursor-pointer transition-all ${
                isSelected
                  ? "border-theme-hover-light dark:border-theme-hover-dark bg-theme-card-light/60 dark:bg-theme-card-dark/40 shadow-xs"
                  : "border-theme-border-light/70 dark:border-theme-border-dark/70 hover:border-theme-hover-light/50 bg-theme-bg-light/40 dark:bg-theme-bg-dark/40"
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value={method.id}
                checked={isSelected}
                onChange={() => onMethodChange(method.id)}
                className="mt-0.5 w-4 h-4 accent-[#241910] dark:accent-[#D7D3CF] cursor-pointer flex-shrink-0"
              />

              <div className="flex items-start gap-2.5 sm:gap-3 flex-1 min-w-0">
                <div
                  className={`mt-0.5 flex-shrink-0 ${
                    isSelected
                      ? "text-theme-hover-light dark:text-theme-hover-dark"
                      : "text-theme-text-secondary-light dark:text-theme-text-secondary-dark"
                  }`}
                >
                  {getMethodIcon(method.id)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-1.5 sm:gap-2">
                    <p className="font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark text-xs sm:text-sm uppercase tracking-wider">
                      {method.name}
                    </p>
                    {method.requiresProof && (
                      <span className="text-[9px] sm:text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30 shrink-0">
                        Screenshot Required
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] sm:text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark mt-1 leading-relaxed">
                    {method.description}
                  </p>
                </div>
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}
