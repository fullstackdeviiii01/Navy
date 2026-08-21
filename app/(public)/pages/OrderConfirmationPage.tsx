// app/(public)/pages/OrderConfirmationPage.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ordersApi } from "../../../lib/api/orders";
import { Check, Package, MapPin, CreditCard, ArrowRight } from "lucide-react";
import Loader from "../../components/shared/Loader";
import { formatPrice } from "../../../lib/utils/formatPrice";
import Link from "next/link";
import Image from "next/image";

interface Props {
  orderId: string;
}

export default function OrderConfirmationPage({ orderId }: Props) {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-theme-bg-light dark:bg-theme-bg-dark flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-theme-bg-light dark:bg-theme-bg-dark flex items-center justify-center">
        <div className="text-center max-w-md px-4" role="alert">
          <p className="text-red-600 dark:text-red-400 text-xs uppercase tracking-wider mb-4">{error || "Order not found"}</p>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-3 bg-theme-primary text-theme-btn-text text-xs uppercase tracking-[0.2em] font-medium transition-colors"
          >
            RETURN HOME
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-theme-bg-light dark:bg-theme-bg-dark py-12 sm:py-16 transition-colors">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Section */}
        <header className="text-center mb-12 pb-10 border-b border-theme-border-light dark:border-theme-border-dark">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-green-500/10 border border-green-500/30 text-green-700 dark:text-green-300 mb-6" aria-hidden="true">
            <Check className="w-6 h-6" />
          </div>

          <p className="text-xs font-medium tracking-[0.25em] uppercase text-theme-hover-light dark:text-theme-hover-dark mb-2">
            THANK YOU
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif text-theme-text-primary-light dark:text-theme-text-primary-dark mb-4">
            Order <span className="italic font-normal font-serif text-theme-hover-light dark:text-theme-hover-dark">Confirmed</span>
          </h1>

          <p className="text-xs sm:text-sm text-theme-text-secondary-light dark:text-theme-text-secondary-dark max-w-lg mx-auto mb-8 leading-relaxed">
            Your pieces are now queued in our workshop. A confirmation receipt has been dispatched to your email.
          </p>

          <div className="inline-flex flex-col items-center gap-2 p-5 bg-theme-surface-light dark:bg-theme-surface-dark border border-theme-border-light dark:border-theme-border-dark">
            <span className="text-[10px] text-theme-text-muted-light dark:text-theme-text-muted-dark uppercase tracking-[0.2em]">
              Order Number
            </span>
            <span className="text-xl font-mono font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark" aria-label={`Order number ${order.order_number}`}>
              {order.order_number}
            </span>
          </div>
        </header>

        {/* Order Details Grid */}
        <div className="space-y-8">
          {/* Items Preview */}
          <div className="border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark p-6">
            <h2 className="text-xs uppercase tracking-[0.2em] font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark mb-4">
              Order Items
            </h2>
            <div className="space-y-4">
              {order.items?.map((item: any, idx: number) => (
                <div key={idx} className="flex gap-4 py-3 border-b border-theme-border-light dark:border-theme-border-dark last:border-0">
                  <div className="relative w-16 h-16 bg-theme-card-light dark:bg-theme-card-dark border border-theme-border-light dark:border-theme-border-dark flex-shrink-0 overflow-hidden">
                    {item.product_image && (
                      <Image
                        src={item.product_image}
                        alt={item.product_name}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-serif text-sm text-theme-text-primary-light dark:text-theme-text-primary-dark truncate">
                      {item.product_name}
                    </h3>
                    <p className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark mt-1">
                      Qty: {item.quantity} × {formatPrice(item.price)}
                    </p>
                    <p className="text-xs font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark mt-1">
                      {formatPrice(item.subtotal)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping & Payment Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark p-6">
              <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark mb-3 flex items-center gap-2">
                <MapPin size={14} />
                Shipping Destination
              </h3>
              <div className="text-xs space-y-1 text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
                <p className="font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark">{order.shipping_address?.full_name}</p>
                <p>{order.shipping_address?.line1}</p>
                <p>{order.shipping_address?.city}, {order.shipping_address?.state}</p>
                <p>{order.shipping_address?.phone}</p>
              </div>
            </div>

            <div className="border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark p-6">
              <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark mb-3 flex items-center gap-2">
                <CreditCard size={14} />
                Payment & Total
              </h3>
              <div className="text-xs space-y-1.5 text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
                <p className="uppercase tracking-wider">Method: {order.payment_method?.toUpperCase()}</p>
                <p className="text-base font-serif text-theme-text-primary-light dark:text-theme-text-primary-dark font-semibold pt-1">
                  Total Paid: {formatPrice(order.pricing?.total || 0)}
                </p>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <Link
              href={`/track-order`}
              className="py-4 px-8 border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark hover:border-theme-hover-light text-xs uppercase tracking-[0.2em] font-medium text-center transition-colors"
            >
              Track This Order
            </Link>
            <Link
              href="/products"
              className="py-4 px-8 bg-theme-primary hover:bg-theme-hover-light dark:hover:bg-theme-hover-dark text-theme-btn-text text-xs uppercase tracking-[0.2em] font-medium text-center transition-colors"
            >
              Continue Exploring
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}