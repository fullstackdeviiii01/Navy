// app/components/checkout/PaymentMethodSelector.tsx
"use client";

import { FaMoneyBillWave, FaUniversity, FaMobileAlt } from "react-icons/fa";

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
      recipient_name: "Rehan Ahmad",
      account_number: "00300112798032",
      iban: "PK00300112798032",
      qr_code: "/QR/BankQR.png",
      instructions: "Transfer the exact order total to our Meezan Bank account and upload the payment receipt below.",
    },
  },
  {
    id: "jazzcash",
    name: "JazzCash",
    shortName: "JazzCash",
    description: "Send payment via JazzCash mobile account / QR scan and upload screenshot.",
    requiresProof: true,
    details: {
      account_title: "Rehan Ahmad",
      mobile_number: "03130538686",
      qr_code: "/QR/JazzCashQR.png",
      instructions: "Send the total amount to our JazzCash account or scan the QR code, then upload the receipt screenshot below.",
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
  orderTotal,
}: PaymentMethodSelectorProps) {
  const getMethodIcon = (id: string) => {
    const iconClass = "w-5 h-5 sm:w-6 sm:h-6";
    switch (id) {
      case "bank_transfer":
        return <FaUniversity className={iconClass} />;
      case "jazzcash":
        return <FaMobileAlt className={iconClass} />;
      case "cod":
      default:
        return <FaMoneyBillWave className={iconClass} />;
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="text-base sm:text-lg font-serif font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark mb-3">
        Select Payment Method
      </h3>

      <div className="grid grid-cols-1 gap-3">
        {STATIC_PAYMENT_METHODS.map((method) => {
          const isSelected = selectedMethod === method.id;
          return (
            <label
              key={method.id}
              className={`flex items-start gap-3 sm:gap-4 p-4 border rounded-xl cursor-pointer transition-all duration-200 ${
                isSelected
                  ? "border-[#A8752B] bg-[#F8F3EA] dark:bg-[#342611] shadow-md ring-1 ring-[#A8752B]"
                  : "border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark hover:border-[#A8752B]/60"
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value={method.id}
                checked={isSelected}
                onChange={() => onMethodChange(method.id)}
                className="mt-1 w-4 h-4 text-[#A8752B] focus:ring-[#A8752B] flex-shrink-0"
              />

              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div
                  className={`mt-0.5 flex-shrink-0 ${
                    isSelected
                      ? "text-[#A8752B]"
                      : "text-theme-text-secondary-light dark:text-theme-text-secondary-dark"
                  }`}
                >
                  {getMethodIcon(method.id)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark text-sm sm:text-base">
                      {method.name}
                    </p>
                    {method.requiresProof && (
                      <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex-shrink-0">
                        Screenshot Required
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark mt-1 leading-relaxed">
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
