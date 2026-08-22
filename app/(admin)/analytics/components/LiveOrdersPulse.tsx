// app/(admin)/analytics/components/LiveOrdersPulse.tsx
"use client";

import { ShoppingBag, ArrowRight, Eye, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

interface OrderItem {
  _id: string;
  order_number: string;
  order_type: "registered" | "guest";
  user_id?: { name: string; email: string } | null;
  guest_info?: { name: string; email: string } | null;
  items: any[];
  pricing: { total: number };
  status: string;
  payment_status: string;
  placed_at: string;
}

interface LiveOrdersPulseProps {
  orders: OrderItem[];
}

const STATUS_CONFIG: Record<string, { label: string; badge: string }> = {
  pending: {
    label: "Pending",
    badge: "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300",
  },
  confirmed: {
    label: "Confirmed",
    badge: "bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300",
  },
  processing: {
    label: "Processing",
    badge: "bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300",
  },
  shipped: {
    label: "Shipped",
    badge: "bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300",
  },
  delivered: {
    label: "Delivered",
    badge: "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300",
  },
  cancelled: {
    label: "Cancelled",
    badge: "bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300",
  },
  refunded: {
    label: "Refunded",
    badge: "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300",
  },
};

export default function LiveOrdersPulse({ orders = [] }: LiveOrdersPulseProps) {
  const router = useRouter();

  const getCustomerName = (order: OrderItem) =>
    order.user_id?.name || order.guest_info?.name || "Guest Customer";

  const getCustomerEmail = (order: OrderItem) =>
    order.user_id?.email || order.guest_info?.email || "No email";

  return (
    <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-2xl border border-theme-border-light dark:border-theme-border-dark p-5 sm:p-6 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-theme-border-light/80 dark:border-theme-border-dark/80">
        <div>
          <h3 className="text-base font-serif font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-theme-hover-light dark:text-theme-hover-dark" />
            <span>Recent Orders</span>
          </h3>
          <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark mt-0.5">
            Latest customer transactions and shipping updates.
          </p>
        </div>

        <button
          type="button"
          onClick={() => router.push("/admin/orders")}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-theme-border-light dark:border-theme-border-dark bg-theme-bg-light dark:bg-theme-bg-dark text-xs font-semibold text-theme-text-secondary-light hover:text-theme-text-primary-light hover:border-neutral-900 dark:hover:border-neutral-100 transition-all self-start sm:self-auto"
        >
          <span>All Orders</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-theme-card-light/70 dark:bg-theme-card-dark/50 border-b border-theme-border-light dark:border-theme-border-dark text-[11px] uppercase tracking-wider text-theme-text-secondary-light dark:text-theme-text-secondary-dark font-semibold">
              <th className="py-3 px-4">Order # & Date</th>
              <th className="py-3 px-4">Customer</th>
              <th className="py-3 px-4">Items</th>
              <th className="py-3 px-4">Total</th>
              <th className="py-3 px-4">Order Status</th>
              <th className="py-3 px-4">Payment</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-theme-border-light/60 dark:divide-theme-border-dark/60">
            {orders.slice(0, 6).map((order) => {
              const statusCfg = STATUS_CONFIG[order.status] || {
                label: order.status,
                badge: "bg-neutral-100 text-neutral-800",
              };

              return (
                <tr
                  key={order._id}
                  className="hover:bg-theme-card-light/40 dark:hover:bg-theme-card-dark/30 transition-colors"
                >
                  {/* Order Number & Date */}
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
                  <td className="py-3.5 px-4 max-w-[200px]">
                    <p className="font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark truncate">
                      {getCustomerName(order)}
                    </p>
                    <p className="text-[11px] text-theme-text-muted-light truncate">
                      {getCustomerEmail(order)}
                    </p>
                  </td>

                  {/* Items */}
                  <td className="py-3.5 px-4 whitespace-nowrap text-theme-text-secondary-light">
                    {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? "s" : ""}
                  </td>

                  {/* Total */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="font-bold font-serif text-theme-text-primary-light dark:text-theme-text-primary-dark">
                      Rs. {order.pricing?.total?.toLocaleString() || "0"}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${statusCfg.badge}`}
                    >
                      {statusCfg.label}
                    </span>
                  </td>

                  {/* Payment */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-semibold capitalize ${
                        order.payment_status === "paid"
                          ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300"
                          : "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300"
                      }`}
                    >
                      {order.payment_status}
                    </span>
                  </td>

                  {/* Action */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => router.push(`/admin/orders/${order._id}`)}
                      className="p-1.5 text-theme-text-muted-light hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                      title="View Order Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {orders.length === 0 && (
        <div className="text-center py-10 text-xs text-theme-text-muted-light">
          No customer orders recorded yet.
        </div>
      )}
    </div>
  );
}
