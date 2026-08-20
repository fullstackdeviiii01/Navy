// app/payment/success/page.tsx - UPDATED FOR NEW FLOW
"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import { checkoutApi } from "../../../lib/api/checkout";

const FAILED_STATUSES = ["failed", "requires_payment_method", "requires_action"];

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [processing, setProcessing] = useState(true);
  const [paymentFailed, setPaymentFailed] = useState(false);

  const redirect_status = searchParams.get("redirect_status");
  const payment_intent = searchParams.get("payment_intent");

  useEffect(() => {
    if (redirect_status && FAILED_STATUSES.includes(redirect_status)) {
      setPaymentFailed(true);
      setProcessing(false);
      setTimeout(() => router.push("/checkout?payment=failed"), 3000);
      return;
    }

    if (redirect_status === "succeeded" && payment_intent) {
      const saved = sessionStorage.getItem("stripe_pending_checkout");
      if (saved) {
        sessionStorage.removeItem("stripe_pending_checkout");
        try {
          const checkoutData = JSON.parse(saved);
          checkoutApi
            .processCheckout({ ...checkoutData, payment_intent_id: payment_intent })
            .catch(() => {})
            .finally(() => {
              setProcessing(false);
              setTimeout(() => router.push("/account?tab=orders"), 3000);
            });
          return;
        } catch {}
      }
    }

    setProcessing(false);
    setTimeout(() => router.push("/account?tab=orders"), 3000);
  }, [redirect_status, payment_intent]);

  if (paymentFailed) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 dark:bg-red-900 rounded-full mb-6">
            <XCircle size={48} className="text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">Payment Failed</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Your payment could not be processed. You will be redirected back to checkout.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Redirecting to checkout...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full text-center">
        {/* Success Icon */}
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full mb-6">
          {processing ? (
            <Loader2 size={48} className="text-green-600 dark:text-green-400 animate-spin" />
          ) : (
            <CheckCircle size={48} className="text-green-600 dark:text-green-400" />
          )}
        </div>

        {/* Success Message */}
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
          Payment Successful!
        </h1>
        
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {processing 
            ? "Processing your order..." 
            : "Your order has been confirmed. Check your email for details."}
        </p>

        {redirect_status === "succeeded" && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
            <p className="text-sm text-green-800 dark:text-green-200">
              ✓ Payment verified successfully
            </p>
          </div>
        )}

        {/* Countdown */}
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Redirecting to your orders...
        </p>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}