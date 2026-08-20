// app/components/checkout/PaymentSection.tsx
"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, CreditCard, Upload, Building2 } from "lucide-react";
import PaymentMethodSelector from "./PaymentMethodSelector";
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
  const [selectedMethod, setSelectedMethod] = useState("");
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);
  const [bankGateway, setBankGateway] = useState<any>(null);

  const [proofFile, setProofFile] = useState<File | null>(null);
  const [bankReference, setBankReference] = useState("");
  const [uploadingProof, setUploadingProof] = useState(false);

  useEffect(() => {
    if (selectedMethod === "bank_transfer") {
      fetchBankGateway();
    }
  }, [selectedMethod]);

  const fetchBankGateway = async () => {
    try {
      const res = await fetch("/api/payment/gateways/active");
      const data = await res.json();
      const bt = data.gateways?.find((g: any) => g.name === "bank_transfer");
      if (bt) setBankGateway(bt);
    } catch (err) {
      console.error("Failed to fetch bank gateway:", err);
    }
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

  const handleCODConfirm = async () => {
    await createOrder("cod");
  };

  const handleBankTransferConfirm = async () => {
    if (proofFile) {
      setUploadingProof(true);
      try {
        const proofUrl = await uploadProof(proofFile);
        await createOrder("bank_transfer", {
          proof_url: proofUrl,
          bank_reference: bankReference || undefined,
        });
      } catch (err: any) {
        setError(err.message || "Failed to upload payment proof");
        setProcessing(false);
        setUploadingProof(false);
      }
    } else {
      await createOrder("bank_transfer", {
        bank_reference: bankReference || undefined,
      });
    }
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {error && (
        <div className="p-3 sm:p-3.5 md:p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-xs sm:text-sm text-red-800 dark:text-red-200 leading-relaxed">
            {error}
          </p>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 sm:p-5 md:p-6">
        {/* Amount to Pay */}
        <div className="flex items-center justify-between p-3 sm:p-3.5 md:p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg mb-4 sm:mb-5 md:mb-6 gap-2">
          <div>
            <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white block">
              Amount to Pay
            </span>
          </div>
          <span className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
            {formatPrice(cart?.total || 0)}
          </span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 mb-4 sm:mb-5">
          <CreditCard
            className="w-4 h-4 sm:w-5 sm:h-5 text-gray-900 dark:text-white"
            aria-hidden="true"
          />
          <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
            Payment Method
          </h3>
        </div>

        <PaymentMethodSelector
          selectedMethod={selectedMethod}
          onMethodChange={setSelectedMethod}
          orderTotal={cart?.total || 0}
        />

        {selectedMethod && (
          <div className="mt-4 sm:mt-5 md:mt-6">
            {/* COD Panel */}
            {selectedMethod === "cod" && (
              <div className="space-y-3 sm:space-y-4">
                <div className="p-3 sm:p-3.5 md:p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <h4 className="font-semibold text-green-900 dark:text-green-100 mb-1.5 sm:mb-2 text-sm sm:text-base">
                    Cash on Delivery Instructions
                  </h4>
                  <ul className="text-xs sm:text-sm text-green-800 dark:text-green-200 space-y-0.5 sm:space-y-1">
                    <li>• Payment will be collected at the time of delivery</li>
                    <li>• Please keep the exact amount ready</li>
                    <li>
                      • Our delivery partner will provide you with a receipt
                    </li>
                  </ul>
                </div>

                <button
                  onClick={handleCODConfirm}
                  disabled={processing}
                  className="w-full px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 bg-green-600 hover:bg-green-700 text-white text-sm sm:text-base font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                >
                  {processing ? "Creating Order..." : "Confirm Order"}
                </button>
              </div>
            )}

            {/* Bank Transfer Panel */}
            {selectedMethod === "bank_transfer" && (
              <div className="space-y-3 sm:space-y-4">
                {/* Bank Details */}
                {bankGateway && (
                  <div className="p-3 sm:p-3.5 md:p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                      <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-700 dark:text-blue-300" />
                      <h4 className="font-semibold text-blue-900 dark:text-blue-100 text-sm sm:text-base">
                        Bank Transfer Details
                      </h4>
                    </div>
                    <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-blue-800 dark:text-blue-200">
                      {bankGateway.credentials?.bank_name && (
                        <p><span className="font-medium">Bank:</span> {bankGateway.credentials.bank_name}</p>
                      )}
                      {bankGateway.credentials?.bank_account_name && (
                        <p><span className="font-medium">Account Name:</span> {bankGateway.credentials.bank_account_name}</p>
                      )}
                      {bankGateway.credentials?.bank_account_number && (
                        <p><span className="font-medium">Account Number:</span> {bankGateway.credentials.bank_account_number}</p>
                      )}
                      {bankGateway.credentials?.bank_iban && (
                        <p><span className="font-medium">IBAN:</span> {bankGateway.credentials.bank_iban}</p>
                      )}
                    </div>

                    {/* QR Code */}
                    {bankGateway.qr_code_image && (
                      <div className="mt-3 sm:mt-4">
                        <img
                          src={bankGateway.qr_code_image}
                          alt="Bank QR Code"
                          className="w-32 h-32 sm:w-40 sm:h-40 object-contain rounded-lg border border-blue-200 dark:border-blue-700"
                        />
                      </div>
                    )}

                    {/* Instructions */}
                    {bankGateway.settings?.instructions && (
                      <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-blue-700 dark:text-blue-300 whitespace-pre-line">
                        {bankGateway.settings.instructions}
                      </p>
                    )}
                  </div>
                )}

                {/* Payment Proof Upload */}
                <div className="p-3 sm:p-3.5 md:p-4 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
                    Payment Screenshot (optional)
                  </label>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <label className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                      <Upload className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 dark:text-gray-400" />
                      <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                        {proofFile ? proofFile.name : "Choose file"}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                      />
                    </label>
                    {proofFile && (
                      <button
                        type="button"
                        onClick={() => setProofFile(null)}
                        className="text-xs sm:text-sm text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>

                {/* Bank Reference */}
                <div className="p-3 sm:p-3.5 md:p-4 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
                    Bank Reference Number (optional)
                  </label>
                  <input
                    type="text"
                    value={bankReference}
                    onChange={(e) => setBankReference(e.target.value)}
                    placeholder="Enter transaction/reference number"
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <button
                  onClick={handleBankTransferConfirm}
                  disabled={processing || uploadingProof}
                  className="w-full px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                >
                  {processing
                    ? "Creating Order..."
                    : uploadingProof
                      ? "Uploading Proof..."
                      : "Place Order"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Back Button */}
      <button
        type="button"
        aria-label="Go back to order details"
        onClick={onBack}
        disabled={processing}
        className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors disabled:opacity-50 active:scale-95"
      >
        <ChevronLeft className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
        <span className="text-xs sm:text-sm font-medium">
          Back to Order Details
        </span>
      </button>
    </div>
  );
}
