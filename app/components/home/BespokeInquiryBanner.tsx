// app/components/home/BespokeInquiryBanner.tsx
"use client";

import Link from "next/link";
import { ChevronsRight, Clock, MessageSquare, ShieldCheck, Mail, MapPin } from "lucide-react";

export default function BespokeInquiryBanner() {
  const consultationPillars = [
    {
      num: "01",
      title: "Lumen & Warmth Advisory",
      desc: "Tailored recommendations on 2700K ambient glow, beam dispersion, and task brightness.",
    },
    {
      num: "02",
      title: "Architectural Proportions",
      desc: "Custom cord drop lengths, ceiling canopy sizes, and table-to-luminaire scale matching.",
    },
    {
      num: "03",
      title: "Direct Studio Access",
      desc: "Connect directly with our master woodturners and metal crafters for project guidance.",
    },
  ];

  return (
    <section className="bg-theme-bg-light dark:bg-theme-bg-dark border-t border-theme-border-light dark:border-theme-border-dark py-8 sm:py-10 md:py-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          
          {/* LEFT: Studio Advisory Card (5 Cols) */}
          <div className="lg:col-span-5 p-8 sm:p-10 border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark flex flex-col justify-between space-y-8 relative overflow-hidden">
            {/* Architectural Watermark Accent */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

            <div className="relative z-10 space-y-6">
              <div className="flex items-center justify-between border-b border-theme-border-light/60 dark:border-theme-border-dark/60 pb-4">
                <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-theme-hover-light dark:text-theme-hover-dark font-medium">
                  STUDIO CONCIERGE
                </span>
                <span className="font-mono text-[10px] uppercase tracking-wider text-theme-text-muted-light dark:text-theme-text-muted-dark">
                  AVAILABLE 7 DAYS
                </span>
              </div>

              <div className="space-y-3">
                <h3 className="text-2xl sm:text-3xl font-serif text-theme-text-primary-light dark:text-theme-text-primary-dark leading-snug">
                  Personal Lighting Advisory
                </h3>
                <p className="text-xs sm:text-sm text-theme-text-secondary-light dark:text-theme-text-secondary-dark leading-relaxed">
                  Choosing the right luminaire depends on room acoustics, ceiling height, and surface textures. Our studio team assists you in selecting the ideal fixture.
                </p>
              </div>

              {/* Quick Studio Stats */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3 text-xs text-theme-text-primary-light dark:text-theme-text-primary-dark">
                  <Clock className="w-4 h-4 text-theme-hover-light dark:text-theme-hover-dark shrink-0" />
                  <span className="font-mono text-[11px] uppercase tracking-wider">Average inquiry response: Under 2 hours</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-theme-text-primary-light dark:text-theme-text-primary-dark">
                  <Mail className="w-4 h-4 text-theme-hover-light dark:text-theme-hover-dark shrink-0" />
                  <span className="font-mono text-[11px] uppercase tracking-wider">Direct craftsman consultation</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-theme-text-primary-light dark:text-theme-text-primary-dark">
                  <ShieldCheck className="w-4 h-4 text-theme-hover-light dark:text-theme-hover-dark shrink-0" />
                  <span className="font-mono text-[11px] uppercase tracking-wider">Complimentary space advice</span>
                </div>
              </div>
            </div>

            <div className="relative z-10 pt-6 border-t border-theme-border-light/60 dark:border-theme-border-dark/60">
              <Link
                href="/contact"
                className="inline-flex items-center justify-between w-full px-6 py-4 bg-theme-primary hover:bg-theme-hover-light dark:hover:bg-theme-hover-dark text-theme-btn-text text-xs uppercase tracking-[0.2em] font-medium transition-colors"
                aria-label="Start a lighting consultation on our contact page"
              >
                <span>START A CONVERSATION</span>
                <ChevronsRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* RIGHT: 3 Consultation Pillars & Project Narrative (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
            <div>
              <span className="text-xs font-medium tracking-[0.25em] uppercase text-theme-hover-light dark:text-theme-hover-dark block mb-2">
                PROJECTS & BESPOKE INQUIRIES
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif text-theme-text-primary-light dark:text-theme-text-primary-dark leading-tight mb-4">
                Have a specific room in mind?{" "}
                <span className="italic font-normal font-serif text-theme-hover-light dark:text-theme-hover-dark">
                  Let us tailor the light.
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-theme-text-secondary-light dark:text-theme-text-secondary-dark leading-relaxed max-w-2xl">
                Whether you are outfitting an entire residence, sourcing fixtures for a dining table, or seeking bespoke timber finishes to complement architectural millwork, we work closely with homeowners and architects.
              </p>
            </div>

            {/* 3 Numbered Consultation Pillars */}
            <div className="grid grid-cols-1 gap-4 pt-2">
              {consultationPillars.map((pillar) => (
                <div
                  key={pillar.num}
                  className="p-5 sm:p-6 border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:border-theme-hover-light transition-colors"
                >
                  <div className="flex items-start sm:items-center gap-4">
                    <span className="font-mono text-xs font-bold text-theme-hover-light dark:text-theme-hover-dark px-2.5 py-1 bg-theme-card-light dark:bg-theme-card-dark border border-theme-border-light dark:border-theme-border-dark shrink-0">
                      {pillar.num}
                    </span>
                    <div>
                      <h4 className="text-sm sm:text-base font-serif font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark">
                        {pillar.title}
                      </h4>
                      <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark mt-0.5 leading-relaxed">
                        {pillar.desc}
                      </p>
                    </div>
                  </div>

                  <Link
                    href="/contact"
                    className="text-[11px] font-mono uppercase tracking-wider text-theme-hover-light dark:text-theme-hover-dark font-medium shrink-0 inline-flex items-center gap-1 group-hover:underline self-end sm:self-auto"
                  >
                    <span>ASK ABOUT THIS</span>
                    <ChevronsRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
