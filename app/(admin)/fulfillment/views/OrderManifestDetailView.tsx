// app/(admin)/fulfillment/views/OrderManifestDetailView.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Edit3,
  CheckCircle,
  Truck,
  FileText,
  CreditCard,
  Landmark,
  Smartphone,
  ExternalLink,
  Copy,
  Check,
  ShieldCheck,
  Clock,
} from "lucide-react";
import OrderStatusUpdateModal from "../components/OrderStatusUpdateModal";
import OrderLineItemsSummary from "../components/OrderLineItemsSummary";
import CustomerDossierCard from "../components/CustomerDossierCard";
import DownloadInvoiceButton from "../../../components/invoice/DownloadInvoiceButton";
import { adminOrdersApi } from "../../../../lib/api/orders";

interface OrderManifestDetailViewProps {
  order: any;
  onUpdateStatus: (
    status: string,
    trackingData?: { tracking_number: string; carrier: string }
  ) => void;
  onRefresh: () => void;
}

const STATUS_BADGES: Record<string, string> = {
  pending: "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300",
  confirmed: "bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-blue-300",
  processing: "bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border-purple-300",
  shipped: "bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border-indigo-300",
  delivered: "bg-green-100 dark:bg-green-950/60 text-green-800 dark:text-green-300 border-green-300",
  cancelled: "bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-300",
  refunded: "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-300",
};

