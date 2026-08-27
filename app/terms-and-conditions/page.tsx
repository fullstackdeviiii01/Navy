// app/terms-and-conditions/page.tsx
import { Metadata } from "next";
import Link from "next/link";
import {
  ChevronRight,
  FileText,
  Hammer,
  CreditCard,
  Truck,
  ShieldCheck,
  Scale,
  ArrowRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Terms & Conditions | Talal Wooden Lamps",
  description:
    "Read our terms and conditions of purchase, artisanal timber characteristics, ordering, warranty, and intellectual property.",
};

export default function TermsConditionsPage() {
  const pillars = [
    {
      icon: Hammer,
      title: "Artisanal Craftsmanship",
      description: "Each luminaire is individually crafted from natural hardwoods. Organic grain and subtle tonal nuances are celebrated features.",
    },
    {
      icon: CreditCard,
      title: "Transparent Pricing",
      description: "All prices are listed in Pakistani Rupees (PKR) and clearly itemized at checkout with applicable shipping and discounts.",
    },
    {
      icon: ShieldCheck,
      title: "1-Year Warranty",
      description: "We guarantee the integrity of our solid wood construction, joinery, and internal wiring against manufacturing defects.",
    },
    {
      icon: Scale,
      title: "Fair Terms",
      description: "Clear and honest return policies, safe payment terms, and dedicated customer support for all orders.",
    },
  ];

  const termsSections = [
    {
      title: "1. Artisanal Nature & Natural Timber Characteristics",
      content: (
        <p>
          Our lighting pieces and wooden artifacts are handcrafted from solid hardwoods including Sheesham (Rosewood), Solid Teak, Walnut, and European Ash. Because timber is a natural organic material, minor variations in wood grain texture, annual growth rings, and subtle wood tones are natural characteristics of authentic solid wood and not defects.
        </p>
      ),
    },
    {
      title: "2. Orders, Invoicing & Acceptance",
      content: (
        <p>
          When you place an order, you will receive an automatic Order Confirmation email containing your order details and invoice. An order becomes officially accepted and dispatched upon payment receipt verification (for Bank Transfer and JazzCash) or phone verification (for Cash on Delivery). We reserve the right to decline or cancel an order if pricing typographical errors occur or if fraudulent activity is suspected.
        </p>
      ),
    },
    {
      title: "3. Payment Methods & Receipt Verification",
      content: (
        <p>
          We accept Cash on Delivery (COD), Direct Bank Transfer, and JazzCash. For manual payment methods (Bank Transfer and JazzCash), customers are required to upload a valid transfer receipt or transaction reference number. Orders are moved to fulfillment as soon as our accounts desk confirms receipt of funds.
        </p>
      ),
    },
    {
      title: "4. Shipping & Risk of Loss",
      content: (
        <p>
          All items are shipped via tracked courier services (TCS, Leopards, Trax). We assume full responsibility for transit risks until the package is handed over to you. If a package arrives damaged by courier handling, please notify our team within 48 hours with photos to receive an immediate replacement.
        </p>
      ),
    },
    {
      title: "5. 7-Day Inspection & Return Policy",
      content: (
        <p>
          Customers enjoy a 7-day inspection period starting from the delivery date. If you wish to return or exchange an eligible standard catalogue item, it must be returned in its original condition and packaging. Custom bespoke commissions with personalized engraving or non-standard dimensions are non-returnable.
        </p>
      ),
    },
    {
      title: "6. Intellectual Property",
      content: (
        <p>
          All product photographs, luminaire designs, brand identity assets, logos, and website text on Talal Wooden Lamps are the intellectual property of our atelier and protected by applicable copyright and trademark laws.
        </p>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-theme-bg-light dark:bg-theme-bg-dark py-10 sm:py-16 transition-colors">
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Breadcrumb Navigation */}
        <nav
          className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em]"
          aria-label="Breadcrumb"
        >
          <Link
            href="/"
            className="text-theme-text-muted-light dark:text-theme-text-muted-dark hover:text-theme-hover-light transition-colors"
          >
            Home
          </Link>
          <ChevronRight className="w-3 h-3 text-theme-text-muted-light" />
          <span className="text-theme-text-primary-light dark:text-theme-text-primary-dark font-medium">
            Terms & Conditions
          </span>
        </nav>

        {/* Hero Header */}
        <div className="border-b border-theme-border-light dark:border-theme-border-dark pb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-theme-hover-light/10 text-theme-hover-light dark:text-theme-hover-dark mb-3">
            <FileText className="w-3.5 h-3.5" />
            <span>Legal Agreement & Standards</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark tracking-tight mb-3">
            Terms & Conditions
          </h1>
          <p className="text-xs sm:text-sm text-theme-text-secondary-light dark:text-theme-text-secondary-dark max-w-2xl leading-relaxed">
            Please review these terms and conditions governing your use of our storefront, custom commissions, order placements, and customer warranty rights.
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {pillars.map((p, idx) => {
            const Icon = p.icon;
            return (
              <div
                key={idx}
                className="p-5 rounded-xl border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark space-y-2.5 shadow-2xs hover:border-theme-hover-light/60 transition-all"
              >
                <div className="w-9 h-9 rounded-lg bg-theme-hover-light/10 dark:bg-theme-hover-dark/10 flex items-center justify-center text-theme-hover-light dark:text-theme-hover-dark">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-serif font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                  {p.title}
                </h3>
                <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark leading-relaxed">
                  {p.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Terms Sections */}
        <div className="space-y-6">
          {termsSections.map((sec, idx) => (
            <div
              key={idx}
              className="p-6 sm:p-8 rounded-xl border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark space-y-3 shadow-2xs"
            >
              <h2 className="text-base sm:text-lg font-serif font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                {sec.title}
              </h2>
              <div className="text-xs sm:text-sm text-theme-text-secondary-light dark:text-theme-text-secondary-dark leading-relaxed">
                {sec.content}
              </div>
            </div>
          ))}
        </div>

        {/* Action CTA Box */}
        <div className="p-6 sm:p-8 rounded-2xl border border-theme-hover-light/30 dark:border-theme-hover-dark/30 bg-theme-card-light dark:bg-theme-card-dark flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xs">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-base sm:text-lg font-serif font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
              Have questions about our terms or warranty?
            </h3>
            <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
              Our concierge team is available to assist you with any questions.
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap justify-center">
            <Link
              href="/contact"
              className="px-5 py-2.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900 text-xs font-semibold uppercase tracking-wider transition-all inline-flex items-center gap-1.5"
            >
              <span>Contact Us</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
