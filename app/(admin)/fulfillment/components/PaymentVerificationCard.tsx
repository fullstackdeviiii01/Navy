// app/(admin)/fulfillment/components/PaymentVerificationCard.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import {
  CreditCard,
  Landmark,
  Smartphone,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  Maximize2,
  X,
  AlertCircle,
  ShieldCheck,
  Clock,
} from "lucide-react";
import { adminOrdersApi } from "../../../../lib/api/orders";

interface PaymentVerificationCardProps {
  order: any;
  onRefresh: () => void;
}

export default function PaymentVerificationCard({
  order,
  onRefresh,
}: PaymentVerificationCardProps) {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const paymentMethod = order.payment_method || "cod";
  const isOnlinePayment =
    paymentMethod === "bank_transfer" || paymentMethod === "jazzcash";
  const hasProof = !!order.payment_proof_url;
  const isPaid = order.payment_status === "paid";

  const copyReference = () => {
    if (!order.bank_reference) return;
    navigator.clipboard.writeText(order.bank_reference);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleVerifyPayment = async () => {
    if (
      !confirm(
        `Verify payment of Rs. ${order.pricing?.total?.toLocaleString()} for Order #${
          order.order_number
        } and mark as PAID?`
      )
    ) {
      return;
    }

    setIsVerifying(true);
    try {
      await adminOrdersApi.markPaid(order._id);
      onRefresh();
    } catch (err: any) {
      alert(err.message || "Failed to verify and mark payment as paid");
    } finally {
      setIsVerifying(false);
    }
  };

  const getMethodBadge = () => {
    if (paymentMethod === "bank_transfer") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
          <Landmark className="w-3 h-3" />
          Bank Transfer (Meezan)
        </span>
      );
    }
    if (paymentMethod === "jazzcash") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300">
          <Smartphone className="w-3 h-3" />
          JazzCash
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
        <CreditCard className="w-3 h-3" />
        Cash on Delivery
      </span>
    );
  };

  return (
    <>
      <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-xl border border-theme-border-light dark:border-theme-border-dark overflow-hidden shadow-xs">
        {/* Card Header */}
        <div className="p-4 sm:p-5 border-b border-theme-border-light/80 dark:border-theme-border-dark/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-theme-card-light dark:bg-theme-card-dark text-theme-hover-light dark:text-theme-hover-dark border border-theme-border-light dark:border-theme-border-dark">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                Payment Verification & Proof
              </h3>
              <p className="text-[11px] text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
                {isOnlinePayment
                  ? "Customer submitted payment proof for verification"
                  : "Cash settlement details"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">{getMethodBadge()}</div>
        </div>

        {/* Card Body */}
        <div className="p-4 sm:p-5 space-y-4">
          {/* Status & Amount Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Amount to Verify */}
            <div className="p-3.5 rounded-lg bg-theme-bg-light/60 dark:bg-theme-bg-dark/40 border border-theme-border-light/60 dark:border-theme-border-dark/60 space-y-1">
              <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-theme-text-muted-light dark:text-theme-text-muted-dark">
                Verified Amount
              </span>
              <p className="text-lg font-serif font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                Rs. {order.pricing?.total?.toLocaleString() || "0"}
              </p>
            </div>

            {/* Payment Settlement Status */}
            <div className="p-3.5 rounded-lg bg-theme-bg-light/60 dark:bg-theme-bg-dark/40 border border-theme-border-light/60 dark:border-theme-border-dark/60 space-y-1">
              <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-theme-text-muted-light dark:text-theme-text-muted-dark">
                Verification State
              </span>
              <div className="flex items-center gap-2 pt-0.5">
                {isPaid ? (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Payment Confirmed & Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
                    <Clock className="w-3.5 h-3.5" />
                    Pending Admin Verification
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Reference Number / Trx ID */}
          {order.bank_reference && (
            <div className="p-3.5 rounded-lg bg-theme-bg-light/70 dark:bg-theme-bg-dark/50 border border-theme-border-light dark:border-theme-border-dark flex items-center justify-between gap-3">
              <div className="space-y-0.5 min-w-0">
                <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-theme-text-muted-light dark:text-theme-text-muted-dark block">
                  Transaction / Reference ID
                </span>
                <p className="text-xs sm:text-sm font-mono font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark truncate">
                  {order.bank_reference}
                </p>
              </div>
              <button
                type="button"
                onClick={copyReference}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark text-[11px] font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark hover:text-theme-text-primary-light transition-colors flex-shrink-0"
                title="Copy reference number"
              >
                {isCopied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span className="text-emerald-600">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Screenshot / Proof Image Section */}
          {hasProof ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark uppercase tracking-wider text-[11px]">
                  Uploaded Payment Receipt / Screenshot
                </span>
                <a
                  href={order.payment_proof_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-theme-hover-light dark:text-theme-hover-dark hover:underline"
                >
                  <span>Open Full Size</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Image Preview Box */}
              <div
                onClick={() => setIsLightboxOpen(true)}
                className="group relative w-full h-72 sm:h-96 rounded-xl border border-theme-border-light dark:border-theme-border-dark bg-neutral-900/5 dark:bg-black/30 overflow-hidden cursor-pointer flex items-center justify-center transition-all hover:border-theme-hover-light"
              >
                <img
                  src={order.payment_proof_url}
                  alt={`Payment proof for order ${order.order_number}`}
                  className="w-full h-full object-contain p-2 group-hover:scale-[1.02] transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-2">
                  <div className="px-3.5 py-2 rounded-lg bg-black/70 backdrop-blur-xs flex items-center gap-1.5 text-xs font-semibold">
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>Click to Inspect Full Screen</span>
                  </div>
                </div>
              </div>
            </div>
          ) : isOnlinePayment ? (
            <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300 flex items-start gap-3">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <p className="font-semibold">No receipt image attached</p>
                <p className="text-[11px] opacity-90">
                  This order was placed via {paymentMethod === "bank_transfer" ? "Bank Transfer" : "JazzCash"}, but no receipt screenshot is on file. Please verify manually using the transaction ID.
                </p>
              </div>
            </div>
          ) : null}

          {/* Verification CTA Buttons */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-theme-border-light/60 dark:border-theme-border-dark/60">
            <div>
              {isPaid ? (
                <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Settlement Complete</span>
                </div>
              ) : (
                <p className="text-[11px] text-theme-text-muted-light dark:text-theme-text-muted-dark">
                  Verify transaction reference & amount before confirming payment.
                </p>
              )}
            </div>

            {!isPaid && (
              <button
                type="button"
                onClick={handleVerifyPayment}
                disabled={isVerifying}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-xs font-semibold shadow-xs hover:shadow transition-all disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isVerifying ? "Verifying..." : "Confirm Payment & Mark as Paid"}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          {/* Top Bar */}
          <div className="w-full max-w-5xl flex items-center justify-between pb-4 text-white">
            <div className="flex items-center gap-3">
              <span className="font-serif text-base sm:text-lg font-semibold">
                Payment Proof • #{order.order_number}
              </span>
              <span className="text-xs opacity-75 font-mono">
                Rs. {order.pricing?.total?.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={order.payment_proof_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                <span>New Tab</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                type="button"
                onClick={() => setIsLightboxOpen(false)}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Image Container */}
          <div className="relative max-w-5xl max-h-[85vh] w-full h-full flex items-center justify-center overflow-auto">
            <img
              src={order.payment_proof_url}
              alt={`Payment proof for order ${order.order_number}`}
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl border border-white/10"
            />
          </div>
        </div>
      )}
    </>
  );
}
