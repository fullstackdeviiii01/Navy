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
  Calendar,
  CreditCard,
  Package,
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
  pending: "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300",
  confirmed: "bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300",
  processing: "bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300",
  shipped: "bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300",
  delivered: "bg-green-100 dark:bg-green-950/60 text-green-800 dark:text-green-300",
  cancelled: "bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300",
  refunded: "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300",
};

export default function OrderManifestDetailView({
  order,
  onUpdateStatus,
  onRefresh,
}: OrderManifestDetailViewProps) {
  const router = useRouter();
  const [showStatusModal, setShowStatusModal] = useState(false);

  const isCODDeliveredUnpaid =
    order.payment_method === "cod" &&
    order.status === "delivered" &&
    order.payment_status !== "paid";

  const handleMarkPaid = async () => {
    if (!confirm("Confirm payment received from courier for this delivered COD shipment?")) return;
    try {
      await adminOrdersApi.markPaid(order._id);
      onRefresh();
    } catch (error: any) {
      alert(error.message || "Failed to mark order as paid");
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-theme-border-light/80 dark:border-theme-border-dark/80">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/admin/orders")}
            className="p-2.5 rounded-lg border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-secondary-light dark:text-theme-text-secondary-dark hover:text-theme-text-primary-light hover:border-theme-hover-light transition-colors"
            title="Return to Fulfillment Directory"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-serif font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark tracking-tight">
                Order Manifest #{order.order_number}
              </h1>
              <span
                className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                  STATUS_BADGES[order.status] || STATUS_BADGES.pending
                }`}
              >
                {order.status}
              </span>
            </div>
            <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark mt-0.5">
              Placed on {new Date(order.placed_at).toLocaleDateString("en-US", {
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

        {/* Action Button Suite */}
        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          {/* Update Status Button */}
          <button
            type="button"
            onClick={() => setShowStatusModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900 text-xs font-semibold rounded-lg shadow-xs hover:shadow active:scale-[0.99] transition-all"
          >
            <Edit3 className="w-3 h-3" />
            <span>Update Status</span>
          </button>

          {/* Download Official Invoice */}
          <DownloadInvoiceButton
            orderId={order._id}
            orderNumber={order.order_number}
            paymentStatus={order.payment_status}
            isAdmin={true}
          />

          {/* COD Settlement Button */}
          {isCODDeliveredUnpaid && (
            <button
              type="button"
              onClick={handleMarkPaid}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Mark Payment Settled</span>
            </button>
          )}
        </div>
      </div>

      {/* Overview Metric Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Status */}
        <div className="p-4 rounded-xl border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark space-y-1">
          <span className="text-[11px] font-mono uppercase font-semibold text-theme-text-muted-light">
            Lifecycle Status
          </span>
          <p className="text-base font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark capitalize">
            {order.status}
          </p>
        </div>

        {/* Payment */}
        <div className="p-4 rounded-xl border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark space-y-1">
          <span className="text-[11px] font-mono uppercase font-semibold text-theme-text-muted-light">
            Payment Method
          </span>
          <p className="text-base font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark uppercase">
            {order.payment_method === "cod"
              ? "Cash on Delivery"
              : order.payment_method || "Online"}
          </p>
          <span className="text-[10px] text-theme-text-muted-light block">
            Settlement: {order.payment_status}
          </span>
        </div>

        {/* Shipping Method */}
        <div className="p-4 rounded-xl border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark space-y-1">
          <span className="text-[11px] font-mono uppercase font-semibold text-theme-text-muted-light">
            Dispatch Carrier
          </span>
          <p className="text-base font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark">
            {order.shipping?.carrier || "Standard Courier"}
          </p>
          {order.shipping?.tracking_number && (
            <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 block truncate">
              {order.shipping.tracking_number}
            </span>
          )}
        </div>

        {/* Total Sum */}
        <div className="p-4 rounded-xl border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark space-y-1">
          <span className="text-[11px] font-mono uppercase font-semibold text-theme-text-muted-light">
            Total Manifest
          </span>
          <p className="text-xl font-serif font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark">
            Rs. {order.pricing?.total?.toLocaleString() || "0"}
          </p>
        </div>
      </div>

      {/* Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Line Items & Pricing */}
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
        </div>

        {/* Right Column: Patron Dossier & Addresses */}
        <div className="space-y-6">
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
