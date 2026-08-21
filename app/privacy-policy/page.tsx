// app/privacy-policy/page.tsx
import { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy and data protection guidelines",
};

export default function PrivacyPolicyPage() {
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
            PRIVACY POLICY
          </span>
        </nav>

        {/* Header */}
        <div className="mb-10 border-b border-theme-border-light dark:border-theme-border-dark pb-8">
          <p className="text-xs font-medium tracking-[0.25em] uppercase text-theme-hover-light dark:text-theme-hover-dark mb-2">
            LEGAL & PRIVACY
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif text-theme-text-primary-light dark:text-theme-text-primary-dark mb-3">
            Privacy <span className="italic font-normal font-serif text-theme-hover-light dark:text-theme-hover-dark">Policy</span>
          </h1>
          <p className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark uppercase tracking-wider">
            Last updated: January 2026
          </p>
        </div>

        {/* Policy Content */}
        <div className="border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark p-8 sm:p-10 space-y-8 text-xs sm:text-sm text-theme-text-secondary-light dark:text-theme-text-secondary-dark leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-serif italic text-theme-text-primary-light dark:text-theme-text-primary-dark">
              1. Information We Collect
            </h2>
            <p>
              We collect information you provide directly to us when placing an order, creating an account, subscribing to our newsletter, or contacting our concierge team. This includes your name, email address, phone number, delivery address, and payment confirmation details.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-serif italic text-theme-text-primary-light dark:text-theme-text-primary-dark">
              2. How We Use Your Information
            </h2>
            <p>
              We use your data exclusively to craft, customize, and deliver your orders; process payments securely; provide tracking notifications; and enhance your experience on our website. We do not sell or monetize your personal data with third-party advertising networks.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-serif italic text-theme-text-primary-light dark:text-theme-text-primary-dark">
              3. Data Security & Storage
            </h2>
            <p>
              Your personal data is encrypted in transit and stored in protected databases. Access is strictly limited to verified fulfillment personnel required to assemble and dispatch your handcrafted pieces.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-serif italic text-theme-text-primary-light dark:text-theme-text-primary-dark">
              4. Contact Us
            </h2>
            <p>
              If you have any questions regarding our privacy practices or wish to request data deletion, please reach out through our <Link href="/contact" className="text-theme-hover-light dark:text-theme-hover-dark underline">Contact Concierge</Link>.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
