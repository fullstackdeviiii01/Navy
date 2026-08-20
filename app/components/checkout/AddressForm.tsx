// app/components/checkout/AddressForm.tsx - FULLY RESPONSIVE
"use client";

import { useState } from "react";

interface AddressFormProps {
  type: "shipping" | "billing";
  onSubmit: (address: any) => void;
  onCancel: () => void;
}

export default function AddressForm({
  type,
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
    country: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2.5 sm:space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-2.5 md:gap-3">
        <input
          type="text"
          id="full-name"
          aria-label="Full name"
          placeholder="Full Name *"
          value={formData.full_name}
          onChange={(e) =>
            setFormData({ ...formData, full_name: e.target.value })
          }
          required
          className="px-3 sm:px-3.5 py-2 sm:py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="tel"
          placeholder="Phone *"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          required
          className="px-3 sm:px-3.5 py-2 sm:py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <input
        type="text"
        placeholder="Street Address *"
        value={formData.line1}
        onChange={(e) => setFormData({ ...formData, line1: e.target.value })}
        required
        className="w-full px-3 sm:px-3.5 py-2 sm:py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <input
        type="text"
        placeholder="Apartment, Suite, etc. (Optional)"
        value={formData.line2}
        onChange={(e) => setFormData({ ...formData, line2: e.target.value })}
        className="w-full px-3 sm:px-3.5 py-2 sm:py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5 md:gap-3">
        <input
          type="text"
          placeholder="City *"
          value={formData.city}
          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
          required
          className="px-2.5 sm:px-3 py-2 sm:py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          placeholder="State *"
          value={formData.state}
          onChange={(e) => setFormData({ ...formData, state: e.target.value })}
          required
          className="px-2.5 sm:px-3 py-2 sm:py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          placeholder="ZIP *"
          value={formData.postal_code}
          onChange={(e) =>
            setFormData({ ...formData, postal_code: e.target.value })
          }
          required
          className="px-2.5 sm:px-3 py-2 sm:py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          placeholder="Country *"
          value={formData.country}
          onChange={(e) =>
            setFormData({ ...formData, country: e.target.value })
          }
          required
          className="px-2.5 sm:px-3 py-2 sm:py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-2 sm:gap-2.5 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="w-full sm:w-auto px-4 sm:px-5 py-2 sm:py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-xs sm:text-sm font-medium active:scale-[0.98]"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="w-full sm:flex-1 px-4 sm:px-5 py-2 sm:py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-xs sm:text-sm font-semibold active:scale-[0.98]"
        >
          Save Address
        </button>
      </div>
    </form>
  );
}
