// app/(admin)/promotions/components/PromotionStatsCards.tsx
"use client";

import { Tag, Sparkles, Percent, CheckCircle2 } from "lucide-react";

interface Coupon {
  _id: string;
  is_active: boolean;
  used_count: number;
  discount_type: "percentage" | "fixed";
  discount_value: number;
}

interface PromotionStatsCardsProps {
  coupons: Coupon[];
}

export default function PromotionStatsCards({ coupons }: PromotionStatsCardsProps) {
  const total = coupons.length;
  const active = coupons.filter((c) => c.is_active).length;
  const totalRedemptions = coupons.reduce((sum, c) => sum + (c.used_count || 0), 0);
  const percentageCoupons = coupons.filter((c) => c.discount_type === "percentage").length;

  const cards = [
    {
      label: "Total Coupons",
      value: total,
      subtext: "Created coupons",
      icon: Tag,
      badgeColor: "bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200",
    },
    {
      label: "Active Coupons",
      value: active,
      subtext: "Available at checkout",
      icon: CheckCircle2,
      badgeColor: "bg-green-100 dark:bg-green-950/60 text-green-800 dark:text-green-300",
    },
    {
      label: "Times Used",
      value: totalRedemptions.toLocaleString(),
      subtext: "Total orders discounted",
      icon: Sparkles,
      badgeColor: "bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300",
    },
    {
      label: "Percentage Discounts",
      value: percentageCoupons,
      subtext: "Percentage off offers",
      icon: Percent,
      badgeColor: "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <div
            key={i}
            className="p-4 rounded-xl border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark space-y-1.5 shadow-xs"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase font-semibold text-theme-text-muted-light dark:text-theme-text-muted-dark">
                {c.label}
              </span>
              <div className={`p-1.5 rounded-lg ${c.badgeColor}`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark">
              {c.value}
            </p>
            <p className="text-[11px] text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
              {c.subtext}
            </p>
          </div>
        );
      })}
    </div>
  );
}
