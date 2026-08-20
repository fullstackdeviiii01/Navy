// app/components/cart/EmptyCart.tsx - PROFESSIONAL DESIGN
"use client";

import { useRouter } from "next/navigation";
import { ShoppingCart, Package } from "lucide-react";

export default function EmptyCart() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-theme-bg-light dark:bg-theme-bg-dark flex items-center justify-center py-8 sm:py-12 md:py-16 px-4">
      <div className="text-center max-w-md w-full">
        <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gray-100 dark:bg-gray-800 rounded-full mb-4 sm:mb-5 md:mb-6">
          <ShoppingCart className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-theme-text-muted-light dark:text-theme-text-muted-dark" aria-hidden="true"/>
        </div>

        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark mb-2 sm:mb-3">
          Your Cart is Empty
        </h1>

        <p className="text-xs sm:text-sm md:text-base text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-5 sm:mb-6 md:mb-8 px-4">
          Start shopping to fill it up with amazing products!
        </p>

        <button
          onClick={() => router.push("/")}
          className="inline-flex items-center gap-1.5 sm:gap-2 px-5 sm:px-6 md:px-8 py-2 sm:py-2.5 md:py-3 bg-theme-primary text-white text-xs sm:text-sm md:text-base font-semibold rounded-lg hover:bg-theme-primary-hover transition-colors"
        >
          <Package className="w-4 h-4 sm:w-5 sm:h-5" />
          Start Shopping
        </button>
      </div>
    </div>
  );
}