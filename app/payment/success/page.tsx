// app/payment/success/page.tsx
"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import Loader from "../../components/shared/Loader";

function PaymentSuccessContent() {
  const router = useRouter();
  const [processing, setProcessing] = useState(true);

  useEffect(() => {
    setProcessing(false);
    const timer = setTimeout(() => router.push("/account?tab=orders"), 3000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-theme-bg-light dark:bg-theme-bg-dark flex items-center justify-center py-12 px-4 transition-colors">
      <div className="max-w-md w-full text-center border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark p-8 sm:p-10 shadow-sm">
        {processing ? (
          <Loader size="lg" text="FINALIZING ORDER..." />
        ) : (
          <>
            <div className="inline-flex items-center justify-center w-14 h-14 bg-green-500/10 border border-green-500/30 text-green-700 dark:text-green-300 mb-6" aria-hidden="true">
              <Check className="w-6 h-6" />
            </div>

            <p className="text-xs font-medium tracking-[0.25em] uppercase text-theme-hover-light dark:text-theme-hover-dark mb-2">
              PAYMENT RECEIVED
            </p>
            <h1 className="text-3xl font-serif font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark tracking-tight mb-3">
              Order Confirmed
            </h1>

            <p className="text-xs sm:text-sm text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-6 leading-relaxed">
              Your order has been confirmed and queued for preparation.
            </p>

            <p className="text-[11px] uppercase tracking-wider text-theme-text-muted-light dark:text-theme-text-muted-dark">
              Redirecting to your orders dashboard...
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<Loader fullScreen text="LOADING..." />}>
      <PaymentSuccessContent />
    </Suspense>
  );
}