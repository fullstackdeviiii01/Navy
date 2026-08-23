// app/components/account/OrdersTab.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ordersApi } from "../../../lib/api/orders";
import {
  ShoppingBag,
  Clock,
  ArrowRight,
  AlertCircle,
  Package,
} from "lucide-react";
import Loader from "../shared/Loader";
import { formatPrice } from "../../../lib/utils/formatPrice";

interface OrdersTabProps {
  dbUser: any;
  limit?: number;
  isOverview?: boolean;
  onOrdersLoaded?: (orders: any[]) => void;
}

export default function OrdersTab({
  dbUser,
  limit,
  isOverview = false,
  onOrdersLoaded,
}: OrdersTabProps) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await ordersApi.getOrders();
      const loadedOrders = data.orders || [];
      setOrders(loadedOrders);
      if (onOrdersLoaded) {
        onOrdersLoaded(loadedOrders);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "delivered":
        return "border-green-600/50 text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-950/40";
      case "shipped":
        return "border-indigo-600/50 text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40";
      case "cancelled":
        return "border-red-600/50 text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/40";
      case "confirmed":
      case "processing":
        return "border-purple-600/50 text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40";
      case "pending":
      default:
        return "border-amber-600/50 text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40";
    }
  };

  const displayedOrders = limit ? orders.slice(0, limit) : orders;

  if (loading) {
    return (
      <div className="py-12 flex justify-center items-center">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 dark:bg-red-950/40 border border-red-300 dark:border-red-800 text-red-900 dark:text-red-200 text-xs">
        <div className="flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    if (isOverview) {
      return (
        <div className="text-center py-10 space-y-3">
          <p className="text-xs sm:text-sm text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
            You haven't placed any orders yet.
          </p>
          <Link
            href="/products"
            className="inline-block px-6 py-2.5 bg-theme-primary hover:bg-theme-hover-light dark:hover:bg-theme-hover-dark text-theme-btn-text text-xs font-semibold tracking-[0.18em] uppercase transition-colors"
          >
            Explore the collection
          </Link>
        </div>
      );
    }

    return (
      <div className="bg-theme-surface-light dark:bg-theme-surface-dark border border-theme-border-light dark:border-theme-border-dark p-12 text-center space-y-4">
        <div className="inline-flex p-4 bg-theme-card-light dark:bg-theme-card-dark text-theme-text-muted-light dark:text-theme-text-muted-dark border border-theme-border-light dark:border-theme-border-dark">
          <ShoppingBag size={32} />
        </div>
        <h3 className="text-lg font-serif text-theme-text-primary-light dark:text-theme-text-primary-dark">
          No Orders Placed Yet
        </h3>
        <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark max-w-sm mx-auto">
          When you place an order, you can review details, verify payments, and track live shipments right here.
        </p>
        <Link
          href="/products"
          className="inline-block px-8 py-3.5 bg-theme-primary hover:bg-theme-hover-light dark:hover:bg-theme-hover-dark text-theme-btn-text text-xs font-semibold tracking-[0.2em] uppercase transition-colors"
        >
          Explore Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {displayedOrders.map((order) => {
        const isPaid = order.payment_status === "paid";
        const dateStr = new Date(order.placed_at)
          .toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
          .toUpperCase();

        const shippingLabel =
          order.shipping_service?.service_name ||
          order.shipping_service?.service_display_name ||
          "STANDARD";

        return (
          <div
            key={order._id}
            className="bg-theme-surface-light dark:bg-theme-surface-dark border border-theme-border-light dark:border-theme-border-dark overflow-hidden transition-all duration-300 hover:border-theme-hover-light/60"
          >
            {/* 1. Header Bar */}
            <div className="p-5 sm:p-6 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-[10px] tracking-[0.2em] uppercase text-theme-text-muted-light dark:text-theme-text-muted-dark mb-0.5">
                  ORDER REFERENCE
                </p>
                <h3 className="text-base sm:text-lg font-serif font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark tracking-wide">
                  {order.order_number}
                </h3>
                <div className="flex items-center gap-2 text-[11px] text-theme-text-secondary-light dark:text-theme-text-secondary-dark uppercase tracking-wider mt-1">
                  <Clock size={12} className="text-theme-hover-light dark:text-theme-hover-dark" />
                  <span>{dateStr}</span>
                  <span>•</span>
                  <span>{shippingLabel}</span>
                </div>
              </div>

              {/* Status & Payment Badges */}
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`px-2.5 py-1 text-[10px] font-semibold tracking-[0.15em] uppercase border ${getStatusBadge(
                    order.status
                  )}`}
                >
                  {order.status}
                </span>
                <span
                  className={`px-2.5 py-1 text-[10px] font-semibold tracking-[0.15em] uppercase border ${
                    isPaid
                      ? "border-green-600/50 text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-950/40"
                      : "border-amber-600/50 text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40"
                  }`}
                >
                  {isPaid ? "PAID" : "UNPAID"}
                </span>
              </div>
            </div>

            {/* 2. Items Section */}
            <div className="bg-theme-card-light/40 dark:bg-theme-card-dark/30 border-y border-theme-border-light dark:border-theme-border-dark divide-y divide-theme-border-light/60 dark:divide-theme-border-dark/60">
              {order.items?.map((item: any, idx: number) => {
                // Resolves image from product_image (item snapshot) or populated product images
                const itemImg =
                  item.product_image ||
                  item.product_id?.images?.[0]?.url ||
                  item.image ||
                  "";
                const itemName = item.product_name || item.name || "Handcrafted Lamp";

                // Format variant attributes (e.g. Color: Walnut, Size: Standard)
                let itemVariant = "";
                if (item.variant_attributes) {
                  if (typeof item.variant_attributes === "object") {
                    itemVariant = Object.entries(item.variant_attributes)
                      .map(([k, v]) => `${k}: ${v}`)
                      .join(" · ");
                  }
                } else if (item.variant_name) {
                  itemVariant = item.variant_name;
                } else if (item.selected_options) {
                  itemVariant = Object.values(item.selected_options).join(" · ");
                }

                return (
                  <div
                    key={item._id || idx}
                    className="p-4 sm:p-5 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4">
                      {/* Thumbnail */}
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-theme-bg-light dark:bg-theme-bg-dark border border-theme-border-light dark:border-theme-border-dark flex-shrink-0 overflow-hidden relative">
                        {itemImg ? (
                          <img
                            src={itemImg}
                            alt={itemName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-theme-text-muted-light dark:text-theme-text-muted-dark bg-theme-card-light dark:bg-theme-card-dark">
                            <Package size={22} />
                          </div>
                        )}
                      </div>

                      <div>
                        <h4 className="text-xs sm:text-sm font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark line-clamp-1 font-serif">
                          {itemName}
                        </h4>
                        <p className="text-[10px] tracking-[0.15em] uppercase text-theme-text-muted-light dark:text-theme-text-muted-dark mt-1">
                          QTY {item.quantity || 1}{" "}
                          {itemVariant ? `· ${itemVariant.toUpperCase()}` : ""}
                        </p>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <p className="text-xs sm:text-sm font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark font-mono">
                        PKR {((item.price || 0) * (item.quantity || 1)).toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 3. Footer Bar */}
            <div className="p-5 sm:p-6 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-[10px] tracking-[0.2em] uppercase text-theme-text-muted-light dark:text-theme-text-muted-dark mb-0.5">
                  ORDER TOTAL
                </p>
                <p className="text-lg sm:text-xl font-bold font-serif text-theme-hover-light dark:text-theme-hover-dark">
                  PKR {(order.pricing?.total || 0).toLocaleString()}
                </p>
              </div>

              <Link
                href={`/orders/${order._id}`}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-theme-card-light dark:bg-theme-card-dark hover:bg-theme-hover-light dark:hover:bg-theme-hover-dark hover:text-white border border-theme-border-light dark:border-theme-border-dark text-theme-text-primary-light dark:text-theme-text-primary-dark text-[11px] font-semibold tracking-[0.2em] uppercase transition-colors group"
              >
                <span>VIEW DETAILS</span>
                <ArrowRight
                  size={14}
                  className="transition-transform group-hover:translate-x-1 duration-200"
                />
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}