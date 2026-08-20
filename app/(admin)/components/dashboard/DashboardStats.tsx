// app/(admin)/components/dashboard/DashboardStats.tsx
"use client";

import { 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Package 
} from "lucide-react";

interface DashboardStatsProps {
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

export default function DashboardStats({ stats }: DashboardStatsProps) {
  const statCards = [
    {
      title: "Total Revenue",
      value: `$${Math.round(stats.totalRevenue).toLocaleString()}`,
      growth: stats.revenueGrowth,
      icon: DollarSign,
      lightBg: "bg-green-50 dark:bg-green-900/20",
      darkText: "text-green-600 dark:text-green-400",
    },
    {
      title: "Total Orders",
      value: stats.totalOrders.toLocaleString(),
      growth: stats.ordersGrowth,
      icon: ShoppingCart,
      lightBg: "bg-blue-50 dark:bg-blue-900/20",
      darkText: "text-blue-600 dark:text-blue-400",
    },
    {
      title: "Total Customers",
      value: stats.totalCustomers.toLocaleString(),
      growth: stats.customersGrowth,
      icon: Users,
      lightBg: "bg-purple-50 dark:bg-purple-900/20",
      darkText: "text-purple-600 dark:text-purple-400",
    },
    {
      title: "Active Products",
      value: stats.activeProducts.toLocaleString(),
      growth: stats.productsGrowth,
      icon: Package,
      lightBg: "bg-orange-50 dark:bg-orange-900/20",
      darkText: "text-orange-600 dark:text-orange-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {statCards.map((card, index) => {
        const Icon = card.icon;

        return (
          <div
            key={index}
            className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg sm:rounded-xl shadow-sm border border-theme-border-light dark:border-theme-border-dark p-3 sm:p-4 hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <div className={`p-1.5 sm:p-2 rounded-lg ${card.lightBg}`}>
                <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${card.darkText}`} aria-hidden="true" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-theme-text-secondary-light dark:text-theme-text-muted-dark truncate">
                  {card.title}
                </p>
                <p className="text-base sm:text-xl font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark truncate">
                  {card.value}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
