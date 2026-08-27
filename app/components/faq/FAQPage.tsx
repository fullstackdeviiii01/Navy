// app/components/faq/FAQPage.tsx
"use client";

import { useState, useMemo } from "react";
import { Plus, Minus, Search, ChevronRight, HelpCircle, Sparkles, PhoneCall, ShieldCheck, Truck, Hammer, RotateCcw, Lightbulb } from "lucide-react";
import Link from "next/link";

interface StaticFAQItem {
  id: string;
  category: "Ordering & Bespoke" | "Shipping & Delivery" | "Materials & Craftsmanship" | "Returns & Warranty" | "Care & Illumination";
  question: string;
  answer: string;
}

const STATIC_FAQS: StaticFAQItem[] = [
  // 1. Ordering & Bespoke
  {
    id: "bespoke-commissions",
    category: "Ordering & Bespoke",
    question: "Do you accept custom dimensions or bespoke architectural lighting commissions?",
    answer: "Yes. Our atelier collaborates directly with architects, interior designers, and private collectors. Custom requests can include bespoke timber profiles, tailored cord lengths, custom brass patina finishes, and specialized lamp shade dimensions. Please reach out through our Contact page to initiate a consultation.",
  },
  {
    id: "order-modification",
    category: "Ordering & Bespoke",
    question: "Can I modify or cancel my order after placement?",
    answer: "Because each artisanal luminaire is prepared and calibrated with care, modifications or cancellations are accepted within 12 hours of order placement. Once dispatch or personalized timber machining commences, orders cannot be cancelled.",
  },
  {
    id: "payment-methods",
    category: "Ordering & Bespoke",
    question: "What payment methods are supported across Pakistan?",
    answer: "We support Cash on Delivery (COD) for orders up to Rs. 50,000, secure Direct Bank Transfer (Meezan Bank with receipt verification), and JazzCash mobile wallet payments. For high-value bespoke commissions, payment milestones can be arranged with our concierge.",
  },

  // 2. Shipping & Delivery
  {
    id: "delivery-timelines",
    category: "Shipping & Delivery",
    question: "What are your delivery timelines across Pakistan?",
    answer: "Standard orders are securely dispatched within 24 to 48 business hours. Deliveries within Karachi typically arrive within 2–3 business days, while nationwide shipments to Lahore, Islamabad, Rawalpindi, and other cities arrive within 3–5 business days via tracked courier services (TCS, Leopards, Trax).",
  },
  {
    id: "fragile-packaging",
    category: "Shipping & Delivery",
    question: "How are fragile lamps packaged to prevent damage during transit?",
    answer: "Every lamp is encased in custom-molded high-density protective foam, reinforced inner corrugated boxing, and sealed heavy-duty outer crate packaging. Electrical components and artisanal shades are isolated to ensure flawless transit even over long domestic journeys.",
  },
  {
    id: "order-tracking",
    category: "Shipping & Delivery",
    question: "How can I track the live status of my shipment?",
    answer: "Once dispatched, you will receive an automated tracking notification with your consignment number. You can also view live fulfillment progress anytime directly on our Track Order page using your Order ID and contact details.",
  },

  // 3. Materials & Craftsmanship
  {
    id: "timber-sources",
    category: "Materials & Craftsmanship",
    question: "What woods and finishes are utilized in your lamps?",
    answer: "We select seasoned, kiln-dried solid hardwoods including Premium Sheesham (Rosewood), Solid Teak, Walnut, and European Ash. Surfaces are hand-rubbed with natural botanical oils and protective matte sealants to preserve the tactile wood grain while preventing moisture absorption.",
  },
  {
    id: "wood-variation",
    category: "Materials & Craftsmanship",
    question: "Why does the wood grain slightly differ from the product photograph?",
    answer: "Natural hardwood possesses unique annual growth rings, tonal nuances, and subtle grain variations. No two handcrafted pieces are completely identical—each lamp is a unique heirloom artifact celebrating the organic individuality of living wood.",
  },
  {
    id: "hardware-safety",
    category: "Materials & Craftsmanship",
    question: "Are electrical components certified for domestic safety and voltage?",
    answer: "All electrical cabling, ceramic sockets, toggle switches, and plugs meet 220V–240V 50Hz safety standards. We employ braided heat-resistant fabric cords and grounded brass housings to guarantee long-term safety and fire resilience.",
  },

  // 4. Returns & Warranty
  {
    id: "inspection-policy",
    category: "Returns & Warranty",
    question: "What is your return and inspection policy?",
    answer: "We offer a 7-day post-delivery inspection window. If your luminaire arrives damaged, defective, or inconsistent with your order specifications, you can submit a return and refund claim directly through your account or order portal. Our concierge will review and process your resolution within 2–3 business days.",
  },
  {
    id: "electrical-warranty",
    category: "Returns & Warranty",
    question: "Do your lamps come with a warranty?",
    answer: "All handcrafted lighting fixtures carry a 1-Year Atelier Warranty covering structural craftsmanship, internal wiring integrity, and socket mechanisms. Consumable items such as decorative light bulbs are excluded from the extended warranty.",
  },
  {
    id: "refund-disbursement",
    category: "Returns & Warranty",
    question: "How are approved refunds disbursed?",
    answer: "Once a return is verified and received by our inspection team, refunds are disbursed directly to your designated bank account or JazzCash wallet within 48 business hours, and an official settlement confirmation is dispatched via email.",
  },

  // 5. Care & Illumination
  {
    id: "recommended-bulbs",
    category: "Care & Illumination",
    question: "Which light bulbs are recommended for optimal ambiance?",
    answer: "We recommend Warm White (2700K–3000K) LED filament bulbs with standard E27 or E14 ceramic screw bases (up to 12W LED, equivalent to 60W incandescent). Warm illumination accentuates the rich golden undertones of our handcrafted timber.",
  },
  {
    id: "cleaning-maintenance",
    category: "Care & Illumination",
    question: "How should I clean and preserve the hardwood finish?",
    answer: "Dust gently using a dry, soft microfiber cloth. Avoid chemical aerosol sprays, solvents, or abrasive cleaners. To rejuvenate the luster of unlacquered natural hardwoods, apply a thin coat of natural beeswax or teak oil once every 12 to 18 months.",
  },
  {
    id: "dimmer-compatibility",
    category: "Care & Illumination",
    question: "Can I use dimmable bulbs or smart lighting systems?",
    answer: "Yes. Our standard ceramic socket fixtures are fully compatible with dimmable LED bulbs (when wired to compatible trailing-edge dimmers) as well as smart home lighting (Philips Hue, Tuya, and Zigbee E27 smart bulbs).",
  },
];

