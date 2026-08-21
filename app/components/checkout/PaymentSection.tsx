// app/components/checkout/PaymentSection.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import {
  ChevronLeft,
  CreditCard,
  Upload,
  Building2,
  Phone,
  Copy,
  Check,
  QrCode,
  Truck,
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
          `Payment screenshot / receipt is mandatory for ${
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

  const selectedMethodObj = STATIC_PAYMENT_METHODS.find(
    (m) => m.id === selectedMethod
  );

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-4 bg-red-100/80 dark:bg-red-950/60 border border-red-300 dark:border-red-800 rounded-xl">
          <p className="text-xs sm:text-sm text-red-800 dark:text-red-200 leading-relaxed font-medium">
            {error}
          </p>
        </div>
      )}

      <div className="bg-theme-surface-light dark:bg-theme-surface-dark border border-theme-border-light dark:border-theme-border-dark rounded-2xl p-4 sm:p-6 shadow-sm">
        {/* Amount to Pay */}
        <div className="flex items-center justify-between p-4 bg-[#E9DFCE] dark:bg-[#48381A] border border-theme-border-light dark:border-theme-border-dark rounded-xl mb-6">
          <div>
            <span className="text-xs uppercase font-semibold tracking-wider text-theme-text-secondary-light dark:text-theme-text-secondary-dark block">
              Total Amount to Pay
            </span>
            <span className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark">
              Including taxes and shipping
            </span>
          </div>
          <span className="text-2xl sm:text-3xl font-bold text-[#A8752B]">
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
        <div className="mt-6 pt-6 border-t border-theme-border-light dark:border-theme-border-dark">
          {/* 1. Cash On Delivery */}
          {selectedMethod === "cod" && (
            <div className="space-y-5">
              <div className="p-4 sm:p-5 bg-[#E9DFCE]/60 dark:bg-[#48381A]/60 border border-theme-border-light dark:border-theme-border-dark rounded-xl">
                <div className="flex items-center gap-2.5 mb-2 text-[#241910] dark:text-[#F3EBDC]">
                  <Truck className="w-5 h-5 text-[#A8752B]" />
                  <h4 className="font-serif font-medium text-base sm:text-lg">
                    Cash on Delivery Details
                  </h4>
                </div>
                <ul className="text-xs sm:text-sm text-theme-text-secondary-light dark:text-theme-text-secondary-dark space-y-1.5 pl-6 list-disc">
                  <li>Payment will be collected in cash at your doorstep upon delivery.</li>
                  <li>Please keep the exact amount ({formatPrice(cart?.total || 0)}) ready for the courier.</li>
                  <li>You will receive an order confirmation email and tracking link immediately.</li>
                </ul>
              </div>

              <button
                type="button"
                onClick={handleSubmitOrder}
                disabled={processing}
                className="w-full py-4 px-6 bg-[#241910] hover:bg-[#A8752B] text-white text-xs sm:text-sm font-semibold tracking-[0.2em] uppercase rounded-xl transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 active:scale-[0.99]"
              >
                {processing ? "Confirming Order..." : "Confirm Cash on Delivery Order"}
              </button>
            </div>
          )}

          {/* 2. Direct Bank Transfer (Meezan Bank) */}
          {selectedMethod === "bank_transfer" && (
            <div className="space-y-5">
              <div className="p-4 sm:p-6 bg-[#E9DFCE]/60 dark:bg-[#48381A]/60 border border-theme-border-light dark:border-theme-border-dark rounded-xl space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-theme-border-light dark:border-theme-border-dark">
                  <div className="flex items-center gap-2.5">
                    <Building2 className="w-5 h-5 text-[#A8752B]" />
                    <h4 className="font-serif font-medium text-base sm:text-lg text-theme-text-primary-light dark:text-theme-text-primary-dark">
                      Meezan Bank Account Information
                    </h4>
                  </div>
                  <span className="text-xs uppercase font-semibold text-[#A8752B] tracking-wider">
                    Official Account
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
                  {/* Account Text Credentials */}
                  <div className="space-y-3">
                    <div className="p-3 bg-white dark:bg-[#342611] rounded-xl border border-theme-border-light dark:border-theme-border-dark">
                      <span className="text-[11px] uppercase tracking-wider text-[#A8752B] font-semibold block">
                        Bank Name
                      </span>
                      <span className="font-semibold text-sm sm:text-base text-theme-text-primary-light dark:text-theme-text-primary-dark">
                        Meezan Bank
                      </span>
                    </div>

                    <div className="p-3 bg-white dark:bg-[#342611] rounded-xl border border-theme-border-light dark:border-theme-border-dark">
                      <span className="text-[11px] uppercase tracking-wider text-[#A8752B] font-semibold block">
                        Account Title / Recipient Name
                      </span>
                      <span className="font-semibold text-sm sm:text-base text-theme-text-primary-light dark:text-theme-text-primary-dark">
                        Rehan Ahmad
                      </span>
                    </div>

                    <div className="p-3 bg-white dark:bg-[#342611] rounded-xl border border-theme-border-light dark:border-theme-border-dark flex items-center justify-between">
                      <div>
                        <span className="text-[11px] uppercase tracking-wider text-[#A8752B] font-semibold block">
                          Account Number
                        </span>
                        <span className="font-bold text-sm sm:text-base text-theme-text-primary-light dark:text-theme-text-primary-dark tracking-wider">
                          00300112798032
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard("00300112798032", "bank_acc")}
                        className="px-3 py-1.5 text-xs bg-[#241910] hover:bg-[#A8752B] text-white rounded-lg font-medium transition-colors flex items-center gap-1.5"
                      >
                        {copiedField === "bank_acc" ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-green-400" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="p-3 bg-white dark:bg-[#342611] rounded-xl border border-theme-border-light dark:border-theme-border-dark flex items-center justify-between">
                      <div className="min-w-0 pr-2">
                        <span className="text-[11px] uppercase tracking-wider text-[#A8752B] font-semibold block">
                          IBAN
                        </span>
                        <span className="font-bold text-xs sm:text-sm text-theme-text-primary-light dark:text-theme-text-primary-dark tracking-wider break-all">
                          PK00300112798032
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard("PK00300112798032", "bank_iban")}
                        className="px-3 py-1.5 text-xs bg-[#241910] hover:bg-[#A8752B] text-white rounded-lg font-medium transition-colors flex items-center gap-1.5 flex-shrink-0"
                      >
                        {copiedField === "bank_iban" ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-green-400" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Bank QR Code */}
                  <div className="flex flex-col items-center justify-center p-4 bg-white dark:bg-[#342611] rounded-xl border border-theme-border-light dark:border-theme-border-dark text-center">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-[#A8752B] mb-2 uppercase tracking-wider">
                      <QrCode className="w-4 h-4" />
                      <span>Scan Bank QR Code</span>
                    </div>
                    <div className="relative w-44 h-44 sm:w-48 sm:h-48 border border-theme-border-light dark:border-theme-border-dark rounded-lg overflow-hidden p-2 bg-white">
                      <img
                        src="/QR/BankQR.png"
                        alt="Meezan Bank Transfer QR Code"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <span className="text-[11px] text-theme-text-muted-light dark:text-theme-text-muted-dark mt-2">
                      Scan with any 1Link / Raast supported banking app
                    </span>
                  </div>
                </div>
              </div>

              {/* Upload Receipt Section */}
              {renderProofUploadSection("Meezan Bank")}
            </div>
          )}

          {/* 3. JazzCash */}
          {selectedMethod === "jazzcash" && (
            <div className="space-y-5">
              <div className="p-4 sm:p-6 bg-[#E9DFCE]/60 dark:bg-[#48381A]/60 border border-theme-border-light dark:border-theme-border-dark rounded-xl space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-theme-border-light dark:border-theme-border-dark">
                  <div className="flex items-center gap-2.5">
                    <Phone className="w-5 h-5 text-[#A8752B]" />
                    <h4 className="font-serif font-medium text-base sm:text-lg text-theme-text-primary-light dark:text-theme-text-primary-dark">
                      JazzCash Account Information
                    </h4>
                  </div>
                  <span className="text-xs uppercase font-semibold text-[#A8752B] tracking-wider">
                    Mobile Wallet
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
                  {/* Account Text Credentials */}
                  <div className="space-y-3">
                    <div className="p-3 bg-white dark:bg-[#342611] rounded-xl border border-theme-border-light dark:border-theme-border-dark">
                      <span className="text-[11px] uppercase tracking-wider text-[#A8752B] font-semibold block">
                        Account Title / Recipient Name
                      </span>
                      <span className="font-semibold text-sm sm:text-base text-theme-text-primary-light dark:text-theme-text-primary-dark">
                        Rehan Ahmad
                      </span>
                    </div>

                    <div className="p-3 bg-white dark:bg-[#342611] rounded-xl border border-theme-border-light dark:border-theme-border-dark flex items-center justify-between">
                      <div>
                        <span className="text-[11px] uppercase tracking-wider text-[#A8752B] font-semibold block">
                          JazzCash Mobile Number
                        </span>
                        <span className="font-bold text-base sm:text-lg text-theme-text-primary-light dark:text-theme-text-primary-dark tracking-wider">
                          03130538686
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard("03130538686", "jazz_num")}
                        className="px-3 py-1.5 text-xs bg-[#241910] hover:bg-[#A8752B] text-white rounded-lg font-medium transition-colors flex items-center gap-1.5"
                      >
                        {copiedField === "jazz_num" ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-green-400" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
                      <p className="font-semibold mb-1">How to pay via JazzCash:</p>
                      <p>1. Open your JazzCash app and select <strong>Send Money → To JazzCash Account</strong></p>
                      <p>2. Enter mobile number: <strong>03130538686</strong> and amount: <strong>{formatPrice(cart?.total || 0)}</strong></p>
                      <p>3. Take a screenshot of the confirmation and upload below.</p>
                    </div>
                  </div>

                  {/* JazzCash QR Code */}
                  <div className="flex flex-col items-center justify-center p-4 bg-white dark:bg-[#342611] rounded-xl border border-theme-border-light dark:border-theme-border-dark text-center">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-[#A8752B] mb-2 uppercase tracking-wider">
                      <QrCode className="w-4 h-4" />
                      <span>Scan JazzCash QR Code</span>
                    </div>
                    <div className="relative w-44 h-44 sm:w-48 sm:h-48 border border-theme-border-light dark:border-theme-border-dark rounded-lg overflow-hidden p-2 bg-white">
                      <img
                        src="/QR/JazzCashQR.png"
                        alt="JazzCash Payment QR Code"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <span className="text-[11px] text-theme-text-muted-light dark:text-theme-text-muted-dark mt-2">
                      Scan directly inside your JazzCash App
                    </span>
                  </div>
                </div>
              </div>

              {/* Upload Receipt Section */}
              {renderProofUploadSection("JazzCash")}
            </div>
          )}
        </div>
      </div>

      {/* Back Button */}
      <button
        type="button"
        onClick={onBack}
        disabled={processing || uploadingProof}
        className="flex items-center gap-2 px-4 py-2.5 text-xs uppercase tracking-widest font-semibold text-theme-text-secondary-light dark:text-theme-text-secondary-dark hover:text-theme-text-primary-light dark:hover:text-theme-text-primary-dark transition-colors disabled:opacity-50"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Back to Shipping Details</span>
      </button>
    </div>
  );

  function renderProofUploadSection(methodLabel: string) {
    return (
      <div className="space-y-4">
        {/* Upload Box */}
        <div
          className={`p-4 bg-theme-surface-light dark:bg-theme-surface-dark border ${
            !proofFile
              ? "border-amber-300 dark:border-amber-700"
              : "border-green-400 dark:border-green-600"
          } rounded-2xl space-y-3`}
        >
          <div className="flex items-center justify-between">
            <label className="block text-xs sm:text-sm font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
              Upload {methodLabel} Receipt / Screenshot <span className="text-red-500">*</span>
            </label>
            <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-300">
              Mandatory to verify order
            </span>
          </div>

          {proofFile ? (
            <div className="flex items-center justify-between p-3 bg-white dark:bg-[#342611] rounded-xl border border-theme-border-light dark:border-theme-border-dark">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={URL.createObjectURL(proofFile)}
                  alt="Receipt Preview"
                  className="w-14 h-14 object-cover rounded-lg border border-theme-border-light dark:border-theme-border-dark flex-shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark truncate">
                    {proofFile.name}
                  </p>
                  <p className="text-[11px] text-green-600 dark:text-green-400 font-medium mt-0.5">
                    ✓ Attached ({(proofFile.size / 1024).toFixed(1)} KB)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setProofFile(null)}
                className="px-3 py-1.5 text-xs text-red-600 hover:text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg font-medium transition-colors"
              >
                Change
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-theme-border-light dark:border-theme-border-dark hover:border-[#A8752B] rounded-xl cursor-pointer bg-white dark:bg-[#342611] transition-all text-center group">
              <Upload className="w-6 h-6 text-[#A8752B] group-hover:scale-110 transition-transform" />
              <span className="text-xs sm:text-sm font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                Click or drag to upload transaction screenshot
              </span>
              <span className="text-[11px] text-theme-text-muted-light dark:text-theme-text-muted-dark">
                Supports PNG, JPG, WEBP from your banking app or JazzCash receipt
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
          <label className="block text-xs font-semibold tracking-wider uppercase text-theme-text-primary-light dark:text-theme-text-primary-dark mb-1.5">
            Transaction ID / TID (optional)
          </label>
          <input
            type="text"
            value={referenceNumber}
            onChange={(e) => setReferenceNumber(e.target.value)}
            placeholder="e.g. 2389148729 or Reference ID"
            className="w-full px-4 py-3 rounded-xl border border-theme-border-light dark:border-theme-border-dark bg-white dark:bg-[#342611] text-theme-text-primary-light dark:text-theme-text-primary-dark text-sm focus:outline-none focus:ring-2 focus:ring-[#A8752B]"
          />
        </div>

        {/* Submit Order Button */}
        <button
          type="button"
          onClick={handleSubmitOrder}
          disabled={processing || uploadingProof || !proofFile}
          className={`w-full py-4 px-6 rounded-xl text-xs sm:text-sm font-semibold tracking-[0.2em] uppercase transition-all duration-300 shadow-md ${
            !proofFile
              ? "bg-gray-400 dark:bg-gray-700 text-gray-200 dark:text-gray-400 cursor-not-allowed opacity-70"
              : "bg-[#241910] hover:bg-[#A8752B] text-white hover:shadow-lg active:scale-[0.99]"
          }`}
        >
          {processing
            ? "Creating Order..."
            : uploadingProof
            ? "Uploading Payment Receipt..."
            : !proofFile
            ? `Upload Screenshot Above to Place Order`
            : `Place Order via ${methodLabel}`}
        </button>
      </div>
    );
  }
}
