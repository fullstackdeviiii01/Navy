// app/(admin)/concierge/components/ReturnsManifestTable.tsx
"use client";

import { useState } from "react";
import { RotateCcw, DollarSign, Edit3, CheckCircle, Package } from "lucide-react";
import RefundProcessingModal from "./RefundProcessingModal";
import ReturnStatusConsoleModal from "./ReturnStatusConsoleModal";

interface ReturnsManifestTableProps {
  returns: any[];
  onStatusUpdate: (returnId: string, status: string, data?: any) => void;
  onRefundProcess: (returnId: string, data?: any) => void;
  onRefresh: () => void;
}

const STATUS_BADGES: Record<string, string> = {
  pending: "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300",
  approved: "bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300",
  items_received: "bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300",
  rejected: "bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300",
  refunded: "bg-green-100 dark:bg-green-950/60 text-green-800 dark:text-green-300",
};

export default function ReturnsManifestTable({
  returns,
  onStatusUpdate,
  onRefundProcess,
}: ReturnsManifestTableProps) {
  const [selectedForStatus, setSelectedForStatus] = useState<any>(null);
  const [selectedForRefund, setSelectedForRefund] = useState<any>(null);

  if (returns.length === 0) {
    return (
      <div className="p-12 text-center text-xs text-theme-text-muted-light">
        No return requests found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs border-collapse">
        <thead>
          <tr className="bg-theme-card-light/70 dark:bg-theme-card-dark/50 border-b border-theme-border-light dark:border-theme-border-dark text-[11px] uppercase tracking-wider text-theme-text-secondary-light dark:text-theme-text-secondary-dark font-semibold">
            <th className="py-3 px-4">Return # & Order #</th>
            <th className="py-3 px-4">Customer</th>
            <th className="py-3 px-4">Reason & Details</th>
            <th className="py-3 px-4">Refund Amount</th>
            <th className="py-3 px-4">Status</th>
            <th className="py-3 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-theme-border-light/60 dark:divide-theme-border-dark/60">
          {returns.map((ret) => {
            const isEligibleForRefund =
              (ret.status === "approved" || ret.status === "items_received") &&
              ret.status !== "refunded";

            return (
              <tr
                key={ret._id}
                className="hover:bg-theme-card-light/40 dark:hover:bg-theme-card-dark/30 transition-colors"
              >
                {/* Return Ref */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <span className="font-mono font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark block">
                    #{ret.return_number}
                  </span>
                  <span className="text-[10px] text-theme-text-muted-light font-mono">
                    Order: {ret.order_id?.order_number || "N/A"}
                  </span>
                </td>

                {/* Customer */}
                <td className="py-3.5 px-4 max-w-[180px]">
                  <p className="font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark truncate">
                    {ret.user_id?.name || ret.customer_name || "Guest Customer"}
                  </p>
                  <p className="text-[11px] text-theme-text-muted-light truncate">
                    {ret.user_id?.email || ret.customer_email || "No email"}
                  </p>
                </td>

                {/* Reason */}
                <td className="py-3.5 px-4 max-w-[220px]">
                  <p className="font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark truncate">
                    {ret.reason || "General Return"}
                  </p>
                  <p className="text-[11px] text-theme-text-muted-light truncate mt-0.5">
                    {ret.comments || "No additional comments"}
                  </p>
                </td>

                {/* Refund Amount */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <span className="font-bold text-sm font-serif text-theme-text-primary-light dark:text-theme-text-primary-dark block">
                    Rs. {ret.refund_amount?.toLocaleString() || ret.order_id?.pricing?.total?.toLocaleString() || "0"}
                  </span>
                  <span className="text-[10px] text-theme-text-muted-light uppercase">
                    {ret.refund_method || "Original Payment"}
                  </span>
                </td>

                {/* Status */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-semibold capitalize ${
                      STATUS_BADGES[ret.status] || STATUS_BADGES.pending
                    }`}
                  >
                    {ret.status?.replace("_", " ")}
                  </span>
                </td>

                {/* Actions */}
                <td className="py-3.5 px-4 text-right whitespace-nowrap">
                  <div className="inline-flex items-center gap-1.5">
                    {/* Refund Button */}
                    {isEligibleForRefund && (
                      <button
                        type="button"
                        onClick={() => setSelectedForRefund(ret)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-[10px] font-semibold shadow-xs transition-colors"
                      >
                        <DollarSign className="w-3 h-3" />
                        <span>Refund</span>
                      </button>
                    )}

                    {/* Change Status */}
                    <button
                      type="button"
                      onClick={() => setSelectedForStatus(ret)}
                      className="p-1.5 text-theme-text-muted-light hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                      title="Change Status"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Modals */}
      {selectedForStatus && (
        <ReturnStatusConsoleModal
          isOpen={!!selectedForStatus}
          returnRequest={selectedForStatus}
          onClose={() => setSelectedForStatus(null)}
          onUpdate={onStatusUpdate}
        />
      )}

      {selectedForRefund && (
        <RefundProcessingModal
          isOpen={!!selectedForRefund}
          returnRequest={selectedForRefund}
          onClose={() => setSelectedForRefund(null)}
          onProcess={onRefundProcess}
        />
      )}
    </div>
  );
}
