// app/components/checkout/AddressForm.tsx
"use client";

import { useState, useEffect } from "react";

interface AddressFormProps {
  type: "shipping" | "billing";
  initialData?: any;
  onSubmit: (address: any) => void;
  onCancel?: () => void;
}

export default function AddressForm({
  initialData,
  onSubmit,
  onCancel,
}: AddressFormProps) {
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "Pakistan",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        full_name: initialData.full_name || "",
        phone: initialData.phone || "",
        line1: initialData.line1 || "",
        line2: initialData.line2 || "",
        city: initialData.city || "",
        state: initialData.state || "",
        postal_code: initialData.postal_code || "",
        country: initialData.country || "Pakistan",
      });
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs uppercase tracking-[0.15em] font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1.5">
            Recipient Full Name *
          </label>
          <input
            type="text"
            placeholder="Full Name"
            value={formData.full_name}
            onChange={(e) =>
              setFormData({ ...formData, full_name: e.target.value })
            }
            required
            className="w-full px-3.5 py-2.5 border border-theme-border-light dark:border-theme-border-dark bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark text-xs sm:text-sm focus:outline-none focus:border-theme-hover-light"
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-[0.15em] font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1.5">
            Phone Number *
          </label>
          <input
            type="tel"
            placeholder="+92 300 1234567"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
            className="w-full px-3.5 py-2.5 border border-theme-border-light dark:border-theme-border-dark bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark text-xs sm:text-sm focus:outline-none focus:border-theme-hover-light"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs uppercase tracking-[0.15em] font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1.5">
          Street Address *
        </label>
        <input
          type="text"
          placeholder="House / Apartment #, Street, Area"
          value={formData.line1}
          onChange={(e) => setFormData({ ...formData, line1: e.target.value })}
          required
          className="w-full px-3.5 py-2.5 border border-theme-border-light dark:border-theme-border-dark bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark text-xs sm:text-sm focus:outline-none focus:border-theme-hover-light"
        />
      </div>

      <div>
        <label className="block text-xs uppercase tracking-[0.15em] font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1.5">
          Apartment, Suite, Landmark (Optional)
        </label>
        <input
          type="text"
          placeholder="e.g. Near City Center"
          value={formData.line2}
          onChange={(e) => setFormData({ ...formData, line2: e.target.value })}
          className="w-full px-3.5 py-2.5 border border-theme-border-light dark:border-theme-border-dark bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark text-xs sm:text-sm focus:outline-none focus:border-theme-hover-light"
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs uppercase tracking-[0.15em] font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1.5">
            City *
          </label>
          <input
            type="text"
            placeholder="City"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            required
            className="w-full px-3.5 py-2.5 border border-theme-border-light dark:border-theme-border-dark bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark text-xs sm:text-sm focus:outline-none focus:border-theme-hover-light"
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-[0.15em] font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1.5">
            Province *
          </label>
          <input
            type="text"
            placeholder="Province"
            value={formData.state}
            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
            required
            className="w-full px-3.5 py-2.5 border border-theme-border-light dark:border-theme-border-dark bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark text-xs sm:text-sm focus:outline-none focus:border-theme-hover-light"
          />
        </div>
        <div className="col-span-2 sm:col-span-1">
          <label className="block text-xs uppercase tracking-[0.15em] font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1.5">
            Postal Code *
          </label>
          <input
            type="text"
            placeholder="Postal Code"
            value={formData.postal_code}
            onChange={(e) =>
              setFormData({ ...formData, postal_code: e.target.value })
            }
            required
            className="w-full px-3.5 py-2.5 border border-theme-border-light dark:border-theme-border-dark bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark text-xs sm:text-sm focus:outline-none focus:border-theme-hover-light"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-3 border border-theme-border-light dark:border-theme-border-dark text-theme-text-primary-light dark:text-theme-text-primary-dark text-xs uppercase tracking-[0.15em] font-medium hover:bg-theme-card-light dark:hover:bg-theme-card-dark transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="flex-1 py-3 bg-theme-primary hover:bg-theme-hover-light dark:hover:bg-theme-hover-dark text-theme-btn-text text-xs uppercase tracking-[0.18em] font-medium transition-colors"
        >
          Confirm Address
        </button>
      </div>
    </form>
  );
}
