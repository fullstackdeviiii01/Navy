// app/components/orders/OrderStatusBadge.tsx
"use client";

import { Clock, Check, Package, Truck, Ban, RotateCcw } from "lucide-react";

interface OrderStatusBadgeProps {
  status: string;
}

export default function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const getStatusConfig = (st: string) => {
    const configs: Record<string, { icon: any; className: string; label: string }> = {
      pending: {
        icon: Clock,
        className: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30",
        label: "Pending",
      },
      confirmed: {
        icon: Check,
        className: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30",
        label: "Confirmed",
      },
      processing: {
        icon: Package,
        className: "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30",
        label: "Processing",
      },
      shipped: {
        icon: Truck,
        className: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/30",
        label: "Shipped",
      },
      delivered: {
        icon: Check,
        className: "bg-green-500/10 text-green-700 dark:text-green-300 border-green-500/30",
        label: "Delivered",
      },
      cancelled: {
        icon: Ban,
        className: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30",
        label: "Cancelled",
      },
      refunded: {
        icon: RotateCcw,
        className: "bg-neutral-500/10 text-neutral-700 dark:text-neutral-300 border-neutral-500/30",
        label: "Refunded",
      },
    };
    return configs[st] || configs.pending;
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 border text-[11px] uppercase tracking-wider font-semibold ${config.className}`}
      role="status"
      aria-label={`Order status: ${config.label}`}
    >
      <Icon className="w-3 h-3" aria-hidden="true" />
      <span>{config.label}</span>
    </span>
  );
}
