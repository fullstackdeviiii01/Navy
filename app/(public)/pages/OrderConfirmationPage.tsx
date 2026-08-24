// app/(public)/pages/OrderConfirmationPage.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
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
  ExternalLink,
  Banknote,
  Building2,
  AlertCircle,
  ShoppingBag,
} from "lucide-react";
import Loader from "../../components/shared/Loader";
import { formatPrice } from "../../../lib/utils/formatPrice";
import { getItemImage } from "../../../lib/utils/productImages";

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
      <div className="min-h-screen bg-theme-bg-light dark:bg-theme-bg-dark flex items-center justify-center p-4 sm:p-6">
        <div className="text-center max-w-md w-full bg-theme-surface-light dark:bg-theme-surface-dark border border-theme-border-light dark:border-theme-border-dark p-6 sm:p-10 shadow-sm" role="alert">
          <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 mx-auto flex items-center justify-center mb-4">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-base sm:text-lg font-serif italic font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark mb-2">
            Unable to Find Order
          </h2>
          <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-6 leading-relaxed">
            {error || "The requested order confirmation details could not be found or have expired."}
          </p>
          <button
            onClick={() => router.push("/")}
            className="w-full py-3.5 px-6 bg-theme-primary hover:bg-theme-hover-light dark:hover:bg-theme-hover-dark text-theme-btn-text text-xs uppercase tracking-[0.2em] font-medium transition-colors shadow-sm"
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
    "Valued Patron";

  const customerEmail =
    order.user_id?.email ||
    order.guest_info?.email ||
    "";

  const isPaid = order.payment_status === "paid";
  const isBankOrJazz =
    order.payment_method === "bank_transfer" || order.payment_method === "jazzcash";
  const isCOD = order.payment_method === "cod";

  const whatsappMessage = encodeURIComponent(
    `Hello Talal Wooden Lamps, I have a question regarding my order #${order.order_number}.`
  );

  return (
    <div className="min-h-screen bg-theme-bg-light dark:bg-theme-bg-dark py-6 sm:py-10 md:py-14 transition-colors">
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        
        {/* ========================================================================= */}
        {/* 1. HERO CONFIRMATION HEADER */}
        {/* ========================================================================= */}
        <header className="relative bg-theme-surface-light dark:bg-theme-surface-dark border border-theme-border-light dark:border-theme-border-dark p-5 sm:p-8 md:p-12 overflow-hidden shadow-xs">
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-44 h-44 rounded-full bg-theme-hover-light/5 dark:bg-theme-hover-dark/10 pointer-events-none blur-3xl" />

          <div className="relative z-10 text-center max-w-2xl mx-auto space-y-3 sm:space-y-4">
            {/* Top Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-[10px] sm:text-[11px] font-semibold tracking-wider uppercase">
              <Check className="w-3.5 h-3.5" />
              <span>Order Placed & Registered</span>
            </div>

            {/* Title */}
            <h1 className="text-xl sm:text-3xl md:text-4xl font-serif text-theme-text-primary-light dark:text-theme-text-primary-dark tracking-tight">
              Thank You, <span className="italic font-normal font-serif text-theme-hover-light dark:text-theme-hover-dark">{customerName}</span>
            </h1>

            {/* Subtitle / Description */}
            <p className="text-xs sm:text-sm text-theme-text-secondary-light dark:text-theme-text-secondary-dark leading-relaxed max-w-lg mx-auto">
              Your order has been recorded in our workshop schedule. A confirmation receipt has been dispatched to{" "}
              <span className="font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark break-all sm:break-normal">
                {customerEmail || "your email"}
              </span>.
            </p>

            {/* Order Reference Pill Bar */}
            <div className="pt-2 sm:pt-4 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs">
              {/* Order ID Box */}
              <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-theme-card-light/70 dark:bg-theme-card-dark/50 border border-theme-border-light dark:border-theme-border-dark">
                <span className="text-[10px] uppercase tracking-[0.18em] font-medium text-theme-text-muted-light dark:text-theme-text-muted-dark">
                  ORDER ID:
                </span>
                <span className="font-mono text-xs sm:text-sm font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark tracking-tight">
                  {order.order_number}
                </span>
                <button
                  type="button"
                  onClick={handleCopyOrderNumber}
                  className="p-1 text-theme-text-muted-light hover:text-theme-hover-light transition-colors ml-0.5"
                  title="Copy Order ID"
                  aria-label="Copy Order ID"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                {copied && (
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold animate-in fade-in">
                    Copied!
                  </span>
                )}
              </div>

              {/* Placed Date */}
              <div className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-theme-card-light/70 dark:bg-theme-card-dark/50 border border-theme-border-light dark:border-theme-border-dark text-[11px] sm:text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
                <Clock className="w-3.5 h-3.5 text-theme-text-muted-light" />
                <span>
                  {new Date(order.placed_at || Date.now()).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>

              {/* Status Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 border font-semibold uppercase text-[10px] sm:text-[11px] tracking-wider bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-500/30">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span>{order.status || "Pending Verification"}</span>
              </div>
            </div>
          </div>
        </header>

        {/* ========================================================================= */}
        {/* 2. PROGRESSION TIMELINE */}
        {/* ========================================================================= */}
        <section className="bg-theme-surface-light dark:bg-theme-surface-dark border border-theme-border-light dark:border-theme-border-dark p-4 sm:p-6 lg:p-8 shadow-xs">
          <div className="flex items-center justify-between mb-4 sm:mb-6 pb-2 border-b border-theme-border-light/60 dark:border-theme-border-dark/60">
            <h2 className="text-xs uppercase tracking-[0.2em] font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-theme-hover-light dark:text-theme-hover-dark" />
              <span>Fulfillment Progression</span>
            </h2>
            <span className="text-[10px] sm:text-[11px] text-theme-text-muted-light dark:text-theme-text-muted-dark font-mono">
              Stage 1 of 4
            </span>
          </div>

          {/* Stepper Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4 relative">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center p-3 bg-emerald-500/5 border border-emerald-500/20">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-emerald-600 text-white flex items-center justify-center text-xs font-bold mb-1.5 shadow-2xs">
                <Check className="w-3.5 h-3.5" />
              </div>
              <p className="text-[11px] sm:text-xs font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                Order Received
              </p>
              <p className="text-[10px] text-theme-text-muted-light dark:text-theme-text-muted-dark mt-0.5">
                Queued in system
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center p-3 bg-theme-card-light/50 dark:bg-theme-card-dark/40 border border-theme-border-light dark:border-theme-border-dark">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-amber-500 text-white flex items-center justify-center text-xs font-bold mb-1.5 shadow-2xs">
                2
              </div>
              <p className="text-[11px] sm:text-xs font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                Verification & Prep
              </p>
              <p className="text-[10px] text-theme-text-muted-light dark:text-theme-text-muted-dark mt-0.5">
                {isBankOrJazz ? "Payment check" : "Order verification"}
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center p-3 bg-theme-card-light/20 dark:bg-theme-card-dark/10 border border-theme-border-light/60 dark:border-theme-border-dark/60 opacity-60">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-neutral-300 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 flex items-center justify-center text-xs font-bold mb-1.5">
                3
              </div>
              <p className="text-[11px] sm:text-xs font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark">
                Dispatched
              </p>
              <p className="text-[10px] text-theme-text-muted-light dark:text-theme-text-muted-dark mt-0.5">
                Handed to courier
              </p>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col items-center text-center p-3 bg-theme-card-light/20 dark:bg-theme-card-dark/10 border border-theme-border-light/60 dark:border-theme-border-dark/60 opacity-60">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-neutral-300 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 flex items-center justify-center text-xs font-bold mb-1.5">
                4
              </div>
              <p className="text-[11px] sm:text-xs font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark">
                Delivered
              </p>
              <p className="text-[10px] text-theme-text-muted-light dark:text-theme-text-muted-dark mt-0.5">
                At your doorstep
              </p>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 3. MAIN TWO-COLUMN DETAILS GRID */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          
          {/* LEFT: Items List & Payment Summary (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Ordered Items List */}
            <div className="border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark p-4 sm:p-6 lg:p-7 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-theme-border-light dark:border-theme-border-dark">
                <h2 className="text-xs uppercase tracking-[0.2em] font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark flex items-center gap-2">
                  <Package className="w-4 h-4 text-theme-hover-light dark:text-theme-hover-dark" />
                  <span>Order Items ({order.items?.length || 0})</span>
                </h2>
              </div>

              <div className="divide-y divide-theme-border-light/60 dark:divide-theme-border-dark/60">
                {order.items?.map((item: any, idx: number) => {
                  const resolvedImg = getItemImage(item);

                  return (
                    <div key={idx} className="py-3.5 first:pt-0 last:pb-0 flex items-center gap-3 sm:gap-4">
                      {/* Image Thumbnail */}
                      <div className="relative w-14 h-14 sm:w-16 sm:h-16 bg-theme-card-light dark:bg-theme-card-dark border border-theme-border-light dark:border-theme-border-dark flex-shrink-0 overflow-hidden">
                        {resolvedImg ? (
                          <Image
                            src={resolvedImg}
                            alt={item.product_name || "Product"}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-theme-text-muted-light">
                            No Img
                          </div>
                        )}
                      </div>

                      {/* Item Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-serif text-xs sm:text-sm font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark truncate">
                          {item.product_name}
                        </h3>

                        {/* Variant Attributes */}
                        {item.variant_attributes && Object.keys(item.variant_attributes).length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-0.5">
                            {Object.entries(item.variant_attributes).map(([key, val]) => (
                              <span
                                key={key}
                                className="text-[10px] px-1.5 py-0.5 bg-theme-card-light dark:bg-theme-card-dark border border-theme-border-light/60 dark:border-theme-border-dark/60 text-theme-text-secondary-light dark:text-theme-text-secondary-dark font-mono"
                              >
                                {key}: {String(val)}
                              </span>
                            ))}
                          </div>
                        )}

                        <p className="text-[11px] text-theme-text-muted-light dark:text-theme-text-muted-dark mt-0.5">
                          {formatPrice(item.price)} × {item.quantity}
                        </p>
                      </div>

                      {/* Subtotal */}
                      <div className="text-right flex-shrink-0">
                        <span className="font-serif font-bold text-xs sm:text-sm text-theme-text-primary-light dark:text-theme-text-primary-dark">
                          {formatPrice(item.subtotal)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Financial Breakdown Card */}
            <div className="border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark p-4 sm:p-6 lg:p-7 shadow-xs space-y-3 text-xs">
              <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark pb-2 border-b border-theme-border-light dark:border-theme-border-dark">
                Payment Summary
              </h3>

              <div className="flex justify-between text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
                <span>Subtotal</span>
                <span>{formatPrice(order.pricing?.subtotal || 0)}</span>
              </div>

              {order.pricing?.discount_amount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                  <span>Promotion Discount</span>
                  <span>-{formatPrice(order.pricing.discount_amount)}</span>
                </div>
              )}

              <div className="flex justify-between text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
                <span>Shipping Fee</span>
                <span>{formatPrice(order.pricing?.shipping_cost || 0)}</span>
              </div>

              <div className="flex justify-between text-sm font-serif font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark pt-3 border-t border-theme-border-light dark:border-theme-border-dark items-baseline">
                <span className="uppercase tracking-wider text-xs">Total Amount</span>
                <span className="text-base sm:text-lg font-serif">
                  {formatPrice(order.pricing?.total || 0)}
                </span>
              </div>
            </div>

          </div>

          {/* RIGHT: Delivery, Payment & Concierge Info (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Delivery Details Card */}
            <div className="border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark p-4 sm:p-6 shadow-xs space-y-3">
              <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark flex items-center gap-2 pb-2 border-b border-theme-border-light dark:border-theme-border-dark">
                <MapPin className="w-3.5 h-3.5 text-theme-hover-light dark:text-theme-hover-dark" />
                <span>Shipping Destination</span>
              </h3>

              <div className="text-xs space-y-1 text-theme-text-secondary-light dark:text-theme-text-secondary-dark leading-relaxed">
                <p className="font-bold text-xs sm:text-sm text-theme-text-primary-light dark:text-theme-text-primary-dark">
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
            <div className="border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark p-4 sm:p-6 shadow-xs space-y-3.5">
              <div className="flex flex-wrap items-center justify-between gap-1.5 pb-2 border-b border-theme-border-light dark:border-theme-border-dark">
                <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark flex items-center gap-2">
                  <CreditCard className="w-3.5 h-3.5 text-theme-hover-light dark:text-theme-hover-dark" />
                  <span>Payment Information</span>
                </h3>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider border ${
                    isPaid
                      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                      : "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30"
                  }`}
                >
                  {isPaid ? (
                    <>
                      <Check className="w-3 h-3" />
                      <span>Paid</span>
                    </>
                  ) : isCOD ? (
                    <>
                      <Banknote className="w-3 h-3" />
                      <span>Pay on Delivery</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-3 h-3" />
                      <span>Pending Verification</span>
                    </>
                  )}
                </span>
              </div>

              <div className="text-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
                    Payment Method:
                  </span>
                  <span className="font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark uppercase">
                    {order.payment_method === "jazzcash"
                      ? "JazzCash"
                      : order.payment_method === "bank_transfer"
                      ? "Direct Bank Transfer"
                      : "Cash on Delivery"}
                  </span>
                </div>

                {/* Bank Reference */}
                {order.bank_reference && (
                  <div className="p-3 bg-theme-card-light/60 dark:bg-theme-card-dark/40 border border-theme-border-light dark:border-theme-border-dark">
                    <p className="text-[10px] uppercase tracking-wider text-theme-text-muted-light dark:text-theme-text-muted-dark mb-0.5">
                      Transaction Reference
                    </p>
                    <p className="font-mono font-bold text-xs text-theme-text-primary-light dark:text-theme-text-primary-dark">
                      {order.bank_reference}
                    </p>
                  </div>
                )}

                {/* Contextual Notice */}
                <div className="p-3 bg-theme-bg-light dark:bg-theme-bg-dark border border-theme-border-light/80 dark:border-theme-border-dark/80 text-[11px] leading-relaxed text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
                  {isCOD ? (
                    <div className="flex items-start gap-2">
                      <Banknote className="w-4 h-4 text-theme-hover-light dark:text-theme-hover-dark shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-theme-text-primary-light dark:text-theme-text-primary-dark font-medium">Cash on Delivery:</strong> Please keep the exact amount of{" "}
                        <strong className="text-theme-text-primary-light dark:text-theme-text-primary-dark">{formatPrice(order.pricing?.total || 0)}</strong> ready for the courier at delivery.
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2">
                      <Building2 className="w-4 h-4 text-theme-hover-light dark:text-theme-hover-dark shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-theme-text-primary-light dark:text-theme-text-primary-dark font-medium">Payment Verification:</strong> Our accounts desk is reviewing your payment record. Your dispatch manifest will be processed immediately upon verification.
                      </div>
                    </div>
                  )}
                </div>

                {order.payment_proof_url && (
                  <a
                    href={order.payment_proof_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 px-3 border border-theme-border-light dark:border-theme-border-dark hover:border-theme-hover-light text-theme-text-primary-light dark:text-theme-text-primary-dark text-xs font-semibold uppercase tracking-wider transition-colors bg-theme-card-light/40 dark:bg-theme-card-dark/30 shadow-2xs"
                  >
                    <Receipt className="w-3.5 h-3.5 text-theme-hover-light dark:text-theme-hover-dark" />
                    <span>View Uploaded Receipt</span>
                    <ExternalLink className="w-3.5 h-3.5 ml-0.5 text-theme-text-muted-light" />
                  </a>
                )}
              </div>
            </div>

            {/* Assistance & Concierge Box */}
            <div className="border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark p-4 sm:p-6 shadow-xs space-y-3">
              <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark flex items-center gap-2">
                <MessageCircle className="w-3.5 h-3.5 text-theme-hover-light dark:text-theme-hover-dark" />
                <span>Need Assistance?</span>
              </h3>
              <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark leading-relaxed">
                Have a question about this order or need custom delivery instructions? Our support concierge is ready to assist.
              </p>
              <a
                href={`https://wa.me/923130538686?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold uppercase tracking-wider transition-colors shadow-xs"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>

          </div>

        </div>

        {/* ========================================================================= */}
        {/* 4. ACTION BUTTONS FOOTER */}
        {/* ========================================================================= */}
        <div className="pt-6 border-t border-theme-border-light dark:border-theme-border-dark flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          <Link
            href={`/track-order?orderId=${order.order_number || order._id}`}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3.5 sm:py-4 px-6 sm:px-8 bg-theme-primary hover:bg-theme-hover-light dark:hover:bg-theme-hover-dark text-theme-btn-text text-xs uppercase tracking-[0.2em] font-medium transition-all shadow-sm"
          >
            <Truck className="w-4 h-4" />
            <span>Track Order Status</span>
          </Link>

          <Link
            href="/products"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3.5 sm:py-4 px-6 sm:px-8 border border-theme-border-light dark:border-theme-border-dark text-theme-text-primary-light dark:text-theme-text-primary-dark hover:border-theme-hover-light text-xs uppercase tracking-[0.2em] font-medium transition-all"
          >
            <span>Continue Shopping</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </main>
    </div>
  );
}