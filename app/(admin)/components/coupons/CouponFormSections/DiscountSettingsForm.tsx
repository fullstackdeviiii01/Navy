// app/dashboard/coupons/components/CouponFormSections/DiscountSettingsForm.tsx
"use client";

interface DiscountSettingsFormProps {
  discountType: string;
  discountValue: number;
  minOrderAmount: number;
  maxDiscount: number | null;
  onDiscountTypeChange: (value: string) => void;
  onDiscountValueChange: (value: number) => void;
  onMinOrderAmountChange: (value: number) => void;
  onMaxDiscountChange: (value: number | null) => void;
}

export default function DiscountSettingsForm({
  discountType,
  discountValue,
  minOrderAmount,
  maxDiscount,
  onDiscountTypeChange,
  onDiscountValueChange,
  onMinOrderAmountChange,
  onMaxDiscountChange,
}: DiscountSettingsFormProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
      <div>
        <label htmlFor="discount-type" className="block text-xs sm:text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1 sm:mb-2">
          Discount Type *
        </label>
        <select
          id="discount-type"
          value={discountType}
          onChange={(e) => onDiscountTypeChange(e.target.value)}
          required
          className="w-full px-2 sm:px-4 py-1.5 sm:py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary"
        >
          <option value="percentage">Percentage (%)</option>
          <option value="fixed">Fixed Amount ($)</option>
        </select>
      </div>

      <div>
        <label htmlFor="discount-value" className="block text-xs sm:text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1 sm:mb-2">
          Discount Value *
        </label>
        <input
          id="discount-value"
          type="number"
          value={discountValue}
          onChange={(e) => onDiscountValueChange(parseFloat(e.target.value))}
          min="0"
          step="0.01"
          required
          className="w-full px-2 sm:px-4 py-1.5 sm:py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary"
        />
      </div>

      <div>
        <label htmlFor="min-order-amount" className="block text-xs sm:text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1 sm:mb-2">
          Min Order Amount ($)
        </label>
        <input
          id="min-order-amount"
          type="number"
          value={minOrderAmount}
          onChange={(e) => onMinOrderAmountChange(parseFloat(e.target.value))}
          min="0"
          step="0.01"
          className="w-full px-2 sm:px-4 py-1.5 sm:py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary"
        />
      </div>

      <div>
        <label htmlFor="max-discount" className="block text-xs sm:text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1 sm:mb-2">
          Max Discount ($)
        </label>
        <input
          id="max-discount"
          type="number"
          value={maxDiscount || ""}
          onChange={(e) => onMaxDiscountChange(e.target.value ? parseFloat(e.target.value) : null)}
          min="0"
          step="0.01"
          placeholder="No limit"
          className="w-full px-2 sm:px-4 py-1.5 sm:py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary"
        />
      </div>
    </div>
  );
}