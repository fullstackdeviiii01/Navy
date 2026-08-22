// app/admin/orders/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { adminOrdersApi } from "../../../../lib/api/orders";
import OrderManifestDetailView from "../../../(admin)/fulfillment/views/OrderManifestDetailView";
import Loader from "../../../components/shared/Loader";

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (params.id) {
      fetchOrder(params.id as string);
    }
  }, [params.id]);

  const fetchOrder = async (orderId: string) => {
    try {
      const data = await adminOrdersApi.getById(orderId);
      setOrder(data.order);
    } catch (err: any) {
      setError(err.message || "Failed to load order manifest");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (
    status: string,
    trackingData?: { tracking_number: string; carrier: string }
  ) => {
    try {
      await adminOrdersApi.updateStatus(order._id, status, trackingData);
      fetchOrder(order._id);
    } catch (err: any) {
      alert(err.message || "Failed to update order status");
    }
  };

  if (loading) {
    return (
      <div className="min-h-[350px] flex items-center justify-center bg-theme-surface-light dark:bg-theme-surface-dark rounded-xl border border-theme-border-light dark:border-theme-border-dark p-12">
        <Loader />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="text-center py-16 bg-theme-surface-light dark:bg-theme-surface-dark rounded-xl border border-theme-border-light dark:border-theme-border-dark p-8 space-y-4">
        <p className="text-sm text-theme-text-muted-light">{error || "Order manifest not found"}</p>
        <button
          type="button"
          onClick={() => router.push("/admin/orders")}
          className="px-5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900 rounded-lg text-xs font-semibold shadow-xs"
        >
          Return to Fulfillment Directory
        </button>
      </div>
    );
  }

  return (
    <OrderManifestDetailView
      order={order}
      onUpdateStatus={handleUpdateStatus}
      onRefresh={() => fetchOrder(order._id)}
    />
  );
}
