
// app/(admin)/components/orders/UpdateStatusModal.tsx
"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface UpdateStatusModalProps {
  order: any;
  onClose: () => void;
  onUpdate: (status: string, trackingData?: { tracking_number: string; carrier: string }) => void;
}

export default function UpdateStatusModal({
  order,
  onClose,
  onUpdate,
}: UpdateStatusModalProps) {
  const [selectedStatus, setSelectedStatus] = useState(order.status);
  const [trackingNumber, setTrackingNumber] = useState(order.tracking_number || "");
  const [carrier, setCarrier] = useState(order.carrier || "");

  const statuses = [
    { value: "pending", label: "Pending" },
    { value: "confirmed", label: "Confirmed" },
    { value: "processing", label: "Processing" },
    { value: "shipped", label: "Shipped" },
    { value: "delivered", label: "Delivered" },
    { value: "cancelled", label: "Cancelled" },
  ];

  const handleSubmit = () => {
  if (selectedStatus === "shipped") {
    onUpdate(selectedStatus, { 
      tracking_number: trackingNumber, 
      carrier: carrier 
    });
  } else {
    onUpdate(selectedStatus);
  }
};

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
            Update Order Status
          </h3>
          <button
            onClick={onClose}
            className="text-theme-text-muted-light hover:text-theme-text-primary-light dark:text-theme-text-muted-dark dark:hover:text-theme-text-primary-dark"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-theme-bg-light dark:bg-theme-bg-dark rounded-lg">
            <p className="text-sm text-theme-text-muted-light dark:text-theme-text-muted-dark">
              Order Number
            </p>
            <p className="font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
              {order.order_number}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark mb-2">
              Order Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-4 py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-theme-primary"
            >
              {statuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          {selectedStatus === "shipped" && (
            <>
              <div>
                <label className="block text-sm font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark mb-2">
                  Tracking Number
                </label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Enter tracking number"
                  className="w-full px-4 py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-theme-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark mb-2">
                  Carrier
                </label>
                <input
                  type="text"
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value)}
                  placeholder="e.g., FedEx, UPS, USPS"
                  className="w-full px-4 py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-theme-primary"
                />
              </div>
            </>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark bg-theme-bg-light dark:bg-theme-bg-dark hover:bg-theme-hover-bg-light dark:hover:bg-theme-hover-bg-dark border border-theme-border-light dark:border-theme-border-dark rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 text-sm font-medium text-white bg-theme-primary hover:bg-theme-primary-hover rounded-lg"
            >
              Update Status
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}