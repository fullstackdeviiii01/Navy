// app/(admin)/analytics/components/RevenueVelocityMetrics.tsx
"use client";

import { DollarSign, ShoppingCart, Users, Package, TrendingUp, TrendingDown } from "lucide-react";

interface RevenueVelocityMetricsProps {
  stats: {
    totalRevenue: number;
    totalOrders: number;
    totalCustomers: number;
    activeProducts: number;
    revenueGrowth: number;
    ordersGrowth: number;
    customersGrowth: number;
    productsGrowth: number;
  };
}

export default function RevenueVelocityMetrics({ stats }: RevenueVelocityMetricsProps) {
  const statCards = [
    {
      title: "Gross Revenue",
      value: `Rs. ${Math.round(stats.totalRevenue).toLocaleString()}`,
      growth: stats.revenueGrowth,
      icon: DollarSign,
      caption: "Consolidated sales volume",
    },
    {
      title: "Orders Volume",
      value: stats.totalOrders.toLocaleString(),
      growth: stats.ordersGrowth,
      icon: ShoppingCart,
      caption: "Delivered & in-transit orders",
    },
    {
      title: "Client Roster",
      value: stats.totalCustomers.toLocaleString(),
      growth: stats.customersGrowth,
      icon: Users,
      caption: "Registered & guest patrons",
    },
    {
      title: "Active Catalog",
      value: stats.activeProducts.toLocaleString(),
      growth: stats.productsGrowth,
      icon: Package,
      caption: "Live luminaire listings",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
      {statCards.map((card, index) => {
        const Icon = card.icon;
        const isPositive = (card.growth ?? 0) >= 0;

        return (
          <div
            key={index}
            className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-xl border border-theme-border-light dark:border-theme-border-dark p-4 shadow-xs hover:shadow-md transition-all space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase font-semibold text-theme-text-muted-light dark:text-theme-text-muted-dark tracking-wider">
                {card.title}
              </span>
              <div className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800/80 text-neutral-800 dark:text-neutral-200 group-hover:bg-neutral-900 group-hover:text-white dark:group-hover:bg-neutral-100 dark:group-hover:text-neutral-900 transition-colors">
                <Icon className="h-4 w-4" />
              </div>
            </div>

            <div>
              <p className="text-xl sm:text-2xl font-serif font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark truncate">
                {card.value}
              </p>
              <div className="flex items-center gap-1.5 mt-1">
                {typeof card.growth === "number" && (
                  <span
                    className={`inline-flex items-center text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                      isPositive
                        ? "bg-green-100 dark:bg-green-950/60 text-green-800 dark:text-green-300"
                        : "bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300"
                    }`}
                  >
                    {isPositive ? <TrendingUp className="w-2.5 h-2.5 mr-0.5" /> : <TrendingDown className="w-2.5 h-2.5 mr-0.5" />}
                    {isPositive ? `+${card.growth}%` : `${card.growth}%`}
                  </span>
                )}
                <span className="text-[11px] text-theme-text-secondary-light dark:text-theme-text-secondary-dark truncate">
                  {card.caption}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
