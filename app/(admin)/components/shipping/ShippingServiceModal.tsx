"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

interface ShippingService {
  _id?: string;
  name: string;
  display_name: string;
  description?: string;
  base_price: number;
  currency: string;
  estimated_days_min?: number;
  estimated_days_max?: number;
  is_active: boolean;
  sort_order: number;
}

interface ShippingServiceModalProps {
  service: ShippingService | null;
  onClose: () => void;
  onSave: (service: Partial<ShippingService>) => void;
  loading: boolean;
}

export default function ShippingServiceModal({
  service,
  onClose,
  onSave,
  loading,
}: ShippingServiceModalProps) {
  const [formData, setFormData] = useState<Partial<ShippingService>>({
    name: "",
    display_name: "",
    description: "",
    base_price: undefined,
    currency: "USD",
    estimated_days_min: undefined,
    estimated_days_max: undefined,
    is_active: true,
    sort_order: 0,
  });

  useEffect(() => {
    if (service) {
      setFormData(service);
    }
  }, [service]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    if (type === "checkbox") {
      setFormData({
        ...formData,
        [name]: (e.target as HTMLInputElement).checked,
      });
    } else if (name === "display_name") {
      // Auto-generate internal name from display name
      const internalName = value
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .replace(/\s+/g, "_")
        .substring(0, 50);
      
      setFormData({
        ...formData,
        display_name: value,
        name: internalName,
      });
    } else if (type === "number") {
      setFormData({
        ...formData,
        [name]: value === "" ? undefined : parseFloat(value),
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-3xl max-h-[95vh] sm:max-h-[90vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
            {service ? "Edit Shipping Service" : "Create Shipping Service"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
            type="button"
          >
            <X size={20} className="sm:w-6 sm:h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="space-y-4 sm:space-y-5">
            {/* Display Name - Full Width */}
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                Display Name *
              </label>
              <input
                type="text"
                name="display_name"
                value={formData.display_name}
                onChange={handleChange}
                required
                placeholder="Standard Shipping"
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Customer-facing name (e.g., "Express Shipping")
              </p>
            </div>

            {/* Internal Name - Hidden but auto-generated */}
            <input
              type="hidden"
              name="name"
              value={formData.name}
            />

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                placeholder="Brief description of this shipping option"
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            {/* Price and Active Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Base Price (USD) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 text-sm sm:text-base">
                    $
                  </span>
                  <input
                    type="number"
                    name="base_price"
                    value={formData.base_price || ""}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className="w-full pl-7 sm:pl-8 pr-3 sm:pr-4 py-2 sm:py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Displays in user's selected currency
                </p>
              </div>

              <div className="flex items-end">
                <label className="flex items-center cursor-pointer h-[42px] sm:h-[46px]">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleChange}
                    className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <span className="ml-2 sm:ml-3 text-sm sm:text-base font-medium text-gray-900 dark:text-white">
                    Active
                  </span>
                </label>
              </div>
            </div>

            {/* Estimated Delivery Days */}
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                Estimated Delivery Time
              </label>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <input
                    type="number"
                    name="estimated_days_min"
                    value={formData.estimated_days_min || ""}
                    onChange={handleChange}
                    min="0"
                    placeholder="Min days"
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Minimum days
                  </p>
                </div>
                <div>
                  <input
                    type="number"
                    name="estimated_days_max"
                    value={formData.estimated_days_max || ""}
                    onChange={handleChange}
                    min="0"
                    placeholder="Max days"
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Maximum days
                  </p>
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Example: 5-7 days, or leave one blank for "5+ days" or "Up to 7 days"
              </p>
            </div>

            {/* Sort Order */}
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                Sort Order
              </label>
              <input
                type="number"
                name="sort_order"
                value={formData.sort_order}
                onChange={handleChange}
                min="0"
                placeholder="0"
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Lower numbers appear first (0 = highest priority)
              </p>
            </div>
          </div>
        </form>

        <div className="flex items-center justify-end gap-3 p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 sm:px-5 py-2 sm:py-2.5 text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 sm:px-5 py-2 sm:py-2.5 text-sm sm:text-base font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Saving...
              </>
            ) : (
              service ? "Update Service" : "Create Service"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}