// app/(admin)/concierge/components/RefundProcessingModal.tsx
"use client";

import { useState } from "react";
import { X, DollarSign, AlertCircle, Check } from "lucide-react";

interface RefundProcessingModalProps {
  isOpen: boolean;
  returnRequest: any;
  onClose: () => void;
  onProcess: (returnId: string) => void;
}

export default function RefundProcessingModal({
  isOpen,
  returnRequest,
  onClose,
  onProcess,
}: RefundProcessingModalProps) {
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !returnRequest) return null;

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      await onProcess(returnRequest._id);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-theme-surface-light dark:bg-theme-surface-dark w-full max-w-md rounded-2xl border border-theme-border-light dark:border-theme-border-dark shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-theme-border-light dark:border-theme-border-dark">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-serif font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
              Process Patron Reimbursement
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-theme-text-muted-light hover:text-theme-text-primary-light rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-xs">
          <div className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200 space-y-1">
            <span className="text-[11px] uppercase font-mono font-semibold">
              Authorized Refund Total
            </span>
            <p className="text-xl font-bold font-serif">
              Rs. {returnRequest.refund_amount?.toLocaleString() || returnRequest.order_id?.pricing?.total?.toLocaleString() || "0"}
            </p>
            <p className="text-[10px] text-emerald-700 dark:text-emerald-300">
              Return Ref: #{returnRequest.return_number}
            </p>
          </div>

          <div className="flex items-start gap-2 p-3 bg-neutral-100 dark:bg-neutral-800 rounded-xl text-neutral-700 dark:text-neutral-300 text-[11px]">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-neutral-500" />
            <p leading-relaxed>
              Reimbursement will be recorded and patron notified via dispatch notification.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-theme-border-light dark:border-theme-border-dark flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg text-xs font-semibold text-theme-text-secondary-light hover:bg-theme-card-light transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={handleConfirm}
            className="inline-flex items-center gap-1.5 px-5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900 rounded-lg text-xs font-semibold shadow-xs hover:shadow active:scale-[0.99] transition-all disabled:opacity-50"
          >
            <Check className="w-3.5 h-3.5" />
            <span>{submitting ? "Processing..." : "Disburse Refund"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
