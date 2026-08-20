// UpdateReturnStatusModal.tsx
"use client";

import { useState } from "react";
import { CheckCircle, XCircle } from "lucide-react";

interface UpdateReturnStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  returnRequest: any;
  onUpdate: (status: string, data?: any) => Promise<void>;
}

export default function UpdateReturnStatusModal({
  isOpen,
  onClose,
  returnRequest,
  onUpdate,
}: UpdateReturnStatusModalProps) {
  const [action, setAction] = useState<"approve" | "reject" | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen || !returnRequest) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (action === "approve") {
        await onUpdate("approved");
      } else if (action === "reject") {
        await onUpdate("rejected", { rejection_reason: rejectionReason });
      }
      onClose();
      setAction(null);
      setRejectionReason("");
    } catch (error) {
      console.error("Failed to update status:", error);
      alert("Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  const canApprove = returnRequest.status === "pending";
  const canReject = returnRequest.status === "pending";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-3 lg:p-4">
      <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg shadow-xl max-w-md w-full max-h-[90vh] flex flex-col">
        <div className="p-3 sm:p-4 lg:p-6 border-b border-theme-border-light dark:border-theme-border-dark">
          <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
            Review Return Request
          </h2>
          <p className="text-xs sm:text-sm text-theme-text-secondary-light dark:text-theme-text-secondary-dark mt-1">
            RMA: {returnRequest.rma_number}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-3 sm:p-4 lg:p-6 overflow-y-auto flex-1">
          <div className="space-y-3 sm:space-y-4 lg:space-y-6">
            {/* Current Status */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1 sm:mb-2">
                Current Status
              </label>
              <p className="text-theme-text-primary-light dark:text-theme-text-primary-dark font-medium capitalize px-2 sm:px-3 py-1.5 sm:py-2 bg-theme-bg-light dark:bg-theme-bg-dark rounded border border-theme-border-light dark:border-theme-border-dark text-xs sm:text-sm">
                {returnRequest.status}
              </p>
            </div>

            {/* Return Details */}
            <div className="bg-theme-bg-light dark:bg-theme-bg-dark p-2 sm:p-3 lg:p-4 rounded-lg border border-theme-border-light dark:border-theme-border-dark">
              <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between">
                  <span className="text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
                    Order:
                  </span>
                  <span className="text-theme-text-primary-light dark:text-theme-text-primary-dark font-medium">
                    {returnRequest.order_id?.order_number || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
                    Items:
                  </span>
                  <span className="text-theme-text-primary-light dark:text-theme-text-primary-dark font-medium">
                    {returnRequest.items.length} item(s)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
                    Refund Amount:
                  </span>
                  <span className="text-theme-text-primary-light dark:text-theme-text-primary-dark font-semibold">
                    ${returnRequest.refund_amount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
                    Refund Method:
                  </span>
                  <span className="text-theme-text-primary-light dark:text-theme-text-primary-dark font-medium capitalize">
                    {returnRequest.refund_method === "bank_transfer" ? "Bank Transfer" : returnRequest.refund_method}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Selection */}
            {(canApprove || canReject) && (
              <>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-2 sm:mb-3">
                    Select Action *
                  </label>
                  <div className="space-y-2">
                    {canApprove && (
                      <label
                        className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-3 lg:p-4 border rounded-lg cursor-pointer transition-all ${
                          action === "approve"
                            ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                            : "border-theme-border-light dark:border-theme-border-dark hover:bg-theme-hover-bg-light dark:hover:bg-theme-hover-bg-dark"
                        }`}
                      >
                        <input
                          type="radio"
                          name="action"
                          value="approve"
                          checked={action === "approve"}
                          onChange={(e) => setAction(e.target.value as any)}
                          className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 focus:ring-green-500"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-1 sm:gap-2">
                            <CheckCircle size={14} className="sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-green-600 dark:text-green-400" aria-hidden="true" />
                            <span className="font-semibold text-xs sm:text-sm lg:text-base text-theme-text-primary-light dark:text-theme-text-primary-dark">
                              Approve Return
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-theme-text-muted-light dark:text-theme-text-muted-dark mt-0.5 sm:mt-1">
                            Accept the return and initiate refund process
                          </p>
                        </div>
                      </label>
                    )}

                    {canReject && (
                      <label
                        className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-3 lg:p-4 border rounded-lg cursor-pointer transition-all ${
                          action === "reject"
                            ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                            : "border-theme-border-light dark:border-theme-border-dark hover:bg-theme-hover-bg-light dark:hover:bg-theme-hover-bg-dark"
                        }`}
                      >
                        <input
                          type="radio"
                          name="action"
                          value="reject"
                          checked={action === "reject"}
                          onChange={(e) => setAction(e.target.value as any)}
                          className="w-3 h-3 sm:w-4 sm:h-4 text-red-600 focus:ring-red-500"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-1 sm:gap-2">
                            <XCircle size={14} className="sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-red-600 dark:text-red-400" aria-hidden="true" />
                            <span className="font-semibold text-xs sm:text-sm lg:text-base text-theme-text-primary-light dark:text-theme-text-primary-dark">
                              Reject Return
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-theme-text-muted-light dark:text-theme-text-muted-dark mt-0.5 sm:mt-1">
                            Decline the return request
                          </p>
                        </div>
                      </label>
                    )}
                  </div>
                </div>

                {action === "reject" && (
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1 sm:mb-2">
                      Rejection Reason *
                    </label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      required
                      rows={2}
                      placeholder="Explain why this return is being rejected..."
                      className="w-full px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}

                {action === "approve" && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-2 sm:p-3 lg:p-4">
                    <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-200 font-medium mb-1 sm:mb-2">
                      What happens next:
                    </p>
                    <ul className="text-xs sm:text-sm text-blue-700 dark:text-blue-300 space-y-0.5 sm:space-y-1 list-disc list-inside">
                      <li>Customer will be notified about the approval</li>
                      <li>You can then process the refund from the refund section</li>
                      <li>Refund will be sent to {returnRequest.refund_method === "bank_transfer" ? "customer's bank account" : "original payment method"}</li>
                    </ul>
                  </div>
                )}
              </>
            )}

            {returnRequest.status !== "pending" && (
              <div className="text-center py-2 sm:py-3 lg:py-4">
                <p className="text-xs sm:text-sm text-theme-text-muted-light dark:text-theme-text-muted-dark">
                  This return has already been {returnRequest.status}.
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4 sm:mt-5 lg:mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg text-theme-text-primary-light dark:text-theme-text-primary-dark text-xs sm:text-sm hover:bg-theme-bg-light dark:hover:bg-theme-bg-dark transition-colors"
              aria-label="Cancel review"
            >
              Cancel
            </button>
            {(canApprove || canReject) && (
              <button
                type="submit"
                disabled={loading || !action || (action === "reject" && !rejectionReason)}
                className="flex-1 px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
                aria-label="Confirm action"
              >
                {loading ? "Updating..." : "Confirm"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}