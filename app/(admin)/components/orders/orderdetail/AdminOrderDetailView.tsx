// app/(admin)/components/orders/orderdetails/AdminOrderDetailView.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Package,
  MapPin,
  CreditCard,
  Calendar,
  User,
  Truck,
  Edit3,
} from "lucide-react";
import OrderStatusBadge from "../OrderStatusBadge";
import UpdateStatusModal from "../UpdateStatusModal";
import OrderItems from "./OrderItems";
import CustomerInfo from "./CustomerInfo";
import { adminOrdersApi } from "../../../../../lib/api/orders";
import ShippingAddress from "../../../../components/orders/orderdetail/ShippingAddress";
import BillingAddress from "../../../../components/orders/orderdetail/BillingAddress";
import DownloadInvoiceButton from "../../../../components/invoice/DownloadInvoiceButton";

interface AdminOrderDetailViewProps {
  order: any;
  onUpdateStatus: (
    status: string,
    trackingData?: { tracking_number: string; carrier: string },
  ) => void;
  onRefresh: () => void;
}

export default function AdminOrderDetailView({
  order,
  onUpdateStatus,
  onRefresh,
}: AdminOrderDetailViewProps) {
  const router = useRouter();
  const [showStatusModal, setShowStatusModal] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header - Outside the card */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <button
            onClick={() => router.push("/admin/orders")}
            className="text-sm text-theme-primary hover:underline mb-2"
          >
            ← Back to Orders
          </button>
          <h1 className="text-xl font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark">
            Order Details
          </h1>
          <p className="text-sm text-theme-text-muted-light dark:text-theme-text-muted-dark font-mono mt-1">
            {order.order_number}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowStatusModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-theme-primary text-white rounded-lg hover:bg-theme-primary-hover"
          >
            <Edit3 size={16} />
            Update Status
          </button>
          <DownloadInvoiceButton
            orderId={order._id}
            orderNumber={order.order_number}
            paymentStatus={order.payment_status}
            isAdmin={true}
          />
          {order.payment_method === "cod" &&
            order.status === "delivered" &&
            order.payment_status !== "paid" && (
              <button
                onClick={async () => {
                  await adminOrdersApi.markPaid(order._id);
                  onRefresh();
                }}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Mark Payment Received
              </button>
            )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Left Side */}
        <div className="lg:col-span-2">
          {/* Single Card Container for Order Details */}
          <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-xl border border-theme-border-light dark:border-theme-border-dark overflow-hidden">
            {/* Status Banner */}
            <div className="p-5 border-b border-theme-border-light dark:border-theme-border-dark">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <p className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark mb-2">
                    Order Status
                  </p>
                  <OrderStatusBadge status={order.status} />
                </div>
                <div>
                  <p className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark mb-2">
                    Payment Status
                  </p>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      order.payment_status === "paid"
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                    }`}
                  >
                    {order.payment_status}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark mb-2">
                    Order Date
                  </p>
                  <p className="text-xs font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark">
                    {new Date(order.placed_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Customer Info, Order Items, Shipping & Billing - Single Unified Section */}
            <div className="p-5">
              {/* Customer Info */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark flex items-center gap-2">
                    <User size={16} />
                    {order.order_type === "guest"
                      ? "Guest Information"
                      : "Customer Information"}
                  </h2>
                  {order.order_type === "registered" &&
                    order.user_id?.customer_since && (
                      <div className="text-right">
                        <p className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark">
                          Customer Since
                        </p>
                        <p className="text-xs font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark">
                          {new Date(
                            order.user_id.customer_since,
                          ).toLocaleDateString("en-US", {
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    )}
                </div>
                <CustomerInfo
                  customer={order.user_id || {}}
                  isGuest={order.order_type === "guest"}
                  guestInfo={order.guest_info}
                />
              </div>
              {/* Divider */}
              <div className="border-t border-theme-border-light dark:border-theme-border-dark my-4"></div>
              {/* Order Items */}
              <div className="mb-4">
                <h2 className="text-sm font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark flex items-center gap-2 mb-3">
                  <Package size={16} />
                  Order Items
                </h2>
                <OrderItems items={order.items} />
              </div>
              {/* Divider */}
              <div className="border-t border-theme-border-light dark:border-theme-border-dark my-4"></div>
              {/* Addresses Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Shipping Address */}
                <div>
                  <h3 className="text-sm font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark flex items-center gap-2 mb-3">
                    <MapPin size={16} />
                    Shipping Address
                  </h3>
                  <ShippingAddress address={order.shipping_address} />
                </div>

                {/* Billing Address */}
                <div>
                  <h3 className="text-sm font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark flex items-center gap-2 mb-3">
                    <CreditCard size={16} />
                    Billing Address
                  </h3>
                  <BillingAddress
                    address={order.billing_address}
                    sameAsShipping={order.same_as_shipping}
                  />
                </div>
              </div>
            </div>

            {/* Tracking Info - Separate Section if exists */}
            {(order.tracking_number || order.carrier) && (
              <>
                <div className="border-t border-theme-border-light dark:border-theme-border-dark"></div>
                <div className="p-5 bg-blue-50 dark:bg-blue-900/10">
                  <h3 className="text-sm font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark flex items-center gap-2 mb-3">
                    <Truck size={16} />
                    Tracking Information
                  </h3>
                  <div className="space-y-1 text-xs">
                    {order.carrier && (
                      <p className="text-theme-text-primary-light dark:text-theme-text-primary-dark">
                        <span className="font-medium">Carrier:</span>{" "}
                        {order.carrier}
                      </p>
                    )}
                    {order.tracking_number && (
                      <p className="text-theme-text-primary-light dark:text-theme-text-primary-dark">
                        <span className="font-medium">Tracking:</span>{" "}
                        <span className="font-mono">
                          {order.tracking_number}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Sidebar - Right Side */}
        <div className="lg:col-span-1">
          <div className="sticky top-4 space-y-6">
            {/* Order Summary */}
            <div className="bg-theme-surface-light dark:bg-theme-surface-dark border border-theme-border-light dark:border-theme-border-dark rounded-xl overflow-hidden">
              <div className="p-4 border-b border-theme-border-light dark:border-theme-border-dark">
                <h3 className="font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                  Order Summary
                </h3>
              </div>
              <div className="p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
                    Subtotal
                  </span>
                  <span className="text-theme-text-primary-light dark:text-theme-text-primary-dark">
                    ${order.pricing.subtotal.toFixed(2)}
                  </span>
                </div>
                {order.pricing.discount_amount > 0 && (
                  <div className="flex justify-between text-green-600 dark:text-green-400">
                    <span>Discount</span>
                    <span>-${order.pricing.discount_amount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
                    Tax
                  </span>
                  <span className="text-theme-text-primary-light dark:text-theme-text-primary-dark">
                    ${order.pricing.tax_amount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
                    Shipping
                  </span>
                  <span className="text-theme-text-primary-light dark:text-theme-text-primary-dark">
                    {order.pricing.shipping_cost === 0
                      ? "FREE"
                      : `$${order.pricing.shipping_cost.toFixed(2)}`}
                  </span>
                </div>
                <div className="border-t border-theme-border-light dark:border-theme-border-dark pt-2 flex justify-between font-semibold">
                  <span className="text-theme-text-primary-light dark:text-theme-text-primary-dark">
                    Total
                  </span>
                  <span className="text-xl text-theme-primary">
                    ${order.pricing.total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-theme-surface-light dark:bg-theme-surface-dark border border-theme-border-light dark:border-theme-border-dark rounded-xl overflow-hidden">
              <div className="p-4 border-b border-theme-border-light dark:border-theme-border-dark">
                <h3 className="font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark flex items-center gap-2">
                  <Calendar size={18} />
                  Timeline
                </h3>
              </div>
              <div className="p-4 space-y-3 text-sm">
                <div>
                  <p className="font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark">
                    Placed
                  </p>
                  <p className="text-theme-text-muted-light dark:text-theme-text-muted-dark">
                    {new Date(order.placed_at).toLocaleString()}
                  </p>
                </div>
                {order.confirmed_at && (
                  <div>
                    <p className="font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark">
                      Confirmed
                    </p>
                    <p className="text-theme-text-muted-light dark:text-theme-text-muted-dark">
                      {new Date(order.confirmed_at).toLocaleString()}
                    </p>
                  </div>
                )}
                {order.shipped_at && (
                  <div>
                    <p className="font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark">
                      Shipped
                    </p>
                    <p className="text-theme-text-muted-light dark:text-theme-text-muted-dark">
                      {new Date(order.shipped_at).toLocaleString()}
                    </p>
                  </div>
                )}
                {order.delivered_at && (
                  <div>
                    <p className="font-medium text-green-600 dark:text-green-400">
                      Delivered
                    </p>
                    <p className="text-theme-text-muted-light dark:text-theme-text-muted-dark">
                      {new Date(order.delivered_at).toLocaleString()}
                    </p>
                  </div>
                )}
                {order.cancelled_at && (
                  <div>
                    <p className="font-medium text-red-600 dark:text-red-400">
                      Cancelled
                    </p>
                    <p className="text-theme-text-muted-light dark:text-theme-text-muted-dark">
                      {new Date(order.cancelled_at).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            {(order.customer_notes || order.admin_notes) && (
              <div className="bg-theme-surface-light dark:bg-theme-surface-dark border border-theme-border-light dark:border-theme-border-dark rounded-xl overflow-hidden">
                <div className="p-4 border-b border-theme-border-light dark:border-theme-border-dark">
                  <h3 className="font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                    Notes
                  </h3>
                </div>
                <div className="p-4 space-y-3 text-sm">
                  {order.customer_notes && (
                    <div>
                      <p className="font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark">
                        Customer Notes
                      </p>
                      <p className="text-theme-text-secondary-light break-words dark:text-theme-text-secondary-dark">
                        {order.customer_notes}
                      </p>
                    </div>
                  )}
                  {order.admin_notes && (
                    <div>
                      <p className="font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark">
                        Admin Notes
                      </p>
                      <p className="text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
                        {order.admin_notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showStatusModal && (
        <UpdateStatusModal
          order={order}
          onClose={() => setShowStatusModal(false)}
          onUpdate={(status, trackingData) => {
            onUpdateStatus(status, trackingData);
            setShowStatusModal(false);
          }}
        />
      )}
    </div>
  );
}
