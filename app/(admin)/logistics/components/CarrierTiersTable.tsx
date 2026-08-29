// app/(admin)/logistics/components/CarrierTiersTable.tsx
"use client";

import { Truck, Edit, Trash2, CheckCircle2, XCircle, Clock } from "lucide-react";

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
  is_standard?: boolean;
  sort_order: number;
}

interface CarrierTiersTableProps {
  services: ShippingService[];
  onEdit: (service: ShippingService) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, currentStatus: boolean) => void;
}

export default function CarrierTiersTable({
  services,
  onEdit,
  onDelete,
  onToggleActive,
}: CarrierTiersTableProps) {
  if (services.length === 0) {
    return (
      <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-xl border border-theme-border-light dark:border-theme-border-dark p-12 text-center text-xs text-theme-text-muted-light">
        No carrier shipping tiers configured yet.
      </div>
    );
  }

  return (
    <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-xl border border-theme-border-light dark:border-theme-border-dark overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-theme-card-light/70 dark:bg-theme-card-dark/50 border-b border-theme-border-light dark:border-theme-border-dark text-[11px] uppercase tracking-wider text-theme-text-secondary-light dark:text-theme-text-secondary-dark font-semibold">
              <th className="py-3 px-4">Carrier Service Tier</th>
              <th className="py-3 px-4">Estimated Transit</th>
              <th className="py-3 px-4">Base Freight Tariff</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-theme-border-light/60 dark:divide-theme-border-dark/60">
            {services.map((service) => (
              <tr
                key={service._id}
                className="hover:bg-theme-card-light/40 dark:hover:bg-theme-card-dark/30 transition-colors"
              >
                {/* Service Name */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200">
                      <Truck className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                          {service.display_name}
                        </p>
                        {service.is_standard ? (
                          <span className="px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wider font-bold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                            ★ Standard (Free &gt; 15k)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wider font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                            Fixed Rate
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-theme-text-muted-light">
                        {service.name}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Estimated Transit */}
                <td className="py-3.5 px-4 whitespace-nowrap text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-theme-text-muted-light" />
                    <span>
                      {service.estimated_days_min && service.estimated_days_max
                        ? `${service.estimated_days_min}-${service.estimated_days_max} Business Days`
                        : "Standard Dispatch"}
                    </span>
                  </div>
                </td>

                {/* Price */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <span className="font-bold text-sm text-theme-text-primary-light dark:text-theme-text-primary-dark">
                    Rs. {service.base_price?.toLocaleString() || 0}
                  </span>
                </td>

                {/* Status */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() =>
                      onToggleActive(service._id, service.is_active)
                    }
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold cursor-pointer transition-colors ${
                      service.is_active
                        ? "bg-green-100 dark:bg-green-950/60 text-green-800 dark:text-green-300 hover:bg-green-200"
                        : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 hover:bg-neutral-200"
                    }`}
                  >
                    {service.is_active ? (
                      <CheckCircle2 className="w-3 h-3" />
                    ) : (
                      <XCircle className="w-3 h-3" />
                    )}
                    <span>{service.is_active ? "Active" : "Disabled"}</span>
                  </button>
                </td>

                {/* Actions */}
                <td className="py-3.5 px-4 text-right whitespace-nowrap">
                  <div className="inline-flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onEdit(service)}
                      className="p-1.5 text-theme-text-muted-light hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                      title="Edit Carrier Route"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(service._id)}
                      className="p-1.5 text-theme-text-muted-light hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                      title="Delete Carrier Service"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
