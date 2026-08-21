// // app/components/orders/orderdetail/UserOrderDetailView.tsx
"use client";

import {
  Package,
  MapPin,
  CreditCard,
  Calendar,
  Truck,
  Star,
} from "lucide-react";
import OrderStatusBadge from "../OrderStatusBadge";
import ShippingAddress from "./ShippingAddress";
import BillingAddress from "./BillingAddress";
import RequestReturnButton from "../RequestReturnButton";
import DownloadInvoiceButton from "../../invoice/DownloadInvoiceButton";
import { formatPrice } from "../../../../lib/utils/formatPrice";

interface UserOrderDetailViewProps {
  order: any;
  onCancel: () => void;
  onRefresh: () => void;
  onReviewClick?: (item: any) => void;
  isGuestView?: boolean;
}

export default function UserOrderDetailView({
  order,
  onCancel,
  onRefresh,
  onReviewClick,
  isGuestView = false,
}: UserOrderDetailViewProps) {
    const canCancel = ["pending", "confirmed"].includes(order.status);
  const canReview = order.status === "delivered";

  return (
    <div className="min-h-screen bg-theme-bg-light dark:bg-theme-bg-dark py-6">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Left Side */}
          <div className="lg:col-span-2">
            {/* Single Card Container for Order Details */}
            <div className="bg-theme-surface-light dark:bg-theme-surface-dark border border-theme-border-light dark:border-theme-border-dark overflow-hidden">
              {/* Header Banner */}
              <div className="p-5 border-b border-theme-border-light dark:border-theme-border-dark">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex gap-2">
                      <h1 className="text-xl font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                        Order Details
                      </h1>
                      <OrderStatusBadge status={order.status} />
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <p className="text-sm text-theme-text-muted-light dark:text-theme-text-muted-dark font-mono">
                        {order.order_number}
                      </p>
                      <span className="text-theme-text-muted-light dark:text-theme-text-muted-dark">
                        •
                      </span>
                      <p className="text-sm text-theme-text-muted-light dark:text-theme-text-muted-dark">
                        {new Date(order.placed_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark">
                        Order Total
                      </p>
                      <p className="text-xl font-bold text-theme-primary">
                        {formatPrice(order.pricing.total)}
                      </p>
                    </div>

                    {/* ✅ Stacked vertically */}
                    <div className="flex flex-col gap-2">
                      <DownloadInvoiceButton
                        orderId={order._id}
                        orderNumber={order.order_number}
                        paymentStatus={order.payment_status}
                        isAdmin={false}
                      />
                      {order.has_active_return ? (
                        <div className="px-3 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 text-xs font-medium text-blue-800 dark:text-blue-200">
                          Return {order.return_status}
                        </div>
                      ) : (
                        <RequestReturnButton
                          order={order}
                          onSuccess={onRefresh}
                        />
                      )}
                    </div>

                    {canCancel && (
                      <button
                        onClick={onCancel}
                        aria-label={`Cancel order ${order.order_number}`}
                        className="flex items-center gap-2 px-3 py-2 text-xs text-white bg-red-600 transition-colors hover:bg-red-700"
                      >
                        Cancel Order
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="p-5">
                <div className="mb-4">
                  <h2 className="text-sm font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark flex items-center gap-2 mb-3">
                    <Package size={16} aria-hidden="true" />
                    Order Items
                  </h2>

                  {/* Items List with Review Buttons for Guest */}
                  <div className="space-y-4">
                    {order.items.map((item: any, index: number) => (
                      <div
                        key={index}
                        className="flex gap-4 pb-4 border-b border-theme-border-light dark:border-theme-border-dark last:border-0 last:pb-0"
                      >
                        <div className="flex-shrink-0 w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                          {item.product_image && (
                            <img
                              src={item.product_image}
                              alt={item.product_name}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm text-theme-text-primary-light dark:text-theme-text-primary-dark">
                            {item.product_name}
                          </h3>

                          {/* Variant Attributes */}
                          {item.variant_attributes &&
                            Object.keys(item.variant_attributes).length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {Object.entries(item.variant_attributes).map(
                                  ([key, value]: [string, any]) => (
                                    <span
                                      key={key}
                                      className="inline-flex items-center px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded"
                                    >
                                      <span className="capitalize">{key}:</span>
                                      <span className="ml-1 font-medium">
                                        {value}
                                      </span>
                                    </span>
                                  ),
                                )}
                              </div>
                            )}

                          <p className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark mt-1">
                            {formatPrice(item.price)} × {item.quantity}
                          </p>
                          <p className="text-sm font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark mt-1">
                            {formatPrice(item.subtotal)}
                          </p>

                          {/* Review Button for Guest Users on Delivered Orders */}
                          {isGuestView && canReview && onReviewClick && (
                            <div className="mt-2">
                              {item.reviewed ? (
                                <div
                                  role="status"
                                  aria-label={`Review submitted for ${item.product_name}`}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg text-xs font-medium"
                                >
                                  <Star
                                    className="w-3.5 h-3.5 fill-current"
                                    aria-hidden="true"
                                  />
                                  Review Submitted
                                </div>
                              ) : (
                                <button
                                  onClick={() => onReviewClick(item)}
                                  aria-label={`Write review for ${item.product_name}`}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                >
                                  <Star className="w-3.5 h-3.5" />
                                  Write Review
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-theme-border-light dark:border-theme-border-dark my-4"></div>

                {/* Addresses Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Shipping Address */}
                  <div>
                    <h3 className="text-sm font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark flex items-center gap-2 mb-3">
                      <MapPin size={16} aria-hidden="true" />
                      Shipping Address
                    </h3>
                    <ShippingAddress address={order.shipping_address} />
                  </div>

                  {/* Billing Address */}
                  <div>
                    <h3 className="text-sm font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark flex items-center gap-2 mb-3">
                      <CreditCard size={16} aria-hidden="true" />
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
                      <Truck size={16} aria-hidden="true" />
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
                <div className="p-4 space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
                      Subtotal
                    </span>
                    <span className="text-theme-text-primary-light dark:text-theme-text-primary-dark">
                      {formatPrice(order.pricing.subtotal)}
                    </span>
                  </div>
                  {order.pricing.discount_amount > 0 && (
                    <div className="flex justify-between text-green-600 dark:text-green-400">
                      <span>Discount</span>
                      <span>-{formatPrice(order.pricing.discount_amount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
                      Tax
                    </span>
                    <span className="text-theme-text-primary-light dark:text-theme-text-primary-dark">
                      {formatPrice(order.pricing.tax_amount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
                      Shipping
                    </span>
                    <span className="text-theme-text-primary-light dark:text-theme-text-primary-dark">
                      {order.pricing.shipping_cost === 0
                        ? "FREE"
                        : formatPrice(order.pricing.shipping_cost)}
                    </span>
                  </div>
                  <div className="border-t border-theme-border-light dark:border-theme-border-dark pt-3 flex justify-between font-semibold">
                    <span className="text-theme-text-primary-light dark:text-theme-text-primary-dark">
                      Total
                    </span>
                    <span className="text-xl text-theme-primary">
                      {formatPrice(order.pricing.total)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Proof (Bank Transfer / JazzCash) */}
              {(order.payment_proof_url || order.bank_reference || order.payment_method !== "cod") && (
                <div className="bg-theme-surface-light dark:bg-theme-surface-dark border border-theme-border-light dark:border-theme-border-dark rounded-xl overflow-hidden shadow-sm">
                  <div className="p-4 border-b border-theme-border-light dark:border-theme-border-dark bg-[#E9DFCE]/40 dark:bg-[#48381A]/40 flex items-center justify-between">
                    <h3 className="font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark flex items-center gap-2 text-sm">
                      <CreditCard size={18} className="text-[#A8752B]" aria-hidden="true" />
                      Payment Verification Proof
                    </h3>
                    <span className="text-[11px] uppercase font-semibold px-2.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200">
                      {order.payment_method === "jazzcash"
                        ? "JazzCash"
                        : order.payment_method === "bank_transfer"
                        ? "Meezan Bank"
                        : "COD"}
                    </span>
                  </div>
                  <div className="p-4 space-y-3 text-sm">
                    {order.bank_reference && (
                      <div className="p-2.5 bg-white dark:bg-[#342611] rounded-lg border border-theme-border-light dark:border-theme-border-dark">
                        <p className="text-[11px] uppercase font-semibold text-theme-text-muted-light dark:text-theme-text-muted-dark mb-0.5">
                          Transaction / Reference ID
                        </p>
                        <p className="text-theme-text-primary-light dark:text-theme-text-primary-dark font-mono font-bold">
                          {order.bank_reference}
                        </p>
                      </div>
                    )}
                    {order.payment_proof_url ? (
                      <div>
                        <p className="font-medium text-xs uppercase tracking-wider text-theme-text-muted-light dark:text-theme-text-muted-dark mb-2">
                          Your Uploaded Receipt Screenshot:
                        </p>
                        <a
                          href={order.payment_proof_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block group relative overflow-hidden rounded-lg border border-theme-border-light dark:border-theme-border-dark"
                        >
                          <img
                            src={order.payment_proof_url}
                            alt="Payment receipt proof"
                            className="w-full max-h-72 object-contain bg-black/5 dark:bg-black/20 group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-semibold transition-opacity">
                            Click to view full image ↗
                          </div>
                        </a>
                      </div>
                    ) : order.payment_method !== "cod" ? (
                      <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                        No receipt screenshot attached
                      </p>
                    ) : null}
                  </div>
                </div>
              )}

              {/* Timeline */}
              <div className="bg-theme-surface-light dark:bg-theme-surface-dark border border-theme-border-light dark:border-theme-border-dark rounded-xl overflow-hidden">
                <div className="p-4 border-b border-theme-border-light dark:border-theme-border-dark">
                  <h3 className="font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark flex items-center gap-2">
                    <Calendar size={18} aria-hidden="true" />
                    Order Timeline
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

              {/* Customer Notes */}
              {order.customer_notes && (
                <div className="bg-theme-surface-light dark:bg-theme-surface-dark border border-theme-border-light dark:border-theme-border-dark rounded-xl overflow-hidden">
                  <div className="p-4 border-b border-theme-border-light dark:border-theme-border-dark">
                    <h3 className="font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                      Your Notes
                    </h3>
                  </div>
                  <div className="p-4 text-sm break-words text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
                    {order.customer_notes}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
