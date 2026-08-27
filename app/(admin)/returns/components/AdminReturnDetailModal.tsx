// app/(admin)/returns/components/AdminReturnDetailModal.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  X,
  CheckCircle2,
  XCircle,
  Clock,
  Landmark,
  Smartphone,
  Copy,
  Check,
  Package,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Loader2,
  FileText,
  Upload,
  Video,
} from "lucide-react";
import { adminReturnsApi } from "../../../../lib/api/returns";
import { formatPrice } from "../../../../lib/utils/formatPrice";
import { openImagePreview } from "../../../../lib/utils/mediaPreview";

interface AdminReturnDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  returnId: string;
  onRefresh: () => void;
}

export default function AdminReturnDetailModal({
  isOpen,
  onClose,
  returnId,
  onRefresh,
}: AdminReturnDetailModalProps) {
  const [returnDoc, setReturnDoc] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  // Status Action state
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [processingStatus, setProcessingStatus] = useState(false);

  // Settlement state
  const [trxRef, setTrxRef] = useState("");
  const [proofUrl, setProofUrl] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [uploadingProof, setUploadingProof] = useState(false);
  const [processingSettle, setProcessingSettle] = useState(false);

  const fetchDetail = useCallback(async () => {
    if (!returnId) return;
    setLoading(true);
    setError("");
    try {
      const data = await adminReturnsApi.getById(returnId);
      setReturnDoc(data.return);
    } catch (err: any) {
      setError(err.message || "Failed to load return details");
    } finally {
      setLoading(false);
    }
  }, [returnId]);

  useEffect(() => {
    if (isOpen && returnId) {
      fetchDetail();
    }
  }, [isOpen, returnId, fetchDetail]);

  if (!isOpen) return null;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApprove = async () => {
    if (!confirm(`Approve Return Claim #${returnDoc?.rma_number}? The customer will be prompted to submit their refund payout details.`)) return;

    setProcessingStatus(true);
    try {
      await adminReturnsApi.updateStatus(returnId, "approved");
      await fetchDetail();
      onRefresh();
    } catch (err: any) {
      alert(err.message || "Failed to approve return");
    } finally {
      setProcessingStatus(false);
    }
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectionReason.trim()) {
      alert("Please enter a reason for rejecting this claim.");
      return;
    }

    setProcessingStatus(true);
    try {
      await adminReturnsApi.updateStatus(returnId, "rejected", rejectionReason.trim());
      setShowRejectInput(false);
      await fetchDetail();
      onRefresh();
    } catch (err: any) {
      alert(err.message || "Failed to reject return");
    } finally {
      setProcessingStatus(false);
    }
  };

  const handleProofUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingProof(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to upload transfer proof");
      }
      if (data.url) {
        setProofUrl(data.url);
      }
    } catch (err: any) {
      alert(err.message || "Failed to upload transfer proof");
    } finally {
      setUploadingProof(false);
    }
  };

  const handleSettleRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trxRef.trim()) {
      alert("Please provide the bank/wallet transaction reference ID.");
      return;
    }

    if (!confirm(`Confirm payout of ${formatPrice(returnDoc.refund_amount)} has been dispatched to customer?`)) return;

    setProcessingSettle(true);
    try {
      await adminReturnsApi.settleRefund(returnId, {
        transaction_reference: trxRef.trim(),
        proof_url: proofUrl || undefined,
        admin_notes: adminNotes || undefined,
      });

      await fetchDetail();
      onRefresh();
    } catch (err: any) {
      alert(err.message || "Failed to settle refund");
    } finally {
      setProcessingSettle(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300";
      case "refunded":
        return "bg-green-100 dark:bg-green-950/60 text-green-800 dark:text-green-300 border-green-300";
      case "rejected":
        return "bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-300";
      case "pending":
      default:
        return "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300";
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-theme-surface-light dark:bg-theme-surface-dark border border-theme-border-light dark:border-theme-border-dark max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl rounded-xl overflow-hidden text-xs">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-theme-border-light dark:border-theme-border-dark flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                {returnDoc?.rma_number || "RMA Details"}
              </span>
              {returnDoc && (
                <span
                  className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase border ${getStatusBadge(
                    returnDoc.status
                  )}`}
                >
                  {returnDoc.status}
                </span>
              )}
            </div>
            <p className="text-[11px] text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
              Order #{returnDoc?.order_id?.order_number || "N/A"} • Submitted on{" "}
              {returnDoc &&
                new Date(returnDoc.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-theme-text-muted-light hover:text-theme-text-primary-light transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {loading ? (
            <div className="py-12 flex justify-center items-center">
              <Loader2 className="w-6 h-6 animate-spin text-theme-hover-light" />
            </div>
          ) : error || !returnDoc ? (
            <div className="p-4 rounded bg-red-100 dark:bg-red-950/50 border border-red-300 text-red-800">
              {error || "Return not found"}
            </div>
          ) : (
            <>
              {/* 1. Customer & Order Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-lg bg-theme-bg-light/60 dark:bg-theme-bg-dark/40 border border-theme-border-light dark:border-theme-border-dark">
                <div>
                  <span className="text-[10px] uppercase font-bold text-theme-text-muted-light block">
                    Customer
                  </span>
                  <p className="font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                    {returnDoc.user_id?.name || "Guest Customer"}
                  </p>
                  <p className="text-[11px] text-theme-text-muted-light truncate">
                    {returnDoc.user_id?.email || returnDoc.guest_email || "N/A"}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-theme-text-muted-light block">
                    Claim Reason
                  </span>
                  <p className="font-semibold capitalize text-theme-text-primary-light dark:text-theme-text-primary-dark">
                    {returnDoc.return_reason.replace("_", " ")}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-theme-text-muted-light block">
                    Total Refund Amount
                  </span>
                  <p className="font-bold text-sm text-theme-hover-light dark:text-theme-hover-dark">
                    {formatPrice(returnDoc.refund_amount)}
                  </p>
                </div>
              </div>

              {/* 2. Customer's Explanation */}
              {returnDoc.return_reason_details && (
                <div className="p-3.5 rounded-lg border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark space-y-1">
                  <span className="text-[10px] uppercase font-bold text-theme-text-muted-light block">
                    Customer Explanation Note
                  </span>
                  <p className="text-xs italic text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
                    "{returnDoc.return_reason_details}"
                  </p>
                </div>
              )}

              {/* 3. Returned Items List */}
              <div className="space-y-2">
                <span className="text-[11px] uppercase font-bold tracking-wider text-theme-text-primary-light dark:text-theme-text-primary-dark">
                  Returned Items Manifest ({returnDoc.items?.length})
                </span>
                <div className="divide-y divide-theme-border-light dark:divide-theme-border-dark border border-theme-border-light dark:border-theme-border-dark rounded-lg overflow-hidden">
                  {returnDoc.items?.map((item: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-3 flex items-center justify-between gap-3 bg-theme-surface-light dark:bg-theme-surface-dark"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded border border-theme-border-light dark:border-theme-border-dark overflow-hidden flex items-center justify-center bg-black/5">
                          {item.product_image ? (
                            <img
                              src={item.product_image}
                              alt={item.product_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Package size={18} className="text-theme-text-muted-light" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark">
                            {item.product_name}
                          </p>
                          <p className="text-[10px] text-theme-text-muted-light uppercase">
                            Qty: {item.quantity} · Unit Price: {formatPrice(item.price)}
                          </p>
                        </div>
                      </div>
                      <p className="font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                        {formatPrice((item.price || 0) * (item.quantity || 1))}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. Uploaded Photos Proof */}
              {returnDoc.media_urls && returnDoc.media_urls.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[11px] uppercase font-bold tracking-wider text-theme-text-primary-light dark:text-theme-text-primary-dark">
                    Customer Photo Evidence ({returnDoc.media_urls.length})
                  </span>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                    {returnDoc.media_urls.map((url: string, idx: number) => (
                      <button
                        type="button"
                        key={idx}
                        onClick={() =>
                          openImagePreview(
                            url,
                            `Return Claim #${returnDoc.rma_number} Evidence Photo #${idx + 1}`
                          )
                        }
                        className="group relative h-24 rounded-lg border border-theme-border-light dark:border-theme-border-dark overflow-hidden bg-black/10 flex items-center justify-center cursor-pointer"
                      >
                        {url.endsWith(".mp4") || url.endsWith(".webm") ? (
                          <div className="flex flex-col items-center gap-1 text-white">
                            <Video size={20} />
                            <span className="text-[9px]">Play Video</span>
                          </div>
                        ) : (
                          <img
                            src={url}
                            alt="Proof"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                          <ExternalLink size={14} />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 5. Customer Payout Account (Visible if approved or refunded) */}
              {returnDoc.status === "approved" || returnDoc.status === "refunded" ? (
                <div className="p-4 rounded-lg bg-theme-bg-light/60 dark:bg-theme-bg-dark/40 border border-theme-border-light dark:border-theme-border-dark space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] uppercase font-bold tracking-wider text-theme-hover-light dark:text-theme-hover-dark flex items-center gap-1.5">
                      <Landmark size={14} />
                      Customer Refund Payout Account
                    </span>
                    {returnDoc.payout_details && (
                      <button
                        type="button"
                        onClick={() =>
                          copyToClipboard(returnDoc.payout_details.account_number)
                        }
                        className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded bg-theme-surface-light dark:bg-theme-surface-dark border border-theme-border-light hover:text-theme-hover-light transition-colors"
                      >
                        {copied ? (
                          <>
                            <Check size={12} className="text-emerald-600" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy size={12} />
                            <span>Copy Account #</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {returnDoc.payout_details ? (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div className="p-2.5 rounded bg-theme-surface-light dark:bg-theme-surface-dark border border-theme-border-light">
                        <span className="text-[9px] uppercase text-theme-text-muted-light block">
                          Account Title
                        </span>
                        <p className="font-semibold truncate">
                          {returnDoc.payout_details.account_title}
                        </p>
                      </div>
                      <div className="p-2.5 rounded bg-theme-surface-light dark:bg-theme-surface-dark border border-theme-border-light">
                        <span className="text-[9px] uppercase text-theme-text-muted-light block">
                          Bank / Wallet Name
                        </span>
                        <p className="font-semibold truncate">
                          {returnDoc.payout_details.bank_or_wallet_name}
                        </p>
                      </div>
                      <div className="p-2.5 rounded bg-theme-surface-light dark:bg-theme-surface-dark border border-theme-border-light">
                        <span className="text-[9px] uppercase text-theme-text-muted-light block">
                          Account / IBAN Number
                        </span>
                        <p className="font-bold text-theme-hover-light truncate">
                          {returnDoc.payout_details.account_number}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 rounded bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-[11px]">
                      Customer has not submitted their bank or wallet account information yet.
                    </div>
                  )}
                </div>
              ) : null}

              {/* 6. Settlement Record (If already refunded) */}
              {returnDoc.status === "refunded" && returnDoc.settlement && (
                <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 space-y-2 text-emerald-950 dark:text-emerald-200">
                  <div className="flex items-center gap-2 font-bold text-xs">
                    <ShieldCheck size={16} className="text-emerald-600" />
                    <span>Refund Dispatched & Settled</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
                    <div>
                      <span className="text-[10px] uppercase opacity-75 block">
                        Transaction Reference / TID
                      </span>
                      <span className="font-bold">
                        {returnDoc.settlement.transaction_reference}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase opacity-75 block">
                        Settled At
                      </span>
                      <span>
                        {new Date(returnDoc.settlement.settled_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* 7. Rejection Note (If rejected) */}
              {returnDoc.status === "rejected" && (
                <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/30 space-y-1 text-rose-900 dark:text-rose-200">
                  <span className="text-[10px] uppercase font-bold tracking-wider block">
                    Rejection Reason
                  </span>
                  <p className="text-xs font-medium">
                    {returnDoc.rejection_reason || "Declined by admin."}
                  </p>
                </div>
              )}

              {/* ── ACTION BARS ── */}

              {/* A. If PENDING: Show Approve / Reject buttons */}
              {returnDoc.status === "pending" && (
                <div className="pt-4 border-t border-theme-border-light dark:border-theme-border-dark space-y-3">
                  {!showRejectInput ? (
                    <div className="flex items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => setShowRejectInput(true)}
                        disabled={processingStatus}
                        className="px-4 py-2.5 rounded-lg border border-rose-500/50 hover:bg-rose-500/10 text-rose-600 text-xs font-semibold transition-colors disabled:opacity-50"
                      >
                        Reject Claim
                      </button>
                      <button
                        type="button"
                        onClick={handleApprove}
                        disabled={processingStatus}
                        className="px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors disabled:opacity-50 flex items-center gap-1.5"
                      >
                        {processingStatus ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <CheckCircle2 size={14} />
                        )}
                        <span>Approve Return Claim</span>
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleReject} className="p-4 rounded-lg bg-theme-bg-light/60 border border-rose-500/30 space-y-3">
                      <label className="block text-xs font-bold text-rose-600">
                        Reason for Rejecting Claim (Visible to Customer):
                      </label>
                      <textarea
                        rows={3}
                        required
                        placeholder="Explain why the return claim is declined (e.g. damaged through misuse, past return window)..."
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        className="w-full p-2.5 rounded bg-theme-surface-light border border-theme-border-light text-xs focus:outline-none focus:border-rose-500"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setShowRejectInput(false)}
                          className="px-3 py-1.5 border rounded text-xs"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={processingStatus}
                          className="px-4 py-1.5 bg-rose-600 text-white rounded font-semibold text-xs hover:bg-rose-700 disabled:opacity-50"
                        >
                          {processingStatus ? "Rejecting..." : "Confirm Rejection"}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* B. If APPROVED & Bank Details available: Settle Refund Form */}
              {returnDoc.status === "approved" && (
                <div className="pt-4 border-t border-theme-border-light dark:border-theme-border-dark space-y-4">
                  {returnDoc.payout_details ? (
                    <form
                      onSubmit={handleSettleRefund}
                      className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/30 space-y-3"
                    >
                      <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-700 dark:text-emerald-300">
                        <ShieldCheck size={16} />
                        <span>Confirm Refund Payment</span>
                      </div>
                      <p className="text-[11px] text-theme-text-muted-light">
                        After transferring {formatPrice(returnDoc.refund_amount)} to the customer's account above, enter the transaction ID below to mark this claim as settled.
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-theme-text-muted-light mb-1">
                            Transaction Reference / TID *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. MEZN-987654321 / JZ-12345"
                            value={trxRef}
                            onChange={(e) => setTrxRef(e.target.value)}
                            className="w-full px-3 py-2 rounded bg-theme-surface-light border border-theme-border-light text-xs focus:outline-none focus:border-emerald-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase font-bold text-theme-text-muted-light mb-1">
                            Transfer Receipt Proof (Optional)
                          </label>
                          <label className="cursor-pointer flex items-center justify-center gap-1 px-3 py-2 rounded bg-theme-surface-light border border-theme-border-light text-xs font-medium hover:border-emerald-500 transition-colors">
                            <Upload size={13} />
                            <span>{uploadingProof ? "Uploading..." : proofUrl ? "Proof Uploaded" : "Upload Receipt"}</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleProofUpload}
                              disabled={uploadingProof}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={processingSettle || !trxRef.trim()}
                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-xs shadow-xs transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {processingSettle ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <CheckCircle2 size={14} />
                        )}
                        <span>Confirm Refund Dispatched & Mark Settled</span>
                      </button>
                    </form>
                  ) : (
                    <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-2">
                      <Clock size={16} />
                      <span>
                        Return claim is approved. Awaiting customer to submit their refund bank/wallet account details before payout can be settled.
                      </span>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
