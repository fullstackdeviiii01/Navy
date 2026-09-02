// app/refund-policy/page.tsx
import { Metadata } from "next";
import Link from "next/link";
import {
  ChevronRight,
  RotateCcw,
  ShieldCheck,
  Truck,
  CheckCircle2,
  Clock,
  HelpCircle,
  PhoneCall,
  AlertTriangle,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Return, Replacement & 7-Day Refund Policy",
  description:
    "Our customer satisfaction guarantee. Easy returns, damaged shipment replacements, and transparent refund policies for all handcrafted luminaires across Pakistan.",
  keywords: [
    "wooden lamp return policy",
    "refund policy pakistan",
    "7-day replacement guarantee",
    "damaged lamp replacement",
  ],
  alternates: {
    canonical: "/refund-policy",
  },
};

export default function RefundPolicyPage() {
  const guarantees = [
    {
      icon: Clock,
      title: "7-Day Return Window",
      description: "Inspect your handcrafted lamp at home. If it doesn't fit your space, request a return within 7 days of delivery.",
    },
    {
      icon: ShieldCheck,
      title: "100% Transit Guarantee",
      description: "If your piece arrives damaged during courier transport, we will dispatch an immediate free replacement.",
    },
    {
      icon: RotateCcw,
      title: "Fast Refund Payout",
      description: "Once inspected, refunds are transferred directly to your Bank Account or JazzCash within 48 business hours.",
    },
    {
      icon: Sparkles,
      title: "1-Year Craftsmanship Warranty",
      description: "All solid wood luminaires carry a 1-year warranty covering joinery, wood stability, and internal electrical sockets.",
    },
  ];

  const steps = [
    {
      step: "01",
      title: "Initiate Your Request",
      text: "Go to your Account Orders or the Track Order page, select the order item, and click 'Request Return'. Attach clear photos of the item and packaging.",
    },
    {
      step: "02",
      title: "Concierge Review",
      text: "Our team reviews your submission within 24–48 hours. Upon approval, you will receive packing instructions and return pickup or drop-off details.",
    },
    {
      step: "03",
      title: "Safe Courier Return",
      text: "Repack the lamp securely in its original protective foam and crate box so it travels back safely without transit scratches.",
    },
    {
      step: "04",
      title: "Inspection & Refund",
      text: "Once received and inspected at our workshop, your refund is disbursed directly to your provided Bank or JazzCash account with an official confirmation receipt.",
    },
  ];

  const returnableConditions = [
    "Item is in original condition without accidental drops, liquid spills, or unauthorized alterations",
    "Returned with original protective foam, box, and all included accessories (cords, shades, fittings)",
    "Initiated within 7 calendar days from the date of courier delivery",
    "Accompanied by the order number and reason for return",
  ];

  const nonReturnableItems = [
    "Customized bespoke pieces with personalized timber engraving or non-standard custom dimensions",
    "Items damaged through improper electrical wiring, power surges, or unauthorized disassembly",
    "Decorative light bulbs damaged by normal wear and tear after delivery",
    "Return claims initiated after the 7-day inspection period",
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
            Return & Refund Policy
          </span>
        </nav>

        {/* Hero Header */}
        <div className="border-b border-theme-border-light dark:border-theme-border-dark pb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-theme-hover-light/10 text-theme-hover-light dark:text-theme-hover-dark mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Hassle-Free Satisfaction Guarantee</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark tracking-tight mb-3">
            Returns & Refunds
          </h1>
          <p className="text-xs sm:text-sm text-theme-text-secondary-light dark:text-theme-text-secondary-dark max-w-2xl leading-relaxed">
            Every wooden lamp is handcrafted with dedication. We want you to be completely confident in your purchase. Here is everything you need to know about our transparent returns, replacements, and warranty coverage.
          </p>
        </div>

        {/* 4 Core Guarantees Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {guarantees.map((g, idx) => {
            const Icon = g.icon;
            return (
              <div
                key={idx}
                className="p-5 rounded-xl border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark space-y-2.5 shadow-2xs hover:border-theme-hover-light/60 transition-all"
              >
                <div className="w-9 h-9 rounded-lg bg-theme-hover-light/10 dark:bg-theme-hover-dark/10 flex items-center justify-center text-theme-hover-light dark:text-theme-hover-dark">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-serif font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                  {g.title}
                </h3>
                <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark leading-relaxed">
                  {g.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Step-by-Step Return Process */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-theme-border-light/80 dark:border-theme-border-dark/80 pb-3">
            <div>
              <h2 className="text-xl font-serif font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                How to Request a Return
              </h2>
              <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark mt-0.5">
                Simple 4-step process designed for fast turnaround
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {steps.map((s, idx) => (
              <div
                key={idx}
                className="p-6 rounded-xl border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark relative overflow-hidden group shadow-2xs"
              >
                <div className="flex items-start gap-4">
                  <span className="font-mono text-2xl font-bold text-theme-hover-light/40 dark:text-theme-hover-dark/40 shrink-0">
                    {s.step}
                  </span>
                  <div className="space-y-1.5">
                    <h3 className="text-sm font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                      {s.title}
                    </h3>
                    <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark leading-relaxed">
                      {s.text}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Eligibility Criteria (Two Column Box) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Eligible Items */}
          <div className="p-6 rounded-xl border border-emerald-600/30 dark:border-emerald-500/30 bg-emerald-50/30 dark:bg-emerald-950/20 space-y-4">
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-semibold text-sm">
              <CheckCircle2 className="w-4 h-4" />
              <span>Eligible for Return or Exchange</span>
            </div>
            <ul className="space-y-2.5 text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
              {returnableConditions.map((cond, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span>{cond}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Ineligible Items */}
          <div className="p-6 rounded-xl border border-rose-600/30 dark:border-rose-500/30 bg-rose-50/30 dark:bg-rose-950/20 space-y-4">
            <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300 font-semibold text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span>Non-Returnable Items</span>
            </div>
            <ul className="space-y-2.5 text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
              {nonReturnableItems.map((cond, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-rose-600 font-bold">•</span>
                  <span>{cond}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Transit Damage & Replacement Section */}
        <div className="p-6 sm:p-8 rounded-xl border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark space-y-4">
          <div className="flex items-center gap-2.5">
            <Truck className="w-5 h-5 text-theme-hover-light dark:text-theme-hover-dark" />
            <h2 className="text-lg font-serif font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
              Courier Transit Damage Guarantee
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-theme-text-secondary-light dark:text-theme-text-secondary-dark leading-relaxed">
            All shipments across Pakistan are insured against transit mishaps. In the unlikely event that your lamp or shade arrives cracked, broken, or dented by courier handling, please notify us within <strong>48 hours</strong> of delivery. Simply take 2–3 photos of the damaged piece and the parcel box, and submit a claim through the order portal or WhatsApp. We will ship an expedited replacement immediately at zero extra cost.
          </p>
        </div>

        {/* 1-Year Warranty Coverage */}
        <div className="p-6 sm:p-8 rounded-xl border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark space-y-4">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-theme-hover-light dark:text-theme-hover-dark" />
            <h2 className="text-lg font-serif font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
              1-Year Workshop Warranty
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-theme-text-secondary-light dark:text-theme-text-secondary-dark leading-relaxed">
            Every Talal Wooden Lamp includes a comprehensive 1-year warranty against manufacturing defects, structural timber cracking under normal ambient conditions, switch malfunctions, and internal socket wiring faults. If an issue arises within your first year of ownership, contact our workshop and we will repair or service your luminaire free of charge.
          </p>
        </div>

        {/* Action CTA Box */}
        <div className="p-6 sm:p-8 rounded-2xl border border-theme-hover-light/30 dark:border-theme-hover-dark/30 bg-theme-card-light dark:bg-theme-card-dark flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xs">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-base sm:text-lg font-serif font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
              Need assistance with an existing order?
            </h3>
            <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
              Our customer support concierge is ready to assist with returns, exchanges, or tracking.
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap justify-center">
            <Link
              href="/track-order"
              className="px-5 py-2.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900 text-xs font-semibold uppercase tracking-wider transition-all inline-flex items-center gap-1.5"
            >
              <span>Track / Return Order</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <a
              href="https://wa.me/923009692765"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-lg border border-theme-border-light dark:border-theme-border-dark hover:border-theme-hover-light bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark text-xs font-semibold uppercase tracking-wider transition-colors inline-flex items-center gap-1.5"
            >
              <PhoneCall className="w-3.5 h-3.5 text-theme-hover-light" />
              <span>WhatsApp Chat</span>
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
