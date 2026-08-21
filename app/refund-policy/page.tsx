// app/refund-policy/page.tsx
import { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Return & Refund Policy",
  description: "Guidelines on returns, exchanges, and customer satisfaction",
};

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-theme-bg-light dark:bg-theme-bg-dark py-12 sm:py-16 transition-colors">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] mb-8" aria-label="Breadcrumb">
          <Link
            href="/"
            className="text-theme-text-muted-light dark:text-theme-text-muted-dark hover:text-theme-text-primary-light transition-colors"
          >
            HOME
          </Link>
          <ChevronRight className="w-3 h-3 text-theme-text-muted-light" />
          <span className="text-theme-text-primary-light dark:text-theme-text-primary-dark font-medium">
            RETURN & REFUND POLICY
          </span>
        </nav>

        {/* Header */}
        <div className="mb-10 border-b border-theme-border-light dark:border-theme-border-dark pb-8">
          <p className="text-xs font-medium tracking-[0.25em] uppercase text-theme-hover-light dark:text-theme-hover-dark mb-2">
            HASSLE-FREE GUARANTEE
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif text-theme-text-primary-light dark:text-theme-text-primary-dark mb-3">
            Returns <span className="italic font-normal font-serif text-theme-hover-light dark:text-theme-hover-dark">& Refunds</span>
          </h1>
          <p className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark uppercase tracking-wider">
            14-Day Satisfaction Window
          </p>
        </div>

        {/* Refund Content */}
        <div className="border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark p-8 sm:p-10 space-y-8 text-xs sm:text-sm text-theme-text-secondary-light dark:text-theme-text-secondary-dark leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-serif italic text-theme-text-primary-light dark:text-theme-text-primary-dark">
              1. 14-Day Return Window
            </h2>
            <p>
              We want you to be completely enamored with your new handcrafted luminaire. If the piece is not the right fit for your space, you may request a return or exchange within 14 days of receipt in original packaging and condition.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-serif italic text-theme-text-primary-light dark:text-theme-text-primary-dark">
              2. Transit Damage Guarantee
            </h2>
            <p>
              In the rare event that your package sustains courier transit damage, notify us within 48 hours of delivery with photographic evidence. We will dispatch an expedited replacement free of charge.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-serif italic text-theme-text-primary-light dark:text-theme-text-primary-dark">
              3. Refund Processing
            </h2>
            <p>
              Approved returns are processed back to your original payment method (Bank Transfer / JazzCash / Store credit) within 3-5 business days following physical receipt and atelier inspection.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
