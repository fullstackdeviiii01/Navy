// app/(admin)/components/customers/CustomerStatsCards.tsx
"use client";

import { FaUserCheck, FaBan, FaUserPlus, FaDollarSign, FaUser, FaUserSecret } from "react-icons/fa";

interface Stats {
  totalCustomers: number;
  activeCustomers: number;
  bannedCustomers: number;
  newThisMonth: number;
  totalRevenue: number;
  averageOrderValue: number;
  registeredCustomers: number;
  guestCustomers: number;
}

interface CustomerStatsCardsProps {
  stats: Stats;
}

export default function CustomerStatsCards({ stats }: CustomerStatsCardsProps) {
  const statsCards = [
    {
      title: "Registered",
      value: stats.registeredCustomers,
      icon: FaUser,
      color: "blue",
      bgColor: "bg-blue-100 dark:bg-blue-900",
      iconColor: "text-blue-600 dark:text-blue-400",
      textColor: "text-blue-600 dark:text-blue-400",
    },
    {
      title: "Guest",
      value: stats.guestCustomers,
      icon: FaUserSecret,
      color: "purple",
      bgColor: "bg-purple-100 dark:bg-purple-900",
      iconColor: "text-purple-600 dark:text-purple-400",
      textColor: "text-purple-600 dark:text-purple-400",
    },
    {
      title: "Active Customers",
      value: stats.activeCustomers,
      icon: FaUserCheck,
      color: "green",
      bgColor: "bg-green-100 dark:bg-green-900",
      iconColor: "text-green-600 dark:text-green-400",
      textColor: "text-green-600 dark:text-green-400",
    },
    {
      title: "New This Month",
      value: stats.newThisMonth,
      icon: FaUserPlus,
      color: "indigo",
      bgColor: "bg-indigo-100 dark:bg-indigo-900",
      iconColor: "text-indigo-600 dark:text-indigo-400",
      textColor: "text-indigo-600 dark:text-indigo-400",
    },
    {
      title: "Total Revenue",
      value: `$${stats.totalRevenue.toFixed(2)}`,
      icon: FaDollarSign,
      color: "yellow",
      bgColor: "bg-yellow-100 dark:bg-yellow-900",
      iconColor: "text-yellow-600 dark:text-yellow-400",
      textColor: "text-yellow-600 dark:text-yellow-400",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 lg:gap-4">
      {statsCards.map((stat, index) => (
        <div
          key={index}
          className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg shadow border border-theme-border-light dark:border-theme-border-dark p-3 sm:p-4 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-theme-text-secondary-light dark:text-theme-text-muted-dark truncate">
                {stat.title}
              </p>
              <p
                className={`text-base sm:text-lg lg:text-xl font-bold ${stat.textColor} mt-0.5 sm:mt-1 break-words`}
              >
                {stat.value}
              </p>
            </div>
            <div
              className={`p-1.5 sm:p-2 lg:p-2.5 rounded-full ${stat.bgColor} flex-shrink-0 ml-2`}
            >
              <stat.icon
                className={`h-3.5 w-3.5 sm:h-4 sm:w-4 lg:h-5 lg:w-5 ${stat.iconColor}`}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}