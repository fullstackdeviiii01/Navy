// app/payment/cancelled/page.tsx - NO CHANGES NEEDED
"use client";

import { XCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function PaymentCancelledPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full text-center">
        {/* Cancel Icon */}
        <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-100 dark:bg-yellow-900 rounded-full mb-6">
          <XCircle size={48} className="text-yellow-600 dark:text-yellow-400" />
        </div>

        {/* Cancel Message */}
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
          Payment Cancelled
        </h1>
        
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Your payment was cancelled. No charges were made to your account.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/checkout"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
          >
            <ArrowLeft size={18} />
            Return to Checkout
          </Link>
          <Link
            href="/cart"
            className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            View Cart
          </Link>
        </div>
      </div>
    </div>
  );
}