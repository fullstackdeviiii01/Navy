// app/terms-and-conditions/page.tsx
import { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms and Conditions",
  description: "Terms and conditions of service",
};

export default function TermsConditionsPage() {
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
            TERMS & CONDITIONS
          </span>
        </nav>

        {/* Header */}
        <div className="mb-10 border-b border-theme-border-light dark:border-theme-border-dark pb-8">
          <p className="text-xs font-medium tracking-[0.25em] uppercase text-theme-hover-light dark:text-theme-hover-dark mb-2">
            LEGAL AGREEMENT
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif text-theme-text-primary-light dark:text-theme-text-primary-dark mb-3">
            Terms <span className="italic font-normal font-serif text-theme-hover-light dark:text-theme-hover-dark">& Conditions</span>
          </h1>
          <p className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark uppercase tracking-wider">
            Effective Date: January 2026
          </p>
        </div>

        {/* Terms Content */}
        <div className="border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark p-8 sm:p-10 space-y-8 text-xs sm:text-sm text-theme-text-secondary-light dark:text-theme-text-secondary-dark leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-serif italic text-theme-text-primary-light dark:text-theme-text-primary-dark">
              1. Handcrafted Variations
            </h2>
            <p>
              Each lighting piece and furniture artifact is individually crafted from natural hardwoods, brass, and artisanal ceramics. Due to the organic nature of natural timber, minor variations in wood grain, figure, and natural coloration are inherent hallmarks of artisanal craftsmanship and not defects.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-serif italic text-theme-text-primary-light dark:text-theme-text-primary-dark">
              2. Orders & Production
            </h2>
            <p>
              Orders placed online are confirmed upon verification of transaction details. Because our pieces are finished on demand, estimated dispatch schedules are provided at checkout and in your order confirmation dispatch note.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-serif italic text-theme-text-primary-light dark:text-theme-text-primary-dark">
              3. Electrical Safety & Warranty
            </h2>
            <p>
              All electrical fixtures are built using CE-certified and certified wiring components. Our luminaires carry a lifetime structural warranty on hand-turned solid timber and a 2-year warranty on internal electrical components.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-serif italic text-theme-text-primary-light dark:text-theme-text-primary-dark">
              4. Governing Law
            </h2>
            <p>
              These Terms & Conditions are governed in accordance with the laws of Pakistan. Inquiries and legal notices can be sent to our customer care team via the <Link href="/contact" className="text-theme-hover-light dark:text-theme-hover-dark underline">Contact page</Link>.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
