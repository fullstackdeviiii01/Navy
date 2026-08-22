// app/(admin)/analytics/components/RecentOrdersLedger.tsx
"use client";

import { ShoppingBag, ArrowRight, Eye } from "lucide-react";
import { useRouter } from "next/navigation";

interface IGuestInfo {
  email: string;
  name: string;
  phone: string;
}

interface IOrderUser {
  _id: string;
  name: string;
  email: string;
}

interface IOrderItem {
  product_id: string;
  variant_id?: string | null;
  product_name: string;
  product_image: string;
  variant_attributes?: Record<string, string>;
  quantity: number;
  price: number;
  subtotal: number;
}

interface IOrderPricing {
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  shipping_cost: number;
  total: number;
  currency: string;
}

type TOrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

type TPaymentStatus = "pending" | "paid" | "failed" | "refunded";

interface IRecentOrder {
  _id: string;
  order_number: string;
  order_type: "registered" | "guest";
  user_id?: IOrderUser | null;
  guest_info?: IGuestInfo | null;
  items: IOrderItem[];
  pricing: IOrderPricing;
  status: TOrderStatus;
  payment_status: TPaymentStatus;
  placed_at: string;
}

interface RecentOrdersLedgerProps {
  orders: IRecentOrder[];
}

const STATUS_BADGES: Record<TOrderStatus, string> = {
  pending: "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300",
  confirmed: "bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300",
  processing: "bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300",
  shipped: "bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300",
  delivered: "bg-green-100 dark:bg-green-950/60 text-green-800 dark:text-green-300",
  cancelled: "bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300",
  refunded: "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300",
};

const PAYMENT_BADGES: Record<TPaymentStatus, string> = {
  paid: "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300",
  pending: "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300",
  failed: "bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300",
  refunded: "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300",
};

export default function RecentOrdersLedger({ orders }: RecentOrdersLedgerProps) {
  const router = useRouter();

  const getCustomerName = (order: IRecentOrder): string =>
    order.user_id?.name || order.guest_info?.name || "Guest Customer";

  const getCustomerEmail = (order: IRecentOrder): string =>
    order.user_id?.email || order.guest_info?.email || "No contact info";

  return (
    <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-xl border border-theme-border-light dark:border-theme-border-dark p-4 sm:p-5 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-theme-border-light/80 dark:border-theme-border-dark/80 pb-3">
        <div>
          <h3 className="text-base font-serif font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark flex items-center gap-2">
            <ShoppingBag className="h-4 w-4 text-theme-hover-light dark:text-theme-hover-dark" />
            <span>Recent Orders</span>
          </h3>
          <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark mt-0.5">
            Latest orders placed by customers.
          </p>
        </div>

        <button
          type="button"
          onClick={() => router.push("/admin/orders")}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-theme-border-light dark:border-theme-border-dark bg-theme-bg-light dark:bg-theme-bg-dark text-xs font-semibold text-theme-text-secondary-light hover:text-theme-text-primary-light hover:border-theme-hover-light transition-all self-start sm:self-auto"
        >
          <span>All Orders</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-theme-card-light/60 dark:bg-theme-card-dark/40 border-b border-theme-border-light dark:border-theme-border-dark text-[11px] uppercase tracking-wider text-theme-text-secondary-light dark:text-theme-text-secondary-dark font-semibold">
              <th className="py-2.5 px-3">Order #</th>
              <th className="py-2.5 px-3">Customer</th>
              <th className="py-2.5 px-3">Total Amount</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-theme-border-light/60 dark:divide-theme-border-dark/60">
            {orders.slice(0, 6).map((order) => (
              <tr
                key={order._id}
                className="hover:bg-theme-card-light/40 dark:hover:bg-theme-card-dark/30 transition-colors"
              >
                <td className="py-3 px-3 whitespace-nowrap">
                  <span className="font-mono font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark block">
                    {order.order_number}
                  </span>
                  <span className="text-[10px] text-theme-text-muted-light">
                    {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                  </span>
                </td>

                <td className="py-3 px-3 max-w-[200px]">
                  <p className="font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark truncate">
                    {getCustomerName(order)}
                  </p>
                  <p className="text-[11px] text-theme-text-muted-light truncate">
                    {getCustomerEmail(order)}
                  </p>
                </td>

                <td className="py-3 px-3 whitespace-nowrap">
                  <p className="font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                    Rs. {order.pricing.total.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-theme-text-muted-light">
                    {new Date(order.placed_at).toLocaleDateString()}
                  </p>
                </td>

                <td className="py-3 px-3 whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${STATUS_BADGES[order.status]}`}>
                      {order.status}
                    </span>
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${PAYMENT_BADGES[order.payment_status]}`}>
                      {order.payment_status}
                    </span>
                  </div>
                </td>

                <td className="py-3 px-3 text-right whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => router.push(`/admin/orders/${order._id}`)}
                    className="p-1.5 text-theme-text-muted-light hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                    title="View Order"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {orders.length === 0 && (
        <div className="text-center py-8 text-xs text-theme-text-muted-light">
          No orders logged yet.
        </div>
      )}
    </div>
  );
}
