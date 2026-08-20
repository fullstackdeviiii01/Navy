// // app/components/orders/RequestReturnModal.tsx
"use client";

import { useState, useEffect } from "react";
import { X, AlertCircle, CreditCard, Banknote } from "lucide-react";
import { returnsApi } from "../../../lib/api/returns";

interface RequestReturnModalProps {
  order: any;
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * Determine whether the order was paid with COD (cash on delivery).
 * We check multiple fields because the order document may have been
 * saved with an inconsistent payment_method value in some guest-checkout
 * flows where the payment record is created before the order.
 */
function isCODPayment(order: any): boolean {
  const method = (order.payment_method || "").toLowerCase();
  return method === "cod";
}

export default function RequestReturnModal({
  order,
  onClose,
  onSuccess,
}: RequestReturnModalProps) {
  const [selectedItems, setSelectedItems] = useState<Map<string, any>>(
    new Map()
  );
  const [returnReason, setReturnReason] = useState("");
  const [returnReasonDetails, setReturnReasonDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Bank details – only required for COD orders
  const [bankDetails, setBankDetails] = useState({
    account_holder_name: "",
    account_number: "",
    bank_name: "",
    ifsc_code: "",
    swift_code: "",
    routing_number: "",
  });

  const isCOD = isCODPayment(order);

  // Determine the refund method label shown to the user
  const refundMethodLabel = (() => {
    const method = (order.payment_method || "").toLowerCase();
    if (method === "cod") return "Bank Transfer";
    if (method === "bank_transfer") return "Bank Transfer";
    return "Bank Transfer";
  })();

  const returnReasons = [
    { value: "defective", label: "Item is defective or damaged" },
    { value: "wrong_item", label: "Received wrong item" },
    { value: "not_as_described", label: "Item not as described" },
    { value: "changed_mind", label: "Changed my mind" },
    { value: "arrived_late", label: "Arrived too late" },
    { value: "quality_issue", label: "Quality not as expected" },
    { value: "other", label: "Other reason" },
  ];

  const handleItemToggle = (item: any) => {
    const productId =
      typeof item.product_id === "object"
        ? item.product_id._id?.toString()
        : item.product_id?.toString();

    const variantId = item.variant_id
      ? typeof item.variant_id === "object"
        ? item.variant_id._id?.toString()
        : item.variant_id?.toString()
      : "";

    const itemId = `${productId}-${variantId}`;
    const newSelectedItems = new Map(selectedItems);

    if (newSelectedItems.has(itemId)) {
      newSelectedItems.delete(itemId);
    } else {
      newSelectedItems.set(itemId, {
        product_id: productId,
        variant_id: variantId || undefined,
        product_name: item.product_name,
        variant_attributes: item.variant_attributes || undefined,
        quantity: item.quantity,
        price: item.price,
        reason: returnReason || "other",
      });
    }

    setSelectedItems(newSelectedItems);
  };

  // Keep item reasons in sync when the global reason changes
  useEffect(() => {
    if (returnReason && selectedItems.size > 0) {
      const updatedItems = new Map(selectedItems);
      updatedItems.forEach((item, key) => {
        updatedItems.set(key, { ...item, reason: returnReason });
      });
      setSelectedItems(updatedItems);
    }
  }, [returnReason]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (selectedItems.size === 0) {
      setError("Please select at least one item to return");
      return;
    }

    if (!returnReason) {
      setError("Please select a return reason");
      return;
    }

    // Only validate bank details when it's a confirmed COD order
    if (isCOD) {
      if (
        !bankDetails.account_holder_name ||
        !bankDetails.account_number ||
        !bankDetails.bank_name
      ) {
        setError(
          "Please provide your bank account details to receive the refund"
        );
        return;
      }
    }

    setLoading(true);

    try {
      const itemsArray = Array.from(selectedItems.values());

      await returnsApi.createReturn({
        order_id: order._id,
        items: itemsArray,
        return_reason: returnReason,
        return_reason_details: returnReasonDetails,
        // Only send bank details for COD – API ignores them otherwise
        bank_transfer_details: isCOD ? bankDetails : undefined,
      });

      onSuccess();
    } catch (err: any) {
      setError(err.message || "Failed to submit return request");
    } finally {
      setLoading(false);
    }
  };

  const totalRefund = Array.from(selectedItems.values()).reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2
              id="modal-title"
              className="text-xl font-semibold text-gray-900 dark:text-white"
            >
              Request Return & Refund
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Order #{order.order_number}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close return request modal"
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          {error && (
            <div
              role="alert"
              aria-live="assertive"
              className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2"
            >
              <AlertCircle
                size={20}
                aria-hidden="true"
                className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5"
              />
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          {/* Refund method info banner */}
          <div className="mb-5 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg flex items-center gap-3">
            {isCOD ? (
              <Banknote className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" aria-hidden="true" />
            ) : (
              <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" aria-hidden="true" />
            )}
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Your refund will be returned to your{" "}
              <span className="font-semibold">{refundMethodLabel}</span> within
              5–7 business days after approval.
            </p>
          </div>

          {/* Return Reason */}
          <div className="mb-6">
            <label
              htmlFor="return-reason"
              className="block text-sm font-semibold text-gray-900 dark:text-white mb-2"
            >
              Reason for Return *
            </label>
            <select
              id="return-reason"
              value={returnReason}
              onChange={(e) => setReturnReason(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a reason...</option>
              {returnReasons.map((reason) => (
                <option key={reason.value} value={reason.value}>
                  {reason.label}
                </option>
              ))}
            </select>
          </div>

          {/* Select Items */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Select Items to Return
            </label>
            <div className="space-y-2">
              {order.items.map((item: any, index: number) => {
                const productId =
                  typeof item.product_id === "object"
                    ? item.product_id._id?.toString()
                    : item.product_id?.toString();
                const variantId = item.variant_id
                  ? typeof item.variant_id === "object"
                    ? item.variant_id._id?.toString()
                    : item.variant_id?.toString()
                  : "";
                const itemId = `${productId}-${variantId}`;
                const isSelected = selectedItems.has(itemId);

                return (
                  <label
                    key={index}
                    className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                      isSelected
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleItemToggle(item)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white text-sm">
                        {item.product_name}
                      </p>
                      {item.variant_attributes &&
                        Object.keys(item.variant_attributes).length > 0 && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            {Object.entries(item.variant_attributes)
                              .map(([key, value]) => `${key}: ${value}`)
                              .join(", ")}
                          </p>
                        )}
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        Qty: {item.quantity} × ${item.price.toFixed(2)}
                      </p>
                    </div>
                    <p className="font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Additional Details */}
          <div className="mb-6">
            <label
              htmlFor="return-details"
              className="block text-sm font-semibold text-gray-900 dark:text-white mb-2"
            >
              Additional Details (Optional)
            </label>
            <textarea
              id="return-details"
              value={returnReasonDetails}
              onChange={(e) => setReturnReasonDetails(e.target.value)}
              rows={3}
              placeholder="Please provide any additional information..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Bank Details — ONLY for COD orders */}
          {isCOD && (
            <div className="mb-6">
              <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4 mb-4">
                <p className="text-sm text-orange-800 dark:text-orange-200 font-medium mb-1">
                  Bank Account Details Required
                </p>
                <p className="text-sm text-orange-700 dark:text-orange-300">
                  Since this was a Cash on Delivery order, we need your bank
                  account details to transfer the refund to you.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="account-holder"
                    className="block text-sm font-medium text-gray-900 dark:text-white mb-2"
                  >
                    Account Holder Name *
                  </label>
                  <input
                    id="account-holder"
                    type="text"
                    value={bankDetails.account_holder_name}
                    onChange={(e) =>
                      setBankDetails({
                        ...bankDetails,
                        account_holder_name: e.target.value,
                      })
                    }
                    required={isCOD}
                    placeholder="John Doe"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="account-number"
                    className="block text-sm font-medium text-gray-900 dark:text-white mb-2"
                  >
                    Account Number *
                  </label>
                  <input
                    id="account-number"
                    type="text"
                    value={bankDetails.account_number}
                    onChange={(e) =>
                      setBankDetails({
                        ...bankDetails,
                        account_number: e.target.value,
                      })
                    }
                    required={isCOD}
                    placeholder="1234567890"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="bank-name"
                    className="block text-sm font-medium text-gray-900 dark:text-white mb-2"
                  >
                    Bank Name *
                  </label>
                  <input
                    id="bank-name"
                    type="text"
                    value={bankDetails.bank_name}
                    onChange={(e) =>
                      setBankDetails({
                        ...bankDetails,
                        bank_name: e.target.value,
                      })
                    }
                    required={isCOD}
                    placeholder="Bank of America"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="ifsc"
                      className="block text-sm font-medium text-gray-900 dark:text-white mb-2"
                    >
                      IFSC Code <span className="text-gray-400">(India)</span>
                    </label>
                    <input
                      id="ifsc"
                      type="text"
                      value={bankDetails.ifsc_code}
                      onChange={(e) =>
                        setBankDetails({
                          ...bankDetails,
                          ifsc_code: e.target.value,
                        })
                      }
                      placeholder="SBIN0001234"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="swift"
                      className="block text-sm font-medium text-gray-900 dark:text-white mb-2"
                    >
                      SWIFT Code{" "}
                      <span className="text-gray-400">(International)</span>
                    </label>
                    <input
                      id="swift"
                      type="text"
                      value={bankDetails.swift_code}
                      onChange={(e) =>
                        setBankDetails({
                          ...bankDetails,
                          swift_code: e.target.value,
                        })
                      }
                      placeholder="BOFAUS3N"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Refund Summary */}
          {selectedItems.size > 0 && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
              <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Refund Summary
              </p>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    {selectedItems.size} item
                    {selectedItems.size !== 1 ? "s" : ""} selected
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    ${totalRefund.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>Refund Method:</span>
                  <span>{refundMethodLabel}</span>
                </div>
                <div className="mt-2 pt-2 border-t border-green-200 dark:border-green-700">
                  <p className="text-xs text-green-800 dark:text-green-200">
                    Refund will be processed within 5–7 business days after
                    your return is approved.
                  </p>
                </div>
              </div>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || selectedItems.size === 0 || !returnReason}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Submitting..." : "Submit Return Request"}
          </button>
        </div>
      </div>
    </div>
  );
}