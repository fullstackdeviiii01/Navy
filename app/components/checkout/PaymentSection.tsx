// app/components/checkout/PaymentSection.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import {
  ChevronLeft,
  Upload,
  Building2,
  Phone,
  Copy,
  Check,
  QrCode,
  Truck,
  Loader2,
} from "lucide-react";
import PaymentMethodSelector, {
  STATIC_PAYMENT_METHODS,
} from "./PaymentMethodSelector";
import { checkoutApi } from "../../../lib/api/checkout";
import { formatPrice } from "../../../lib/utils/formatPrice";

interface PaymentSectionProps {
  cart: any;
  checkoutData: any;
  onBack: () => void;
  onSuccess: (orderId: string) => void;
}

export default function PaymentSection({
  cart,
  checkoutData,
  onBack,
  onSuccess,
}: PaymentSectionProps) {
  const [selectedMethod, setSelectedMethod] = useState("cod");
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [referenceNumber, setReferenceNumber] = useState("");
  const [uploadingProof, setUploadingProof] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const uploadProof = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload/payment-proof", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to upload payment proof");
    }

    const data = await res.json();
    return data.url;
  };

  const createOrder = async (paymentMethod: string, paymentData?: any) => {
    setProcessing(true);
    setError("");

    try {
      const orderData: any = {
        ...checkoutData,
        payment_method: paymentMethod,
        ...paymentData,
      };

      const result = await checkoutApi.processCheckout(orderData);
      setProcessing(false);
      onSuccess(result.order._id);
    } catch (error: any) {
      console.error("Order creation failed:", error);
      setError(error.message || "Failed to create order");
      setProcessing(false);
    }
  };

  const handleSubmitOrder = async () => {
    setError("");

    if (selectedMethod === "cod") {
      await createOrder("cod");
      return;
    }

    if (selectedMethod === "bank_transfer" || selectedMethod === "jazzcash") {
      if (!proofFile) {
        setError(
          `Payment screenshot / receipt is required for ${
            selectedMethod === "bank_transfer" ? "Bank Transfer" : "JazzCash"
          }. Please upload your transfer receipt to proceed.`
        );
        return;
      }

      setUploadingProof(true);
      try {
        const proofUrl = await uploadProof(proofFile);
        await createOrder(selectedMethod, {
          proof_url: proofUrl,
          bank_reference: referenceNumber || undefined,
        });
      } catch (err: any) {
        setError(err.message || "Failed to upload payment receipt");
        setProcessing(false);
        setUploadingProof(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs">
          <p>{error}</p>
        </div>
      )}

      <div className="border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark p-4 sm:p-6 lg:p-8 transition-colors space-y-6">
        {/* Amount to Pay Summary Box */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 sm:p-5 bg-theme-card-light dark:bg-theme-card-dark border border-theme-border-light dark:border-theme-border-dark shadow-2xs">
          <div>
            <span className="text-[11px] sm:text-xs uppercase tracking-[0.2em] font-semibold text-theme-text-secondary-light dark:text-theme-text-secondary-dark block">
              Total Amount to Pay
            </span>
            <span className="text-[10px] sm:text-[11px] text-theme-text-muted-light dark:text-theme-text-muted-dark mt-0.5 block">
              Including taxes and delivery fee
            </span>
          </div>
          <span className="text-xl sm:text-2xl md:text-3xl font-serif text-theme-text-primary-light dark:text-theme-text-primary-dark font-semibold tracking-tight">
            {formatPrice(cart?.total || 0)}
          </span>
        </div>

        {/* Payment Method Selector */}
        <PaymentMethodSelector
          selectedMethod={selectedMethod}
          onMethodChange={(method) => {
            setSelectedMethod(method);
            setError("");
          }}
          orderTotal={cart?.total || 0}
        />

        {/* Selected Method Details Panel */}
        <div className="pt-6 border-t border-theme-border-light dark:border-theme-border-dark">
          {selectedMethod === "cod" && (
            <div className="space-y-5">
              <div className="p-4 sm:p-5 bg-theme-card-light/40 dark:bg-theme-card-dark/30 border border-theme-border-light dark:border-theme-border-dark">
                <div className="flex items-center gap-2 mb-2.5 text-theme-text-primary-light dark:text-theme-text-primary-dark">
                  <Truck className="w-4 h-4 text-theme-hover-light dark:text-theme-hover-dark shrink-0" />
                  <h4 className="font-serif font-medium text-base sm:text-lg">
                    Cash on Delivery Terms
                  </h4>
                </div>
                <ul className="text-xs sm:text-sm text-theme-text-secondary-light dark:text-theme-text-secondary-dark space-y-1.5 pl-4 sm:pl-5 list-disc leading-relaxed">
                  <li>Payment will be collected in cash at your doorstep upon delivery.</li>
                  <li>Please keep the exact amount ({formatPrice(cart?.total || 0)}) ready for the courier.</li>
                  <li>You will receive an order confirmation email with your tracking link immediately.</li>
                </ul>
              </div>

              <button
                type="button"
                onClick={handleSubmitOrder}
                disabled={processing}
                className="w-full py-3.5 sm:py-4 px-6 bg-theme-primary hover:bg-theme-hover-light dark:hover:bg-theme-hover-dark text-theme-btn-text text-xs uppercase tracking-[0.2em] font-medium transition-all disabled:opacity-40 shadow-sm flex items-center justify-center gap-2"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>CONFIRMING ORDER...</span>
                  </>
                ) : (
                  <span>PLACE ORDER WITH CASH ON DELIVERY</span>
                )}
              </button>
            </div>
          )}

          {selectedMethod === "bank_transfer" && (
            <div className="space-y-6">
              <div className="p-4 sm:p-5 bg-theme-card-light/40 dark:bg-theme-card-dark/30 border border-theme-border-light dark:border-theme-border-dark space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-theme-border-light dark:border-theme-border-dark">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-theme-hover-light dark:text-theme-hover-dark shrink-0" />
                    <h4 className="font-serif font-medium text-base sm:text-lg text-theme-text-primary-light dark:text-theme-text-primary-dark">
                      Meezan Bank Details
                    </h4>
                  </div>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-theme-hover-light dark:text-theme-hover-dark font-semibold">
                    OFFICIAL ACCOUNT
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 items-start">
                  <div className="space-y-3">
                    <div className="p-3 bg-theme-surface-light dark:bg-theme-surface-dark border border-theme-border-light dark:border-theme-border-dark flex items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-theme-text-muted-light dark:text-theme-text-muted-dark font-medium block">
                          Recipient Name / Account Title
                        </span>
                        <span className="text-xs sm:text-sm text-theme-text-primary-light dark:text-theme-text-primary-dark font-bold">
                          Talal Ahmad
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard("Talal Ahmad", "bank_title")}
                        className="px-2.5 py-1 text-[10px] sm:text-[11px] uppercase tracking-wider bg-theme-primary text-theme-btn-text hover:bg-theme-hover-light transition-colors flex items-center gap-1 shrink-0"
                      >
                        {copiedField === "bank_title" ? (
                          <>
                            <Check className="w-3 h-3 text-green-400" />
                            <span>COPIED</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>COPY</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="p-3 bg-theme-surface-light dark:bg-theme-surface-dark border border-theme-border-light dark:border-theme-border-dark flex items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-theme-text-muted-light dark:text-theme-text-muted-dark font-medium block">
                          Account Number
                        </span>
                        <span className="text-xs sm:text-sm text-theme-text-primary-light dark:text-theme-text-primary-dark font-bold">
                          00300112798032
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard("00300112798032", "bank_acc")}
                        className="px-2.5 py-1 text-[10px] sm:text-[11px] uppercase tracking-wider bg-theme-primary text-theme-btn-text hover:bg-theme-hover-light transition-colors flex items-center gap-1 shrink-0"
                      >
                        {copiedField === "bank_acc" ? (
                          <>
                            <Check className="w-3 h-3 text-green-400" />
                            <span>COPIED</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>COPY</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="p-3 bg-theme-surface-light dark:bg-theme-surface-dark border border-theme-border-light dark:border-theme-border-dark flex items-center justify-between gap-2">
                      <div className="min-w-0 pr-1">
                        <span className="text-[10px] uppercase tracking-wider text-theme-text-muted-light dark:text-theme-text-muted-dark font-medium block">
                          IBAN
                        </span>
                        <span className="text-[11px] sm:text-xs text-theme-text-primary-light dark:text-theme-text-primary-dark font-bold break-all">
                          PK00300112798032
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard("PK00300112798032", "bank_iban")}
                        className="px-2.5 py-1 text-[10px] sm:text-[11px] uppercase tracking-wider bg-theme-primary text-theme-btn-text hover:bg-theme-hover-light transition-colors flex items-center gap-1 shrink-0"
                      >
                        {copiedField === "bank_iban" ? (
                          <>
                            <Check className="w-3 h-3 text-green-400" />
                            <span>COPIED</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>COPY</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Bank QR Code */}
                  <div className="flex flex-col items-center justify-center p-4 bg-theme-surface-light dark:bg-theme-surface-dark border border-theme-border-light dark:border-theme-border-dark text-center">
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-theme-hover-light dark:text-theme-hover-dark mb-2 uppercase tracking-wider">
                      <QrCode className="w-3.5 h-3.5" />
                      <span>Scan Bank QR Code</span>
                    </div>
                    <div className="relative w-32 h-32 sm:w-36 sm:h-36 border border-theme-border-light dark:border-theme-border-dark p-2 bg-white">
                      <img
                        src="/QR/BankQR.png"
                        alt="Meezan Bank Transfer QR Code"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <span className="text-[10px] text-theme-text-muted-light dark:text-theme-text-muted-dark mt-2">
                      Scan and pay
                    </span>
                  </div>
                </div>
              </div>

              {/* Upload Receipt */}
              {renderProofUploadSection("Meezan Bank")}
            </div>
          )}

          {/* 3. JazzCash */}
          {selectedMethod === "jazzcash" && (
            <div className="space-y-6">
              <div className="p-4 sm:p-5 bg-theme-card-light/40 dark:bg-theme-card-dark/30 border border-theme-border-light dark:border-theme-border-dark space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-theme-border-light dark:border-theme-border-dark">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-theme-hover-light dark:text-theme-hover-dark shrink-0" />
                    <h4 className="font-serif font-medium text-base sm:text-lg text-theme-text-primary-light dark:text-theme-text-primary-dark">
                      JazzCash Mobile Account
                    </h4>
                  </div>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-theme-hover-light dark:text-theme-hover-dark font-semibold">
                    MOBILE WALLET
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 items-start">
                  <div className="space-y-3">
                    <div className="p-3 bg-theme-surface-light dark:bg-theme-surface-dark border border-theme-border-light dark:border-theme-border-dark">
                      <span className="text-[10px] uppercase tracking-wider text-theme-text-muted-light dark:text-theme-text-muted-dark font-medium block">
                        Account Title / Recipient Name
                      </span>
                      <span className="font-bold text-xs sm:text-sm text-theme-text-primary-light dark:text-theme-text-primary-dark">
                        Talal Ahmad
                      </span>
                    </div>

                    <div className="p-3 bg-theme-surface-light dark:bg-theme-surface-dark border border-theme-border-light dark:border-theme-border-dark flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <span className="text-[10px] uppercase tracking-wider text-theme-text-muted-light dark:text-theme-text-muted-dark font-medium block">
                          Mobile Number
                        </span>
                        <span className="text-sm sm:text-base text-theme-text-primary-light dark:text-theme-text-primary-dark font-bold">
                          03130538686
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard("03130538686", "jazz_num")}
                        className="px-2.5 py-1 text-[10px] sm:text-[11px] uppercase tracking-wider bg-theme-primary text-theme-btn-text hover:bg-theme-hover-light transition-colors flex items-center gap-1 shrink-0"
                      >
                        {copiedField === "jazz_num" ? (
                          <>
                            <Check className="w-3 h-3 text-green-400" />
                            <span>COPIED</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>COPY</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="p-3 bg-theme-surface-light dark:bg-theme-surface-dark border border-theme-border-light dark:border-theme-border-dark text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark leading-relaxed">
                      <p className="font-medium mb-1 uppercase tracking-wider text-[10px] text-theme-hover-light dark:text-theme-hover-dark">How to pay:</p>
                      <p>1. Open JazzCash App → <strong>Send Money → JazzCash Account</strong></p>
                      <p>2. Enter: <strong>03130538686</strong> and amount: <strong>{formatPrice(cart?.total || 0)}</strong></p>
                      <p>3. Upload receipt screenshot below.</p>
                    </div>
                  </div>

                  {/* JazzCash QR Code */}
                  <div className="flex flex-col items-center justify-center p-4 bg-theme-surface-light dark:bg-theme-surface-dark border border-theme-border-light dark:border-theme-border-dark text-center">
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-theme-hover-light dark:text-theme-hover-dark mb-2 uppercase tracking-wider">
                      <QrCode className="w-3.5 h-3.5" />
                      <span>Scan JazzCash QR</span>
                    </div>
                    <div className="relative w-32 h-32 sm:w-36 sm:h-36 border border-theme-border-light dark:border-theme-border-dark p-2 bg-white">
                      <img
                        src="/QR/JazzCashQR.png"
                        alt="JazzCash Payment QR Code"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <span className="text-[10px] text-theme-text-muted-light dark:text-theme-text-muted-dark mt-2">
                      Scan and pay
                    </span>
                  </div>
                </div>
              </div>

              {/* Upload Receipt */}
              {renderProofUploadSection("JazzCash")}
            </div>
          )}
        </div>
      </div>

      {/* Back Button */}
      <div className="pt-2 pb-6">
        <button
          type="button"
          onClick={onBack}
          disabled={processing || uploadingProof}
          className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark hover:text-theme-hover-light dark:hover:text-theme-hover-dark transition-colors disabled:opacity-50"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Delivery Details</span>
        </button>
      </div>
    </div>
  );

  function renderProofUploadSection(methodLabel: string) {
    return (
      <div className="space-y-4">
        {/* Upload Box */}
        <div className="p-4 border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-1">
            <label className="block text-xs uppercase tracking-wider font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
              Upload {methodLabel} Receipt *
            </label>
            <span className="text-[10px] uppercase tracking-wider font-medium text-theme-hover-light dark:text-theme-hover-dark">
              Required for verification
            </span>
          </div>

          {proofFile ? (
            <div className="flex items-center justify-between p-3 border border-theme-border-light dark:border-theme-border-dark bg-theme-card-light/40 dark:bg-theme-card-dark/30">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={URL.createObjectURL(proofFile)}
                  alt="Receipt Preview"
                  className="w-12 h-12 object-cover border border-theme-border-light dark:border-theme-border-dark flex-shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark truncate">
                    {proofFile.name}
                  </p>
                  <p className="text-[10px] text-green-600 dark:text-green-400 font-medium">
                    ✓ Attached ({(proofFile.size / 1024).toFixed(1)} KB)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setProofFile(null)}
                className="text-xs uppercase tracking-wider font-semibold text-theme-hover-light dark:text-theme-hover-dark hover:underline"
              >
                Change
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center gap-2 p-5 sm:p-6 border-2 border-dashed border-theme-border-light dark:border-theme-border-dark hover:border-theme-hover-light cursor-pointer bg-theme-bg-light dark:bg-theme-bg-dark transition-all text-center group">
              <Upload className="w-5 h-5 text-theme-hover-light dark:text-theme-hover-dark group-hover:scale-110 transition-transform" />
              <span className="text-xs uppercase tracking-wider font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark">
                Click or drag transaction screenshot
              </span>
              <span className="text-[10px] text-theme-text-muted-light dark:text-theme-text-muted-dark">
                PNG, JPG, or WEBP from your banking app
              </span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setProofFile(e.target.files?.[0] || null)}
              />
            </label>
          )}
        </div>

        {/* Optional Reference ID */}
        <div>
          <label className="block text-xs uppercase tracking-[0.15em] font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1.5">
            Transaction / Reference ID (Optional)
          </label>
          <input
            type="text"
            value={referenceNumber}
            onChange={(e) => setReferenceNumber(e.target.value)}
            placeholder="e.g. 2389148729"
            className="w-full px-3.5 py-2.5 border border-theme-border-light dark:border-theme-border-dark bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark text-xs sm:text-sm focus:outline-none focus:border-theme-hover-light"
          />
        </div>

        {/* Submit Button */}
        <button
          type="button"
          onClick={handleSubmitOrder}
          disabled={processing || uploadingProof || !proofFile}
          className={`w-full py-3.5 sm:py-4 px-6 text-xs uppercase tracking-[0.2em] font-medium transition-all ${
            !proofFile
              ? "bg-theme-border-light dark:bg-theme-border-dark text-theme-text-muted-light dark:text-theme-text-muted-dark cursor-not-allowed opacity-60"
              : "bg-theme-primary hover:bg-theme-hover-light dark:hover:bg-theme-hover-dark text-theme-btn-text shadow-sm"
          }`}
        >
          {processing ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>CREATING ORDER...</span>
            </span>
          ) : uploadingProof ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>UPLOADING RECEIPT...</span>
            </span>
          ) : !proofFile ? (
            `UPLOAD SCREENSHOT ABOVE TO PROCEED`
          ) : (
            `PLACE ORDER VIA ${methodLabel.toUpperCase()}`
          )}
        </button>
      </div>
    );
  }
}
