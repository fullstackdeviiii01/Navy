// ProcessRefundModal.tsx
"use client";

import { useState } from "react";
import { DollarSign, AlertCircle, CheckCircle } from "lucide-react";

interface ProcessRefundModalProps {
  isOpen: boolean;
  onClose: () => void;
  returnRequest: any;
  onProcess: () => Promise<void>;
}

export default function ProcessRefundModal({
  isOpen,
  onClose,
  returnRequest,
  onProcess,
}: ProcessRefundModalProps) {
  const [loading, setLoading] = useState(false);

  if (!isOpen || !returnRequest) return null;

  const isBankTransfer = returnRequest.refund_method === "bank_transfer";
  const refundMethod = returnRequest.refund_method;

  const handleProcess = async () => {
    if (
      !confirm(
        "Are you sure you want to process this refund? This action cannot be undone.",
      )
    ) {
      return;
    }

    setLoading(true);

    try {
      await onProcess();
      onClose();
    } catch (error) {
      console.error("Failed to process refund:", error);
      alert("Failed to process refund");
    } finally {
      setLoading(false);
    }
  };

  const getRefundMethodDetails = () => {
    switch (refundMethod) {
      case "stripe":
        return {
          title: "Stripe Card Refund",
          timeline: "3-5 business days",
          description:
            "Refund will be automatically processed to the customer's original card",
        };
      case "paypal":
        return {
          title: "PayPal Refund",
          timeline: "Within 24 hours",
          description:
            "Refund will be automatically processed to the customer's PayPal account",
        };
      case "bank_transfer":
        return {
          title: "Bank Transfer Refund",
          timeline: "5-7 business days",
          description:
            "You must manually transfer the refund amount to the customer's bank account",
        };
      default:
        return {
          title: "Refund",
          timeline: "Processing time varies",
          description: "Process refund to customer",
        };
    }
  };

  const methodDetails = getRefundMethodDetails();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-3 lg:p-4">
      <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] flex flex-col">
        <div className="p-3 sm:p-4 lg:p-6 border-b border-theme-border-light dark:border-theme-border-dark">
          <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
            Process Refund
          </h2>
          <p className="text-xs sm:text-sm text-theme-text-secondary-light dark:text-theme-text-secondary-dark mt-1">
            RMA: {returnRequest.rma_number}
          </p>
        </div>
        <div className="p-3 sm:p-4 lg:p-6 overflow-y-auto flex-1">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-2 sm:p-3 lg:p-4 mb-3 sm:mb-4 lg:mb-6">
            <div className="flex gap-1 sm:gap-2">
              <AlertCircle
                className="text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5 sm:w-5 sm:h-5"
                size={16}
                aria-hidden="true"
              />
              <div className="text-xs sm:text-sm text-yellow-800 dark:text-yellow-200">
                <p className="font-medium mb-0.5 sm:mb-1">Important</p>
                <p>
                  {isBankTransfer
                    ? "You will need to manually process the bank transfer."
                    : "This will automatically process the refund."}{" "}
                  This action cannot be undone.
                </p>
              </div>
            </div>
          </div>

          {/* Refund Details */}
          <div className="space-y-3 sm:space-y-4 lg:space-y-4 mb-4 sm:mb-5 lg:mb-6">
            <div className="bg-theme-bg-light dark:bg-theme-bg-dark p-2 sm:p-3 lg:p-4 rounded-lg border border-theme-border-light dark:border-theme-border-dark">
              <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                <div className="flex justify-between">
                  <span className="text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
                    Order Number:
                  </span>
                  <span className="text-theme-text-primary-light dark:text-theme-text-primary-dark font-medium">
                    {returnRequest.order_id?.order_number}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
                    Refund Method:
                  </span>
                  <span className="text-theme-text-primary-light dark:text-theme-text-primary-dark font-medium">
                    {methodDetails.title}
                  </span>
                </div>

                <div className="flex justify-between items-center pt-2 sm:pt-3 border-t border-theme-border-light dark:border-theme-border-dark">
                  <span className="text-theme-text-secondary-light dark:text-theme-text-secondary-dark font-medium">
                    Refund Amount:
                  </span>
                  <div className="flex items-center gap-0.5 sm:gap-1">
                    <DollarSign
                      size={14}
                      className="sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-green-600 dark:text-green-400"
                      aria-hidden="true"
                    />
                    <span className="text-base sm:text-lg lg:text-xl font-bold text-green-600 dark:text-green-400">
                      {returnRequest.refund_amount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bank Transfer Details */}
            {isBankTransfer && returnRequest.bank_transfer_details && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-2 sm:p-3 lg:p-4">
                <p className="text-xs sm:text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2 sm:mb-3">
                  Customer's Bank Account Details:
                </p>
                <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-700 dark:text-blue-300">
                      Account Holder:
                    </span>
                    <span className="text-blue-900 dark:text-blue-100 font-medium truncate ml-2 max-w-[120px] sm:max-w-none">
                      {returnRequest.bank_transfer_details.account_holder_name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700 dark:text-blue-300">
                      Account Number:
                    </span>
                    <span className="text-blue-900 dark:text-blue-100 font-mono">
                      {returnRequest.bank_transfer_details.account_number}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700 dark:text-blue-300">
                      Bank Name:
                    </span>
                    <span className="text-blue-900 dark:text-blue-100 font-medium truncate ml-2 max-w-[120px] sm:max-w-none">
                      {returnRequest.bank_transfer_details.bank_name}
                    </span>
                  </div>
                  {returnRequest.bank_transfer_details.ifsc_code && (
                    <div className="flex justify-between">
                      <span className="text-blue-700 dark:text-blue-300">
                        IFSC Code:
                      </span>
                      <span className="text-blue-900 dark:text-blue-100 font-mono">
                        {returnRequest.bank_transfer_details.ifsc_code}
                      </span>
                    </div>
                  )}
                  {returnRequest.bank_transfer_details.swift_code && (
                    <div className="flex justify-between">
                      <span className="text-blue-700 dark:text-blue-300">
                        SWIFT Code:
                      </span>
                      <span className="text-blue-900 dark:text-blue-100 font-mono">
                        {returnRequest.bank_transfer_details.swift_code}
                      </span>
                    </div>
                  )}
                  {returnRequest.bank_transfer_details.routing_number && (
                    <div className="flex justify-between">
                      <span className="text-blue-700 dark:text-blue-300">
                        Routing Number:
                      </span>
                      <span className="text-blue-900 dark:text-blue-100 font-mono">
                        {returnRequest.bank_transfer_details.routing_number}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Process Details */}
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-2 sm:p-3 lg:p-4">
              <p className="text-xs sm:text-sm font-semibold text-green-800 dark:text-green-200 mb-1 sm:mb-2 flex items-center gap-1 sm:gap-2">
                <CheckCircle size={14} className="sm:w-4 sm:h-4" aria-hidden="true" />
                What will happen:
              </p>
              <ul className="text-xs sm:text-sm text-green-700 dark:text-green-300 space-y-0.5 sm:space-y-1 list-disc list-inside">
                {isBankTransfer ? (
                  <>
                    <li>Refund will be marked as "Processing"</li>
                    <li>
                      You must manually transfer $
                      {returnRequest.refund_amount.toFixed(2)} to the customer's
                      bank account
                    </li>
                    <li>
                      After transfer, mark the refund as "Completed" in the
                      system
                    </li>
                    <li>Customer will be notified via email</li>
                    <li>Expected timeline: {methodDetails.timeline}</li>
                  </>
                ) : refundMethod === "stripe" ? (
                  <>
                    <li>
                      Stripe will automatically refund $
                      {returnRequest.refund_amount.toFixed(2)} to the customer's
                      card
                    </li>
                    <li>
                      Customer will receive refund in {methodDetails.timeline}
                    </li>
                    <li>Customer will be notified via email</li>
                    <li>Return status will be updated to "Refunded"</li>
                  </>
                ) : (
                  <>
                    <li>
                      PayPal will automatically refund $
                      {returnRequest.refund_amount.toFixed(2)} to the customer's
                      account
                    </li>
                    <li>
                      Customer will receive refund {methodDetails.timeline}
                    </li>
                    <li>Customer will be notified via email</li>
                    <li>Return status will be updated to "Refunded"</li>
                  </>
                )}
              </ul>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-3 sm:px-4 py-1.5 sm:py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg text-theme-text-primary-light dark:text-theme-text-primary-dark text-xs sm:text-sm hover:bg-theme-bg-light dark:hover:bg-theme-bg-dark transition-colors disabled:opacity-50"
              aria-label="Cancel refund process"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleProcess}
              disabled={loading}
              className="flex-1 px-3 sm:px-4 py-1.5 sm:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
              aria-label={isBankTransfer ? "Mark refund as processing" : "Process refund"}
            >
              {loading
                ? "Processing..."
                : isBankTransfer
                  ? "Mark as Processing"
                  : "Process Refund"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}