const CATEGORIES = [
  { id: "all", label: "All Inquiries", icon: Sparkles },
  { id: "Ordering & Bespoke", label: "Ordering & Bespoke", icon: Hammer },
  { id: "Shipping & Delivery", label: "Shipping & Delivery", icon: Truck },
  { id: "Materials & Craftsmanship", label: "Craftsmanship", icon: ShieldCheck },
  { id: "Returns & Warranty", label: "Returns & Warranty", icon: RotateCcw },
  { id: "Care & Illumination", label: "Care & Lighting", icon: Lightbulb },
] as const;

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFaq, setExpandedFaq] = useState<string | null>("bespoke-commissions");

  const filteredFaqs = useMemo(() => {
    return STATIC_FAQS.filter((faq) => {
      const matchesCategory = activeCategory === "all" || faq.category === activeCategory;
      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return faq.question.toLowerCase().includes(q) || faq.answer.toLowerCase().includes(q);
    });
  }, [activeCategory, searchQuery]);

  const toggleFaq = (faqId: string) => {
    setExpandedFaq((prev) => (prev === faqId ? null : faqId));
  };

  return (
    <div className="min-h-screen bg-theme-bg-light dark:bg-theme-bg-dark py-10 sm:py-16 transition-colors">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] mb-8" aria-label="Breadcrumb">
          <Link
            href="/"
            aria-label="Home"
            className="text-theme-text-muted-light dark:text-theme-text-muted-dark hover:text-theme-text-primary-light dark:hover:text-theme-text-primary-dark transition-colors"
          >
            HOME
          </Link>
          <ChevronRight className="w-3 h-3 text-theme-text-muted-light dark:text-theme-text-muted-dark" />
          <span className="text-theme-text-primary-light dark:text-theme-text-primary-dark font-medium">
            FAQS
          </span>
        </nav>

        {/* Header Banner */}
        <div className="text-center space-y-4 mb-10 sm:mb-14">
          <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.25em] text-theme-hover-light dark:text-theme-hover-dark">
            CONCIERGE KNOWLEDGE BASE
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark tracking-tight">
            Frequently Asked Questions
          </h1>
          <p className="text-xs sm:text-sm text-theme-text-secondary-light dark:text-theme-text-secondary-dark max-w-xl mx-auto leading-relaxed">
            Everything you need to know regarding our handcrafted solid wood luminaires, tailored bespoke commissions, domestic shipping, and care guidelines.
          </p>
        </div>

        {/* Search Input Bar */}
        <div className="relative max-w-2xl mx-auto mb-10">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-text-muted-light dark:text-theme-text-muted-dark" />
          <input
            type="text"
            placeholder="Search questions, wood types, bulb specs, or policies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3.5 bg-theme-surface-light dark:bg-theme-surface-dark border border-theme-border-light dark:border-theme-border-dark text-xs sm:text-sm text-theme-text-primary-light dark:text-theme-text-primary-dark placeholder:text-theme-text-muted-light focus:outline-none focus:border-theme-hover-light dark:focus:border-theme-hover-dark transition-all rounded-none shadow-xs"
            aria-label="Search FAQs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] uppercase font-mono text-theme-text-muted-light hover:text-theme-text-primary-light px-2 py-1"
            >
              CLEAR
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = activeCategory === cat.id;
            const count =
              cat.id === "all"
                ? STATIC_FAQS.length
                : STATIC_FAQS.filter((f) => f.category === cat.id).length;

            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 text-[11px] uppercase tracking-[0.14em] font-medium border transition-all ${
                  isSelected
                    ? "bg-theme-primary text-white border-theme-primary shadow-sm"
                    : "bg-theme-surface-light dark:bg-theme-surface-dark border-theme-border-light dark:border-theme-border-dark text-theme-text-secondary-light dark:text-theme-text-secondary-dark hover:border-theme-hover-light dark:hover:border-theme-hover-dark hover:text-theme-text-primary-light"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
                <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono ${
                  isSelected ? "bg-white/20 text-white" : "bg-neutral-200/60 dark:bg-neutral-800 text-theme-text-muted-light"
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* FAQs Accordion List */}
        <div className="space-y-3 mb-16">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq) => {
              const isOpen = expandedFaq === faq.id;
              return (
                <div
                  key={faq.id}
                  className={`border transition-all duration-200 ${
                    isOpen
                      ? "border-theme-hover-light/70 dark:border-theme-hover-dark/70 bg-theme-surface-light dark:bg-theme-surface-dark shadow-sm"
                      : "border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light/60 dark:bg-theme-surface-dark/60 hover:border-theme-border-light/90"
                  }`}
                >
                  <button
                    onClick={() => toggleFaq(faq.id)}
                    className="w-full px-5 sm:px-6 py-4 sm:py-5 flex items-center justify-between text-left gap-4 transition-colors"
                    aria-expanded={isOpen}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-theme-hover-light dark:text-theme-hover-dark font-semibold hidden sm:inline-block">
                        [{faq.category.split(" ")[0]}]
                      </span>
                      <h3 className="text-sm sm:text-base font-serif text-theme-text-primary-light dark:text-theme-text-primary-dark font-medium leading-snug">
                        {faq.question}
                      </h3>
                    </div>
                    <div className="p-1 rounded bg-neutral-100 dark:bg-neutral-800 text-theme-text-muted-light shrink-0">
                      {isOpen ? (
                        <Minus className="w-3.5 h-3.5 text-theme-hover-light" />
                      ) : (
                        <Plus className="w-3.5 h-3.5" />
                      )}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-1 border-t border-theme-border-light/40 dark:border-theme-border-dark/40 animate-fadeIn">
                      <p className="text-xs sm:text-sm text-theme-text-secondary-light dark:text-theme-text-secondary-dark leading-relaxed font-sans">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="border border-dashed border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark text-center py-16 px-4 space-y-3">
              <HelpCircle className="w-8 h-8 text-theme-hover-light mx-auto" />
              <h3 className="text-lg font-serif font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark">
                No matching inquiries found
              </h3>
              <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark max-w-sm mx-auto">
                We couldn't find any questions matching "{searchQuery}". Please clear your search or speak directly with our concierge.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setActiveCategory("all");
                }}
                className="mt-2 px-5 py-2.5 bg-theme-primary text-white text-xs uppercase tracking-wider font-medium"
              >
                VIEW ALL INQUIRIES
              </button>
            </div>
          )}
        </div>

        {/* Concierge Contact Banner */}
        <div className="border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
          <div className="space-y-1.5 text-center md:text-left">
            <span className="text-[10px] uppercase tracking-[0.2em] font-mono text-theme-hover-light dark:text-theme-hover-dark">
              STILL HAVE QUESTIONS?
            </span>
            <h4 className="text-lg sm:text-2xl font-serif text-theme-text-primary-light dark:text-theme-text-primary-dark">
              Speak With Our Atelier Concierge
            </h4>
            <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark max-w-md">
              Need tailored dimensional guidance or material swatches? Our artisans are ready to assist.
            </p>
          </div>

          <Link
            href="/contact"
            className="no-theme-hover inline-flex items-center justify-center gap-2.5 px-6 sm:px-8 py-3 sm:py-3.5 bg-theme-primary hover:bg-[#A8752B] dark:hover:bg-[#C99648] text-theme-btn-text hover:text-white text-[11px] sm:text-xs uppercase tracking-[0.2em] font-medium transition-all duration-300 shadow-md active:scale-95 group shrink-0"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>CONTACT CONCIERGE</span>
          </Link>
        </div>

      </div>
    </div>
  );
}
