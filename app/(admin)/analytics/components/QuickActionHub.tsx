// app/(admin)/analytics/components/QuickActionHub.tsx
"use client";

import { useRouter } from "next/navigation";
import {
  Plus,
  ShoppingBag,
  Tag,
  Users,
  RotateCcw,
  Sliders,
  Store,
  ArrowUpRight,
} from "lucide-react";

export default function QuickActionHub() {
  const router = useRouter();

  const actions = [
    {
      label: "Add Product",
      description: "Create new luminaire listing",
      icon: Plus,
      href: "/admin/products/new",
      accent: "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900",
    },
    {
      label: "Process Orders",
      description: "Review pending shipments",
      icon: ShoppingBag,
      href: "/admin/orders",
      accent: "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300",
    },
    {
      label: "Add Coupon",
      description: "Launch discounts & promos",
      icon: Tag,
      href: "/admin/coupons",
      accent: "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300",
    },
    {
      label: "Customer List",
      description: "View customer accounts",
      icon: Users,
      href: "/admin/customers",
      accent: "bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300",
    },
    {
      label: "Returns & Refunds",
      description: "Manage customer returns",
      icon: RotateCcw,
      href: "/admin/returns",
      accent: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300",
    },
    {
      label: "Store Settings",
      description: "Update logo & contacts",
      icon: Sliders,
      href: "/admin/site-settings",
      accent: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
    },
  ];

  return (
    <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-2xl border border-theme-border-light dark:border-theme-border-dark p-5 sm:p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-theme-border-light/80 dark:border-theme-border-dark/80">
        <div>
          <h3 className="text-base font-serif font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
            Quick Actions
          </h3>
          <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark mt-0.5">
            Direct shortcuts to daily administrative workflows.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {actions.map((action, idx) => {
          const Icon = action.icon;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => router.push(action.href)}
              className="group p-3.5 rounded-xl border border-theme-border-light/80 dark:border-theme-border-dark/80 bg-theme-bg-light/50 dark:bg-theme-bg-dark/40 hover:border-neutral-900 dark:hover:border-neutral-100 transition-all text-left flex flex-col justify-between space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-lg ${action.accent} shadow-2xs`}>
                  <Icon className="w-4 h-4" />
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-theme-text-muted-light group-hover:text-theme-text-primary-light transition-colors opacity-0 group-hover:opacity-100" />
              </div>

              <div>
                <p className="text-xs font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark group-hover:text-theme-hover-light transition-colors">
                  {action.label}
                </p>
                <p className="text-[10px] text-theme-text-muted-light truncate mt-0.5">
                  {action.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
