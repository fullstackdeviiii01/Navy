// app/dashboard/coupons/components/CouponFormSections/UsageLimitsForm.tsx
"use client";

interface UsageLimitsFormProps {
  usageLimit: number | null;
  perUserLimit: number;
  onUsageLimitChange: (value: number | null) => void;
  onPerUserLimitChange: (value: number) => void;
}

export default function UsageLimitsForm({
  usageLimit,
  perUserLimit,
  onUsageLimitChange,
  onPerUserLimitChange,
}: UsageLimitsFormProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
      <div>
        <label htmlFor="total-usage-limit" className="block text-xs sm:text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1 sm:mb-2">
          Total Usage Limit
        </label>
        <input
          id="total-usage-limit"
          type="number"
          value={usageLimit || ""}
          onChange={(e) => onUsageLimitChange(e.target.value ? parseInt(e.target.value) : null)}
          min="1"
          placeholder="Unlimited"
          className="w-full px-2 sm:px-4 py-1.5 sm:py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary"
        />
      </div>

      <div>
        <label htmlFor="per-user-limit" className="block text-xs sm:text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1 sm:mb-2">
          Per User Limit *
        </label>
        <input
          id="per-user-limit"
          type="number"
          value={perUserLimit}
          onChange={(e) => onPerUserLimitChange(parseInt(e.target.value))}
          min="1"
          required
          className="w-full px-2 sm:px-4 py-1.5 sm:py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary"
        />
      </div>
    </div>
  );
}