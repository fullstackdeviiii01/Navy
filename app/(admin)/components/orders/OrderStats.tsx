import React from 'react';
import { Package, Clock, CheckCircle, Truck, Ban } from "lucide-react";

interface OrderStatsProps {
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

export function OrderStats({ stats }: OrderStatsProps) {
  const statCards = [
    {
      label: "Pending",
      value: stats.pending,
      icon: Clock,
      color: "text-yellow-600 dark:text-yellow-400",
      bg: "bg-yellow-50 dark:bg-yellow-950/30",
      border: "border-yellow-200 dark:border-yellow-800",
    },
    {
      label: "Processing",
      value: stats.processing + stats.confirmed,
      icon: Package,
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-50 dark:bg-purple-950/30",
      border: "border-purple-200 dark:border-purple-800",
    },
    {
      label: "Shipped",
      value: stats.shipped,
      icon: Truck,
      color: "text-indigo-600 dark:text-indigo-400",
      bg: "bg-indigo-50 dark:bg-indigo-950/30",
      border: "border-indigo-200 dark:border-indigo-800",
    },
    {
      label: "Delivered",
      value: stats.delivered,
      icon: CheckCircle,
      color: "text-green-600 dark:text-green-400",
      bg: "bg-green-50 dark:bg-green-950/30",
      border: "border-green-200 dark:border-green-800",
    },
    {
      label: "Cancelled",
      value: stats.cancelled,
      icon: Ban,
      color: "text-red-600 dark:text-red-400",
      bg: "bg-red-50 dark:bg-red-950/30",
      border: "border-red-200 dark:border-red-800",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className={`rounded-xl border ${stat.border} bg-theme-surface-light dark:bg-theme-surface-dark shadow p-2 sm:p-3 lg:p-4`}
          >
            <div className="flex items-center gap-4 mb-1">
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                {stat.label}
              </p>
            </div>
            <p className={`text-3xl font-bold ${stat.color}`}>
              {stat.value}
            </p>
          </div>
        );
      })}
    </div>
  );
}