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
  const [carrier, setCarrier] = useState(order?.shipping?.carrier || "TCS");
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
            <h3 className="text-base font-serif font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
              Update Fulfillment Status
            </h3>
            <p className="text-xs font-mono text-theme-text-muted-light mt-0.5">
              Manifest #{order.order_number}
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
              Select Lifecycle Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3.5 py-2 text-xs sm:text-sm border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-neutral-500/40 cursor-pointer"
            >
              <option value="pending">Pending Review</option>
              <option value="confirmed">Order Confirmed</option>
              <option value="processing">Processing & Manufacturing</option>
              <option value="shipped">Dispatched / In Transit</option>
              <option value="delivered">Delivered to Patron</option>
              <option value="cancelled">Cancelled</option>
              <option value="refunded">Refund Settled</option>
            </select>
          </div>

          {status === "shipped" && (
            <div className="p-3.5 rounded-xl border border-theme-border-light dark:border-theme-border-dark bg-theme-bg-light/60 dark:bg-theme-bg-dark/40 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                <Truck className="w-3.5 h-3.5 text-indigo-500" />
                <span>Carrier Dispatch Information</span>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1">
                  Logistics Carrier
                </label>
                <select
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark"
                >
                  <option value="TCS">TCS Express</option>
                  <option value="Leopards">Leopards Courier</option>
                  <option value="M&P">M&P Express</option>
                  <option value="Trax">Trax Logistics</option>
                  <option value="DHL">DHL Express</option>
                  <option value="FedEx">FedEx</option>
                  <option value="Custom">Artisan Courier</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1">
                  Tracking Waybill / Reference #
                </label>
                <input
                  type="text"
                  placeholder="e.g. TCS-9821739812"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  required={status === "shipped"}
                  className="w-full px-3 py-1.5 text-xs font-mono border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark"
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
              <span>{isSubmitting ? "Updating..." : "Commit Status"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
