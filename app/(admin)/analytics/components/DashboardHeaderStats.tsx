// app/(admin)/analytics/components/DashboardHeaderStats.tsx
"use client";

import { DollarSign, ShoppingBag, Users, Package } from "lucide-react";

interface DashboardHeaderStatsProps {
  stats: {
    totalRevenue: number;
    totalOrders: number;
    totalCustomers: number;
    activeProducts: number;
  };
}

export default function DashboardHeaderStats({ stats }: DashboardHeaderStatsProps) {
  const cards = [
    {
      title: "Total Revenue (Rs)",
      value: (stats.totalRevenue || 0).toLocaleString(),
      icon: DollarSign,
      accent: "from-emerald-500/10 to-transparent",
      badgeColor: "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300",
    },
    {
      title: "Total Orders",
      value: (stats.totalOrders || 0).toLocaleString(),
      icon: ShoppingBag,
      accent: "from-blue-500/10 to-transparent",
      badgeColor: "bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300",
    },
    {
      title: "Total Customers",
      value: (stats.totalCustomers || 0).toLocaleString(),
      icon: Users,
      accent: "from-purple-500/10 to-transparent",
      badgeColor: "bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300",
    },
    {
      title: "Active Products",
      value: (stats.activeProducts || 0).toLocaleString(),
      icon: Package,
      accent: "from-amber-500/10 to-transparent",
      badgeColor: "bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;

        return (
          <div
            key={idx}
            className="relative overflow-hidden p-5 rounded-2xl border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark shadow-xs hover:shadow-md transition-all duration-300 group"
          >
            {/* Ambient Background Gradient Accent */}
            <div
              className={`absolute inset-0 bg-gradient-to-br ${card.accent} opacity-40 group-hover:opacity-70 transition-opacity pointer-events-none`}
            />

            <div className="relative z-10 flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-theme-text-muted-light dark:text-theme-text-muted-dark">
                {card.title}
              </span>
              <div className={`p-2 rounded-xl ${card.badgeColor} shadow-2xs`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="relative z-10">
              <p className="text-2xl sm:text-3xl font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark tracking-tight">
                {card.value}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
