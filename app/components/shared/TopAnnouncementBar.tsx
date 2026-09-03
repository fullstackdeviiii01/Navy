// app/components/shared/TopAnnouncementBar.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Sparkles, Truck, ShieldCheck, Tag, ChevronLeft, ChevronRight, Check, Copy, Lamp } from "lucide-react";

interface ActiveCoupon {
  _id?: string;
  code: string;
  description?: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  min_order_amount?: number;
  applicable_to?: {
    type: "all" | "categories" | "products";
    category_ids?: string[];
    product_ids?: string[];
    categories?: { _id: string; name: string; slug: string }[];
    products?: { _id: string; name: string; slug: string }[];
  };
}

interface AnnouncementItem {
  id: string;
  icon: any;
  desktopText: string;
  mobileText: string;
  code?: string;
  link?: string;
}

export default function TopAnnouncementBar() {
  const [messages, setMessages] = useState<AnnouncementItem[]>([
    {
      id: "free-shipping",
      icon: Truck,
      desktopText: "Free Delivery Nationwide on Orders Above Rs. 15,000",
      mobileText: "Free Delivery Above Rs. 15,000",
      link: "/shipping-policy",
    },
    {
      id: "handmade",
      icon: Sparkles,
      desktopText: "100% Solid Natural Wood · Handcrafted & Lathe-Turned in Pakistan",
      mobileText: "100% Handcrafted Solid Wood",
      link: "/about",
    },
    {
      id: "home-lighting",
      icon: Lamp,
      desktopText: "Handcrafted Wooden Lighting, Made for Your Home",
      mobileText: "Handcrafted Wooden Lighting",
      link: "/products",
    },
  ]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  useEffect(() => {
    fetchActiveDiscounts();
  }, []);

  const fetchActiveDiscounts = async () => {
    try {
      const res = await fetch("/api/coupons/active", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      const coupons: ActiveCoupon[] = data.coupons || [];

      const dynamicList: AnnouncementItem[] = [
        {
          id: "free-shipping",
          icon: Truck,
          desktopText: "Free Delivery Nationwide on Orders Above Rs. 15,000",
          mobileText: "Free Delivery Above Rs. 15,000",
          link: "/shipping-policy",
        },
      ];

      // Add dynamic coupons from database with targeted collection links
      coupons.forEach((c) => {
        const discountVal =
          c.discount_type === "percentage"
            ? `${c.discount_value}% OFF`
            : `Rs. ${c.discount_value.toLocaleString()} OFF`;
        const minSpend =
          c.min_order_amount && c.min_order_amount > 0
            ? ` Over Rs. ${c.min_order_amount.toLocaleString()}`
            : "";

        let link = "/products";
        let desktopText = c.description
          ? `${c.description} — Use code ${c.code} for ${discountVal}${minSpend}`
          : `Special Offer: Use code ${c.code} for ${discountVal}${minSpend}`;
        let mobileText = `Use Code ${c.code} for ${discountVal}`;

        const hasCats = Boolean(c.applicable_to?.category_ids?.length && c.applicable_to.categories?.length);
        const hasProds = Boolean(c.applicable_to?.product_ids?.length && c.applicable_to.products?.length);

        if (hasCats && hasProds) {
          link = `/products?coupon=${c.code}`;
          desktopText = c.description
            ? `${c.description} — Use code ${c.code} for ${discountVal}${minSpend} →`
            : `Special Offer: Use code ${c.code} for ${discountVal} on Selected Collections & Pieces →`;
          mobileText = `Code ${c.code}: ${discountVal} OFF`;
        } else if (hasCats) {
          const cats = c.applicable_to!.categories!;
          const catSlugs = cats.map((cat) => cat.slug).join(",");
          const catNames = cats.map((cat) => cat.name).join(" & ");
          link = `/products?category=${catSlugs}`;
          desktopText = c.description
            ? `${c.description} — Use code ${c.code} for ${discountVal} on ${catNames} →`
            : `Special Offer: Use code ${c.code} for ${discountVal} on ${catNames} →`;
          mobileText = `${catNames}: Code ${c.code} (${discountVal})`;
        } else if (hasProds) {
          const prods = c.applicable_to!.products!;
          if (prods.length === 1) {
            const prod = prods[0];
            link = `/product/${prod.slug || prod._id}`;
            desktopText = c.description
              ? `${c.description} — Use code ${c.code} for ${discountVal} on ${prod.name} →`
              : `Special Offer: Use code ${c.code} for ${discountVal} on ${prod.name} →`;
            mobileText = `${prod.name}: Code ${c.code}`;
          } else {
            link = `/products?coupon=${c.code}`;
            const prodNames = prods.map((p) => p.name).slice(0, 2).join(" & ") + (prods.length > 2 ? " & more" : "");
            desktopText = c.description
              ? `${c.description} — Use code ${c.code} for ${discountVal} on ${prodNames} →`
              : `Special Offer: Use code ${c.code} for ${discountVal} on ${prodNames} →`;
            mobileText = `Code ${c.code}: ${discountVal} OFF`;
          }
        }

        dynamicList.push({
          id: `coupon-${c.code}`,
          icon: Tag,
          desktopText,
          mobileText,
          link,
          code: c.code,
        });
      });

      dynamicList.push(
        {
          id: "handmade",
          icon: Sparkles,
          desktopText: "100% Solid Natural Wood · Handcrafted & Lathe-Turned in Pakistan",
          mobileText: "100% Handcrafted Solid Wood",
          link: "/about",
        },
        {
          id: "home-lighting",
          icon: Lamp,
          desktopText: "Handcrafted Wooden Lighting, Made for Your Home",
          mobileText: "Handcrafted Wooden Lighting",
          link: "/products",
        }
      );

      setMessages(dynamicList);
    } catch (err) {
      console.error("Failed to load active promotions:", err);
    }
  };

  // Smooth Auto-slide timer
  useEffect(() => {
    if (isPaused || messages.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % messages.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [messages.length, isPaused]);

  const handleCopyCode = (code: string, e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(code);
    }
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2200);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + messages.length) % messages.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % messages.length);
  };

  // Touch Swipe Handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsPaused(true);
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    setIsPaused(false);
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative z-50 bg-[#E5E5E5] dark:bg-[#140E0A] text-[#241910] dark:text-[#F3E8D6] border-b border-[#9E8C75] dark:border-[#5A4638] h-7 sm:h-8 select-none overflow-hidden transition-colors"
      role="region"
      aria-label="Promotions and Announcements"
    >
      <div className="max-w-7xl mx-auto h-full px-2 sm:px-4 flex items-center justify-between gap-1 text-[9.5px] sm:text-[11px] font-mono tracking-[0.14em] uppercase">
        {/* Previous Button (Visible on sm+) */}
        <button
          type="button"
          onClick={handlePrev}
          className="p-1 text-[#C59345]/70 hover:text-[#A8752B] transition-colors focus:outline-none hidden sm:inline-flex items-center justify-center shrink-0"
          aria-label="Previous announcement"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        {/* Sliding Content Window */}
        <div className="flex-1 overflow-hidden h-full relative">
          <div
            className="flex h-full transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {messages.map((item, index) => {
              const Icon = item.icon || Sparkles;
              const isCurrent = index === currentIndex;

              return (
                <div
                  key={item.id || index}
                  className="w-full shrink-0 h-full flex items-center justify-center text-center px-1 sm:px-2 gap-1.5 sm:gap-2 font-medium"
                  aria-hidden={!isCurrent}
                >
                  <Icon className="w-3 h-3 text-[#C59345] shrink-0" />

                  {item.link ? (
                    <Link
                      href={item.link}
                      className="hover:text-[#A8752B] transition-colors truncate max-w-[85vw] sm:max-w-none text-left sm:text-center"
                    >
                      <span className="sm:hidden">{item.mobileText}</span>
                      <span className="hidden sm:inline">{item.desktopText}</span>
                    </Link>
                  ) : (
                    <div className="truncate max-w-[70vw] sm:max-w-none text-left sm:text-center">
                      <span className="sm:hidden">{item.mobileText}</span>
                      <span className="hidden sm:inline">{item.desktopText}</span>
                    </div>
                  )}

                  {item.code && (
                    <button
                      type="button"
                      onClick={(e) => handleCopyCode(item.code!, e)}
                      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[2px] text-[8.5px] sm:text-[9.5px] font-mono tracking-wider font-semibold border transition-all active:scale-95 shrink-0 ${
                        copiedCode === item.code
                          ? "bg-emerald-600 border-emerald-500 text-white"
                          : "bg-[#C59345]/15 hover:bg-[#C59345]/25 border-[#C59345]/40 text-[#A8752B]"
                      }`}
                      title="Tap to copy promo code"
                    >
                      {copiedCode === item.code ? (
                        <>
                          <Check className="w-2.5 h-2.5" />
                          <span>COPIED!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-2.5 h-2.5 opacity-80" />
                          <span>{item.code}</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Next Button (Visible on sm+) */}
        <button
          type="button"
          onClick={handleNext}
          className="p-1 text-[#C5A265]/60 hover:text-[#F3BE6C] transition-colors focus:outline-none hidden sm:inline-flex items-center justify-center shrink-0"
          aria-label="Next announcement"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
