// app/(admin)/logistics/components/LogisticsKpiCards.tsx
"use client";

import { Truck, CheckCircle2, Clock, DollarSign } from "lucide-react";

interface ShippingService {
  _id: string;
  name: string;
  display_name: string;
  base_price: number;
  currency: string;
  is_active: boolean;
  estimated_days_min?: number;
  estimated_days_max?: number;
}

interface LogisticsKpiCardsProps {
  services: ShippingService[];
}

export default function LogisticsKpiCards({ services }: LogisticsKpiCardsProps) {
  const total = services.length;
  const active = services.filter((s) => s.is_active).length;
  const inactive = total - active;
  const prices = services.map((s) => s.base_price);
  const minPrice = prices.length ? Math.min(...prices) : 0;
  const maxPrice = prices.length ? Math.max(...prices) : 0;

  const cards = [
    {
      label: "Total Carrier Tiers",
      value: total,
      caption: "Available logistics routes",
      icon: Truck,
      badgeColor: "bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200",
    },
    {
      label: "Active Delivery Tiers",
      value: active,
      caption: "Enabled for checkout dispatch",
      icon: CheckCircle2,
      badgeColor: "bg-green-100 dark:bg-green-950/60 text-green-800 dark:text-green-300",
    },
    {
      label: "Disabled Routes",
      value: inactive,
      caption: "Temporarily offline",
      icon: Clock,
      badgeColor: "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300",
    },
    {
      label: "Carrier Tariff Range",
      value: total > 0 ? `Rs. ${minPrice} - ${maxPrice}` : "Rs. 0",
      caption: "Base freight pricing",
      icon: DollarSign,
      badgeColor: "bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300",
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
              {c.caption}
            </p>
          </div>
        );
      })}
    </div>
  );
}
