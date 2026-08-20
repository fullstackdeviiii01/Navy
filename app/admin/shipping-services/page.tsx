// app/admin/shipping-services/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Plus, Truck, CheckCircle, XCircle, DollarSign } from "lucide-react";
import ShippingServicesTable from "../../(admin)/components/shipping/ShippingServicesTable";
import ShippingServiceModal from "../../(admin)/components/shipping/ShippingServiceModal";

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

export default function ShippingServicesPage() {
  const [services, setServices] = useState<ShippingService[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedService, setSelectedService] = useState<ShippingService | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("__session="))
        ?.split("=")[1];

      const response = await fetch("/api/shipping-services/admin", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch services");

      const data = await response.json();
      setServices(data.services);
    } catch (error: any) {
      setError(error.message || "Failed to fetch shipping services");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedService(null);
    setShowModal(true);
  };

  const handleEdit = (service: ShippingService) => {
    setSelectedService(service);
    setShowModal(true);
  };

  const handleSave = async (serviceData: Partial<ShippingService>) => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("__session="))
        ?.split("=")[1];

      const url = selectedService
        ? `/api/shipping-services/admin/${selectedService._id}`
        : "/api/shipping-services/admin";

      const response = await fetch(url, {
        method: selectedService ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(serviceData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save service");
      }

      setSuccess(
        selectedService
          ? "Service updated successfully"
          : "Service created successfully"
      );
      setShowModal(false);
      await fetchServices();
    } catch (error: any) {
      setError(error.message || "Failed to save service");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("__session="))
        ?.split("=")[1];

      const response = await fetch(`/api/shipping-services/admin/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete service");
      }

      setSuccess("Service deleted successfully");
      await fetchServices();
    } catch (error: any) {
      setError(error.message || "Failed to delete service");
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("__session="))
        ?.split("=")[1];

      const response = await fetch(`/api/shipping-services/admin/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ is_active: !currentStatus }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update service");
      }

      setSuccess(
        `Service ${!currentStatus ? "activated" : "deactivated"} successfully`
      );
      await fetchServices();
    } catch (error: any) {
      setError(error.message || "Failed to update service");
    }
  };

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError("");
        setSuccess("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-theme-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark">
              Shipping Services
            </h1>
            <p className="text-sm sm:text-base text-theme-text-muted-light dark:text-theme-text-muted-dark mt-1 sm:mt-2">
              Manage shipping options for your customers
            </p>
          </div>
          <button
            onClick={handleCreate}
            className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-theme-primary text-white rounded-lg hover:bg-theme-primary-hover transition-colors shadow-sm whitespace-nowrap self-start sm:self-auto"
          >
            <Plus size={18} className="sm:w-5 sm:h-5" />
            <span className="text-sm sm:text-base font-medium">Add Service</span>
          </button>
        </div>

        {/* Stats Cards - Updated to match OrderStats style */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: "Total Services",
              value: services.length,
              icon: Truck,
              color: "text-blue-600 dark:text-blue-400",
              bg: "bg-blue-50 dark:bg-blue-950/30",
              border: "border-blue-200 dark:border-blue-800",
            },
            {
              label: "Active Services",
              value: services.filter(s => s.is_active).length,
              icon: CheckCircle,
              color: "text-green-600 dark:text-green-400",
              bg: "bg-green-50 dark:bg-green-950/30",
              border: "border-green-200 dark:border-green-800",
            },
            {
              label: "Inactive Services",
              value: services.filter(s => !s.is_active).length,
              icon: XCircle,
              color: "text-red-600 dark:text-red-400",
              bg: "bg-red-50 dark:bg-red-950/30",
              border: "border-red-200 dark:border-red-800",
            },
            {
              label: "Price Range",
              value: services.length > 0 
                ? `$${Math.min(...services.map(s => s.base_price))} - $${Math.max(...services.map(s => s.base_price))}`
                : '$0',
              icon: DollarSign,
              color: "text-purple-600 dark:text-purple-400",
              bg: "bg-purple-50 dark:bg-purple-950/30",
              border: "border-purple-200 dark:border-purple-800",
            },
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className={`rounded-xl border ${stat.border} bg-theme-surface-light dark:bg-theme-surface-dark shadow p-4`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded-lg ${stat.bg}`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <p className={`text-sm font-medium ${stat.color}`}>
                    {stat.label}
                  </p>
                </div>
                <p className={`text-3xl font-bold ${stat.color}`}>
                  {stat.value}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {(error || success) && (
        <div className="fixed top-4 right-4 z-50 max-w-md">
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}
          {success && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-sm text-green-800 dark:text-green-200">
                {success}
              </p>
            </div>
          )}
        </div>
      )}

      <ShippingServicesTable
        services={services}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleActive={handleToggleActive}
      />

      {showModal && (
        <ShippingServiceModal
          service={selectedService}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
          loading={saving}
        />
      )}
    </div>
  );
}