// app/(admin)/curation/components/ReviewSentimentMetrics.tsx
"use client";

import { Star, CheckCircle, Clock, MessageSquareQuote } from "lucide-react";

interface ReviewSentimentMetricsProps {
  totalReviews: number;
  pendingCount: number;
  approvedCount: number;
}

export default function ReviewSentimentMetrics({
  totalReviews,
  pendingCount,
  approvedCount,
}: ReviewSentimentMetricsProps) {
  const cards = [
    {
      label: "Total Testimonials",
      value: totalReviews,
      caption: "All submitted reviews",
      icon: MessageSquareQuote,
      badgeColor: "bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200",
    },
    {
      label: "Pending Moderation",
      value: pendingCount,
      caption: "Awaiting approval audit",
      icon: Clock,
      badgeColor: "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300",
    },
    {
      label: "Approved & Live",
      value: approvedCount,
      caption: "Published on product dossiers",
      icon: CheckCircle,
      badgeColor: "bg-green-100 dark:bg-green-950/60 text-green-800 dark:text-green-300",
    },
    {
      label: "Curation Ratio",
      value: totalReviews > 0 ? `${Math.round((approvedCount / totalReviews) * 100)}%` : "100%",
      caption: "Approval percentage",
      icon: Star,
      badgeColor: "bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300",
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
