// app/(admin)/fulfillment/components/FulfillmentDataTable.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, Edit3, DollarSign, Package } from "lucide-react";
import OrderStatusUpdateModal from "./OrderStatusUpdateModal";
import { adminOrdersApi } from "../../../../lib/api/orders";

interface FulfillmentDataTableProps {
  orders: any[];
  onUpdateStatus: (orderId: string, status: string, trackingData?: any) => void;
  onRefresh: () => void;
}

const STATUS_BADGES: Record<string, string> = {
  pending: "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300",
  confirmed: "bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300",
  processing: "bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300",
  shipped: "bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300",
  delivered: "bg-green-100 dark:bg-green-950/60 text-green-800 dark:text-green-300",
  cancelled: "bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300",
  refunded: "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300",
};

const PAYMENT_BADGES: Record<string, string> = {
  paid: "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300",
  pending: "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300",
  failed: "bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300",
  refunded: "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300",
};

export default function FulfillmentDataTable({
  orders,
  onUpdateStatus,
  onRefresh,
}: FulfillmentDataTableProps) {
  const router = useRouter();
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);

  const getCustomerName = (order: any) =>
    order.user_id?.name || order.guest_info?.name || "Guest Customer";

  const getCustomerEmail = (order: any) =>
    order.user_id?.email || order.guest_info?.email || "No email";

  const handleMarkPaymentReceived = async (orderId: string) => {
    if (!confirm("Confirm payment received for this COD order?")) return;
    try {
      await adminOrdersApi.markPaid(orderId);
      onRefresh();
    } catch (error: any) {
      alert(error.message || "Failed to mark order as paid");
    }
  };

  return (
    <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-xl border border-theme-border-light dark:border-theme-border-dark overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-theme-card-light/70 dark:bg-theme-card-dark/50 border-b border-theme-border-light dark:border-theme-border-dark text-[11px] uppercase tracking-wider text-theme-text-secondary-light dark:text-theme-text-secondary-dark font-semibold">
              <th className="py-3 px-4">Order # & Date</th>
              <th className="py-3 px-4">Customer</th>
              <th className="py-3 px-4">Items</th>
              <th className="py-3 px-4">Total</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Payment</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-theme-border-light/60 dark:divide-theme-border-dark/60">
            {orders.map((order) => {
              const isCODDeliveredUnpaid =
                order.payment_method === "cod" &&
                order.status === "delivered" &&
                order.payment_status !== "paid";

              return (
                <tr
                  key={order._id}
                  className="hover:bg-theme-card-light/40 dark:hover:bg-theme-card-dark/30 transition-colors"
                >
                  {/* Order ID */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="font-mono font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark block">
                      {order.order_number}
                    </span>
                    <span className="text-[10px] text-theme-text-muted-light">
                      {new Date(order.placed_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </td>

                  {/* Customer */}
                  <td className="py-3.5 px-4 max-w-[180px]">
                    <p className="font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark truncate">
                      {getCustomerName(order)}
                    </p>
                    <p className="text-[11px] text-theme-text-muted-light truncate">
                      {getCustomerEmail(order)}
                    </p>
                    {order.order_type === "guest" && (
                      <span className="text-[9px] font-semibold uppercase px-1.5 py-0.2 rounded bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 inline-block mt-0.5">
                        Guest
                      </span>
                    )}
                  </td>

                  {/* Items */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark">
                      <Package className="w-3 h-3 text-theme-text-muted-light" />
                      {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? "s" : ""}
                    </span>
                  </td>

                  {/* Total */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark block">
                      Rs. {order.pricing?.total?.toLocaleString() || "0"}
                    </span>
                    <span className="text-[10px] text-theme-text-muted-light uppercase">
                      {order.payment_method || "Online"}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-semibold capitalize ${
                        STATUS_BADGES[order.status] || STATUS_BADGES.pending
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>

                  {/* Payment */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-semibold capitalize ${
                        PAYMENT_BADGES[order.payment_status] || PAYMENT_BADGES.pending
                      }`}
                    >
                      {order.payment_status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-1">
                      {/* Mark Paid button if eligible */}
                      {isCODDeliveredUnpaid && (
                        <button
                          type="button"
                          onClick={() => handleMarkPaymentReceived(order._id)}
                          className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-semibold transition-colors mr-1"
                          title="Mark Payment Received"
                        >
                          Mark Paid
                        </button>
                      )}

                      {/* Status Update Modal */}
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowStatusModal(true);
                        }}
                        className="p-1.5 text-theme-text-muted-light hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                        title="Change Status"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      {/* Details View Link */}
                      <button
                        type="button"
                        onClick={() => router.push(`/admin/orders/${order._id}`)}
                        className="p-1.5 text-theme-text-muted-light hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                        title="View Order"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Lifecycle Status Update Modal */}
      {showStatusModal && selectedOrder && (
        <OrderStatusUpdateModal
          isOpen={showStatusModal}
          onClose={() => {
            setShowStatusModal(false);
            setSelectedOrder(null);
          }}
          order={selectedOrder}
          onUpdate={(status, trackingData) => {
            onUpdateStatus(selectedOrder._id, status, trackingData);
            setShowStatusModal(false);
            setSelectedOrder(null);
          }}
        />
      )}
    </div>
  );
}
