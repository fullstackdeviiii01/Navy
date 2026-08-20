// ReturnsTable.tsx
"use client";

import React, { useState } from "react";
import ReturnStatusBadge from "./ReturnStatusBadge";
import UpdateReturnStatusModal from "./UpdateReturnStatusModal";
import ProcessRefundModal from "./ProcessRefundModal";

interface ReturnsTableProps {
  returns: any[];
  onStatusUpdate: (returnId: string, status: string, data?: any) => Promise<void>;
  onRefundProcess: (returnId: string) => Promise<void>;
  onCompleteBankTransfer: (returnId: string) => Promise<void>;
}

export default function ReturnsTable({
  returns,
  onStatusUpdate,
  onRefundProcess,
  onCompleteBankTransfer,
}: ReturnsTableProps) {
  const [selectedReturn, setSelectedReturn] = useState<any>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const handleStatusUpdate = async (status: string, data?: any) => {
    if (selectedReturn) {
      await onStatusUpdate(selectedReturn._id, status, data);
      setShowStatusModal(false);
      setSelectedReturn(null);
    }
  };

  const handleRefundProcess = async () => {
    if (selectedReturn) {
      await onRefundProcess(selectedReturn._id);
      setShowRefundModal(false);
      setSelectedReturn(null);
    }
  };

  const handleCompleteBankTransfer = async (returnRequest: any) => {
    if (!confirm("Confirm that you have successfully transferred the refund amount to the customer's bank account. This action cannot be undone.")) {
      return;
    }

    try {
      await onCompleteBankTransfer(returnRequest._id);
    } catch (error) {
      console.error("Failed to complete bank transfer:", error);
      alert("Failed to complete bank transfer");
    }
  };

  const toggleRowExpansion = (returnId: string) => {
    setExpandedRow(expandedRow === returnId ? null : returnId);
  };

  const getRefundStatusBadge = (refundStatus: string) => {
    const config: Record<string, { color: string; bg: string; text: string }> = {
      pending: {
        color: "text-gray-700 dark:text-gray-300",
        bg: "bg-gray-100 dark:bg-gray-900/30",
        text: "Not Started",
      },
      processing: {
        color: "text-blue-700 dark:text-blue-300",
        bg: "bg-blue-100 dark:bg-blue-900/30",
        text: "Processing",
      },
      completed: {
        color: "text-green-700 dark:text-green-300",
        bg: "bg-green-100 dark:bg-green-900/30",
        text: "Completed",
      },
      failed: {
        color: "text-red-700 dark:text-red-300",
        bg: "bg-red-100 dark:bg-red-900/30",
        text: "Failed",
      },
    };

    const c = config[refundStatus] || config.pending;

    return (
      <span className={`inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded-full text-xs font-medium ${c.bg} ${c.color}`}>
        <span className="hidden xs:inline">{c.text}</span>
        <span className="xs:hidden">
          {refundStatus === "pending" ? "Pend" : 
           refundStatus === "processing" ? "Proc" : 
           refundStatus === "completed" ? "Done" : "Fail"}
        </span>
      </span>
    );
  };

  if (returns.length === 0) {
    return (
      <div className="text-center py-6 sm:py-8 lg:py-12">
        <p className="text-xs sm:text-sm text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
          No returns found
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-theme-bg-light dark:bg-theme-bg-dark border-b border-theme-border-light dark:border-theme-border-dark">
            <tr>
              <th className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-left text-xs font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark uppercase tracking-wider">
                RMA / Order
              </th>
              <th className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-left text-xs font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark uppercase tracking-wider hidden sm:table-cell">
                Customer
              </th>
              <th className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-left text-xs font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark uppercase tracking-wider">
                Status
              </th>
              <th className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-left text-xs font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark uppercase tracking-wider hidden md:table-cell">
                Refund
              </th>
              <th className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-left text-xs font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark uppercase tracking-wider">
                Amount
              </th>
              <th className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-right text-xs font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-theme-surface-light dark:bg-theme-surface-dark divide-y divide-theme-border-light dark:divide-theme-border-dark">
            {returns.map((returnRequest) => (
              <React.Fragment key={returnRequest._id}>
                <tr
                  className="hover:bg-theme-bg-light dark:hover:bg-theme-bg-dark transition-colors cursor-pointer"
                  onClick={() => toggleRowExpansion(returnRequest._id)}
                >
                  <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-4">
                    <div className="text-xs sm:text-sm">
                      <div className="font-mono text-theme-text-primary-light dark:text-theme-text-primary-dark truncate max-w-[100px] sm:max-w-none">
                        {returnRequest.rma_number}
                      </div>
                      <div className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark mt-0.5 truncate max-w-[100px] sm:max-w-none">
                        Order: {returnRequest.order_id?.order_number || "N/A"}
                      </div>
                      <div className="sm:hidden text-xs mt-1">
                        {returnRequest.user_id?.email || returnRequest.guest_email}
                      </div>
                    </div>
                  </td>
                  <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-4 hidden sm:table-cell">
                    <div className="text-xs sm:text-sm text-theme-text-primary-light dark:text-theme-text-primary-dark truncate max-w-[120px] lg:max-w-none">
                      {returnRequest.user_id?.email || returnRequest.guest_email}
                    </div>
                  </td>
                  <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-4 whitespace-nowrap">
                    <ReturnStatusBadge status={returnRequest.status} />
                  </td>
                  <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-4 whitespace-nowrap hidden md:table-cell">
                    {getRefundStatusBadge(returnRequest.refund_status || "pending")}
                  </td>
                  <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-4 whitespace-nowrap">
                    <span className="text-xs sm:text-sm font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark">
                      ${returnRequest.refund_amount.toFixed(2)}
                    </span>
                    <div className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark capitalize">
                      via {returnRequest.refund_method === "bank_transfer" ? "Bank" : returnRequest.refund_method}
                    </div>
                    <div className="md:hidden text-xs mt-1">
                      {getRefundStatusBadge(returnRequest.refund_status || "pending")}
                    </div>
                  </td>
                  <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-4 whitespace-nowrap text-right text-xs sm:text-sm font-medium">
                    <div className="flex justify-end gap-1 sm:gap-2">
                      {returnRequest.status === "pending" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedReturn(returnRequest);
                            setShowStatusModal(true);
                          }}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-xs sm:text-sm"
                          aria-label="Review return request"
                        >
                          <span className="hidden sm:inline">Review</span>
                          <span className="sm:hidden">View</span>
                        </button>
                      )}
                      {returnRequest.status === "approved" && returnRequest.refund_status !== "completed" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedReturn(returnRequest);
                            setShowRefundModal(true);
                          }}
                          className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 text-xs sm:text-sm"
                          aria-label="Process refund for this return"
                        >
                          <span className="hidden sm:inline">Process Refund</span>
                          <span className="sm:hidden">Refund</span>
                        </button>
                      )}
                      {returnRequest.refund_method === "bank_transfer" && returnRequest.refund_status === "processing" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCompleteBankTransfer(returnRequest);
                          }}
                          className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 text-xs sm:text-sm"
                          aria-label="Complete bank transfer and mark refund as completed"
                        >
                          <span className="hidden sm:inline">Complete Transfer</span>
                          <span className="sm:hidden">Complete</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>

                {expandedRow === returnRequest._id && (
                  <tr>
                    <td colSpan={6} className="px-2 sm:px-3 lg:px-4 py-2 sm:py-4 bg-theme-bg-light dark:bg-theme-bg-dark">
                      <div className="space-y-3 sm:space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                          {/* Return Items */}
                          <div>
                            <h4 className="font-semibold text-xs sm:text-sm text-theme-text-primary-light dark:text-theme-text-primary-dark mb-1 sm:mb-2">
                              Items to Return
                            </h4>
                            <div className="space-y-1 sm:space-y-2">
                              {returnRequest.items.map((item: any, index: number) => (
                                <div
                                  key={index}
                                  className="text-xs sm:text-sm bg-theme-surface-light dark:bg-theme-surface-dark p-1.5 sm:p-2 rounded border border-theme-border-light dark:border-theme-border-dark"
                                >
                                  <p className="font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark truncate">
                                    {item.product_name}
                                  </p>
                                  <p className="text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
                                    Qty: {item.quantity} × ${item.price.toFixed(2)}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Bank Transfer Details for COD */}
                          {returnRequest.refund_method === "bank_transfer" && returnRequest.bank_transfer_details && (
                            <div>
                              <h4 className="font-semibold text-xs sm:text-sm text-theme-text-primary-light dark:text-theme-text-primary-dark mb-1 sm:mb-2">
                                Customer's Bank Details
                              </h4>
                              <div className="text-xs sm:text-sm bg-blue-50 dark:bg-blue-900/20 p-2 sm:p-3 rounded border border-blue-200 dark:border-blue-800">
                                <div className="space-y-0.5 sm:space-y-1">
                                  <p className="truncate">
                                    <span className="font-medium">Holder:</span>{" "}
                                    {returnRequest.bank_transfer_details.account_holder_name}
                                  </p>
                                  <p>
                                    <span className="font-medium">Account:</span>{" "}
                                    {returnRequest.bank_transfer_details.account_number}
                                  </p>
                                  <p className="truncate">
                                    <span className="font-medium">Bank:</span>{" "}
                                    {returnRequest.bank_transfer_details.bank_name}
                                  </p>
                                  {returnRequest.bank_transfer_details.ifsc_code && (
                                    <p>
                                      <span className="font-medium">IFSC:</span>{" "}
                                      {returnRequest.bank_transfer_details.ifsc_code}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Customer Notes */}
                        {returnRequest.return_reason_details && (
                          <div>
                            <h4 className="font-semibold text-xs sm:text-sm text-theme-text-primary-light dark:text-theme-text-primary-dark mb-1 sm:mb-2">
                              Customer Notes
                            </h4>
                            <p className="text-xs sm:text-sm text-theme-text-secondary-light dark:text-theme-text-secondary-dark bg-theme-surface-light dark:bg-theme-surface-dark p-2 sm:p-3 rounded border border-theme-border-light dark:border-theme-border-dark">
                              {returnRequest.return_reason_details}
                            </p>
                          </div>
                        )}

                        {/* Rejection Reason */}
                        {returnRequest.rejection_reason && (
                          <div>
                            <h4 className="font-semibold text-xs sm:text-sm text-red-600 dark:text-red-400 mb-1 sm:mb-2">
                              Rejection Reason
                            </h4>
                            <p className="text-xs sm:text-sm text-theme-text-secondary-light dark:text-theme-text-secondary-dark bg-red-50 dark:bg-red-900/20 p-2 sm:p-3 rounded border border-red-200 dark:border-red-800">
                              {returnRequest.rejection_reason}
                            </p>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <UpdateReturnStatusModal
        isOpen={showStatusModal}
        onClose={() => {
          setShowStatusModal(false);
          setSelectedReturn(null);
        }}
        returnRequest={selectedReturn}
        onUpdate={handleStatusUpdate}
      />

      <ProcessRefundModal
        isOpen={showRefundModal}
        onClose={() => {
          setShowRefundModal(false);
          setSelectedReturn(null);
        }}
        returnRequest={selectedReturn}
        onProcess={handleRefundProcess}
      />
    </>
  );
}