// app/components/checkout/ShippingServiceSelector.tsx
"use client";

import { useState, useEffect } from "react";
import { Truck, Clock, Check } from "lucide-react";
import { useCurrency } from "../../context/CurrencyContext";

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
  const { formatPrice } = useCurrency();
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
      return `${service.estimated_days_min}-${service.estimated_days_max} days`;
    } else if (service.estimated_days_min) {
      return `${service.estimated_days_min}+ days`;
    } else if (service.estimated_days_max) {
      return `Up to ${service.estimated_days_max} days`;
    }
    return null;
  };

  if (fetchLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Truck className="w-5 h-5 text-gray-900 dark:text-white" />
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
            Shipping Method
          </h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Truck className="w-5 h-5 text-gray-900 dark:text-white" />
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
            Shipping Method
          </h3>
        </div>
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Truck className="w-5 h-5 text-gray-900 dark:text-white" />
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
            Shipping Method
          </h3>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          No shipping options available
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 sm:p-5 md:p-6">
      <div className="flex items-center gap-2 mb-4 sm:mb-5">
        <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-gray-900 dark:text-white" />
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
          Shipping Method
        </h3>
      </div>

      <div className="space-y-3">
        {services.map((service) => {
          const isSelected = selectedServiceId === service._id;
          const estimatedDelivery = getEstimatedDelivery(service);

          return (
            <label
              key={service._id}
              className={`block p-3 sm:p-4 border rounded-lg cursor-pointer transition-all ${
                isSelected
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-sm"
                  : "border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
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
                  className="w-4 h-4 mt-0.5 text-blue-600 focus:ring-blue-500 flex-shrink-0"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                          {service.display_name}
                        </p>
                        {isSelected && (
                          <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                        )}
                      </div>
                      {service.description && (
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {service.description}
                        </p>
                      )}
                      {estimatedDelivery && (
                        <div className="flex items-center gap-1.5 mt-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                          <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          <span>{estimatedDelivery}</span>
                        </div>
                      )}
                    </div>

                    <div className="text-right flex-shrink-0">
                      <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
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
        <div className="mt-3 sm:mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="text-xs sm:text-sm text-blue-800 dark:text-blue-200 flex items-center gap-2">
            <div
              className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"
              role="status"
              aria-label="Loading"
            ></div>
            <span>Updating shipping cost...</span>
          </div>
        </div>
      )}
    </div>
  );
}
