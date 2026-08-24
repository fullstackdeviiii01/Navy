// app/components/cart/EmptyCart.tsx
"use client";

import Link from "next/link";
import { Package, ChevronsRight } from "lucide-react";

export default function EmptyCart() {
  return (
    <div className="border border-dashed border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark p-12 sm:p-16 text-center space-y-6">
      <div className="inline-flex items-center justify-center w-16 h-16 border border-theme-border-light dark:border-theme-border-dark bg-theme-card-light/50 dark:bg-theme-card-dark/30 text-theme-hover-light dark:text-theme-hover-dark">
        <Package className="w-8 h-8" strokeWidth={1.5} />
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium tracking-[0.25em] uppercase text-theme-hover-light dark:text-theme-hover-dark">
          BAG IS EMPTY
        </p>
        <h2 className="text-2xl sm:text-3xl font-serif italic text-theme-text-primary-light dark:text-theme-text-primary-dark">
          Your cart contains no pieces
        </h2>
        <p className="text-xs sm:text-sm text-theme-text-secondary-light dark:text-theme-text-secondary-dark max-w-md mx-auto leading-relaxed">
          Discover our handcrafted luminaires, solid wood table lamps, and architectural lighting fixtures.
        </p>
      </div>

      <div className="pt-2">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-8 py-4 bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 text-white dark:text-neutral-900 text-xs uppercase tracking-[0.2em] font-medium transition-all shadow-sm group"
        >
          <span>CONTINUE EXPLORING</span>
          <ChevronsRight className="w-4 h-4 text-white dark:text-neutral-900 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );
}