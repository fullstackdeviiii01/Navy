// // app/components/checkout/PaymentSection.tsx
"use client";

import { useState } from "react";
import { ChevronLeft, Lock, CreditCard } from "lucide-react";
import PaymentMethodSelector from "./PaymentMethodSelector";
import StripePaymentForm from "./StripePaymentForm";
import PayPalPaymentButton from "./PayPalPaymentButton";
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

  const createOrder = async (paymentMethod: string, paymentData?: any) => {
    setProcessing(true);
    setError("");

    try {
      const orderData: any = {
        ...checkoutData,
        payment_method: paymentMethod,
      };

      if (paymentMethod === "stripe" && paymentData?.payment_intent_id) {
        orderData.payment_intent_id = paymentData.payment_intent_id;
      } else if (paymentMethod === "paypal" && paymentData?.paypal_order_id) {
        orderData.paypal_order_id = paymentData.paypal_order_id;
      }

      const result = await checkoutApi.processCheckout(orderData);
      setProcessing(false);
      onSuccess(result.order._id);
    } catch (error: any) {
      console.error("Order creation failed:", error);
      setError(error.message || "Failed to create order");
      setProcessing(false);
    }
  };

  const handleStripeSuccess = async (paymentIntentId: string) => {
    await createOrder("stripe", { payment_intent_id: paymentIntentId });
  };

  const handlePayPalSuccess = async (paypalOrderId: string) => {
    await createOrder("paypal", { paypal_order_id: paypalOrderId });
  };

  const handleCODConfirm = async () => {
    await createOrder("cod");
  };

  const handlePaymentError = (errorMessage: string) => {
    setError(errorMessage);
    setProcessing(false);
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
            {selectedMethod === "stripe" && (
              <StripePaymentForm
                checkoutData={checkoutData}
                amount={cart?.total || 0}
                currency={cart.currency || "USD"}
                onSuccess={handleStripeSuccess}
                onError={handlePaymentError}
              />
            )}

            {selectedMethod === "paypal" && (
              <PayPalPaymentButton
                checkoutData={checkoutData}
                amount={cart.total}
                currency={cart.currency || "USD"}
                onSuccess={handlePayPalSuccess}
                onError={handlePaymentError}
              />
            )}

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
          </div>
        )}
      </div>

      {/* Security Badge */}
      <div className="flex items-center gap-1.5 sm:gap-2 p-3 sm:p-3.5 md:p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
        <Lock
          className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600 dark:text-gray-400 flex-shrink-0"
          aria-hidden="true"
        />
        <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400">
          Your payment information is secure and encrypted
        </p>
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