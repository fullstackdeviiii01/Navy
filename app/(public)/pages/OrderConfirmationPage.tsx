// app/(public)/pages/OrderConfirmationPage.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ordersApi } from "../../../lib/api/orders";
import {
  Check,
  Package,
  MapPin,
  CreditCard,
  ArrowRight,
  Copy,
  Clock,
  MessageCircle,
  Truck,
  ShieldCheck,
  Receipt,
  Sparkles,
} from "lucide-react";
import Loader from "../../components/shared/Loader";
import { formatPrice } from "../../../lib/utils/formatPrice";
import { getItemImage } from "../../../lib/utils/productImages";
import Link from "next/link";
import Image from "next/image";

interface Props {
  orderId: string;
}

export default function OrderConfirmationPage({ orderId }: Props) {
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (orderId) {
      fetchOrder(orderId);
    }
  }, [orderId]);

  const fetchOrder = async (id: string) => {
    try {
      const data = await ordersApi.getOrderById(id);
      setOrder(data.order);
    } catch (err: any) {
      setError(err.message || "Failed to load order");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyOrderNumber = () => {
    if (order?.order_number) {
      navigator.clipboard.writeText(order.order_number);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-theme-bg-light dark:bg-theme-bg-dark flex items-center justify-center p-6">
        <Loader />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-theme-bg-light dark:bg-theme-bg-dark flex items-center justify-center p-6">
        <div className="text-center max-w-md bg-theme-surface-light dark:bg-theme-surface-dark border border-theme-border-light dark:border-theme-border-dark p-8 sm:p-10 shadow-sm" role="alert">
          <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 mx-auto flex items-center justify-center mb-4">
            !
          </div>
          <h2 className="text-lg font-serif font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark mb-2">
            Unable to Find Order
          </h2>
          <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-6">
            {error || "The requested order confirmation details could not be found or have expired."}
          </p>
          <button
            onClick={() => router.push("/")}
            className="no-theme-hover w-full py-3.5 px-6 text-xs uppercase tracking-[0.2em] font-semibold transition-all hover:opacity-90 shadow-sm"
            style={{ backgroundColor: "#241910", color: "#FFFFFF" }}
          >
            Return to Store
          </button>
        </div>
      </div>
    );
  }

  const customerName =
    order.shipping_address?.full_name ||
    order.user_id?.name ||
    order.guest_info?.name ||
    "Valued Customer";

  const customerEmail =
    order.user_id?.email ||
    order.guest_info?.email ||
    "";

  const isPaid = order.payment_status === "paid";
  const isBankOrJazz =
    order.payment_method === "bank_transfer" || order.payment_method === "jazzcash";
  const isCOD = order.payment_method === "cod";

  const whatsappMessage = encodeURIComponent(
    `Hello Rehan Wooden Lamps, I have a question regarding my order #${order.order_number}.`
  );

  return (
    <div className="min-h-screen bg-theme-bg-light dark:bg-theme-bg-dark py-8 sm:py-12 lg:py-16 transition-colors">
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* ========================================================================= */}
        {/* HERO CONFIRMATION HEADER */}
        {/* ========================================================================= */}
        <header className="relative bg-theme-surface-light dark:bg-theme-surface-dark border border-theme-border-light dark:border-theme-border-dark p-6 sm:p-10 lg:p-12 overflow-hidden shadow-xs">
          {/* Subtle Ambient Background Accent */}
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-44 h-44 rounded-full bg-theme-hover-light/5 dark:bg-theme-hover-dark/10 pointer-events-none blur-2xl" />

          <div className="relative z-10 text-center max-w-2xl mx-auto space-y-4">
            {/* Top Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-[11px] font-semibold tracking-wider uppercase">
              <Check className="w-3.5 h-3.5" />
              <span>Order Placed & Registered</span>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-serif font-normal text-theme-text-primary-light dark:text-theme-text-primary-dark tracking-tight">
              Thank You, <span className="font-serif italic text-theme-hover-light dark:text-theme-hover-dark">{customerName}</span>
            </h1>

            {/* Description */}
            <p className="text-xs sm:text-sm text-theme-text-secondary-light dark:text-theme-text-secondary-dark leading-relaxed">
              Your order has been recorded in our system. A confirmation receipt with full item specifications has been sent to{" "}
              <span className="font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">{customerEmail || "your email"}</span>.
            </p>

            {/* Order Reference Pill Bar */}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-3 text-xs">
              {/* Order Number with Copy */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-theme-card-light/60 dark:bg-theme-card-dark/40 border border-theme-border-light dark:border-theme-border-dark rounded-sm">
                <span className="text-[10px] uppercase tracking-[0.18em] text-theme-text-muted-light dark:text-theme-text-muted-dark">
                  Order ID:
                </span>
                <span className="font-mono font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                  {order.order_number}
                </span>
                <button
                  type="button"
                  onClick={handleCopyOrderNumber}
                  className="p-1 text-theme-text-muted-light hover:text-theme-text-primary-light transition-colors ml-1"
                  title="Copy Order ID"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                {copied && (
                  <span className="text-[10px] text-emerald-600 font-semibold animate-in fade-in">
                    Copied!
                  </span>
                )}
              </div>

              {/* Placed Date */}
              <div className="inline-flex items-center gap-1.5 px-4 py-2 bg-theme-card-light/60 dark:bg-theme-card-dark/40 border border-theme-border-light dark:border-theme-border-dark rounded-sm text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
                <Clock className="w-3.5 h-3.5 text-theme-text-muted-light" />
                <span>{new Date(order.placed_at || Date.now()).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
              </div>

              {/* Status Badge */}
              <div className="inline-flex items-center gap-1.5 px-4 py-2 border rounded-sm font-semibold uppercase text-[10px] tracking-wider bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-500/30">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span>{order.status || "Pending Verification"}</span>
              </div>
            </div>
          </div>
        </header>

        {/* ========================================================================= */}
        {/* PROGRESSION TIMELINE */}
        {/* ========================================================================= */}
        <section className="bg-theme-surface-light dark:bg-theme-surface-dark border border-theme-border-light dark:border-theme-border-dark p-6 sm:p-8 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xs uppercase tracking-[0.2em] font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-theme-hover-light" />
              <span>Fulfillment Progression</span>
            </h2>
            <span className="text-[11px] text-theme-text-muted-light font-mono">
              Stage 1 of 4
            </span>
          </div>

          {/* Stepper Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 relative">
            {/* Step 1 */}
            <div className="relative flex flex-col items-center text-center p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold mb-2 shadow-xs">
                <Check className="w-4 h-4" />
              </div>
              <p className="text-xs font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                Order Received
              </p>
              <p className="text-[10px] text-theme-text-muted-light mt-0.5">
                Queued in system
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative flex flex-col items-center text-center p-3 rounded-lg bg-theme-card-light/40 dark:bg-theme-card-dark/30 border border-theme-border-light dark:border-theme-border-dark">
              <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold mb-2 shadow-xs">
                2
              </div>
              <p className="text-xs font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                Verification & Prep
              </p>
              <p className="text-[10px] text-theme-text-muted-light mt-0.5">
                {isBankOrJazz ? "Payment check" : "Order check"}
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative flex flex-col items-center text-center p-3 rounded-lg bg-theme-card-light/20 dark:bg-theme-card-dark/10 border border-theme-border-light/60 dark:border-theme-border-dark/60 opacity-60">
              <div className="w-8 h-8 rounded-full bg-neutral-300 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400 flex items-center justify-center text-xs font-bold mb-2">
                3
              </div>
              <p className="text-xs font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark">
                Dispatched
              </p>
              <p className="text-[10px] text-theme-text-muted-light mt-0.5">
                Handed to courier
              </p>
            </div>

            {/* Step 4 */}
            <div className="relative flex flex-col items-center text-center p-3 rounded-lg bg-theme-card-light/20 dark:bg-theme-card-dark/10 border border-theme-border-light/60 dark:border-theme-border-dark/60 opacity-60">
              <div className="w-8 h-8 rounded-full bg-neutral-300 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400 flex items-center justify-center text-xs font-bold mb-2">
                4
              </div>
              <p className="text-xs font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark">
                Delivered
              </p>
              <p className="text-[10px] text-theme-text-muted-light mt-0.5">
                At your destination
              </p>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* MAIN TWO-COLUMN DETAILS GRID */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: Items List & Price Summary (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Ordered Items List */}
            <div className="border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark p-6 sm:p-7 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-theme-border-light dark:border-theme-border-dark">
                <h2 className="text-xs uppercase tracking-[0.2em] font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark flex items-center gap-2">
                  <Package className="w-4 h-4 text-theme-hover-light" />
                  <span>Order Items ({order.items?.length || 0})</span>
                </h2>
              </div>

              <div className="divide-y divide-theme-border-light/60 dark:divide-theme-border-dark/60">
                {order.items?.map((item: any, idx: number) => {
                  const resolvedImg = getItemImage(item);

                  return (
                    <div key={idx} className="py-4 first:pt-0 last:pb-0 flex items-center gap-4">
                      {/* Image Thumbnail */}
                      <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded bg-theme-card-light dark:bg-theme-card-dark border border-theme-border-light dark:border-theme-border-dark flex-shrink-0 overflow-hidden">
                        {resolvedImg ? (
                          <img
                            src={resolvedImg}
                            alt={item.product_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-theme-text-muted-light">
                            No Img
                          </div>
                        )}
                      </div>

                      {/* Item Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-serif text-sm font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark truncate">
                          {item.product_name}
                        </h3>

                        {/* Variant Attributes */}
                        {item.variant_attributes && Object.keys(item.variant_attributes).length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {Object.entries(item.variant_attributes).map(([key, val]) => (
                              <span
                                key={key}
                                className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-theme-text-secondary-light dark:text-theme-text-secondary-dark font-mono"
                              >
                                {key}: {String(val)}
                              </span>
                            ))}
                          </div>
                        )}

                        <p className="text-[11px] text-theme-text-muted-light mt-1">
                          Rs. {item.price?.toLocaleString()} × {item.quantity}
                        </p>
                      </div>

                      {/* Subtotal */}
                      <div className="text-right flex-shrink-0">
                        <span className="font-serif font-bold text-sm text-theme-text-primary-light dark:text-theme-text-primary-dark">
                          Rs. {item.subtotal?.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Financial Breakdown Card */}
            <div className="border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark p-6 sm:p-7 shadow-xs space-y-3 text-xs">
              <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark pb-2 border-b border-theme-border-light dark:border-theme-border-dark">
                Payment Summary
              </h3>

              <div className="flex justify-between text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
                <span>Subtotal</span>
                <span>Rs. {order.pricing?.subtotal?.toLocaleString() || 0}</span>
              </div>

              {order.pricing?.discount_amount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                  <span>Promotion Discount</span>
                  <span>- Rs. {order.pricing.discount_amount.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
                <span>Shipping Fee</span>
                <span>
                  {order.pricing?.shipping_cost === 0
                    ? "FREE"
                    : `Rs. ${order.pricing?.shipping_cost?.toLocaleString()}`}
                </span>
              </div>

              <div className="flex justify-between text-sm font-serif font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark pt-3 border-t border-theme-border-light dark:border-theme-border-dark items-baseline">
                <span className="uppercase tracking-wider text-xs">Total Amount</span>
                <span className="text-lg">Rs. {order.pricing?.total?.toLocaleString() || 0}</span>
              </div>
            </div>

          </div>

          {/* RIGHT: Delivery, Payment & Concierge Info (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Delivery Details Card */}
            <div className="border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark p-6 shadow-xs space-y-3">
              <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark flex items-center gap-2 pb-2 border-b border-theme-border-light dark:border-theme-border-dark">
                <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                <span>Shipping Destination</span>
              </h3>

              <div className="text-xs space-y-1.5 text-theme-text-secondary-light dark:text-theme-text-secondary-dark leading-relaxed">
                <p className="font-bold text-sm text-theme-text-primary-light dark:text-theme-text-primary-dark">
                  {order.shipping_address?.full_name || customerName}
                </p>
                <p>{order.shipping_address?.street_address || order.shipping_address?.line1}</p>
                {order.shipping_address?.apartment && <p>{order.shipping_address.apartment}</p>}
                <p>
                  {order.shipping_address?.city}, {order.shipping_address?.state} {order.shipping_address?.postal_code}
                </p>
                <p className="font-medium pt-1 text-theme-text-primary-light dark:text-theme-text-primary-dark">
                  Phone: {order.shipping_address?.phone || order.guest_info?.phone || "Not provided"}
                </p>
              </div>
            </div>

            {/* Payment Verification Card */}
            <div className="border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-theme-border-light dark:border-theme-border-dark">
                <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark flex items-center gap-2">
                  <CreditCard className="w-3.5 h-3.5 text-purple-500" />
                  <span>Payment Information</span>
                </h3>
                <span
                  className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border ${
                    isPaid
                      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                      : isCOD
                      ? "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30"
                      : "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30"
                  }`}
                >
                  {isPaid
                    ? "Paid ✓"
                    : isCOD
                    ? "Pay on Delivery"
                    : "Pending Verification"}
                </span>
              </div>

              <div className="text-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-theme-text-secondary-light">Payment Method:</span>
                  <span className="font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark uppercase">
                    {order.payment_method === "jazzcash"
                      ? "JazzCash"
                      : order.payment_method === "bank_transfer"
                      ? "Bank Transfer"
                      : "Cash on Delivery"}
                  </span>
                </div>

                {/* Bank Reference */}
                {order.bank_reference && (
                  <div className="p-3 bg-theme-card-light/50 dark:bg-theme-card-dark/30 border border-theme-border-light dark:border-theme-border-dark rounded">
                    <p className="text-[10px] uppercase tracking-wider text-theme-text-muted-light mb-0.5">
                      Transaction Reference
                    </p>
                    <p className="font-mono font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                      {order.bank_reference}
                    </p>
                  </div>
                )}

                {/* Contextual Notice */}
                <div className="p-3 bg-theme-bg-light dark:bg-theme-bg-dark border border-theme-border-light/80 dark:border-theme-border-dark/80 rounded text-[11px] leading-relaxed text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
                  {isCOD ? (
                    <p>
                      💵 <strong>Cash on Delivery:</strong> Please keep the exact amount of{" "}
                      <strong>Rs. {order.pricing?.total?.toLocaleString()}</strong> ready for the courier at delivery.
                    </p>
                  ) : (
                    <p>
                      🏦 <strong>Payment Verification:</strong> Our accounts desk is reviewing your payment record. Your dispatch manifest will be processed immediately upon bank verification.
                    </p>
                  )}
                </div>

                {order.payment_proof_url && (
                  <a
                    href={order.payment_proof_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded border border-theme-border-light dark:border-theme-border-dark hover:border-theme-hover-light text-theme-text-primary-light text-xs font-semibold transition-colors"
                  >
                    <Receipt className="w-3.5 h-3.5" />
                    <span>View Uploaded Receipt ↗</span>
                  </a>
                )}
              </div>
            </div>

            {/* Assistance & Concierge Box */}
            <div className="border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark p-6 shadow-xs space-y-3">
              <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark flex items-center gap-2">
                <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />
                <span>Need Assistance?</span>
              </h3>
              <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark leading-relaxed">
                Have a question about this commission or need custom delivery instructions? Our support concierge is ready to assist.
              </p>
              <a
                href={`https://wa.me/923130538686?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-semibold uppercase tracking-wider transition-colors shadow-xs"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>

          </div>

        </div>

        {/* ========================================================================= */}
        {/* ACTION BUTTONS FOOTER */}
        {/* ========================================================================= */}
        <div className="pt-6 border-t border-theme-border-light dark:border-theme-border-dark flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href={`/track-order?orderId=${order.order_number || order._id}`}
            className="no-theme-hover w-full sm:w-auto inline-flex items-center justify-center gap-2.5 py-4 px-8 rounded-none text-xs font-semibold uppercase tracking-[0.2em] transition-all shadow-sm active:scale-[0.99]"
            style={{
              backgroundColor: "#241910",
              color: "#FFFFFF",
            }}
          >
            <Truck className="w-4 h-4 text-white" />
            <span style={{ color: "#FFFFFF" }}>Track Order Status</span>
          </Link>

          <Link
            href="/products"
            className="no-theme-hover w-full sm:w-auto inline-flex items-center justify-center gap-2.5 py-4 px-8 rounded-none text-xs font-semibold uppercase tracking-[0.2em] transition-all active:scale-[0.99]"
            style={{
              border: "1px solid #5A4638",
              backgroundColor: "transparent",
              color: "#241910",
            }}
          >
            <span>Continue Shopping</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </main>
    </div>
  );
}