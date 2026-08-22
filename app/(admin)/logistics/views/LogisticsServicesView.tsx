// app/(admin)/logistics/views/LogisticsServicesView.tsx
"use client";

import { useState, useEffect } from "react";
import { Plus, Truck, AlertCircle, CheckCircle2 } from "lucide-react";
import LogisticsKpiCards from "../components/LogisticsKpiCards";
import CarrierTiersTable from "../components/CarrierTiersTable";
import CarrierServiceModal from "../components/CarrierServiceModal";
import Loader from "../../../components/shared/Loader";

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

export default function LogisticsServicesView() {
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

      if (!response.ok) throw new Error("Failed to fetch shipping services");

      const data = await response.json();
      setServices(data.services || []);
    } catch (err: any) {
      setError(err.message || "Failed to fetch shipping methods");
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

  const handleSave = async (formData: any) => {
    try {
      setSaving(true);
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("__session="))
        ?.split("=")[1];

      const url = selectedService
        ? `/api/shipping-services/admin/${selectedService._id}`
        : "/api/shipping-services/admin";

      const method = selectedService ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save shipping service");
      }

      setSuccess(
        selectedService
          ? "Shipping method updated successfully."
          : "New shipping method created successfully."
      );
      setShowModal(false);
      await fetchServices();
    } catch (err: any) {
      setError(err.message || "Failed to save service");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this shipping service?")) return;

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
        throw new Error(data.error || "Failed to delete shipping service");
      }

      setSuccess("Shipping method removed successfully.");
      await fetchServices();
    } catch (err: any) {
      setError(err.message || "Failed to delete service");
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
        throw new Error(data.error || "Failed to update service status");
      }

      setSuccess(
        `Shipping method ${!currentStatus ? "activated" : "disabled"} successfully.`
      );
      await fetchServices();
    } catch (err: any) {
      setError(err.message || "Failed to update status");
    }
  };

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError("");
        setSuccess("");
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  return (
    <div className="space-y-6 pb-16">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-theme-border-light/80 dark:border-theme-border-dark/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-serif font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark tracking-tight">
              Shipping Methods
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300">
              <Truck className="w-3 h-3" />
              Delivery Options
            </span>
          </div>
          <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark mt-0.5">
            Manage shipping rates, estimated delivery times, and active courier options.
          </p>
        </div>

        <button
          type="button"
          onClick={handleCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900 text-xs font-semibold tracking-wide shadow-xs hover:shadow active:scale-[0.99] transition-all self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Shipping Method</span>
        </button>
      </div>

      {/* Floating Status Feedback */}
      {(error || success) && (
        <div className="fixed top-5 right-5 z-50 max-w-sm animate-in slide-in-from-top-3">
          {error && (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 rounded-xl shadow-lg flex items-center gap-2 text-xs text-rose-800 dark:text-rose-200">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 rounded-xl shadow-lg flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-200">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{success}</span>
            </div>
          )}
        </div>
      )}

      {/* KPI Cards */}
      <LogisticsKpiCards services={services} />

      {/* Table */}
      {loading ? (
        <div className="min-h-[300px] flex items-center justify-center bg-theme-surface-light dark:bg-theme-surface-dark rounded-xl border border-theme-border-light dark:border-theme-border-dark p-12">
          <Loader />
        </div>
      ) : (
        <CarrierTiersTable
          services={services}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleActive={handleToggleActive}
        />
      )}

      {/* Modal */}
      {showModal && (
        <CarrierServiceModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
          service={selectedService}
          loading={saving}
        />
      )}
    </div>
  );
}
