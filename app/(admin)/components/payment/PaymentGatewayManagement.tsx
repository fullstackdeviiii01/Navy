// // app/(admin)/components/payment/PaymentGatewayManagement.tsx
"use client";

import { useState, useEffect } from "react";
import { FaPlus, FaCreditCard } from "react-icons/fa";
import { paymentApi } from "../../../../lib/api/payment";
import PaymentGatewayCard from "./PaymentGatewayCard";
import ConfigureGatewayModal from "./ConfigureGatewayModal";
import CreateGatewayModal from "./CreateGatewayModal";
import Loader from "../../../components/shared/Loader";

export default function PaymentGatewayManagement() {
  const [gateways, setGateways] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGateway, setSelectedGateway] = useState<any>(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchGateways();
  }, []);

  const fetchGateways = async () => {
    setLoading(true);
    try {
      const data = await paymentApi.getGateways();
      setGateways(data.gateways);
    } catch (error: any) {
      setError(error.message || "Failed to fetch gateways");
    } finally {
      setLoading(false);
    }
  };

  const handleConfigure = async (gateway: any) => {
    try {
      const data = await paymentApi.getGateway(gateway.name);
      setSelectedGateway(data.gateway);
      setShowConfigModal(true);
    } catch (error: any) {
      setError(error.message || "Failed to fetch gateway details");
    }
  };

  const handleSave = async (data: any) => {
    try {
      await paymentApi.saveGateway(data);
      setSuccess("Gateway configured successfully");
      fetchGateways();
      setShowConfigModal(false);
      setSelectedGateway(null);
    } catch (error: any) {
      setError(error.message || "Failed to save gateway");
      throw error;
    }
  };

  const handleToggle = async (name: string, enabled: boolean) => {
    try {
      await paymentApi.saveGateway({ name, is_enabled: enabled });
      setSuccess(`Gateway ${enabled ? "enabled" : "disabled"} successfully`);
      fetchGateways();
    } catch (error: any) {
      setError(error.message || "Failed to toggle gateway");
    }
  };

  const handleDelete = async (name: string) => {
    if (!confirm("Are you sure you want to delete this payment gateway?")) {
      return;
    }

    try {
      await paymentApi.deleteGateway(name);
      setSuccess("Gateway deleted successfully");
      fetchGateways();
    } catch (error: any) {
      setError(error.message || "Failed to delete gateway");
    }
  };

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError("");
        setSuccess("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  if (loading) {
    return (
      <div className="relative h-48 sm:h-64">
        <Loader />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-2 sm:p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div className="min-w-0">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark">
            Payment Gateways
          </h2>
          <p className="text-xs sm:text-sm text-theme-text-muted-light dark:text-theme-text-muted-dark mt-1">
            Configure payment methods for your store
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-theme-primary text-white rounded-lg hover:bg-theme-primary-hover transition-colors text-xs sm:text-sm w-full sm:w-auto"
        >
          <FaPlus size={12} className="sm:w-3.5 sm:h-3.5"/>
          <span>Add Gateway</span>
        </button>
      </div>

      {/* Notifications */}
      {(error || success) && (
        <div className="fixed top-2 sm:top-4 right-2 sm:right-4 z-50 max-w-xs sm:max-w-md">
          {error && (
            <div
              className="p-2 sm:p-3 md:p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
              role="alert"
            >
              <p className="text-xs sm:text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}
          {success && (
            <div
              className="p-2 sm:p-3 md:p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
              role="status"
            >
              <p className="text-xs sm:text-sm text-green-800 dark:text-green-200">
                {success}
              </p>
            </div>
          )}
        </div>
      )}
      
      {/* Gateways Grid */}
      {gateways.length === 0 ? (
        <div className="text-center py-8 sm:py-12 md:py-16 bg-theme-surface-light dark:bg-theme-surface-dark border border-theme-border-light dark:border-theme-border-dark rounded-lg sm:rounded-xl">
          <FaCreditCard className="mx-auto text-3xl sm:text-4xl text-theme-text-muted-light dark:text-theme-text-muted-dark mb-2 sm:mb-3" aria-hidden="true" />
          <p className="text-sm sm:text-base text-theme-text-muted-light dark:text-theme-text-muted-dark">
            No payment gateways configured yet
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-3 sm:mt-4 px-4 sm:px-6 py-1.5 sm:py-2 bg-theme-primary text-white rounded-lg hover:bg-theme-primary-hover transition-colors text-xs sm:text-sm"
          >
            Add Your First Gateway
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
          {gateways.map((gateway) => (
            <PaymentGatewayCard
              key={gateway._id}
              gateway={gateway}
              onConfigure={handleConfigure}
              onToggle={handleToggle}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {showConfigModal && selectedGateway && (
        <ConfigureGatewayModal
          gateway={selectedGateway}
          onClose={() => {
            setShowConfigModal(false);
            setSelectedGateway(null);
          }}
          onSave={handleSave}
        />
      )}

      {showCreateModal && (
        <CreateGatewayModal
          onClose={() => setShowCreateModal(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}