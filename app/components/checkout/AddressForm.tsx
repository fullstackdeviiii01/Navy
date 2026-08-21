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
  type,
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
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] font-semibold tracking-wider uppercase text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1">
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
            className="w-full px-3 py-2.5 border border-theme-border-light dark:border-theme-border-dark bg-white dark:bg-[#342611] text-theme-text-primary-light dark:text-theme-text-primary-dark text-xs sm:text-sm focus:outline-none focus:border-[#A8752B]"
          />
        </div>
        <div>
          <label className="block text-[10px] font-semibold tracking-wider uppercase text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1">
            Phone Number *
          </label>
          <input
            type="tel"
            placeholder="+92 300 0000000"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
            className="w-full px-3 py-2.5 border border-theme-border-light dark:border-theme-border-dark bg-white dark:bg-[#342611] text-theme-text-primary-light dark:text-theme-text-primary-dark text-xs sm:text-sm focus:outline-none focus:border-[#A8752B]"
          />
        </div>
      </div>

      <div>
        <label className="block text-[10px] font-semibold tracking-wider uppercase text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1">
          Street Address *
        </label>
        <input
          type="text"
          placeholder="House / Apartment #, Street, Area"
          value={formData.line1}
          onChange={(e) => setFormData({ ...formData, line1: e.target.value })}
          required
          className="w-full px-3 py-2.5 border border-theme-border-light dark:border-theme-border-dark bg-white dark:bg-[#342611] text-theme-text-primary-light dark:text-theme-text-primary-dark text-xs sm:text-sm focus:outline-none focus:border-[#A8752B]"
        />
      </div>

      <div>
        <label className="block text-[10px] font-semibold tracking-wider uppercase text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1">
          Landmark / Suite (Optional)
        </label>
        <input
          type="text"
          placeholder="Apartment, suite, landmark, etc."
          value={formData.line2}
          onChange={(e) => setFormData({ ...formData, line2: e.target.value })}
          className="w-full px-3 py-2.5 border border-theme-border-light dark:border-theme-border-dark bg-white dark:bg-[#342611] text-theme-text-primary-light dark:text-theme-text-primary-dark text-xs sm:text-sm focus:outline-none focus:border-[#A8752B]"
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-[10px] font-semibold tracking-wider uppercase text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1">
            City *
          </label>
          <input
            type="text"
            placeholder="City"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            required
            className="w-full px-3 py-2.5 border border-theme-border-light dark:border-theme-border-dark bg-white dark:bg-[#342611] text-theme-text-primary-light dark:text-theme-text-primary-dark text-xs sm:text-sm focus:outline-none focus:border-[#A8752B]"
          />
        </div>
        <div>
          <label className="block text-[10px] font-semibold tracking-wider uppercase text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1">
            Province / State *
          </label>
          <input
            type="text"
            placeholder="Province"
            value={formData.state}
            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
            required
            className="w-full px-3 py-2.5 border border-theme-border-light dark:border-theme-border-dark bg-white dark:bg-[#342611] text-theme-text-primary-light dark:text-theme-text-primary-dark text-xs sm:text-sm focus:outline-none focus:border-[#A8752B]"
          />
        </div>
        <div className="col-span-2 sm:col-span-1">
          <label className="block text-[10px] font-semibold tracking-wider uppercase text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1">
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
            className="w-full px-3 py-2.5 border border-theme-border-light dark:border-theme-border-dark bg-white dark:bg-[#342611] text-theme-text-primary-light dark:text-theme-text-primary-dark text-xs sm:text-sm focus:outline-none focus:border-[#A8752B]"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 border border-theme-border-light dark:border-theme-border-dark text-theme-text-primary-light dark:text-theme-text-primary-dark text-xs uppercase tracking-wider font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="flex-1 py-2.5 bg-[#241910] hover:bg-[#A8752B] text-white text-xs uppercase tracking-[0.18em] font-semibold transition-colors shadow-sm"
        >
          Confirm Address
        </button>
      </div>
    </form>
  );
}
