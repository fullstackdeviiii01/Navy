// app/components/orders/RequestReturnButton.tsx
"use client";

import { useState } from "react";
import { Package } from "lucide-react";
import RequestReturnModal from "./RequestReturnModal";

interface RequestReturnButtonProps {
  order: any;
  onSuccess?: () => void;
}

export default function RequestReturnButton({
  order,
  onSuccess,
}: RequestReturnButtonProps) {
  const [showModal, setShowModal] = useState(false);

  // Check if order is eligible for return
  const isEligible = () => {
    // Check basic status
    if (!["delivered", "shipped"].includes(order.status)) {
      return false;
    }

    // Check if payment is completed
    if (order.payment_status !== "paid") {
      return false;
    }

    // Check if active return exists
    if (order.has_active_return) {
      return false;
    }

    // Check if within 30 days
    const daysSinceOrder = Math.floor(
      (Date.now() - new Date(order.placed_at).getTime()) /
        (1000 * 60 * 60 * 24),
    );

    return daysSinceOrder <= 30;
  };

  if (!isEligible()) {
    return null;
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        
        className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors text-sm font-medium"
      >
        <Package size={16}/>
        Request Return
      </button>

      {showModal && (
        <RequestReturnModal
          order={order}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            onSuccess?.();
          }}
        />
      )}
    </>
  );
}
