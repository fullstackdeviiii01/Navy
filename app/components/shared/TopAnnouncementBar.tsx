// app/components/shared/TopAnnouncementBar.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles, Truck, ShieldCheck, Tag, ChevronLeft, ChevronRight } from "lucide-react";

interface ActiveCoupon {
  _id?: string;
  code: string;
  description?: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  min_order_amount?: number;
}

export default function TopAnnouncementBar() {
  const [messages, setMessages] = useState<
    Array<{ id: string; icon: any; text: string; code?: string; link?: string }>
  >([
    {
      id: "free-shipping",
      icon: Truck,
      text: "Free Delivery on all orders above Rs. 15,000",
      link: "/shipping-policy",
    },
    {
      id: "handmade",
      icon: Sparkles,
      text: "100% Solid Wood · Handcrafted & Lathe-Turned in Pakistan",
      link: "/about",
    },
    {
      id: "warranty",
      icon: ShieldCheck,
      text: "7-Day Transit Damage Guarantee & 1-Year Structural Warranty",
      link: "/refund-policy",
    },
  ]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    fetchActiveDiscounts();
  }, []);

  const fetchActiveDiscounts = async () => {
    try {
      const res = await fetch("/api/coupons/active", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      const coupons: ActiveCoupon[] = data.coupons || [];

      const dynamicList: Array<{ id: string; icon: any; text: string; code?: string; link?: string }> = [
        {
          id: "free-shipping",
          icon: Truck,
          text: "Free Delivery on all orders above Rs. 15,000",
          link: "/shipping-policy",
        },
      ];

      // Add each dynamic coupon from database
      coupons.forEach((c) => {
        const discountText =
          c.discount_type === "percentage"
            ? `${c.discount_value}% OFF`
            : `Rs. ${c.discount_value.toLocaleString()} OFF`;
        const minSpendText =
          c.min_order_amount && c.min_order_amount > 0
            ? ` on orders over Rs. ${c.min_order_amount.toLocaleString()}`
            : "";

        dynamicList.push({
          id: `coupon-${c.code}`,
          icon: Tag,
          text: c.description
            ? `${c.description} — Use code ${c.code} for ${discountText}${minSpendText}`
            : `Special Offer: Use code ${c.code} for ${discountText}${minSpendText}`,
          code: c.code,
        });
      });

      dynamicList.push(
        {
          id: "handmade",
          icon: Sparkles,
          text: "100% Solid Wood · Handcrafted & Lathe-Turned by Master Artisans",
          link: "/about",
        },
        {
          id: "warranty",
          icon: ShieldCheck,
          text: "7-Day Transit Damage Replacement Guarantee & Free Returns",
          link: "/refund-policy",
        }
      );

      setMessages(dynamicList);
    } catch (err) {
      console.error("Failed to load active promotions:", err);
    }
  };

  // Auto-slide effect
  useEffect(() => {
    if (isPaused || messages.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % messages.length);
    }, 4200);
    return () => clearInterval(timer);
  }, [messages.length, isPaused]);

  const handleCopyCode = (code: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const currentMsg = messages[currentIndex] || messages[0];
  const IconComponent = currentMsg?.icon || Sparkles;

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative z-50 bg-[#1E1610] dark:bg-[#140E0A] text-[#F3E8D6] border-b border-[#8A5E22]/20 py-1.5 px-3 sm:px-4 select-none overflow-hidden transition-colors"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 text-[10px] sm:text-[11.5px] font-medium tracking-[0.16em] uppercase">
        {/* Previous Button */}
        <button
          type="button"
          onClick={() => setCurrentIndex((prev) => (prev - 1 + messages.length) % messages.length)}
          className="p-0.5 text-[#C5A265]/60 hover:text-[#F3BE6C] transition-colors focus:outline-none hidden sm:inline-flex"
          aria-label="Previous announcement"
        >
          <ChevronLeft className="w-3 h-3" />
        </button>

        {/* Center Sliding Content */}
        <div className="flex-1 flex items-center justify-center text-center overflow-hidden min-h-[20px]">
          <div
            key={currentMsg.id}
            className="inline-flex items-center justify-center gap-1.5 sm:gap-2 animate-in fade-in slide-in-from-bottom-1 duration-300"
          >
            <IconComponent className="w-3 h-3 text-[#F3BE6C] shrink-0" />

            {currentMsg.link ? (
              <Link
                href={currentMsg.link}
                className="hover:text-[#F3BE6C] transition-colors line-clamp-1 underline-offset-4 hover:underline"
              >
                {currentMsg.text}
              </Link>
            ) : (
              <span className="line-clamp-1">{currentMsg.text}</span>
            )}

            {currentMsg.code && (
              <button
                type="button"
                onClick={(e) => handleCopyCode(currentMsg.code!, e)}
                className="inline-flex items-center gap-1 bg-[#8A5E22]/30 hover:bg-[#8A5E22]/60 border border-[#F3BE6C]/40 text-[#F3BE6C] px-1.5 py-0.5 rounded-[3px] text-[9.5px] font-mono tracking-normal lowercase normal-case transition-all active:scale-95 ml-1"
                title="Click to copy promo code"
              >
                <span>{copiedCode === currentMsg.code ? "Copied!" : currentMsg.code}</span>
              </button>
            )}
          </div>
        </div>

        {/* Next Button */}
        <button
          type="button"
          onClick={() => setCurrentIndex((prev) => (prev + 1) % messages.length)}
          className="p-0.5 text-[#C5A265]/60 hover:text-[#F3BE6C] transition-colors focus:outline-none hidden sm:inline-flex"
          aria-label="Next announcement"
        >
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
