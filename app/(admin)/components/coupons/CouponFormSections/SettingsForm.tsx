// app/dashboard/coupons/components/CouponFormSections/SettingsForm.tsx
"use client";

interface SettingsFormProps {
  isActive: boolean;
  showOnProducts: boolean;
  onIsActiveChange: (value: boolean) => void;
  onShowOnProductsChange: (value: boolean) => void;
}

export default function SettingsForm({
  isActive,
  showOnProducts,
  onIsActiveChange,
  onShowOnProductsChange,
}: SettingsFormProps) {
  return (
    <div className="space-y-2 sm:space-y-3">
      <label htmlFor="is-active" className="flex items-center gap-2 sm:gap-3 cursor-pointer">
        <input
          id="is-active"
          type="checkbox"
          checked={isActive}
          onChange={(e) => onIsActiveChange(e.target.checked)}
          className="w-3 h-3 sm:w-4 sm:h-4 text-theme-primary rounded focus:ring-theme-primary"
        />
        <span className="text-xs sm:text-sm font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark">
          Active (users can use this coupon)
        </span>
      </label>

      <label htmlFor="show-on-products" className="flex items-center gap-2 sm:gap-3 cursor-pointer">
        <input
          id="show-on-products"
          type="checkbox"
          checked={showOnProducts}
          onChange={(e) => onShowOnProductsChange(e.target.checked)}
          className="w-3 h-3 sm:w-4 sm:h-4 text-theme-primary rounded focus:ring-theme-primary"
        />
        <span className="text-xs sm:text-sm font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark">
          Show discount on product cards
        </span>
      </label>
    </div>
  );
}