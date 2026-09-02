// app/components/home/BrandTrustBar.tsx
"use client";

import React from "react";
import { Sparkles, Hammer, Leaf, ShieldCheck, Truck } from "lucide-react";

export default function BrandTrustBar() {
  const trustPillars = [
    {
      icon: Sparkles,
      title: "PREMIUM QUALITY",
      subtitle: "Finest Natural Wood",
    },
    {
      icon: Hammer,
      title: "HANDMADE",
      subtitle: "Crafted by Experts",
    },
    {
      icon: Leaf,
      title: "ECO FRIENDLY",
      subtitle: "Sustainable Materials",
    },
    {
      icon: ShieldCheck,
      title: "SECURE PAYMENT",
      subtitle: "100% Protected",
    },
    {
      icon: Truck,
      title: "FAST DELIVERY",
      subtitle: "On All Orders",
    },
  ];

  return (
    <section className="relative w-full bg-[#120D09] text-[#F3E8D6] py-4 sm:py-5 md:py-6 border-y border-[#3A2A1D] transition-colors select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6 items-center justify-center">
          {trustPillars.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="flex items-center gap-2.5 sm:gap-3 p-1 transition-transform duration-200 hover:scale-[1.02]"
              >
                {/* Gold Icon Badge */}
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#C59345]/15 border border-[#C59345]/40 flex items-center justify-center text-[#C59345] shrink-0 shadow-sm">
                  <Icon className="w-4 h-4" />
                </div>

                {/* Text Typography */}
                <div className="min-w-0">
                  <h4 className="text-[10.5px] sm:text-[11.5px] font-serif font-bold uppercase tracking-[0.12em] text-white truncate">
                    {item.title}
                  </h4>
                  <p className="text-[9.5px] sm:text-[10.5px] font-sans text-[#A89B8C] truncate mt-0.5">
                    {item.subtitle}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
