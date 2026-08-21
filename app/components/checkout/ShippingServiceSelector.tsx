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
}

interface ShippingServiceSelectorProps {
  selectedServiceId: string | null;
  onServiceSelect: (serviceId: string) => void;
  loading?: boolean;
}

export default function ShippingServiceSelector({
  selectedServiceId,
  onServiceSelect,
  loading = false,
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
          <h3 className="text-lg font-serif italic text-theme-text-primary-light dark:text-theme-text-primary-dark">
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
          <h3 className="text-lg font-serif italic text-theme-text-primary-light dark:text-theme-text-primary-dark">
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
          <h3 className="text-lg font-serif italic text-theme-text-primary-light dark:text-theme-text-primary-dark">
            Delivery Method
          </h3>
        </div>
        <p className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark">
          Standard delivery will be calculated.
        </p>
      </div>
    );
  }

  return (
    <div className="border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark p-6 transition-colors">
      <div className="flex items-center justify-between pb-4 mb-5 border-b border-theme-border-light dark:border-theme-border-dark">
        <div className="flex items-center gap-2">
          <Truck className="w-4 h-4 text-theme-hover-light dark:text-theme-hover-dark" />
          <h3 className="text-lg font-serif italic text-theme-text-primary-light dark:text-theme-text-primary-dark">
            Delivery Method
          </h3>
        </div>
      </div>

      <div className="space-y-3">
        {services.map((service) => {
          const isSelected = selectedServiceId === service._id;
          const estimatedDelivery = getEstimatedDelivery(service);

          return (
            <label
              key={service._id}
              className={`block p-4 border cursor-pointer transition-all ${
                isSelected
                  ? "border-theme-hover-light dark:border-theme-hover-dark bg-theme-card-light/50 dark:bg-theme-card-dark/40"
                  : "border-theme-border-light/70 dark:border-theme-border-dark/70 hover:border-theme-hover-light/50"
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
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark">
                          {service.display_name}
                        </p>
                        {isSelected && (
                          <Check className="w-3.5 h-3.5 text-theme-hover-light dark:text-theme-hover-dark flex-shrink-0" />
                        )}
                      </div>
                      {service.description && (
                        <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark mt-1">
                          {service.description}
                        </p>
                      )}
                      {estimatedDelivery && (
                        <div className="flex items-center gap-1.5 mt-1.5 text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{estimatedDelivery}</span>
                        </div>
                      )}
                    </div>

                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                        {service.base_price === 0
                          ? "FREE"
                          : formatPrice(service.base_price)}
                      </p>
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
