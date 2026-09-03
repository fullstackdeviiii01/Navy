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
    <section className="relative w-full bg-[#120D09] text-[#F3E8D6] py-3 sm:py-4 md:py-6 border-y border-[#3A2A1D] transition-colors select-none">
      <div className="max-w-7xl mx-auto px-1.5 xs:px-2.5 sm:px-6 lg:px-8">
        <div className="grid grid-cols-5 gap-1 sm:gap-3 md:gap-4 lg:gap-6 items-center justify-between">
          {trustPillars.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="flex flex-col sm:flex-row items-center text-center sm:text-left gap-1 sm:gap-2.5 md:gap-3 p-0.5 sm:p-1 transition-transform duration-200 hover:scale-[1.02] min-w-0"
              >
                {/* Gold Icon Badge */}
                <div className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-full bg-[#C59345]/15 border border-[#C59345]/40 flex items-center justify-center text-[#C59345] shrink-0 shadow-sm">
                  <Icon className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4" />
                </div>

                {/* Text Typography */}
                <div className="min-w-0 w-full sm:w-auto">
                  <h4 className="text-[6.5px] xs:text-[7.5px] sm:text-[10px] md:text-[11.5px] font-serif font-bold uppercase tracking-tight sm:tracking-[0.12em] text-white leading-[1.1] sm:leading-normal text-center sm:text-left line-clamp-2 sm:truncate">
                    {item.title}
                  </h4>
                  <p className="text-[5.5px] xs:text-[6.5px] sm:text-[9px] md:text-[10.5px] font-sans text-[#A89B8C] leading-[1.1] sm:leading-normal text-center sm:text-left line-clamp-1 sm:truncate mt-0.5">
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
