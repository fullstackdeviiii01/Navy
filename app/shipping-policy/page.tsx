// app/shipping-policy/page.tsx
import { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Shipping Policy",
  description: "Handcrafted delivery and courier shipping guidelines",
};

export default function ShippingPolicyPage() {
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
            SHIPPING POLICY
          </span>
        </nav>

        {/* Header */}
        <div className="mb-10 border-b border-theme-border-light dark:border-theme-border-dark pb-8">
          <p className="text-xs font-medium tracking-[0.25em] uppercase text-theme-hover-light dark:text-theme-hover-dark mb-2">
            DELIVERY & FULFILLMENT
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif text-theme-text-primary-light dark:text-theme-text-primary-dark mb-3">
            Shipping <span className="italic font-normal font-serif text-theme-hover-light dark:text-theme-hover-dark">Policy</span>
          </h1>
          <p className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark uppercase tracking-wider">
            Insured Transit Across Pakistan & Beyond
          </p>
        </div>

        {/* Shipping Content */}
        <div className="border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark p-8 sm:p-10 space-y-8 text-xs sm:text-sm text-theme-text-secondary-light dark:text-theme-text-secondary-dark leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-serif italic text-theme-text-primary-light dark:text-theme-text-primary-dark">
              1. Packaging & Protective Crating
            </h2>
            <p>
              Every luminaire is individually nestled in custom-molded shock-absorbent cushioning and reinforced corrugated boxing to prevent any transit scuffs or impact during transport.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-serif italic text-theme-text-primary-light dark:text-theme-text-primary-dark">
              2. Transit Times & Fees
            </h2>
            <p>
              Standard courier delivery takes 3-5 business days from dispatch. Express air transit takes 1-2 business days. Orders above our promotional threshold qualify for complimentary insured standard delivery.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-serif italic text-theme-text-primary-light dark:text-theme-text-primary-dark">
              3. Order Tracking
            </h2>
            <p>
              As soon as your shipment is dispatched, you will receive a tracking link via email and SMS. You can also monitor real-time progress anytime via our <Link href="/track-order" className="text-theme-hover-light dark:text-theme-hover-dark underline">Track Order Portal</Link>.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
