// app/(admin)/concierge/components/ReturnStatusConsoleModal.tsx
"use client";

import { useState } from "react";
import { X, RotateCcw, Check } from "lucide-react";

interface ReturnStatusConsoleModalProps {
  isOpen: boolean;
  returnRequest: any;
  onClose: () => void;
  onUpdate: (returnId: string, status: string, data?: any) => void;
}

export default function ReturnStatusConsoleModal({
  isOpen,
  returnRequest,
  onClose,
  onUpdate,
}: ReturnStatusConsoleModalProps) {
  const [status, setStatus] = useState(returnRequest?.status || "pending");
  const [adminNotes, setAdminNotes] = useState(
    returnRequest?.admin_notes || ""
  );
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !returnRequest) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await onUpdate(returnRequest._id, status, { admin_notes: adminNotes });
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
          <div>
            <h3 className="text-base font-serif font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
              Update Return Lifecycle
            </h3>
            <p className="text-xs text-theme-text-muted-light mt-0.5">
              Claim #{returnRequest.return_number}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-theme-text-muted-light hover:text-theme-text-primary-light rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1.5">
              Lifecycle Decision
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3.5 py-2 text-xs sm:text-sm border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-neutral-500/40 cursor-pointer"
            >
              <option value="pending">Pending Inspection</option>
              <option value="approved">Approved for Return</option>
              <option value="items_received">Items Received in Atelier</option>
              <option value="rejected">Rejected Claim</option>
              <option value="refunded">Refund Settled</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1.5">
              Concierge Audit Notes
            </label>
            <textarea
              rows={3}
              placeholder="Internal remarks regarding physical inspection or customer communication..."
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              className="w-full px-3.5 py-2 text-xs border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-neutral-500/40"
            />
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-theme-border-light dark:border-theme-border-dark flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg text-xs font-semibold text-theme-text-secondary-light hover:bg-theme-card-light transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900 text-xs font-semibold tracking-wide shadow-xs hover:shadow active:scale-[0.99] transition-all disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{submitting ? "Saving..." : "Commit Decision"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
