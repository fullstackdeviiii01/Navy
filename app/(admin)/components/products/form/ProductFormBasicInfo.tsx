// ============================================
// 1. app/(admin)/components/products/form/ProductFormBasicInfo.tsx
// ============================================
"use client";

interface ProductFormBasicInfoProps {
  formData: any;
  onChange: (updates: any) => void;
}

export default function ProductFormBasicInfo({
  formData,
  onChange,
}: ProductFormBasicInfoProps) {
  return (
    <div className="space-y-4">
      <h4 className="text-lg font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark border-b border-theme-border-light dark:border-theme-border-dark pb-2">
        Basic Information
      </h4>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-2">
            Product Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => onChange({ name: e.target.value })}
            required
            className="w-full px-3 py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-theme-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-2">
            Brand
          </label>
          <input
            type="text"
            value={formData.brand}
            onChange={(e) => onChange({ brand: e.target.value })}
            className="w-full px-3 py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-theme-primary"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-2">
          Short Description
        </label>
        <textarea
          value={formData.short_description}
          onChange={(e) => onChange({ short_description: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-theme-primary"
        />
      </div>
    </div>
  );
}

