// app/components/checkout/ShippingServiceSelector.tsx
"use client";

import { useState, useEffect } from "react";
import { Truck, Clock, Check, Loader2 } from "lucide-react";
import { formatPrice } from "../../../lib/utils/formatPrice";

interface ShippingService {
  _id: string;
  name: string;
  display_name: string;
  description?: string;
  base_price: number;
  currency: string;
  estimated_days_min?: number;
  estimated_days_max?: number;
  is_standard?: boolean;
}

interface ShippingServiceSelectorProps {
  selectedServiceId: string | null;
  onServiceSelect: (serviceId: string) => void;
  loading?: boolean;
  cartSubtotal?: number;
}

export default function ShippingServiceSelector({
  selectedServiceId,
  onServiceSelect,
  loading = false,
  cartSubtotal = 0,
}: ShippingServiceSelectorProps) {
  const [services, setServices] = useState<ShippingService[]>([]);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setFetchLoading(true);
      const response = await fetch("/api/shipping-services");

      if (!response.ok) {
        throw new Error("Failed to fetch shipping services");
      }

      const data = await response.json();
      setServices(data.services);

      if (data.services.length > 0 && !selectedServiceId) {
        onServiceSelect(data.services[0]._id);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load shipping options");
    } finally {
      setFetchLoading(false);
    }
  };

  const getEstimatedDelivery = (service: ShippingService) => {
    if (service.estimated_days_min && service.estimated_days_max) {
      return `${service.estimated_days_min}-${service.estimated_days_max} business days`;
    } else if (service.estimated_days_min) {
      return `${service.estimated_days_min}+ business days`;
    } else if (service.estimated_days_max) {
      return `Up to ${service.estimated_days_max} business days`;
    }
    return null;
  };

  if (fetchLoading) {
    return (
      <div className="border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark p-6">
        <div className="flex items-center gap-2 pb-4 mb-4 border-b border-theme-border-light dark:border-theme-border-dark">
          <Truck className="w-4 h-4 text-theme-hover-light dark:text-theme-hover-dark" />
          <h3 className="text-lg font-serif font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark">
            Delivery Method
          </h3>
        </div>
        <div className="flex items-center justify-center py-6 text-theme-text-muted-light dark:text-theme-text-muted-dark">
          <Loader2 className="w-5 h-5 animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark p-6">
        <div className="flex items-center gap-2 pb-4 mb-4 border-b border-theme-border-light dark:border-theme-border-dark">
          <Truck className="w-4 h-4 text-theme-hover-light dark:text-theme-hover-dark" />
          <h3 className="text-lg font-serif font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark">
            Delivery Method
          </h3>
        </div>
        <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div className="border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark p-6">
        <div className="flex items-center gap-2 pb-4 mb-4 border-b border-theme-border-light dark:border-theme-border-dark">
          <Truck className="w-4 h-4 text-theme-hover-light dark:text-theme-hover-dark" />
          <h3 className="text-lg font-serif font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark">
            Delivery Method
          </h3>
        </div>
        <p className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark">
          Standard delivery will be calculated.
        </p>
      </div>
    );
  }

  const isOrderOver15k = cartSubtotal >= 15000;

  return (
    <div className="border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark p-6 transition-colors">
      <div className="flex items-center justify-between pb-4 mb-5 border-b border-theme-border-light dark:border-theme-border-dark">
        <div className="flex items-center gap-2">
          <Truck className="w-4 h-4 text-theme-hover-light dark:text-theme-hover-dark" />
          <h3 className="text-lg font-serif font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark">
            Delivery Method
          </h3>
        </div>
      </div>

      <div className="space-y-3">
        {services.map((service) => {
          const isSelected = selectedServiceId === service._id;
          const estimatedDelivery = getEstimatedDelivery(service);
          const isStandard =
            service.is_standard === true ||
            (service.is_standard === undefined &&
              (service.name || service.display_name || "")
                .toLowerCase()
                .includes("standard"));
          const isFreeForThis = isStandard && isOrderOver15k;

          return (
            <label
              key={service._id}
              className={`block p-3.5 sm:p-4 border cursor-pointer transition-all ${
                isSelected
                  ? "border-theme-hover-light dark:border-theme-hover-dark bg-theme-card-light/60 dark:bg-theme-card-dark/40 shadow-2xs"
                  : "border-theme-border-light/70 dark:border-theme-border-dark/70 hover:border-theme-hover-light/50 bg-theme-bg-light/30 dark:bg-theme-bg-dark/30"
              } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="radio"
                  name="shipping_service"
                  value={service._id}
                  checked={isSelected}
                  onChange={() => !loading && onServiceSelect(service._id)}
                  disabled={loading}
                  className="w-4 h-4 mt-0.5 accent-[#241910] dark:accent-[#D7D3CF] cursor-pointer flex-shrink-0"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-xs sm:text-sm font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                          {service.display_name}
                        </p>
                        {isSelected && (
                          <Check className="w-3.5 h-3.5 text-theme-hover-light dark:text-theme-hover-dark flex-shrink-0" />
                        )}
                        {isStandard ? (
                          <span className="text-[9px] sm:text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                            Free over Rs. 15,000
                          </span>
                        ) : (
                          <span className="text-[9px] sm:text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                            Fixed Rate
                          </span>
                        )}
                      </div>
                      {service.description && (
                        <p className="text-[11px] sm:text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark mt-1">
                          {service.description}
                        </p>
                      )}
                      {estimatedDelivery && (
                        <div className="flex items-center gap-1.5 mt-1.5 text-[11px] sm:text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark">
                          <Clock className="w-3 h-3" />
                          <span>{estimatedDelivery}</span>
                        </div>
                      )}
                    </div>

                    <div className="text-right flex-shrink-0 pl-2">
                      {isFreeForThis ? (
                        <div>
                          <div className="flex items-center gap-1.5 justify-end">
                            <span className="line-through text-theme-text-muted-light dark:text-theme-text-muted-dark text-[11px]">
                              {formatPrice(service.base_price || 0)}
                            </span>
                            <span className="text-xs sm:text-sm font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                              FREE
                            </span>
                          </div>
                          <span className="text-[9px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block font-medium mt-0.5">
                            Unlocked
                          </span>
                        </div>
                      ) : (
                        <div>
                          <p className="text-xs sm:text-sm font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                            {formatPrice(service.base_price || 0)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </label>
          );
        })}
      </div>

      {loading && (
        <div className="mt-3 p-2.5 bg-theme-card-light/40 dark:bg-theme-card-dark/30 border border-theme-border-light/60 dark:border-theme-border-dark/60 flex items-center gap-2 text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>Updating delivery fee...</span>
        </div>
      )}
    </div>
  );
}
