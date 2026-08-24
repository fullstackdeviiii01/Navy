// app/(admin)/components/orders/OrdersTable.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, Edit3 } from "lucide-react";
import OrderStatusBadge from "./OrderStatusBadge";
import UpdateStatusModal from "./UpdateStatusModal";

interface OrdersTableProps {
  orders: any[];
  onUpdateStatus: (orderId: string, status: string) => void;
  onRefresh: () => void;
}

export default function OrdersTable({
  orders,
  onUpdateStatus,
}: OrdersTableProps) {
  const router = useRouter();
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);

  const handleUpdateStatus = (order: any) => {
    setSelectedOrder(order);
    setShowStatusModal(true);
  };

  const handleViewOrder = (orderId: string) => {
    router.push(`/admin/orders/${orderId}`);
  };

  return (
    <>
      <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg shadow overflow-hidden border border-theme-border-light dark:border-theme-border-dark">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-theme-border-light dark:divide-theme-border-dark">
            <thead className="bg-theme-bg-light dark:bg-theme-bg-dark">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-theme-text-muted-light dark:text-theme-text-secondary-dark uppercase tracking-wider">
                  Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-theme-text-muted-light dark:text-theme-text-secondary-dark uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-theme-text-muted-light dark:text-theme-text-secondary-dark uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-theme-text-muted-light dark:text-theme-text-secondary-dark uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-theme-text-muted-light dark:text-theme-text-secondary-dark uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-theme-text-muted-light dark:text-theme-text-secondary-dark uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-theme-text-muted-light dark:text-theme-text-secondary-dark uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-theme-surface-light dark:bg-theme-surface-dark divide-y divide-theme-border-light dark:divide-theme-border-dark">
              {orders.map((order) => (
                <tr
                  key={order._id}
                  className="hover:bg-theme-hover-bg-light dark:hover:bg-theme-hover-bg-dark"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-mono font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                        {order.order_number}
                      </div>
                      <div className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark">
                        {order.items.length} item
                        {order.items.length !== 1 ? "s" : ""}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-theme-text-primary-light dark:text-theme-text-primary-dark">
                      {order.order_type === "guest"
                        ? order.guest_info?.name || "Guest"
                        : order.user_id?.name || "N/A"}
                    </div>
                    <div className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark">
                      {order.order_type === "guest"
                        ? order.guest_info?.email || "N/A"
                        : order.user_id?.email || "N/A"}
                    </div>
                    {order.order_type === "guest" && (
                      <span className="inline-flex mt-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                        Guest Order
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-theme-text-primary-light dark:text-theme-text-primary-dark">
                    {new Date(order.placed_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                    ${order.pricing.total.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full capitalize ${
                        order.payment_status === "paid"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : order.payment_status === "refunded"
                            ? "bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200"
                            : order.payment_status === "failed"
                            ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                      }`}
                    >
                      {order.payment_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-lg font-medium">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleViewOrder(order._id)}
                        className="text-theme-primary hover:text-theme-primary-hover"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(order)}
                        className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300"
                        title="Update Status"
                      >
                        <Edit3 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showStatusModal && selectedOrder && (
        <UpdateStatusModal
          order={selectedOrder}
          onClose={() => {
            setShowStatusModal(false);
            setSelectedOrder(null);
          }}
          onUpdate={(status) => {
            onUpdateStatus(selectedOrder._id, status);
            setShowStatusModal(false);
            setSelectedOrder(null);
          }}
        />
      )}
    </>
  );
}
