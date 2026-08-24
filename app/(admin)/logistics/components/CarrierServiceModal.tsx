// app/(admin)/logistics/components/CarrierServiceModal.tsx
"use client";

import { useState, useEffect } from "react";
import { X, Truck, Check } from "lucide-react";

interface ShippingService {
  _id: string;
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

interface CarrierServiceModalProps {
  service: ShippingService | null;
  isOpen: boolean;
  loading: boolean;
  onClose: () => void;
  onSave: (data: Partial<ShippingService>) => void;
}

export default function CarrierServiceModal({
  service,
  isOpen,
  loading,
  onClose,
  onSave,
}: CarrierServiceModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    display_name: "",
    description: "",
    base_price: 0,
    currency: "PKR",
    estimated_days_min: 2,
    estimated_days_max: 5,
    is_active: true,
    sort_order: 0,
  });

  useEffect(() => {
    if (service) {
      setFormData({
        name: service.name || "",
        display_name: service.display_name || "",
        description: service.description || "",
        base_price: service.base_price || 0,
        currency: service.currency || "PKR",
        estimated_days_min: service.estimated_days_min || 2,
        estimated_days_max: service.estimated_days_max || 5,
        is_active: service.is_active ?? true,
        sort_order: service.sort_order || 0,
      });
    } else {
      setFormData({
        name: "",
        display_name: "",
        description: "",
        base_price: 0,
        currency: "PKR",
        estimated_days_min: 2,
        estimated_days_max: 5,
        is_active: true,
        sort_order: 0,
      });
    }
  }, [service, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-theme-surface-light dark:bg-theme-surface-dark w-full max-w-lg rounded-2xl border border-theme-border-light dark:border-theme-border-dark shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-theme-border-light dark:border-theme-border-dark">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-serif font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                {service ? "Edit Carrier Route" : "Add New Logistics Service"}
              </h3>
              <p className="text-xs text-theme-text-muted-light mt-0.5">
                Define transit timeline, base freight tariff, and checkout display.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-theme-text-muted-light hover:text-theme-text-primary-light rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs overflow-y-auto max-h-[75vh]">
          {/* Identifiers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-theme-text-secondary-light mb-1.5">
                Service Display Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Express Courier Delivery"
                value={formData.display_name}
                onChange={(e) =>
                  setFormData({ ...formData, display_name: e.target.value })
                }
                required
                className="w-full px-3.5 py-2 text-xs sm:text-sm border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-neutral-500/40"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-theme-text-secondary-light mb-1.5">
                System Identifier Code *
              </label>
              <input
                type="text"
                placeholder="e.g. express_courier"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                className="w-full px-3.5 py-2 text-xs sm:text-sm font-mono border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-neutral-500/40"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-theme-text-secondary-light mb-1.5">
              Service Description
            </label>
            <textarea
              rows={2}
              placeholder="Delivery notes shown to customer at checkout..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-3.5 py-2 text-xs border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-neutral-500/40"
            />
          </div>

          {/* Pricing & Transit */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl border border-theme-border-light dark:border-theme-border-dark bg-theme-bg-light/40 dark:bg-theme-bg-dark/20">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-theme-text-secondary-light mb-1.5">
                Base Tariff (Rs.) *
              </label>
              <input
                type="number"
                min="0"
                value={formData.base_price}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    base_price: parseFloat(e.target.value) || 0,
                  })
                }
                required
                className="w-full px-3 py-1.5 text-xs font-mono font-bold border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-theme-text-secondary-light mb-1.5">
                Min. Days
              </label>
              <input
                type="number"
                min="1"
                value={formData.estimated_days_min}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    estimated_days_min: parseInt(e.target.value) || 1,
                  })
                }
                className="w-full px-3 py-1.5 text-xs font-mono border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-theme-text-secondary-light mb-1.5">
                Max. Days
              </label>
              <input
                type="number"
                min="1"
                value={formData.estimated_days_max}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    estimated_days_max: parseInt(e.target.value) || 1,
                  })
                }
                className="w-full px-3 py-1.5 text-xs font-mono border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark"
              />
            </div>
          </div>

          <div className="flex items-center gap-6 pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) =>
                  setFormData({ ...formData, is_active: e.target.checked })
                }
                className="rounded text-neutral-900 focus:ring-neutral-500"
              />
              <span className="font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                Service Active
              </span>
            </label>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-theme-border-light dark:border-theme-border-dark flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg text-xs font-semibold text-theme-text-secondary-light hover:bg-theme-card-light transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900 text-xs font-semibold tracking-wide shadow-xs hover:shadow active:scale-[0.99] transition-all disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{loading ? "Saving..." : "Save Route"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
