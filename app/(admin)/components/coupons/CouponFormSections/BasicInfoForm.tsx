// app/dashboard/coupons/components/CouponFormSections/BasicInfoForm.tsx
"use client";

interface BasicInfoFormProps {
  code: string;
  description: string;
  onCodeChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
}

export default function BasicInfoForm({
  code,
  description,
  onCodeChange,
  onDescriptionChange,
}: BasicInfoFormProps) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:gap-4">
      <div className="col-span-1">
        <label htmlFor="coupon-code" className="block text-xs sm:text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1 sm:mb-2">
          Coupon Code *
        </label>
        <input
          id="coupon-code"
          type="text"
          value={code}
          onChange={(e) => onCodeChange(e.target.value.toUpperCase())}
          placeholder="SUMMER2024"
          required
          className="w-full px-2 sm:px-4 py-1.5 sm:py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark text-xs sm:text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-theme-primary"
        />
      </div>

      <div className="col-span-1">
        <label htmlFor="coupon-description" className="block text-xs sm:text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1 sm:mb-2">
          Description
        </label>
        <textarea
          id="coupon-description"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          rows={2}
          placeholder="Special summer discount"
          className="w-full px-2 sm:px-4 py-1.5 sm:py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary"
        />
      </div>
    </div>
  );
}