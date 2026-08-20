// app/dashboard/coupons/components/CouponFormSections/ValidityPeriodForm.tsx
"use client";

interface ValidityPeriodFormProps {
  validFrom: string;
  validUntil: string;
  onValidFromChange: (value: string) => void;
  onValidUntilChange: (value: string) => void;
}

export default function ValidityPeriodForm({
  validFrom,
  validUntil,
  onValidFromChange,
  onValidUntilChange,
}: ValidityPeriodFormProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
      <div>
        <label htmlFor="valid-from" className="block text-xs sm:text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1 sm:mb-2">
          Valid From *
        </label>
        <input
          id="valid-from"
          type="date"
          value={validFrom}
          onChange={(e) => onValidFromChange(e.target.value)}
          required
          className="w-full px-2 sm:px-4 py-1.5 sm:py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary"
        />
      </div>

      <div>
        <label htmlFor="valid-until" className="block text-xs sm:text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1 sm:mb-2">
          Valid Until *
        </label>
        <input
          id="valid-until"
          type="date"
          value={validUntil}
          onChange={(e) => onValidUntilChange(e.target.value)}
          required
          className="w-full px-2 sm:px-4 py-1.5 sm:py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary"
        />
      </div>
    </div>
  );
}