// app/(admin)/fulfillment/components/OrderStatusUpdateModal.tsx
"use client";

import { useState } from "react";
import { X, Truck, Check } from "lucide-react";

interface OrderStatusUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
  onUpdate: (
    status: string,
    trackingData?: { tracking_number: string; carrier: string }
  ) => void;
}

export default function OrderStatusUpdateModal({
  isOpen,
  onClose,
  order,
  onUpdate,
}: OrderStatusUpdateModalProps) {
  const [status, setStatus] = useState(order?.status || "pending");
  const [trackingNumber, setTrackingNumber] = useState(
    order?.shipping?.tracking_number || ""
  );
  const [carrier, setCarrier] = useState(
    order?.shipping?.carrier || "M&P Express"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !order) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (status === "shipped") {
        await onUpdate(status, {
          tracking_number: trackingNumber,
          carrier,
        });
      } else {
        await onUpdate(status);
      }
      onClose();
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-theme-surface-light dark:bg-theme-surface-dark w-full max-w-md rounded-2xl border border-theme-border-light dark:border-theme-border-dark shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-theme-border-light dark:border-theme-border-dark">
          <div>
            <h3 className="text-base font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
              Update Order Status
            </h3>
            <p className="text-xs text-theme-text-muted-light mt-0.5">
              Order #{order.order_number}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-theme-text-muted-light hover:text-theme-text-primary-light transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1.5">
              Order Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3.5 py-2 text-xs sm:text-sm border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-neutral-500/40 cursor-pointer"
            >
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>

          {status === "shipped" && (
            <div className="p-3.5 rounded-xl border border-theme-border-light dark:border-theme-border-dark bg-theme-bg-light/60 dark:bg-theme-bg-dark/40 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                <Truck className="w-3.5 h-3.5 text-indigo-500" />
                <span>Shipping & Courier Details</span>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1">
                  Courier / Carrier
                </label>
                <div className="w-full px-3 py-2 text-xs border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark font-semibold flex items-center justify-between">
                  <span>M&P Express Logistics</span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase tracking-wider font-bold">
                    Official Carrier
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1">
                  M&P Tracking / Consignment Number *
                </label>
                <input
                  type="text"
                  placeholder="e.g. 5048291038"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  required={status === "shipped"}
                  className="w-full px-3 py-2 text-xs border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark font-mono focus:outline-none focus:border-theme-hover-light"
                />
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-3 border-t border-theme-border-light dark:border-theme-border-dark flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold border border-theme-border-light dark:border-theme-border-dark rounded-lg text-theme-text-secondary-light hover:bg-theme-card-light transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900 text-xs font-semibold tracking-wide shadow-xs hover:shadow active:scale-[0.99] transition-all disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isSubmitting ? "Updating..." : "Update Status"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
