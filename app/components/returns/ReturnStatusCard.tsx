// app/components/returns/ReturnStatusCard.tsx
"use client";

import { useState } from "react";
import {
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  Landmark,
  Smartphone,
  Copy,
  Check,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { returnsApi } from "../../../lib/api/returns";
import { formatPrice } from "../../../lib/utils/formatPrice";
import RequestReturnModal from "./RequestReturnModal";

interface ReturnStatusCardProps {
  order: any;
  returnDoc: any;
  onRefresh: () => void;
}

export default function ReturnStatusCard({
  order,
  returnDoc,
  onRefresh,
}: ReturnStatusCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [payoutMethod, setPayoutMethod] = useState<
    "bank_transfer" | "jazzcash" | "easypaisa"
  >("bank_transfer");

  const [accountTitle, setAccountTitle] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [bankOrWalletName, setBankOrWalletName] = useState("");
  const [submittingPayout, setSubmittingPayout] = useState(false);
  const [payoutError, setPayoutError] = useState("");
  const [payoutSuccess, setPayoutSuccess] = useState("");

  const isEligibleToRequest =
    !returnDoc &&
    (order.status === "delivered" || order.status === "shipped");

  const handlePayoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPayoutError("");
    setPayoutSuccess("");

    if (!accountTitle || !accountNumber || !bankOrWalletName) {
      setPayoutError("Please fill out all bank / mobile wallet fields.");
      return;
    }

    setSubmittingPayout(true);
    try {
      await returnsApi.submitPayoutDetails(returnDoc._id, {
        method: payoutMethod,
        account_title: accountTitle,
        account_number: accountNumber,
        bank_or_wallet_name: bankOrWalletName,
      });

      setPayoutSuccess("Payout account details submitted successfully!");
      onRefresh();
    } catch (err: any) {
      setPayoutError(err.message || "Failed to submit payout details");
    } finally {
      setSubmittingPayout(false);
    }
  };

  // Case 1: No return on file yet — Show return request button if order is eligible
  if (!returnDoc) {
    if (!isEligibleToRequest) return null;

    return (
      <>
        <div className="p-4 sm:p-5 rounded-lg border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-theme-card-light dark:bg-theme-card-dark text-theme-hover-light dark:text-theme-hover-dark border border-theme-border-light dark:border-theme-border-dark flex-shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-serif font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                Returns & Exchange Guarantee
              </h3>
              <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
                Eligible for replacement or refund within 30 days of delivery.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-theme-surface-light dark:bg-theme-surface-dark border border-theme-border-light dark:border-theme-border-dark hover:border-theme-hover-light dark:hover:border-theme-hover-dark text-theme-text-primary-light dark:text-theme-text-primary-dark text-xs font-semibold uppercase tracking-wider rounded transition-colors"
          >
            <span>Request Return / Refund</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <RequestReturnModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          order={order}
          onSuccess={onRefresh}
        />
      </>
    );
  }

  // Case 2: Return is PENDING
  if (returnDoc.status === "pending") {
    return (
      <div className="p-5 sm:p-6 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200 space-y-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span className="font-bold text-xs uppercase tracking-wider">
              Return Request Under Review
            </span>
          </div>
          <span className="font-mono text-[11px] font-semibold bg-amber-500/20 px-2 py-0.5 rounded">
            {returnDoc.rma_number}
          </span>
        </div>

        <p className="text-xs leading-relaxed opacity-90">
          Your return claim for{" "}
          <strong>
            {returnDoc.items?.length} item(s) ({formatPrice(returnDoc.refund_amount)})
          </strong>{" "}
          is currently being assessed by our concierge team. You will be notified once the claim is approved so you can provide your refund payout details.
        </p>
      </div>
    );
  }

  // Case 3: Return is REJECTED
  if (returnDoc.status === "rejected") {
    return (
      <div className="p-5 sm:p-6 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-900 dark:text-rose-200 space-y-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            <span className="font-bold text-xs uppercase tracking-wider">
              Return Claim Declined
            </span>
          </div>
          <span className="font-mono text-[11px] font-semibold bg-rose-500/20 px-2 py-0.5 rounded">
            {returnDoc.rma_number}
          </span>
        </div>

        <div className="p-3 bg-white/50 dark:bg-black/20 rounded border border-rose-500/20 text-xs space-y-1">
          <span className="text-[10px] uppercase font-bold tracking-wider opacity-75">
            Reason for decline:
          </span>
          <p className="font-medium">
            {returnDoc.rejection_reason || "The claim did not meet the eligible return policy criteria."}
          </p>
        </div>
      </div>
    );
  }

  // Case 4: Return is APPROVED — Payout details form is unlocked!
  if (returnDoc.status === "approved") {
    const hasPayoutDetails = !!returnDoc.payout_details?.account_number;

    return (
      <div className="p-5 sm:p-6 rounded-lg border border-emerald-500/30 bg-emerald-500/5 text-emerald-950 dark:text-emerald-200 space-y-5">
        {/* Approved Header Banner */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="font-bold text-xs uppercase tracking-wider">
              Return Claim Approved • {formatPrice(returnDoc.refund_amount)}
            </span>
          </div>
          <span className="font-mono text-[11px] font-semibold bg-emerald-500/20 px-2 py-0.5 rounded">
            {returnDoc.rma_number}
          </span>
        </div>

        {/* Instructions */}
        <p className="text-xs leading-relaxed opacity-90">
          Your claim has been approved. Please pack the item(s) safely for pickup/return. Enter your bank or mobile wallet details below to receive your refund transfer.
        </p>

        {/* If payout details are already submitted */}
        {hasPayoutDetails ? (
          <div className="p-4 rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark border border-emerald-500/40 text-theme-text-primary-light dark:text-theme-text-primary-dark space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>Refund Payout Account Registered</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs pt-1">
              <div>
                <span className="text-[10px] uppercase text-theme-text-muted-light block">
                  Method
                </span>
                <span className="font-medium capitalize">
                  {returnDoc.payout_details.method.replace("_", " ")}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-theme-text-muted-light block">
                  Bank / Wallet
                </span>
                <span className="font-medium">
                  {returnDoc.payout_details.bank_or_wallet_name}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-theme-text-muted-light block">
                  Account #
                </span>
                <span className="font-mono font-medium">
                  {returnDoc.payout_details.account_number}
                </span>
              </div>
            </div>
            <p className="text-[11px] text-theme-text-muted-light pt-2">
              Funds will be disbursed once the returned package reaches our fulfillment center.
            </p>
          </div>
        ) : (
          /* Form to submit bank/jazzcash details */
          <form
            onSubmit={handlePayoutSubmit}
            className="p-4 rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark border border-theme-border-light dark:border-theme-border-dark space-y-4 text-xs text-theme-text-primary-light dark:text-theme-text-primary-dark"
          >
            <div className="flex items-center justify-between pb-2 border-b border-theme-border-light/60 dark:border-theme-border-dark/60">
              <span className="font-bold text-xs uppercase tracking-wider text-theme-hover-light dark:text-theme-hover-dark flex items-center gap-1.5">
                <Landmark className="w-3.5 h-3.5" />
                Provide Refund Payout Account
              </span>
            </div>

            {payoutError && (
              <div className="p-2.5 rounded bg-red-100 dark:bg-red-950/50 border border-red-300 dark:border-red-800 text-red-800 dark:text-red-200 flex items-center gap-2">
                <AlertCircle size={14} />
                <span>{payoutError}</span>
              </div>
            )}
            {payoutSuccess && (
              <div className="p-2.5 rounded bg-emerald-100 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
                <CheckCircle2 size={14} />
                <span>{payoutSuccess}</span>
              </div>
            )}

            {/* Payout Channel Tabs */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPayoutMethod("bank_transfer")}
                className={`py-2 px-3 rounded border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                  payoutMethod === "bank_transfer"
                    ? "bg-theme-card-light dark:bg-theme-card-dark border-theme-hover-light text-theme-hover-light dark:text-theme-hover-dark"
                    : "border-theme-border-light hover:border-theme-hover-light/60"
                }`}
              >
                <Landmark className="w-3.5 h-3.5" />
                <span>Bank Account</span>
              </button>
              <button
                type="button"
                onClick={() => setPayoutMethod("jazzcash")}
                className={`py-2 px-3 rounded border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                  payoutMethod === "jazzcash"
                    ? "bg-theme-card-light dark:bg-theme-card-dark border-rose-500 text-rose-600"
                    : "border-theme-border-light hover:border-rose-400"
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>JazzCash</span>
              </button>
              <button
                type="button"
                onClick={() => setPayoutMethod("easypaisa")}
                className={`py-2 px-3 rounded border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                  payoutMethod === "easypaisa"
                    ? "bg-theme-card-light dark:bg-theme-card-dark border-emerald-500 text-emerald-600"
                    : "border-theme-border-light hover:border-emerald-400"
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>EasyPaisa</span>
              </button>
            </div>

            {/* Input Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Account Title */}
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-theme-text-muted-light mb-1">
                  Account Title / Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Muhammad Ali"
                  value={accountTitle}
                  onChange={(e) => setAccountTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-theme-bg-light dark:bg-theme-bg-dark border border-theme-border-light dark:border-theme-border-dark rounded text-xs focus:outline-none focus:border-theme-hover-light"
                />
              </div>

              {/* Bank / Wallet Name */}
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-theme-text-muted-light mb-1">
                  {payoutMethod === "bank_transfer"
                    ? "Bank Name"
                    : "Wallet Provider"}
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    payoutMethod === "bank_transfer"
                      ? "e.g. Meezan Bank, HBL, Allied Bank"
                      : payoutMethod === "jazzcash"
                      ? "JazzCash"
                      : "EasyPaisa"
                  }
                  value={bankOrWalletName}
                  onChange={(e) => setBankOrWalletName(e.target.value)}
                  className="w-full px-3 py-2 bg-theme-bg-light dark:bg-theme-bg-dark border border-theme-border-light dark:border-theme-border-dark rounded text-xs focus:outline-none focus:border-theme-hover-light"
                />
              </div>

              {/* Account / Mobile / IBAN Number */}
              <div className="sm:col-span-2">
                <label className="block text-[10px] uppercase font-bold tracking-wider text-theme-text-muted-light mb-1">
                  {payoutMethod === "bank_transfer"
                    ? "Account / IBAN Number"
                    : "Mobile Wallet Account Number"}
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    payoutMethod === "bank_transfer"
                      ? "PK00MEZN0000000000000000"
                      : "03001234567"
                  }
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-theme-bg-light dark:bg-theme-bg-dark border border-theme-border-light dark:border-theme-border-dark rounded text-xs font-mono focus:outline-none focus:border-theme-hover-light"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submittingPayout}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-semibold text-xs transition-colors flex items-center justify-center gap-2"
            >
              {submittingPayout ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Saving Payout Details...</span>
                </>
              ) : (
                <span>Confirm & Submit Payout Account</span>
              )}
            </button>
          </form>
        )}
      </div>
    );
  }

  // Case 5: Return is REFUNDED
  if (returnDoc.status === "refunded") {
    return (
      <div className="p-5 sm:p-6 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-950 dark:text-emerald-200 space-y-4">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span className="font-bold text-xs uppercase tracking-wider">
              Refund Dispatched & Settled ({formatPrice(returnDoc.refund_amount)})
            </span>
          </div>
          <span className="font-mono text-[11px] font-semibold bg-emerald-500/20 px-2 py-0.5 rounded">
            {returnDoc.rma_number}
          </span>
        </div>

        <div className="p-3.5 bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg border border-emerald-500/30 text-theme-text-primary-light dark:text-theme-text-primary-dark space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider text-theme-text-muted-light">
              Transaction Reference / TID
            </span>
            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
              {returnDoc.settlement?.transaction_reference || "TRX-SETTLED"}
            </span>
          </div>

          {returnDoc.refunded_at && (
            <p className="text-[11px] text-theme-text-muted-light">
              Dispatched on {new Date(returnDoc.refunded_at).toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          )}
        </div>
      </div>
    );
  }

  return null;
}
