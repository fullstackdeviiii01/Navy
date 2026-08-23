import { useState, useEffect } from "react";
import {
  Package,
  MapPin,
  CreditCard,
  Calendar,
  Truck,
  Star,
} from "lucide-react";
import Image from "next/image";
import OrderStatusBadge from "../OrderStatusBadge";
import ShippingAddress from "./ShippingAddress";
import BillingAddress from "./BillingAddress";
import DownloadInvoiceButton from "../../invoice/DownloadInvoiceButton";
import ReturnStatusCard from "../../returns/ReturnStatusCard";
import { returnsApi } from "../../../../lib/api/returns";
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
  const [returnDoc, setReturnDoc] = useState<any>(null);
  const canCancel = ["pending", "confirmed"].includes(order.status);
  const canReview = order.status === "delivered";

  useEffect(() => {
    fetchReturnData();
  }, [order._id]);

  const fetchReturnData = async () => {
    try {
      const data = await returnsApi.getReturnByOrder(order._id);
      setReturnDoc(data.return || null);
    } catch (err) {
      console.error("Failed to fetch order return status:", err);
    }
  };

  const handleRefreshAll = () => {
    fetchReturnData();
    onRefresh();
  };

  return (
    <div className="bg-theme-bg-light dark:bg-theme-bg-dark py-6 transition-colors">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Left Side */}
          <div className="lg:col-span-2 space-y-6">
            {/* Returns & Exchange Live Tracker / Action Card */}
            <ReturnStatusCard
              order={order}
              returnDoc={returnDoc}
              onRefresh={handleRefreshAll}
            />

            <div className="border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark overflow-hidden">
              {/* Header Banner */}
              <div className="p-6 border-b border-theme-border-light dark:border-theme-border-dark">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h1 className="text-xl font-serif italic text-theme-text-primary-light dark:text-theme-text-primary-dark">
                        Order Details
                      </h1>
                      <OrderStatusBadge status={order.status} />
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-xs uppercase tracking-wider text-theme-text-muted-light dark:text-theme-text-muted-dark font-mono">
                      <span>{order.order_number}</span>
                      <span>•</span>
                      <span>{new Date(order.placed_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-[10px] uppercase tracking-wider text-theme-text-muted-light dark:text-theme-text-muted-dark">
                        Total
                      </p>
                      <p className="text-xl font-serif text-theme-text-primary-light dark:text-theme-text-primary-dark font-semibold">
                        {formatPrice(order.pricing.total)}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2">
                      <DownloadInvoiceButton
                        orderId={order._id}
                        orderNumber={order.order_number}
                        paymentStatus={order.payment_status}
                        isAdmin={false}
                      />
                    </div>

                    {canCancel && (
                      <button
                        onClick={onCancel}
                        aria-label={`Cancel order ${order.order_number}`}
                        className="px-3 py-2 text-xs uppercase tracking-wider text-red-600 dark:text-red-400 border border-red-500/30 hover:bg-red-500/10 transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="p-6">
                <h2 className="text-xs uppercase tracking-[0.2em] font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark flex items-center gap-2 mb-4">
                  <Package size={14} aria-hidden="true" />
                  Pieces in this order
                </h2>

                <div className="space-y-4">
                  {order.items.map((item: any, index: number) => {
                    const itemImg =
                      item.product_image ||
                      item.product_id?.images?.[0]?.url ||
                      item.image ||
                      "";
                    const itemName = item.product_name || item.name || "Custom Lamp";

                    return (
                      <div
                        key={index}
                        className="flex gap-4 pb-4 border-b border-theme-border-light dark:border-theme-border-dark last:border-0 last:pb-0"
                      >
                        <div className="relative flex-shrink-0 w-20 h-20 bg-theme-card-light dark:bg-theme-card-dark border border-theme-border-light dark:border-theme-border-dark overflow-hidden flex items-center justify-center">
                          {itemImg ? (
                            <img
                              src={itemImg}
                              alt={itemName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-theme-text-muted-light dark:text-theme-text-muted-dark">
                              <Package size={22} />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-serif text-sm text-theme-text-primary-light dark:text-theme-text-primary-dark">
                            {itemName}
                          </h3>

                        {/* Variant Attributes */}
                        {item.variant_attributes &&
                          Object.keys(item.variant_attributes).length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-1.5">
                              {Object.entries(item.variant_attributes).map(
                                ([key, value]: [string, any]) => (
                                  <span
                                    key={key}
                                    className="inline-flex items-center px-2 py-0.5 border border-theme-border-light dark:border-theme-border-dark bg-theme-card-light/40 dark:bg-theme-card-dark/30 text-theme-text-secondary-light dark:text-theme-text-secondary-dark text-[10px] uppercase tracking-wider"
                                  >
                                    <span className="text-theme-text-muted-light dark:text-theme-text-muted-dark mr-1">{key}:</span>
                                    <span className="font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark">
                                      {value}
                                    </span>
                                  </span>
                                ),
                              )}
                            </div>
                          )}

                        <p className="text-xs uppercase tracking-wider text-theme-text-muted-light dark:text-theme-text-muted-dark mt-1">
                          {formatPrice(item.price)} × {item.quantity}
                        </p>
                        <p className="text-xs sm:text-sm font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark mt-1">
                          {formatPrice(item.subtotal)}
                        </p>

                        {/* Review Button for Delivered Orders */}
                        {isGuestView && canReview && onReviewClick && (
                          <div className="mt-2">
                            {item.reviewed ? (
                              <div
                                role="status"
                                aria-label={`Review submitted for ${item.product_name}`}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-500/10 text-green-700 dark:text-green-300 border border-green-500/30 text-[11px] uppercase tracking-wider font-medium"
                              >
                                <Star
                                  className="w-3 h-3 fill-current"
                                  aria-hidden="true"
                                />
                                Review Submitted
                              </div>
                            ) : (
                              <button
                                onClick={() => onReviewClick(item)}
                                aria-label={`Write review for ${item.product_name}`}
                                className="inline-flex items-center gap-1.5 px-3 py-1 text-xs uppercase tracking-wider font-medium text-theme-hover-light dark:text-theme-hover-dark border border-theme-hover-light/40 hover:bg-theme-card-light dark:hover:bg-theme-card-dark transition-colors"
                              >
                                <Star className="w-3 h-3" />
                                Write Review
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                </div>

                {/* Addresses Grid */}
                <div className="border-t border-theme-border-light dark:border-theme-border-dark my-6 pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Shipping Address */}
                    <div>
                      <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark flex items-center gap-2 mb-3">
                        <MapPin size={14} aria-hidden="true" />
                        Shipping Destination
                      </h3>
                      <ShippingAddress address={order.shipping_address} />
                    </div>

                    {/* Billing Address */}
                    <div>
                      <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark flex items-center gap-2 mb-3">
                        <CreditCard size={14} aria-hidden="true" />
                        Billing Details
                      </h3>
                      <BillingAddress
                        address={order.billing_address}
                        sameAsShipping={order.same_as_shipping}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Tracking Info */}
              {(order.tracking_number || order.carrier) && (
                <div className="border-t border-theme-border-light dark:border-theme-border-dark p-6 bg-theme-card-light/40 dark:bg-theme-card-dark/30">
                  <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark flex items-center gap-2 mb-2">
                    <Truck size={14} aria-hidden="true" />
                    Tracking Information
                  </h3>
                  <div className="space-y-1 text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
                    {order.carrier && (
                      <p>
                        <span className="font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark">Courier:</span>{" "}
                        {order.carrier}
                      </p>
                    )}
                    {order.tracking_number && (
                      <p>
                        <span className="font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark">Tracking ID:</span>{" "}
                        <span className="font-mono">{order.tracking_number}</span>
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Right Side */}
          <div className="lg:col-span-1 space-y-6">
            {/* Order Summary */}
            <div className="border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark p-6">
              <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark pb-3 border-b border-theme-border-light dark:border-theme-border-dark mb-4">
                Price Breakdown
              </h3>
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="uppercase tracking-wider text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
                    Subtotal
                  </span>
                  <span className="font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark">
                    {formatPrice(order.pricing.subtotal)}
                  </span>
                </div>
                {order.pricing.discount_amount > 0 && (
                  <div className="flex justify-between text-green-600 dark:text-green-400">
                    <span className="uppercase tracking-wider">Discount</span>
                    <span>-{formatPrice(order.pricing.discount_amount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="uppercase tracking-wider text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
                    Delivery
                  </span>
                  <span className="font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark">
                    {order.pricing.shipping_cost === 0
                      ? "FREE"
                      : formatPrice(order.pricing.shipping_cost)}
                  </span>
                </div>
                <div className="border-t border-theme-border-light dark:border-theme-border-dark pt-3 flex justify-between items-baseline font-semibold">
                  <span className="text-xs uppercase tracking-[0.2em] text-theme-text-primary-light dark:text-theme-text-primary-dark">
                    Total
                  </span>
                  <span className="text-lg font-serif text-theme-text-primary-light dark:text-theme-text-primary-dark font-semibold">
                    {formatPrice(order.pricing.total)}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-theme-border-light dark:border-theme-border-dark">
                <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark flex items-center gap-2">
                  <CreditCard size={14} aria-hidden="true" />
                  Payment Details
                </h3>
                <span
                  className={`inline-flex px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider border ${
                    order.payment_status === "paid"
                      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                      : order.payment_method === "cod"
                      ? "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30"
                      : "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30"
                  }`}
                >
                  {order.payment_status === "paid"
                    ? "Paid ✓"
                    : order.payment_method === "cod"
                    ? "Pay on Delivery"
                    : "Pending Verification"}
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
                    Method:
                  </span>
                  <span className="font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark uppercase">
                    {order.payment_method === "jazzcash"
                      ? "JazzCash"
                      : order.payment_method === "bank_transfer"
                      ? "Bank Transfer"
                      : "Cash on Delivery"}
                  </span>
                </div>

                {order.payment_status !== "paid" && (
                  <p className="text-[11px] text-theme-text-muted-light dark:text-theme-text-muted-dark italic">
                    {order.payment_method === "cod"
                      ? "Please keep exact cash ready for the courier when your package arrives."
                      : "Your payment reference is being verified with our bank. Your order will be confirmed once verified."}
                  </p>
                )}

                {order.bank_reference && (
                  <div className="p-3 bg-theme-card-light/40 dark:bg-theme-card-dark/30 border border-theme-border-light dark:border-theme-border-dark">
                    <p className="text-[10px] uppercase tracking-wider text-theme-text-muted-light dark:text-theme-text-muted-dark mb-0.5">
                      Transaction / Reference ID
                    </p>
                    <p className="text-theme-text-primary-light dark:text-theme-text-primary-dark font-mono font-bold">
                      {order.bank_reference}
                    </p>
                  </div>
                )}

                {order.payment_proof_url && (
                  <div className="pt-1">
                    <a
                      href={order.payment_proof_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded border border-theme-border-light dark:border-theme-border-dark hover:border-theme-hover-light text-theme-text-primary-light text-xs font-semibold transition-colors"
                    >
                      <span>View Uploaded Receipt ↗</span>
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Timeline */}
            <div className="border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark p-6">
              <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark flex items-center gap-2 pb-3 border-b border-theme-border-light dark:border-theme-border-dark mb-4">
                <Calendar size={14} aria-hidden="true" />
                Timeline
              </h3>
              <div className="space-y-3 text-xs">
                <div>
                  <p className="font-medium uppercase tracking-wider text-theme-text-primary-light dark:text-theme-text-primary-dark">
                    Order Placed
                  </p>
                  <p className="text-theme-text-muted-light dark:text-theme-text-muted-dark">
                    {new Date(order.placed_at).toLocaleString()}
                  </p>
                </div>
                {order.confirmed_at && (
                  <div>
                    <p className="font-medium uppercase tracking-wider text-theme-text-primary-light dark:text-theme-text-primary-dark">
                      Confirmed
                    </p>
                    <p className="text-theme-text-muted-light dark:text-theme-text-muted-dark">
                      {new Date(order.confirmed_at).toLocaleString()}
                    </p>
                  </div>
                )}
                {order.shipped_at && (
                  <div>
                    <p className="font-medium uppercase tracking-wider text-theme-text-primary-light dark:text-theme-text-primary-dark">
                      Dispatched
                    </p>
                    <p className="text-theme-text-muted-light dark:text-theme-text-muted-dark">
                      {new Date(order.shipped_at).toLocaleString()}
                    </p>
                  </div>
                )}
                {order.delivered_at && (
                  <div>
                    <p className="font-medium uppercase tracking-wider text-green-600 dark:text-green-400">
                      Delivered
                    </p>
                    <p className="text-theme-text-muted-light dark:text-theme-text-muted-dark">
                      {new Date(order.delivered_at).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Customer Notes */}
            {order.customer_notes && (
              <div className="border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark p-6">
                <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark pb-3 border-b border-theme-border-light dark:border-theme-border-dark mb-3">
                  Special Instructions
                </h3>
                <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
                  {order.customer_notes}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
