// // // app/orders(public)/pages/OrderDetailPage.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ordersApi } from "../../../lib/api/orders";
import UserOrderDetailView from "../../components/orders/orderdetail/UserOrderDetailView";
import Loader from "../../components/shared/Loader";

interface Props {
  orderId: string;
}

export default function OrderDetailPage({ orderId }: Props) {
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (orderId) {
      fetchOrder(orderId);
    }
  }, [orderId]);
  

  const fetchOrder = async (orderId: string) => {
    try {
      const data = await ordersApi.getOrderById(orderId);
      setOrder(data.order);
    } catch (error: any) {
      setError(error.message || "Failed to load order");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!confirm("Are you sure you want to cancel this order?")) return;

    try {
      await ordersApi.cancelOrder(order._id);
      fetchOrder(order._id);
    } catch (error: any) {
      alert(error.message || "Failed to cancel order");
    }
  };

  if (loading) {
    return (
      <div className="relative h-64">
        <Loader />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-theme-bg-light dark:bg-theme-bg-dark flex items-center justify-center">
        <div className="text-center max-w-md px-4" role="alert">
          <p className="text-theme-error mb-4">{error || "Order not found"}</p>
          <button
            onClick={() => router.push("/account?tab=orders")}
            className="px-6 py-3 bg-theme-primary text-white rounded-lg hover:bg-theme-primary-hover min-h-[44px]"
            aria-label="Go back to orders list"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <main>
      <h1 className="sr-only">Order Details for {order.order_number}</h1>
      <UserOrderDetailView
        order={order}
        onCancel={handleCancelOrder}
        onRefresh={() => fetchOrder(order._id)}
      />
    </main>
  );
}