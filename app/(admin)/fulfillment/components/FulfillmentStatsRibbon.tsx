// app/(admin)/fulfillment/components/FulfillmentStatsRibbon.tsx
"use client";

import {
  Clock,
  CheckCircle,
  Package,
  Truck,
  CheckCheck,
  XCircle,
} from "lucide-react";

interface FulfillmentStatsRibbonProps {
  stats: {
    total: number;
    pending: number;
    confirmed: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
  };
}

export default function FulfillmentStatsRibbon({ stats }: FulfillmentStatsRibbonProps) {
  const statItems = [
    {
      label: "All Orders",
      value: stats.total,
      icon: Package,
      badgeColor: "bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200",
    },
    {
      label: "Pending",
      value: stats.pending,
      icon: Clock,
      badgeColor: "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300",
    },
    {
      label: "Confirmed",
      value: stats.confirmed,
      icon: CheckCircle,
      badgeColor: "bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300",
    },
    {
      label: "Processing",
      value: stats.processing,
      icon: Package,
      badgeColor: "bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300",
    },
    {
      label: "In Transit",
      value: stats.shipped,
      icon: Truck,
      badgeColor: "bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300",
    },
    {
      label: "Delivered",
      value: stats.delivered,
      icon: CheckCheck,
      badgeColor: "bg-green-100 dark:bg-green-950/60 text-green-800 dark:text-green-300",
    },
    {
      label: "Cancelled",
      value: stats.cancelled,
      icon: XCircle,
      badgeColor: "bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
      {statItems.map((item, idx) => {
        const Icon = item.icon;
        return (
          <div
            key={idx}
            className="p-3.5 rounded-xl border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark space-y-1.5 shadow-xs"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-theme-text-muted-light dark:text-theme-text-muted-dark">
                {item.label}
              </span>
              <div className={`p-1 rounded-md ${item.badgeColor}`}>
                <Icon className="w-3 h-3" />
              </div>
            </div>
            <p className="text-xl font-serif font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark">
              {item.value}
            </p>
          </div>
        );
      })}
    </div>
  );
}
