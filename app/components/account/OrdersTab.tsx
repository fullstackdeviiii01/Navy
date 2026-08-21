// app/components/account/OrdersTab.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ordersApi } from "../../../lib/api/orders";
import {
  ShoppingBag,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import Loader from "../shared/Loader";
import { formatPrice } from "../../../lib/utils/formatPrice";

interface OrdersTabProps {
  dbUser: any;
  limit?: number;
}

export default function OrdersTab({ dbUser, limit }: OrdersTabProps) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await ordersApi.getOrders();
      setOrders(data.orders || []);
    } catch (err: any) {
      setError(err.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "delivered":
        return "border-green-600/60 text-green-400 bg-green-950/30";
      case "shipped":
        return "border-blue-600/60 text-blue-400 bg-blue-950/30";
      case "cancelled":
        return "border-red-600/60 text-red-400 bg-red-950/30";
      case "confirmed":
      case "processing":
        return "border-purple-600/60 text-purple-400 bg-purple-950/30";
      case "pending":
      default:
        return "border-amber-600/60 text-amber-400 bg-amber-950/30";
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
      <div className="p-4 bg-red-950/40 border border-red-800 text-red-200 text-xs">
        <div className="flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="bg-[#201509] border border-[#3D2C15] p-12 text-center space-y-4">
        <div className="inline-flex p-4 bg-[#180F05] text-[#D7D3CF]/40 border border-[#3D2C15]">
          <ShoppingBag size={32} />
        </div>
        <h3 className="text-lg font-serif text-[#F3EBDC]">No Orders Placed Yet</h3>
        <p className="text-xs text-[#D7D3CF]/70 max-w-sm mx-auto">
          When you place an order, you can review details, verify payments, and track live shipments right here.
        </p>
        <Link
          href="/products"
          className="inline-block px-8 py-3.5 bg-[#A8752B] hover:bg-[#C08A38] text-white text-xs font-semibold tracking-[0.2em] uppercase transition-colors"
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
            className="bg-[#201509] border border-[#3D2C15] overflow-hidden transition-all duration-300 hover:border-[#D4A359]/60"
          >
            {/* 1. Header Bar */}
            <div className="p-5 sm:p-6 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-[10px] tracking-[0.2em] uppercase text-[#D7D3CF]/60 mb-0.5">
                  ORDER REFERENCE
                </p>
                <h3 className="text-base sm:text-lg font-serif font-bold text-[#F3EBDC] tracking-wide">
                  {order.order_number}
                </h3>
                <div className="flex items-center gap-2 text-[11px] text-[#D7D3CF]/70 uppercase tracking-wider mt-1">
                  <Clock size={12} className="text-[#D4A359]" />
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
                      ? "border-green-600/60 text-green-400 bg-green-950/30"
                      : "border-amber-600/60 text-amber-400 bg-amber-950/30"
                  }`}
                >
                  {isPaid ? "PAID" : "UNPAID"}
                </span>
              </div>
            </div>

            {/* 2. Items Section (Darker Charcoal-Brown Nested Box) */}
            <div className="bg-[#180F05] border-y border-[#3D2C15] divide-y divide-[#3D2C15]/40">
              {order.items?.map((item: any, idx: number) => {
                const itemImg = item.product_id?.images?.[0]?.url || item.image || "";
                const itemVariant =
                  item.variant_name ||
                  (item.selected_options
                    ? Object.values(item.selected_options).join(" / ")
                    : null);

                return (
                  <div
                    key={item._id || idx}
                    className="p-4 sm:p-5 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4">
                      {/* Sharp Square Thumbnail */}
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#281E10] border border-[#3D2C15] flex-shrink-0 overflow-hidden">
                        {itemImg ? (
                          <img
                            src={itemImg}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-[#D7D3CF]/40">
                            No Img
                          </div>
                        )}
                      </div>

                      <div>
                        <h4 className="text-xs sm:text-sm font-medium text-[#F3EBDC] line-clamp-1">
                          {item.name}
                        </h4>
                        <p className="text-[10px] tracking-[0.15em] uppercase text-[#D7D3CF]/60 mt-1">
                          QTY {item.quantity}{" "}
                          {itemVariant ? `· ${itemVariant.toUpperCase()}` : ""}
                        </p>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <p className="text-xs sm:text-sm font-semibold text-[#F3EBDC] font-mono">
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
                <p className="text-[10px] tracking-[0.2em] uppercase text-[#D7D3CF]/60 mb-0.5">
                  ORDER TOTAL
                </p>
                <p className="text-lg sm:text-xl font-bold font-serif text-[#D4A359]">
                  PKR {(order.pricing?.total || 0).toLocaleString()}
                </p>
              </div>

              <Link
                href={`/orders/${order._id}`}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#2A1D0E] hover:bg-[#A8752B] border border-[#3D2C15] text-[#F3EBDC] text-[11px] font-semibold tracking-[0.2em] uppercase transition-colors group"
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