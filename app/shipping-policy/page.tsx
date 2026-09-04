// app/shipping-policy/page.tsx
import { Metadata } from "next";
import Link from "next/link";
import {
  ChevronRight,
  Truck,
  Box,
  ShieldCheck,
  Clock,
  ArrowRight,
  CheckCircle2,
  PhoneCall,
  Mail,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Nationwide Shipping & Delivery Policy | Talal Wooden Lamps",
  description:
    "Information on nationwide delivery across Pakistan via M&P Express Logistics, order tracking, transit timelines, and secure packaging for our handcrafted wooden lamps.",
  keywords: [
    "wooden lamp shipping pakistan",
    "M&P express delivery",
    "lamp delivery nationwide",
    "wooden lamp order tracking",
  ],
  alternates: {
    canonical: "/shipping-policy",
  },
};

export default function ShippingPolicyPage() {
  const highlights = [
    {
      icon: Truck,
      title: "Nationwide Delivery",
      description: "Delivering across all cities, towns, and regions throughout Pakistan via M&P Express Logistics.",
    },
    {
      icon: Box,
      title: "Secure Packaging",
      description: "Carefully wrapped with multi-layer protective padding to keep handcrafted wood and electrical parts safe.",
    },
    {
      icon: Clock,
      title: "Estimated Timelines",
      description: "Most shipments typically arrive within 3 to 5 business days following dispatch (remote areas may vary).",
    },
    {
      icon: ShieldCheck,
      title: "Tracked Consignment",
      description: "Every parcel is dispatched with an official M&P tracking number for end-to-end status visibility.",
    },
  ];

  const policyPoints = [
    {
      title: "1. Courier Partner & Coverage",
      content:
        "All our domestic orders are shipped exclusively via M&P Express Logistics (Muller & Phipps). M&P provides reliable, tracked doorstep delivery across all major cities, towns, and accessible districts across Pakistan.",
    },
    {
      title: "2. Order Processing & Dispatch",
      content:
        "Because our wooden lamps and fixtures are handcrafted with artisanal care, orders undergo a thorough inspection and secure packaging before handover. Orders are typically processed and dispatched within 1 to 3 business days. During promotional campaigns or high-demand periods, dispatch times may vary slightly.",
    },
    {
      title: "3. Estimated Delivery Timeframes",
      content:
        "Once handed over to M&P, delivery typically takes 3 to 5 business days for major urban centers, and 5 to 7 business days for regional or distant areas. Please note that transit timelines are estimates provided by the courier and may be subject to external factors such as weather conditions, transit delays, or public holidays.",
    },
    {
      title: "4. Order Tracking",
      content:
        "As soon as your parcel is booked with M&P Express, an automated consignment tracking number is generated. You can check your live parcel progress directly through our Track Order page or on the official M&P tracking portal.",
    },
    {
      title: "5. Shipping Charges",
      content:
        "Applicable delivery fees are calculated transparently and displayed at checkout before you confirm your order. Shipping rates are based on standard courier weight and destination criteria.",
    },
    {
      title: "6. Parcel Receiving & Inspection",
      content:
        "We strongly advise inspecting the external packaging at the time of delivery. If a parcel appears visibly damaged or tampered with in transit, please contact our support team immediately so we can promptly assist you.",
    },
  ];

  return (
    <div className="min-h-screen bg-theme-bg-light dark:bg-theme-bg-dark py-10 sm:py-16 transition-colors">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-12">
        {/* Breadcrumb */}
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
            Shipping Policy
          </span>
        </nav>

        {/* Header */}
        <div className="border-b border-theme-border-light dark:border-theme-border-dark pb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-[#C59345]/15 text-[#A8752B] dark:text-[#E5B568] mb-3">
            <Truck className="w-3.5 h-3.5" />
            <span>Nationwide Logistics</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark tracking-tight mb-3">
            Shipping & Delivery Policy
          </h1>
          <p className="text-xs sm:text-sm text-theme-text-secondary-light dark:text-theme-text-secondary-dark max-w-2xl leading-relaxed">
            We deliver our handcrafted solid wood lamps to doorsteps nationwide across Pakistan through our trusted courier partner, M&amp;P Express Logistics.
          </p>
        </div>

        {/* 4 Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {highlights.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-5 rounded-lg border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark space-y-2.5 shadow-2xs hover:border-[#C59345]/50 transition-all"
              >
                <div className="w-9 h-9 rounded-md bg-[#C59345]/10 dark:bg-[#C59345]/20 flex items-center justify-center text-[#A8752B] dark:text-[#E5B568]">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-serif font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                  {item.title}
                </h3>
                <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark leading-relaxed">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Policy Sections */}
        <div className="space-y-6">
          <div className="border-b border-theme-border-light dark:border-theme-border-dark pb-3">
            <h2 className="text-xl font-serif font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
              Delivery Guidelines &amp; Terms
            </h2>
            <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark mt-0.5">
              Clear, transparent information about how your order is dispatched and delivered.
            </p>
          </div>

          <div className="space-y-4">
            {policyPoints.map((point, i) => (
              <div
                key={i}
                className="p-5 sm:p-6 rounded-lg border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark space-y-2 shadow-2xs"
              >
                <h3 className="text-sm sm:text-base font-serif font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#A8752B] dark:text-[#C59345] shrink-0" />
                  <span>{point.title}</span>
                </h3>
                <p className="text-xs sm:text-sm text-theme-text-secondary-light dark:text-theme-text-secondary-dark leading-relaxed pl-6">
                  {point.content}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Support & Tracking CTA */}
        <div className="p-6 sm:p-8 rounded-xl border border-[#C59345]/30 bg-theme-card-light dark:bg-theme-card-dark flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xs">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-base sm:text-lg font-serif font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
              Need assistance with your delivery?
            </h3>
            <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
              Our customer care team is available via WhatsApp, phone, and email to help track or coordinate your shipment.
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap justify-center shrink-0">
            <Link
              href="/track-order"
              className="no-theme-hover px-4 py-2.5 rounded-[2px] bg-[#B88636] hover:bg-[#A8752B] text-white !text-white hover:text-white text-xs font-semibold uppercase tracking-wider transition-all inline-flex items-center gap-1.5 shadow-2xs active:scale-95"
            >
              <span>Track Order</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/contact"
              className="px-4 py-2.5 rounded-[2px] border border-theme-border-light dark:border-theme-border-dark hover:border-[#C59345] bg-white dark:bg-[#1A120B] text-theme-text-primary-light dark:text-theme-text-primary-dark text-xs font-semibold uppercase tracking-wider transition-colors"
            >
              <span>Contact Care</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
