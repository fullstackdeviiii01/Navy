// app/payment/success/page.tsx
"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Loader2 } from "lucide-react";

function PaymentSuccessContent() {
  const router = useRouter();
  const [processing, setProcessing] = useState(true);

  useEffect(() => {
    setProcessing(false);
    setTimeout(() => router.push("/account?tab=orders"), 3000);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full mb-6">
          {processing ? (
            <Loader2 size={48} className="text-green-600 dark:text-green-400 animate-spin" />
          ) : (
            <CheckCircle size={48} className="text-green-600 dark:text-green-400" />
          )}
        </div>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
          Order Confirmed!
        </h1>

        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {processing
            ? "Processing your order..."
            : "Your order has been confirmed. Check your email for details."}
        </p>

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