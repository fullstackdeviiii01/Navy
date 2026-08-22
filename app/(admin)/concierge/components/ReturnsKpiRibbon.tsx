// app/(admin)/concierge/components/ReturnsKpiRibbon.tsx
"use client";

import { RotateCcw, Clock, CheckCircle, XCircle, DollarSign } from "lucide-react";

interface ReturnsKpiRibbonProps {
  stats: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    refunded: number;
  };
}

export default function ReturnsKpiRibbon({ stats }: ReturnsKpiRibbonProps) {
  const cards = [
    {
      label: "Total Requests",
      value: stats.total,
      caption: "All return claims",
      icon: RotateCcw,
      badgeColor: "bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200",
    },
    {
      label: "Pending Review",
      value: stats.pending,
      caption: "Awaiting inspection",
      icon: Clock,
      badgeColor: "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300",
    },
    {
      label: "Authorized",
      value: stats.approved,
      caption: "Approved return labels",
      icon: CheckCircle,
      badgeColor: "bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300",
    },
    {
      label: "Refunded Settled",
      value: stats.refunded,
      caption: "Reimbursed to patrons",
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
              {c.caption}
            </p>
          </div>
        );
      })}
    </div>
  );
}
