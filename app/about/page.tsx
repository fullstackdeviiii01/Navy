// app/about/page.tsx
import { Metadata } from "next";
import Link from "next/link";
import {
  ChevronRight,
  Sparkles,
  TreePine,
  Hammer,
  ShieldCheck,
  HeartHandshake,
  Lightbulb,
  ArrowRight,
  CheckCircle2,
  PhoneCall,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Our Artisanal Heritage & Sustainable Timber Craftsmanship",
  description:
    "Discover the story behind Talal Wooden Lamps. The art of turning seasoned solid hardwoods into timeless lighting heirlooms through master lathe work and natural botanical oil finishes.",
  keywords: [
    "about talal wooden lamps",
    "wooden lamp craftsmanship",
    "artisanal woodturning pakistan",
    "sheesham wood lighting atelier",
    "sustainable timber lighting",
  ],
  alternates: {
    canonical: "/about",
  },
};

export default function AboutPage() {
  const values = [
    {
      icon: TreePine,
      title: "Sustainable Solid Hardwoods",
      description: "We carefully source seasoned solid Sheesham (Rosewood), Teak, and Ash timber from responsibly managed regional reserves.",
    },
    {
      icon: Hammer,
      title: "Artisanal Woodturning & Joinery",
      description: "Each lamp profile is hand-turned on traditional precision lathes and finished with traditional wood joinery techniques.",
    },
    {
      icon: Lightbulb,
      title: "Atmospheric Illumination",
      description: "Our fixtures are engineered to diffuse gentle, warm illumination that highlights the rich organic grain of the timber.",
    },
    {
      icon: ShieldCheck,
      title: "Built as Modern Heirlooms",
      description: "Protected with natural botanical oils and matte beeswax sealants to ensure each lamp endures for generations.",
    },
  ];

  const craftSteps = [
    {
      num: "01",
      title: "Timber Selection & Kiln Seasoning",
      description: "We hand-select dense, premium hardwood logs and kiln-dry them to optimal moisture levels (8%–10%) to prevent warping or cracking over decades.",
    },
    {
      num: "02",
      title: "Precision Lathe Shaping",
      description: "Master woodturners shape each lamp base by hand, following sculptural silhouettes inspired by Scandinavian minimalism and oriental woodwork.",
    },
    {
      num: "03",
      title: "Hand-Sanding & Botanical Oil Finishing",
      description: "Surfaces are sanded through progressive micro-grit stages, then treated with pure botanical linseed oils and organic wax to accentuate the natural grain.",
    },
    {
      num: "04",
      title: "Electrical Calibration & Safety Testing",
      description: "High-grade ceramic sockets, braided heat-resistant cords, and certified switch mechanisms are installed and individually load-tested before dispatch.",
    },
  ];

  const careTips = [
    {
      title: "Routine Dusting",
      text: "Gently wipe the wood surface with a soft, dry microfiber cloth. Avoid aerosol chemical sprays, silicones, or abrasive kitchen scourers.",
    },
    {
      title: "Moisture & Sunlight",
      text: "Keep your handcrafted lamp away from direct humid dampness or continuous outdoor sunlight to preserve the rich natural timber color.",
    },
    {
      title: "Recommended Light Bulbs",
      text: "Use Warm White (2700K–3000K) LED filament bulbs (E27 / E14 screw base, up to 12W LED). Warm light brings out the golden undertones of natural Sheesham.",
    },
    {
      title: "Periodic Nourishment",
      text: "To restore the deep natural luster after years of use, apply a few drops of natural teak oil or pure beeswax once every 12 to 18 months.",
    },
  ];

  return (
    <div className="min-h-screen bg-theme-bg-light dark:bg-theme-bg-dark py-10 sm:py-16 transition-colors">
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
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
            About & Craftsmanship
          </span>
        </nav>

        {/* Hero Header */}
        <div className="border-b border-theme-border-light dark:border-theme-border-dark pb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-theme-hover-light/10 text-theme-hover-light dark:text-theme-hover-dark mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Handcrafted in Pakistan • Est. 2026</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-serif font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark tracking-tight mb-4">
            The Art of Living Wood
          </h1>
          <p className="text-sm sm:text-base text-theme-text-secondary-light dark:text-theme-text-secondary-dark max-w-3xl leading-relaxed">
            Talal Wooden Lamps was founded with a singular conviction: that lighting fixtures should not be mass-produced plastic commodities, but sculptural wood artifacts that bring warmth, natural soul, and serenity to modern interiors.
          </p>
        </div>

        {/* Brand Story Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4 text-xs sm:text-sm text-theme-text-secondary-light dark:text-theme-text-secondary-dark leading-relaxed">
            <h2 className="text-xl sm:text-2xl font-serif font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
              Our Story & Philosophy
            </h2>
            <p>
              Deep in the heritage workshops of Pakistan, our craftspeople merge centuries-old woodturning traditions with contemporary Scandinavian aesthetic sensibilities. Every block of seasoned Sheesham and Teak wood possesses its own story—annual rings, distinct amber grain patterns, and natural tonal variations.
            </p>
            <p>
              Instead of masking these organic qualities with synthetic laminates, our artisans celebrate them. We sculpt, hand-rub, and calibrate each luminaire to harmonize raw natural materials with refined electrical safety.
            </p>
          </div>

          <div className="p-8 rounded-2xl border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark space-y-4 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-theme-hover-light/10 flex items-center justify-center text-theme-hover-light font-serif font-bold text-lg">
                RL
              </div>
              <div>
                <h3 className="text-sm font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                  Talal Wooden Lamps
                </h3>
                <p className="text-[11px] text-theme-text-muted-light uppercase tracking-wider">
                  Handcrafted Solid Wood Lighting
                </p>
              </div>
            </div>
            <div className="space-y-2 pt-2 border-t border-theme-border-light/60 dark:border-theme-border-dark/60 text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
              <p className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>100% Solid Seasoned Sheesham, Teak & Ash</span>
              </p>
              <p className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Zero Synthetic Veneers or MDF Core</span>
              </p>
              <p className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Certified 220V–240V Electrical Safety</span>
              </p>
              <p className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Nationwide Insured Delivery Across Pakistan</span>
              </p>
            </div>
          </div>
        </div>

        {/* 4 Core Pillars Grid */}
        <div className="space-y-6">
          <div className="border-b border-theme-border-light/80 dark:border-theme-border-dark/80 pb-3">
            <h2 className="text-xl font-serif font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
              Craftsmanship Principles
            </h2>
            <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark mt-0.5">
              The fundamental standards behind every piece we create
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {values.map((v, idx) => {
              const Icon = v.icon;
              return (
                <div
                  key={idx}
                  className="p-5 rounded-xl border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark space-y-2.5 shadow-2xs hover:border-theme-hover-light/60 transition-all"
                >
                  <div className="w-9 h-9 rounded-lg bg-theme-hover-light/10 dark:bg-theme-hover-dark/10 flex items-center justify-center text-theme-hover-light dark:text-theme-hover-dark">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-serif font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                    {v.title}
                  </h3>
                  <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark leading-relaxed">
                    {v.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* The 4-Step Artisanal Process */}
        <div className="space-y-6">
          <div className="border-b border-theme-border-light/80 dark:border-theme-border-dark/80 pb-3">
            <h2 className="text-xl font-serif font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
              How Each Lamp is Made
            </h2>
            <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark mt-0.5">
              From raw hardwood log to illuminated centerpiece
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {craftSteps.map((s, idx) => (
              <div
                key={idx}
                className="p-6 rounded-xl border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark relative overflow-hidden group shadow-2xs"
              >
                <div className="flex items-start gap-4">
                  <span className="font-mono text-2xl font-bold text-theme-hover-light/40 dark:text-theme-hover-dark/40 shrink-0">
                    {s.num}
                  </span>
                  <div className="space-y-1.5">
                    <h3 className="text-sm font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                      {s.title}
                    </h3>
                    <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark leading-relaxed">
                      {s.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Wood Care & Maintenance Guide */}
        <div className="space-y-6">
          <div className="border-b border-theme-border-light/80 dark:border-theme-border-dark/80 pb-3">
            <h2 className="text-xl font-serif font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
              Care & Maintenance Guide
            </h2>
            <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark mt-0.5">
              Simple tips to keep your solid wood lamp looking magnificent for decades
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {careTips.map((tip, idx) => (
              <div
                key={idx}
                className="p-5 rounded-xl border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark space-y-2 shadow-2xs"
              >
                <h3 className="text-sm font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-theme-hover-light" />
                  <span>{tip.title}</span>
                </h3>
                <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark leading-relaxed pl-3.5">
                  {tip.text}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Action CTA Banner */}
        <div className="p-8 sm:p-10 rounded-2xl border border-theme-hover-light/30 dark:border-theme-hover-dark/30 bg-theme-card-light dark:bg-theme-card-dark flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xs">
          <div className="space-y-1.5 text-center sm:text-left">
            <h3 className="text-lg sm:text-xl font-serif font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
              Experience the warmth in your space
            </h3>
            <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark max-w-md">
              Explore our complete collection of handcrafted table, desk, and floor lamps.
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap justify-center">
            <Link
              href="/products"
              className="px-6 py-3 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900 text-xs font-semibold uppercase tracking-wider transition-all inline-flex items-center gap-1.5"
            >
              <span>Explore Collection</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/contact"
              className="px-6 py-3 rounded-lg border border-theme-border-light dark:border-theme-border-dark hover:border-theme-hover-light bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark text-xs font-semibold uppercase tracking-wider transition-colors"
            >
              <span>Custom Commissions</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
