// app/(admin)/patrons/components/PatronAnalyticsRibbon.tsx
"use client";

import { Users, UserCheck, UserX, UserPlus, DollarSign, ShoppingBag } from "lucide-react";

interface PatronAnalyticsRibbonProps {
  stats: {
    totalCustomers: number;
    activeCustomers: number;
    bannedCustomers: number;
    newThisMonth: number;
    totalRevenue: number;
    averageOrderValue: number;
    registeredCustomers: number;
    guestCustomers: number;
  };
}

export default function PatronAnalyticsRibbon({ stats }: PatronAnalyticsRibbonProps) {
  const cards = [
    {
      label: "Total Patrons",
      value: stats.totalCustomers.toLocaleString(),
      subtext: `${stats.registeredCustomers} Members • ${stats.guestCustomers} Guests`,
      icon: Users,
      badgeColor: "bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200",
    },
    {
      label: "Active Store Patrons",
      value: stats.activeCustomers.toLocaleString(),
      subtext: "Eligible for ordering",
      icon: UserCheck,
      badgeColor: "bg-green-100 dark:bg-green-950/60 text-green-800 dark:text-green-300",
    },
    {
      label: "Acquisitions This Month",
      value: stats.newThisMonth.toLocaleString(),
      subtext: "New accounts created",
      icon: UserPlus,
      badgeColor: "bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300",
    },
    {
      label: "Lifetime Patron Volume",
      value: `Rs. ${Math.round(stats.totalRevenue).toLocaleString()}`,
      subtext: `Avg. Rs. ${Math.round(stats.averageOrderValue).toLocaleString()} / Patron`,
      icon: DollarSign,
      badgeColor: "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300",
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
              <span className="text-[11px] font-mono uppercase font-semibold text-theme-text-muted-light dark:text-theme-text-muted-dark">
                {c.label}
              </span>
              <div className={`p-1.5 rounded-lg ${c.badgeColor}`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-serif font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark">
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
