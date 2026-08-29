// app/components/orders/orderdetail/UserOrderDetailView.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Package,
  MapPin,
  CreditCard,
  Calendar,
  Truck,
  Star,
  ExternalLink,
  Copy,
  Check,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileText,
} from "lucide-react";
import OrderStatusBadge from "../OrderStatusBadge";
import ShippingAddress from "./ShippingAddress";
import BillingAddress from "./BillingAddress";
import DownloadInvoiceButton from "../../invoice/DownloadInvoiceButton";
import ReturnStatusCard from "../../returns/ReturnStatusCard";
import { returnsApi } from "../../../../lib/api/returns";
import { formatPrice } from "../../../../lib/utils/formatPrice";
import { openImagePreview } from "../../../../lib/utils/mediaPreview";

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
  const [copiedRef, setCopiedRef] = useState(false);

  const canCancel = ["pending", "confirmed"].includes(order.status);
  const canReview = order.status === "delivered";
  const isPaid = order.payment_status === "paid";

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

  const handleCopyReference = () => {
    if (!order.bank_reference) return;
    navigator.clipboard.writeText(order.bank_reference);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  const paymentLabel =
    order.payment_method === "jazzcash"
      ? "JazzCash"
      : order.payment_method === "bank_transfer"
      ? "Bank Transfer"
      : order.payment_method === "cod"
      ? "Cash on Delivery"
      : order.payment_method || "Direct Payment";

  const totalItemsCount = order.items?.reduce(
    (acc: number, item: any) => acc + (item.quantity || 1),
    0
  ) || 0;

  return (
    <div className="w-full space-y-6">
      {/* ── 1. Top Executive Command Header ─────────────────────────────── */}
      <div className="border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark p-5 sm:p-7 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 pb-5 border-b border-theme-border-light/70 dark:border-theme-border-dark/70">
          <div className="space-y-1.5 min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-theme-text-muted-light dark:text-theme-text-muted-dark">
                ORDER REFERENCE
              </span>
              <OrderStatusBadge status={order.status} />
            </div>

            <h1 className="text-xl sm:text-2xl lg:text-3xl font-serif font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark tracking-tight">
              #{order.order_number}
            </h1>

            <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark flex flex-wrap items-center gap-2 pt-0.5">
              <span>
                Placed on{" "}
                <strong className="font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark">
                  {new Date(order.placed_at).toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </strong>
              </span>
              <span>•</span>
              <span>
                {totalItemsCount} {totalItemsCount === 1 ? "Piece" : "Pieces"}
              </span>
            </p>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-3 shrink-0 pt-2 lg:pt-0">
            <DownloadInvoiceButton
              orderId={order._id}
              orderNumber={order.order_number}
              paymentStatus={order.payment_status}
              isAdmin={false}
            />

            {canCancel && (
              <button
                type="button"
                onClick={onCancel}
                aria-label={`Cancel order ${order.order_number}`}
                className="px-4 py-2.5 sm:py-3 text-xs uppercase tracking-[0.15em] font-semibold text-rose-600 dark:text-rose-400 border border-rose-500/30 hover:bg-rose-500/10 transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-2xs"
              >
                Cancel Order
              </button>
            )}
          </div>
        </div>

        {/* ── 2. Four Key Status Metric Tiles ─────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 pt-5">
          {/* Tile 1: Order Status */}
          <div className="p-3.5 sm:p-4 border border-theme-border-light/60 dark:border-theme-border-dark/60 bg-theme-card-light/40 dark:bg-theme-card-dark/30 space-y-1">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-theme-text-muted-light dark:text-theme-text-muted-dark block">
              Order Status
            </span>
            <p className="text-xs sm:text-sm font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark capitalize truncate">
              {order.status}
            </p>
          </div>

          {/* Tile 2: Payment Method & Verification */}
          <div className="p-3.5 sm:p-4 border border-theme-border-light/60 dark:border-theme-border-dark/60 bg-theme-card-light/40 dark:bg-theme-card-dark/30 space-y-1">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-theme-text-muted-light dark:text-theme-text-muted-dark block">
              Payment Method
            </span>
            <p className="text-xs sm:text-sm font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark truncate">
              {paymentLabel}
            </p>
            <span
              className={`inline-block text-[10px] font-semibold uppercase tracking-wider ${
                isPaid
                  ? "text-emerald-700 dark:text-emerald-400"
                  : ["bank_transfer", "jazzcash"].includes(order.payment_method)
                  ? "text-amber-700 dark:text-amber-400"
                  : "text-neutral-600 dark:text-neutral-400"
              }`}
            >
              {isPaid
                ? "Paid ✓"
                : ["bank_transfer", "jazzcash"].includes(order.payment_method)
                ? "Pending Verification"
                : "Pay on Delivery"}
            </span>
          </div>

          {/* Tile 3: Shipping Carrier */}
          <div className="p-3.5 sm:p-4 border border-theme-border-light/60 dark:border-theme-border-dark/60 bg-theme-card-light/40 dark:bg-theme-card-dark/30 space-y-1">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-theme-text-muted-light dark:text-theme-text-muted-dark block">
              Delivery Method
            </span>
            <p className="text-xs sm:text-sm font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark truncate">
              {order.shipping_service?.service_name ||
                order.shipping_service?.service_display_name ||
                order.carrier ||
                "Standard Delivery"}
            </p>
          </div>

          {/* Tile 4: Total Amount */}
          <div className="p-3.5 sm:p-4 border border-theme-border-light/60 dark:border-theme-border-dark/60 bg-theme-card-light/40 dark:bg-theme-card-dark/30 space-y-1">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-theme-text-muted-light dark:text-theme-text-muted-dark block">
              Total Amount
            </span>
            <p className="text-sm sm:text-base font-serif font-bold text-theme-hover-light dark:text-theme-hover-dark truncate">
              {formatPrice(order.pricing?.total || 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Returns & Exchange Live Tracker / Action Card */}
      <ReturnStatusCard
        order={order}
        returnDoc={returnDoc}
        onRefresh={handleRefreshAll}
      />

      {/* ── 3. Main 2-Column Responsive Layout ─────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* ── Left Column: Items, Destination & Tracking ─────────────── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Pieces in Order Card */}
          <div className="border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark overflow-hidden shadow-xs">
            <div className="p-4 sm:p-6 border-b border-theme-border-light dark:border-theme-border-dark flex items-center justify-between">
              <h2 className="text-xs uppercase tracking-[0.2em] font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark flex items-center gap-2">
                <Package size={15} className="text-theme-hover-light" aria-hidden="true" />
                <span>Pieces in this order ({order.items?.length || 0})</span>
              </h2>
            </div>

            <div className="p-4 sm:p-6 divide-y divide-theme-border-light/60 dark:divide-theme-border-dark/60">
              {order.items?.map((item: any, index: number) => {
                const itemImg =
                  item.product_image ||
                  item.product_id?.images?.[0]?.url ||
                  item.image ||
                  "";
                const itemName = item.product_name || item.name || "Handcrafted Lamp";

                return (
                  <div
                    key={index}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      {/* Image Thumbnail */}
                      <div className="relative flex-shrink-0 w-20 h-20 bg-theme-card-light dark:bg-theme-card-dark border border-theme-border-light dark:border-theme-border-dark overflow-hidden group">
                        {itemImg ? (
                          <img
                            src={itemImg}
                            alt={itemName}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-theme-text-muted-light dark:text-theme-text-muted-dark">
                            <Package size={22} />
                          </div>
                        )}
                      </div>

                      {/* Info & Variants */}
                      <div className="min-w-0 space-y-1">
                        <h3 className="font-serif text-sm sm:text-base font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark truncate">
                          {itemName}
                        </h3>

                        {/* Variant Attributes */}
                        {item.variant_attributes &&
                          Object.keys(item.variant_attributes).length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-0.5">
                              {Object.entries(item.variant_attributes).map(
                                ([key, value]: [string, any]) => (
                                  <span
                                    key={key}
                                    className="inline-flex items-center px-2 py-0.5 border border-theme-border-light/80 dark:border-theme-border-dark/80 bg-theme-card-light/50 dark:bg-theme-card-dark/40 text-theme-text-secondary-light dark:text-theme-text-secondary-dark text-[10px] uppercase tracking-wider font-mono"
                                  >
                                    <span className="text-theme-text-muted-light dark:text-theme-text-muted-dark mr-1">
                                      {key}:
                                    </span>
                                    <span className="font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark">
                                      {value}
                                    </span>
                                  </span>
                                )
                              )}
                            </div>
                          )}

                        <p className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark">
                          {formatPrice(item.price_at_addition || item.price)} × {item.quantity}
                        </p>
                      </div>
                    </div>

                    {/* Price & Review Action */}
                    <div className="text-left sm:text-right shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-theme-border-light/40">
                      <p className="text-sm sm:text-base font-serif font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                        {formatPrice((item.price_at_addition || item.price) * item.quantity)}
                      </p>

                      {/* Review Button for Delivered Orders */}
                      {isGuestView && canReview && onReviewClick && (
                        <div className="mt-2">
                          {item.reviewed ? (
                            <div
                              role="status"
                              aria-label={`Review submitted for ${itemName}`}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-[10px] uppercase tracking-wider font-semibold"
                            >
                              <Star className="w-3 h-3 fill-current" aria-hidden="true" />
                              Review Submitted
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => onReviewClick(item)}
                              aria-label={`Write review for ${itemName}`}
                              className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] uppercase tracking-wider font-semibold text-theme-hover-light dark:text-theme-hover-dark border border-theme-hover-light/40 hover:bg-theme-card-light dark:hover:bg-theme-card-dark transition-colors cursor-pointer"
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
          </div>

          {/* Destination & Billing Addresses */}
          <div className="border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark p-5 sm:p-7 shadow-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
              {/* Shipping Address */}
              <div className="space-y-3">
                <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark flex items-center gap-2 pb-2.5 border-b border-theme-border-light/70 dark:border-theme-border-dark/70">
                  <MapPin size={15} className="text-theme-hover-light" aria-hidden="true" />
                  <span>Shipping Destination</span>
                </h3>
                <ShippingAddress address={order.shipping_address} />
              </div>

              {/* Billing Address */}
              <div className="space-y-3">
                <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark flex items-center gap-2 pb-2.5 border-b border-theme-border-light/70 dark:border-theme-border-dark/70">
                  <CreditCard size={15} className="text-theme-hover-light" aria-hidden="true" />
                  <span>Billing Details</span>
                </h3>
                <BillingAddress
                  address={order.billing_address}
                  sameAsShipping={order.same_as_shipping}
                />
              </div>
            </div>
          </div>

          {/* Tracking & Courier Information (if tracking number or carrier present) */}
          {(order.tracking_number || order.carrier) && (
            <div className="border border-theme-border-light dark:border-theme-border-dark p-5 sm:p-7 bg-theme-card-light/40 dark:bg-theme-card-dark/30 shadow-xs space-y-3">
              <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark flex items-center gap-2 pb-2.5 border-b border-theme-border-light dark:border-theme-border-dark">
                <Truck size={15} className="text-theme-hover-light" aria-hidden="true" />
                <span>Live Courier Tracking</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {order.carrier && (
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-theme-text-muted-light block">
                      Courier Partner
                    </span>
                    <span className="font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                      {order.carrier}
                    </span>
                  </div>
                )}
                {order.tracking_number && (
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-theme-text-muted-light block">
                      Tracking Waybill / ID
                    </span>
                    <span className="font-mono font-bold text-indigo-700 dark:text-indigo-400">
                      {order.tracking_number}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Right Column: Price Breakdown, Payment & Timeline ───────── */}
        <div className="lg:col-span-1 space-y-6">
          {/* 1. Price Breakdown Card */}
          <div className="border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark p-5 sm:p-6 shadow-xs space-y-4">
            <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark pb-3 border-b border-theme-border-light dark:border-theme-border-dark">
              Price Breakdown
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
                <span className="uppercase tracking-wider">Subtotal</span>
                <span className="font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark">
                  {formatPrice(order.pricing?.subtotal || 0)}
                </span>
              </div>

              {order.pricing?.discount_amount > 0 && (
                <div className="flex justify-between items-center text-emerald-700 dark:text-emerald-400 font-medium">
                  <span className="uppercase tracking-wider">
                    Discount {order.coupon_code ? `(${order.coupon_code})` : ""}
                  </span>
                  <span>-{formatPrice(order.pricing.discount_amount)}</span>
                </div>
              )}

              <div className="flex justify-between items-center text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
                <span className="uppercase tracking-wider">Delivery</span>
                <span className="font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark">
                  {order.pricing?.shipping_cost === 0
                    ? "FREE"
                    : formatPrice(order.pricing?.shipping_cost || 0)}
                </span>
              </div>

              <div className="border-t border-theme-border-light dark:border-theme-border-dark pt-3.5 flex justify-between items-baseline">
                <span className="text-xs uppercase tracking-[0.2em] font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                  Total
                </span>
                <span className="text-xl sm:text-2xl font-serif font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                  {formatPrice(order.pricing?.total || 0)}
                </span>
              </div>
            </div>
          </div>

          {/* 2. Payment Information Card */}
          <div className="border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-theme-border-light dark:border-theme-border-dark">
              <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark flex items-center gap-2">
                <CreditCard size={15} className="text-theme-hover-light" aria-hidden="true" />
                <span>Payment Details</span>
              </h3>
              <span
                className={`inline-flex px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider border ${
                  order.payment_status === "paid"
                    ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                    : order.payment_method === "cod"
                    ? "bg-neutral-500/10 text-neutral-700 dark:text-neutral-300 border-neutral-500/30"
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

            <div className="space-y-3.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-theme-text-secondary-light dark:text-theme-text-secondary-dark uppercase tracking-wider text-[11px]">
                  Method:
                </span>
                <span className="font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                  {paymentLabel}
                </span>
              </div>

              {/* Informational helper for pending transfer */}
              {order.payment_status !== "paid" && (
                <p className="text-[11px] text-theme-text-muted-light dark:text-theme-text-muted-dark leading-relaxed italic p-2.5 bg-theme-card-light/40 dark:bg-theme-card-dark/30 border border-theme-border-light/60">
                  {order.payment_method === "cod"
                    ? "Please keep the exact cash amount ready for the courier upon parcel arrival."
                    : "Your payment reference is being verified with our accounts team. Your order will be confirmed once verified."}
                </p>
              )}

              {/* Transaction Ref ID */}
              {order.bank_reference && (
                <div className="p-3 bg-theme-bg-light dark:bg-theme-bg-dark border border-theme-border-light dark:border-theme-border-dark flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[9px] uppercase tracking-wider font-semibold text-theme-text-muted-light dark:text-theme-text-muted-dark mb-0.5">
                      Transaction Reference / ID
                    </p>
                    <p className="text-xs font-mono font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark truncate">
                      {order.bank_reference}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyReference}
                    className="p-1.5 text-theme-text-muted-light hover:text-theme-text-primary-light transition-colors"
                    title="Copy Transaction ID"
                  >
                    {copiedRef ? (
                      <Check size={14} className="text-emerald-600" />
                    ) : (
                      <Copy size={14} />
                    )}
                  </button>
                </div>
              )}

              {/* Uploaded Receipt Preview */}
              {order.payment_proof_url && (
                <button
                  type="button"
                  onClick={() =>
                    openImagePreview(
                      order.payment_proof_url,
                      `Order #${order.order_number} Payment Receipt`
                    )
                  }
                  className="w-full py-2.5 px-3 border border-theme-border-light dark:border-theme-border-dark hover:border-theme-hover-light dark:hover:border-theme-hover-dark bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark text-xs font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                >
                  <FileText size={14} className="text-theme-hover-light" />
                  <span>View Uploaded Receipt</span>
                  <ExternalLink size={12} className="text-theme-text-muted-light" />
                </button>
              )}
            </div>
          </div>

          {/* 3. Order Timeline Card */}
          <div className="border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark p-5 sm:p-6 shadow-xs space-y-4">
            <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark flex items-center gap-2 pb-3 border-b border-theme-border-light dark:border-theme-border-dark">
              <Calendar size={15} className="text-theme-hover-light" aria-hidden="true" />
              <span>Order Timeline</span>
            </h3>

            <div className="relative pl-5 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-theme-border-light dark:before:bg-theme-border-dark text-xs">
              {/* Placed */}
              <div className="relative">
                <div className="absolute -left-5 top-1 w-2.5 h-2.5 rounded-full bg-theme-hover-light ring-4 ring-theme-surface-light dark:ring-theme-surface-dark" />
                <p className="font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark uppercase tracking-wider text-[11px]">
                  Order Placed
                </p>
                <p className="text-theme-text-muted-light dark:text-theme-text-muted-dark text-[11px]">
                  {new Date(order.placed_at).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>

              {/* Confirmed */}
              {order.confirmed_at && (
                <div className="relative">
                  <div className="absolute -left-5 top-1 w-2.5 h-2.5 rounded-full bg-emerald-600 ring-4 ring-theme-surface-light dark:ring-theme-surface-dark" />
                  <p className="font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark uppercase tracking-wider text-[11px]">
                    Confirmed & Verified
                  </p>
                  <p className="text-theme-text-muted-light dark:text-theme-text-muted-dark text-[11px]">
                    {new Date(order.confirmed_at).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              )}

              {/* Shipped */}
              {order.shipped_at && (
                <div className="relative">
                  <div className="absolute -left-5 top-1 w-2.5 h-2.5 rounded-full bg-indigo-600 ring-4 ring-theme-surface-light dark:ring-theme-surface-dark" />
                  <p className="font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark uppercase tracking-wider text-[11px]">
                    Dispatched / Shipped
                  </p>
                  <p className="text-theme-text-muted-light dark:text-theme-text-muted-dark text-[11px]">
                    {new Date(order.shipped_at).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              )}

              {/* Delivered */}
              {order.delivered_at && (
                <div className="relative">
                  <div className="absolute -left-5 top-1 w-2.5 h-2.5 rounded-full bg-emerald-600 ring-4 ring-theme-surface-light dark:ring-theme-surface-dark" />
                  <p className="font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider text-[11px]">
                    Delivered
                  </p>
                  <p className="text-theme-text-muted-light dark:text-theme-text-muted-dark text-[11px]">
                    {new Date(order.delivered_at).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* 4. Customer Instructions Note (if present) */}
          {order.customer_notes && (
            <div className="border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark p-5 sm:p-6 shadow-xs space-y-2">
              <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark pb-2.5 border-b border-theme-border-light dark:border-theme-border-dark">
                Special Instructions
              </h3>
              <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark italic leading-relaxed">
                "{order.customer_notes}"
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
