// app/components/cart/EmptyCart.tsx
"use client";

import { useRouter } from "next/navigation";
import { Package, ArrowRight } from "lucide-react";

export default function EmptyCart() {
  const router = useRouter();

  return (
    <div className="min-h-[70vh] bg-theme-bg-light dark:bg-theme-bg-dark flex items-center justify-center py-16 px-4">
      <div className="text-center max-w-md w-full border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark p-8 sm:p-12">
        <p className="text-xs font-medium tracking-[0.25em] uppercase text-theme-hover-light dark:text-theme-hover-dark mb-3">
          YOUR BASKET
        </p>

        <h1 className="text-3xl sm:text-4xl font-serif italic text-theme-text-primary-light dark:text-theme-text-primary-dark mb-4">
          Your basket is empty
        </h1>

        <p className="text-sm text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-8 leading-relaxed">
          Discover our handcrafted, heirloom-quality solid timber lighting and candlelight pieces.
        </p>

        <button
          onClick={() => router.push("/products")}
          className="inline-flex items-center gap-3 px-8 py-4 bg-theme-primary hover:bg-theme-hover-light dark:hover:bg-theme-hover-dark text-theme-btn-text text-xs font-medium tracking-[0.2em] uppercase transition-all duration-300 group"
        >
          <span>EXPLORE THE COLLECTION</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
}