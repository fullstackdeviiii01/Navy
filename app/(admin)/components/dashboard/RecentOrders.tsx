// app/(admin)/components/dashboard/RecentOrders.tsx
"use client";

import { ShoppingBag, ArrowRight, Eye } from "lucide-react";
import { useRouter } from "next/navigation";

// ── Types (derived from IOrderDocument in app/models/Order.ts) ─────────────

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

interface RecentOrdersProps {
  orders: IRecentOrder[];
}

// ── Helpers ────────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<TOrderStatus, string> = {
  pending:    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  confirmed:  "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  processing: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  shipped:    "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
  delivered:  "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  cancelled:  "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  refunded:   "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
};

const PAYMENT_STATUS_COLORS: Record<TPaymentStatus, string> = {
  paid:     "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  pending:  "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  failed:   "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  refunded: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
};

const getCustomerName = (order: IRecentOrder): string =>
  order.user_id?.name || order.guest_info?.name || "Guest Customer";

const getCustomerEmail = (order: IRecentOrder): string =>
  order.user_id?.email || order.guest_info?.email || "No email provided";

// ── Component ──────────────────────────────────────────────────────────────

export default function RecentOrders({ orders }: RecentOrdersProps) {
  const router = useRouter();

  return (
    <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg sm:rounded-xl shadow-sm border border-theme-border-light dark:border-theme-border-dark p-3 sm:p-4 lg:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-3 sm:gap-4">
        <div className="min-w-0">
          <h3 className="text-base sm:text-lg font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark flex items-center gap-2">
            <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5 text-theme-primary" aria-hidden="true" />
            Recent Orders
          </h3>
          <p className="text-xs sm:text-sm text-theme-text-secondary-light dark:text-theme-text-muted-dark mt-1">
            Latest customer orders
          </p>
        </div>
        <button
          onClick={() => router.push("/admin/orders")}
          aria-label="View all orders"
          className="text-xs sm:text-sm text-theme-primary hover:text-theme-primary-hover font-medium flex items-center gap-1 self-start sm:self-center"
        >
          View All
          <ArrowRight size={14} className="sm:w-4 sm:h-4" />
        </button>
      </div>

      <div className="overflow-x-auto -mx-2 sm:mx-0">
        <div className="min-w-full inline-block align-middle">
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-theme-border-light dark:divide-theme-border-dark">
              <thead>
                <tr className="border-b border-theme-border-light dark:border-theme-border-dark">
                  <th className="text-left py-2 px-2 sm:px-4 text-xs font-medium text-theme-text-muted-light dark:text-theme-text-secondary-dark uppercase tracking-wider">
                    Order
                  </th>
                  <th className="text-left py-2 px-2 sm:px-4 text-xs font-medium text-theme-text-muted-light dark:text-theme-text-secondary-dark uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="text-left py-2 px-2 sm:px-4 text-xs font-medium text-theme-text-muted-light dark:text-theme-text-secondary-dark uppercase tracking-wider">
                    Total
                  </th>
                  <th className="text-left py-2 px-2 sm:px-4 text-xs font-medium text-theme-text-muted-light dark:text-theme-text-secondary-dark uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left py-2 px-2 sm:px-4 text-xs font-medium text-theme-text-muted-light dark:text-theme-text-secondary-dark uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-theme-border-light dark:divide-theme-border-dark">
                {orders.slice(0, 5).map((order) => (
                  <tr
                    key={order._id}
                    className="hover:bg-theme-hover-bg-light dark:hover:bg-theme-hover-bg-dark transition-colors"
                  >
                    {/* Order Number */}
                    <td className="py-3 px-2 sm:px-4 whitespace-nowrap">
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-mono font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark truncate max-w-[100px] sm:max-w-none">
                          {order.order_number}
                        </p>
                        <p className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark">
                          {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </td>

                    {/* Customer */}
                    <td className="py-3 px-2 sm:px-4">
                      <div className="min-w-0 max-w-[120px] sm:max-w-none">
                        <p className="text-xs sm:text-sm text-theme-text-primary-light dark:text-theme-text-primary-dark truncate">
                          {getCustomerName(order)}
                        </p>
                        <p className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark truncate">
                          {getCustomerEmail(order)}
                        </p>
                        {order.order_type === "guest" && (
                          <span className="text-[10px] font-medium text-purple-600 dark:text-purple-400">
                            Guest
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Total */}
                    <td className="py-3 px-2 sm:px-4 whitespace-nowrap">
                      <p className="text-xs sm:text-sm font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                        {order.pricing.currency} {order.pricing.total.toFixed(2)}
                      </p>
                      <p className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark">
                        {new Date(order.placed_at).toLocaleDateString()}
                      </p>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-2 sm:px-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${STATUS_COLORS[order.status]}`}>
                          {order.status}
                        </span>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${PAYMENT_STATUS_COLORS[order.payment_status]}`}>
                          {order.payment_status}
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-2 sm:px-4 whitespace-nowrap">
                      <button
                        onClick={() => router.push(`/admin/orders/${order._id}`)}
                        className="text-theme-primary hover:text-theme-primary-hover p-1"
                        aria-label={`View details for order ${order.order_number}`}
                      >
                        <Eye size={16} className="sm:w-4 sm:h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {orders.length === 0 && (
        <div className="text-center py-6 sm:py-8">
          <ShoppingBag
            className="h-8 w-8 sm:h-12 sm:w-12 text-theme-text-muted-light dark:text-theme-text-muted-dark mx-auto mb-2 sm:mb-3"
            aria-hidden="true"
          />
          <p className="text-sm text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
            No orders yet
          </p>
        </div>
      )}
    </div>
  );
}