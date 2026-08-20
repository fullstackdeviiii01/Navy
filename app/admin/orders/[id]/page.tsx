// app/(admin)/admin/orders/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { adminOrdersApi } from "../../../../lib/api/orders"
import AdminOrderDetailView from "../../../(admin)/components/orders/orderdetail/AdminOrderDetailView";

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
    } catch (error: any) {
      setError(error.message || "Failed to load order");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (status: string) => {
    try {
      await adminOrdersApi.updateStatus(order._id, status);
      fetchOrder(order._id);
    } catch (error: any) {
      alert(error.message || "Failed to update order status");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-theme-primary"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="text-center py-12">
        <p className="text-theme-error mb-4">{error || "Order not found"}</p>
        <button
          onClick={() => router.push("/admin/orders")}
          className="px-6 py-3 bg-theme-primary text-white rounded-lg hover:bg-theme-primary-hover"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  return (
    <AdminOrderDetailView
      order={order}
      onUpdateStatus={handleUpdateStatus}
      onRefresh={() => fetchOrder(order._id)}
    />
  );
}
