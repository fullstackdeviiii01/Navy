// app/dashboard/coupons/components/CouponManagementHeader.tsx
"use client";

import { Plus } from "lucide-react";

interface CouponManagementHeaderProps {
  onCreate: () => void;
}

export default function CouponManagementHeader({ onCreate }: CouponManagementHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
      <div>
        <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark">
          Coupon Management
        </h1>
        <p className="text-xs sm:text-sm text-theme-text-secondary-light dark:text-theme-text-secondary-dark mt-0.5 sm:mt-1">
          Create and manage discount coupons
        </p>
      </div>
      <button
        onClick={onCreate}
        aria-label="Create discount coupon"
        className="flex items-center justify-center sm:justify-start gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-theme-primary text-white rounded-lg hover:bg-theme-primary-hover transition-colors text-xs sm:text-sm"
      >
        <Plus size={14} className="sm:w-4 sm:h-4" />
        Create Coupon
      </button>
    </div>
  );
}