export default function OrderManifestDetailView({
  order,
  onUpdateStatus,
  onRefresh,
}: OrderManifestDetailViewProps) {
  const router = useRouter();
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [copiedRef, setCopiedRef] = useState(false);
  const [isMarkingPaid, setIsMarkingPaid] = useState(false);

  const isPaid = order.payment_status === "paid";
  const isOnlinePayment =
    order.payment_method === "bank_transfer" ||
    order.payment_method === "jazzcash";

  const copyReference = () => {
    if (!order.bank_reference) return;
    navigator.clipboard.writeText(order.bank_reference);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  const handleMarkPaid = async () => {
    if (
      !confirm(
        `Confirm payment of Rs. ${order.pricing?.total?.toLocaleString()} for Order #${
          order.order_number
        } and mark as PAID?`
      )
    ) {
      return;
    }
    setIsMarkingPaid(true);
    try {
      await adminOrdersApi.markPaid(order._id);
      onRefresh();
    } catch (error: any) {
      alert(error.message || "Failed to mark order as paid");
    } finally {
      setIsMarkingPaid(false);
    }
  };

  const getPaymentMethodDisplay = () => {
    switch (order.payment_method) {
      case "bank_transfer":
        return { label: "Bank Transfer", icon: Landmark };
      case "jazzcash":
        return { label: "JazzCash", icon: Smartphone };
      case "cod":
      default:
        return { label: "Cash on Delivery", icon: CreditCard };
    }
  };

  const paymentInfo = getPaymentMethodDisplay();
  const PaymentIcon = paymentInfo.icon;

  return (
    <div className="space-y-6 pb-20">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-theme-border-light dark:border-theme-border-dark">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/admin/orders")}
            className="p-2.5 rounded-lg border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-secondary-light dark:text-theme-text-secondary-dark hover:text-theme-text-primary-light hover:border-theme-hover-light transition-colors"
            title="Back to Orders"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-serif font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark tracking-tight">
                Order #{order.order_number}
              </h1>
              <span
                className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase border ${
                  STATUS_BADGES[order.status] || STATUS_BADGES.pending
                }`}
              >
                {order.status}
              </span>
            </div>
            <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark mt-0.5">
              Placed on{" "}
              {new Date(order.placed_at).toLocaleDateString("en-US", {
                weekday: "long",
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          {/* Update Status */}
          <button
            type="button"
            onClick={() => setShowStatusModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900 text-xs font-semibold rounded-lg shadow-xs transition-all"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Update Status</span>
          </button>

          {/* Download Invoice */}
          <DownloadInvoiceButton
            orderId={order._id}
            orderNumber={order.order_number}
            paymentStatus={order.payment_status}
            isAdmin={true}
          />
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* 1. Order Status */}
        <div className="p-4 rounded-xl border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark space-y-1">
          <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-theme-text-muted-light">
            Order Status
          </span>
          <p className="text-sm sm:text-base font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark capitalize">
            {order.status}
          </p>
        </div>

        {/* 2. Payment Status */}
        <div className="p-4 rounded-xl border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark space-y-1">
          <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-theme-text-muted-light">
            Payment Method
          </span>
          <p className="text-sm sm:text-base font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark truncate">
            {paymentInfo.label}
          </p>
          <span
            className={`inline-block text-[10px] font-semibold uppercase ${
              isPaid
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-amber-600 dark:text-amber-400"
            }`}
          >
            {isPaid ? "Paid ✓" : "Pending Payment"}
          </span>
        </div>

        {/* 3. Shipping Carrier */}
        <div className="p-4 rounded-xl border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark space-y-1">
          <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-theme-text-muted-light">
            Shipping Carrier
          </span>
          <p className="text-sm sm:text-base font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark">
            {order.carrier || "Standard Delivery"}
          </p>
          {order.tracking_number && (
            <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 block truncate">
              {order.tracking_number}
            </span>
          )}
        </div>

        {/* 4. Total Amount */}
        <div className="p-4 rounded-xl border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark space-y-1">
          <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-theme-text-muted-light">
            Total Amount
          </span>
          <p className="text-base sm:text-lg font-serif font-bold text-theme-hover-light dark:text-theme-hover-dark">
            Rs. {order.pricing?.total?.toLocaleString() || "0"}
          </p>
        </div>
      </div>

      {/* Main 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Line Items & Customer Notes */}
        <div className="lg:col-span-2 space-y-6">
          <OrderLineItemsSummary
            items={order.items || []}
            pricing={
              order.pricing || {
                subtotal: 0,
                discount_amount: 0,
                tax_amount: 0,
                shipping_cost: 0,
                total: 0,
                currency: "PKR",
              }
            }
          />

          {/* Customer Note if exists */}
          {order.customer_notes && (
            <div className="p-4 rounded-xl border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark space-y-1.5">
              <span className="text-[10px] uppercase font-bold tracking-wider text-theme-text-muted-light block">
                Customer Instructions / Notes
              </span>
              <p className="text-xs italic text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
                "{order.customer_notes}"
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Payment Details & Customer / Shipping Info */}
        <div className="space-y-6">
          {/* Payment Details Card */}
          <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-xl border border-theme-border-light dark:border-theme-border-dark p-4 sm:p-5 space-y-4 shadow-xs">
            <div className="border-b border-theme-border-light dark:border-theme-border-dark pb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark flex items-center gap-2">
                <PaymentIcon className="w-4 h-4 text-theme-hover-light" />
                <span>Payment Information</span>
              </h3>
              <span
                className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                  isPaid
                    ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300"
                    : "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300"
                }`}
              >
                {isPaid ? "Paid" : "Pending"}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
                  Payment Channel:
                </span>
                <span className="font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                  {paymentInfo.label}
                </span>
              </div>

              {/* Bank / JazzCash Reference */}
              {order.bank_reference && (
                <div className="p-2.5 rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark border border-theme-border-light dark:border-theme-border-dark flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-[9px] uppercase font-mono text-theme-text-muted-light block">
                      Transaction Ref / ID
                    </span>
                    <span className="font-mono font-bold text-xs text-theme-text-primary-light dark:text-theme-text-primary-dark truncate block">
                      {order.bank_reference}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={copyReference}
                    className="p-1.5 rounded hover:bg-theme-card-light text-theme-text-muted-light hover:text-theme-text-primary-light transition-colors"
                    title="Copy Reference"
                  >
                    {copiedRef ? (
                      <Check size={13} className="text-emerald-600" />
                    ) : (
                      <Copy size={13} />
                    )}
                  </button>
                </div>
              )}

              {/* Payment Proof Button (Opens in New Tab) */}
              {order.payment_proof_url && (
                <div className="pt-1">
                  <a
                    href={order.payment_proof_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded-lg border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark hover:border-theme-hover-light dark:hover:border-theme-hover-dark text-theme-text-primary-light dark:text-theme-text-primary-dark text-xs font-semibold transition-colors"
                  >
                    <ExternalLink size={13} className="text-theme-hover-light" />
                    <span>View Payment Proof (New Tab) ↗</span>
                  </a>
                </div>
              )}

              {/* Mark as Paid Action if unpaid */}
              {!isPaid && (
                <div className="pt-2 border-t border-theme-border-light/60 dark:border-theme-border-dark/60">
                  <button
                    type="button"
                    onClick={handleMarkPaid}
                    disabled={isMarkingPaid}
                    className="inline-flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors disabled:opacity-50"
                  >
                    <CheckCircle size={13} />
                    <span>{isMarkingPaid ? "Updating..." : "Mark as Paid"}</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Customer & Addresses */}
          <CustomerDossierCard order={order} />
        </div>
      </div>

      {/* Status Update Modal */}
      <OrderStatusUpdateModal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        order={order}
        onUpdate={onUpdateStatus}
      />
    </div>
  );
}
