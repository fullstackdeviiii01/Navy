// app/(admin)/components/orders/OrderStatusBadge.tsx
"use client";

import { Clock, CheckCircle, Package, Truck, Ban } from "lucide-react";

interface OrderStatusBadgeProps {
  status: string;
}

export default function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    const configs: any = {
      pending: {
        icon: Clock,
        color: "text-yellow-800 dark:text-yellow-200",
        bg: "bg-yellow-100 dark:bg-yellow-900",
        label: "Pending",
      },
      confirmed: {
        icon: CheckCircle,
        color: "text-blue-800 dark:text-blue-200",
        bg: "bg-blue-100 dark:bg-blue-900",
        label: "Confirmed",
      },
      processing: {
        icon: Package,
        color: "text-purple-800 dark:text-purple-200",
        bg: "bg-purple-100 dark:bg-purple-900",
        label: "Processing",
      },
      shipped: {
        icon: Truck,
        color: "text-indigo-800 dark:text-indigo-200",
        bg: "bg-indigo-100 dark:bg-indigo-900",
        label: "Shipped",
      },
      delivered: {
        icon: CheckCircle,
        color: "text-green-800 dark:text-green-200",
        bg: "bg-green-100 dark:bg-green-900",
        label: "Delivered",
      },
      cancelled: {
        icon: Ban,
        color: "text-red-800 dark:text-red-200",
        bg: "bg-red-100 dark:bg-red-900",
        label: "Cancelled",
      },
    };
    return configs[status] || configs.pending;
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.color}`}
    >
      <Icon size={12} className="mr-1" />
      {config.label}
    </span>
  );
}
