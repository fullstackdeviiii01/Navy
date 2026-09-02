// app/care-guide/page.tsx
import { Metadata } from "next";
import Link from "next/link";
import {
  ChevronRight,
  Sparkles,
  TreePine,
  Lightbulb,
  ShieldCheck,
  CheckCircle2,
  PhoneCall,
  ArrowRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Solid Wood Lamp Care & Maintenance Guide",
  description:
    "Expert care instructions to preserve the grain, lustre, and longevity of solid hardwood lamps. Natural botanical wax application, dusting, and electrical safety advice.",
  keywords: [
    "wooden lamp care guide",
    "how to clean wooden lamps",
    "hardwood maintenance",
    "sheesham wood polish",
    "lamp maintenance tips",
  ],
  alternates: {
    canonical: "/care-guide",
  },
};

export default function CareGuidePage() {
  const careSections = [
    {
      title: "1. Routine Dusting & Cleaning",
      tips: [
        "Dust the timber body weekly with a dry, soft microfiber cloth or feather duster.",
        "For fingerprint marks or minor smudges, use a slightly damp cloth (water only), then immediately dry with a clean microfiber cloth.",
        "Never use chemical aerosol sprays, ammonia-based glass cleaners, silicone polishes, or abrasive scouring pads.",
      ],
    },
    {
      title: "2. Environmental & Climate Placement",
      tips: [
        "Position your lamp indoors in climate-controlled areas away from excessive dampness or direct moisture.",
        "Avoid placing the lamp directly in front of air conditioning vents, radiator heaters, or unshaded direct outdoor sunlight.",
        "Natural wood breathes with ambient humidity; maintaining moderate indoor conditions keeps the timber perfectly stable.",
      ],
    },
    {
      title: "3. Light Bulb & Electrical Recommendations",
      tips: [
        "Use Warm White (2700K–3000K) LED filament bulbs for optimal amber ambiance and minimal heat generation.",
        "Compatible with standard E27 and E14 ceramic screw bases up to 12W LED (equivalent to 60W incandescent).",
        "Always ensure the lamp is unplugged from the wall socket before replacing light bulbs or adjusting fittings.",
      ],
    },
    {
      title: "4. Periodic Timber Nourishment",
      tips: [
        "After 12 to 18 months of regular use, you may refresh the natural wood sheen by applying a few drops of natural teak oil or pure beeswax.",
        "Apply a tiny quantity with a soft cotton cloth following the direction of the wood grain, let it absorb for 15 minutes, and buff gently.",
      ],
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
            Care Guide
          </span>
        </nav>

        {/* Hero Header */}
        <div className="border-b border-theme-border-light dark:border-theme-border-dark pb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-theme-hover-light/10 text-theme-hover-light dark:text-theme-hover-dark mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Preserving Natural Wood Heirlooms</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark tracking-tight mb-3">
            Care & Maintenance
          </h1>
          <p className="text-xs sm:text-sm text-theme-text-secondary-light dark:text-theme-text-secondary-dark max-w-2xl leading-relaxed">
            Your Talal Wooden Lamp is crafted from genuine solid hardwoods designed to last for generations. Follow these simple guidelines to preserve its natural beauty and flawless performance.
          </p>
        </div>

        {/* Care Sections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {careSections.map((sec, idx) => (
            <div
              key={idx}
              className="p-6 sm:p-7 rounded-xl border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark space-y-4 shadow-2xs"
            >
              <h2 className="text-base sm:text-lg font-serif font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                {sec.title}
              </h2>
              <ul className="space-y-2.5 text-xs sm:text-sm text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
                {sec.tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-theme-hover-light shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Action CTA Box */}
        <div className="p-6 sm:p-8 rounded-2xl border border-theme-hover-light/30 dark:border-theme-hover-dark/30 bg-theme-card-light dark:bg-theme-card-dark flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xs">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-base sm:text-lg font-serif font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
              Have specific questions about your timber piece?
            </h3>
            <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
              Our workshop artisans are always glad to assist with wood care guidance.
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap justify-center">
            <Link
              href="/contact"
              className="px-5 py-2.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900 text-xs font-semibold uppercase tracking-wider transition-all inline-flex items-center gap-1.5"
            >
              <span>Contact Workshop</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
