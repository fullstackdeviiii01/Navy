// // app/(public)/pages/OrderConfirmationPage.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ordersApi } from "../../../lib/api/orders";
import {
  CheckCircle,
  Package,
  MapPin,
  CreditCard,
  ArrowRight,
} from "lucide-react";
import Loader from "../../components/shared/Loader";
import { formatPrice } from "../../../lib/utils/formatPrice";

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
            onClick={() => router.push("/")}
            className="px-6 py-3 bg-theme-primary text-white rounded-lg hover:bg-theme-primary-hover transition-colors min-h-[44px]"
            aria-label="Go to homepage"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-theme-bg-light dark:bg-theme-bg-dark py-12">
      <main className="container mx-auto px-4 max-w-4xl">
        {/* Success Section */}
        <header className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full mb-6" aria-hidden="true">
            <CheckCircle
              size={48}
              className="text-green-600 dark:text-green-400"
            />
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark mb-3">
            Order Placed Successfully!
          </h1>

          <p className="text-lg text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-6">
            Thank you for your order. We'll send you a confirmation email
            shortly.
          </p>

          <div className="inline-flex flex-col items-center gap-3 p-6 bg-theme-surface-light dark:bg-theme-surface-dark border-2 border-theme-primary rounded-xl">
            <span className="text-sm text-theme-text-muted-light dark:text-theme-text-muted-dark uppercase tracking-wide">
              Order Number
            </span>
            <span className="text-2xl font-mono font-bold text-theme-primary" aria-label={`Order number ${order.order_number}`}>
              {order.order_number}
            </span>
          </div>
        </header>

        {/* Order Details */}
        <div className="space-y-6">
          {/* Order Items */}
          <section className="bg-theme-surface-light dark:bg-theme-surface-dark border border-theme-border-light dark:border-theme-border-dark rounded-xl overflow-hidden" aria-labelledby="order-items-heading">
            <div className="p-6 border-b border-theme-border-light dark:border-theme-border-dark bg-gradient-to-r from-theme-primary/5 to-transparent">
              <h2 id="order-items-heading" className="text-xl font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark flex items-center gap-2">
                <Package size={22} aria-hidden="true" />
                Your Order
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                {order.items.map((item: any, index: number) => (
                  <article
                    key={index}
                    className="flex gap-4 pb-6 border-b border-theme-border-light dark:border-theme-border-dark last:border-0 last:pb-0"
                  >
                    <div className="flex-shrink-0 w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                      {item.product_image && (
                        <img
                          src={item.product_image}
                          alt={item.product_name}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                        {item.product_name}
                      </h3>

                      {/* Variant Attributes */}
                      {item.variant_attributes &&
                        Object.keys(item.variant_attributes).length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2" role="list" aria-label="Product attributes">
                            {Object.entries(item.variant_attributes).map(
                              ([key, value]: [string, any]) => (
                                <span
                                  key={key}
                                  className="inline-flex items-center px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded"
                                  role="listitem"
                                >
                                  <span className="capitalize">{key}:</span>
                                  <span className="ml-1 font-medium">
                                    {value}
                                  </span>
                                </span>
                              ),
                            )}
                          </div>
                        )}

                      <div className="flex items-center gap-4 mt-2 text-sm text-theme-text-muted-light dark:text-theme-text-muted-dark">
                        <span>Qty: {item.quantity}</span>
                        <span aria-hidden="true">•</span>
                        <span>{formatPrice(item.price)} each</span>
                      </div>
                      <p className="text-lg font-bold text-theme-primary mt-2">
                        {formatPrice(item.subtotal)}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Shipping Address */}
            <section className="bg-theme-surface-light dark:bg-theme-surface-dark border border-theme-border-light dark:border-theme-border-dark rounded-xl overflow-hidden" aria-labelledby="shipping-heading">
              <div className="p-5 border-b border-theme-border-light dark:border-theme-border-dark bg-gradient-to-r from-theme-primary/5 to-transparent">
                <h2 id="shipping-heading" className="font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark flex items-center gap-2">
                  <MapPin size={20} aria-hidden="true" />
                  Shipping Address
                </h2>
              </div>
              <address className="p-5 not-italic">
                <p className="font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark mb-2">
                  {order.shipping_address.full_name}
                </p>
                <p className="text-sm text-theme-text-secondary-light dark:text-theme-text-secondary-dark leading-relaxed">
                  {order.shipping_address.line1}
                  {order.shipping_address.line2 && (
                    <>
                      <br />
                      {order.shipping_address.line2}
                    </>
                  )}
                  <br />
                  {order.shipping_address.city}, {order.shipping_address.state}{" "}
                  {order.shipping_address.postal_code}
                  <br />
                  {order.shipping_address.country}
                </p>
              </address>
            </section>

            {/* Order Summary */}
            <section className="bg-theme-surface-light dark:bg-theme-surface-dark border border-theme-border-light dark:border-theme-border-dark rounded-xl overflow-hidden" aria-labelledby="summary-heading">
              <div className="p-5 border-b border-theme-border-light dark:border-theme-border-dark bg-gradient-to-r from-theme-primary/5 to-transparent">
                <h2 id="summary-heading" className="font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark flex items-center gap-2">
                  <CreditCard size={20} aria-hidden="true" />
                  Order Summary
                </h2>
              </div>
              <div className="p-5 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
                    Subtotal
                  </span>
                  <span className="font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark">
                    {formatPrice(order.pricing.subtotal)}
                  </span>
                </div>
                {order.pricing.discount_amount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600 dark:text-green-400">
                      Discount
                    </span>
                    <span className="font-medium text-green-600 dark:text-green-400">
                      -{formatPrice(order.pricing.discount_amount)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
                    Tax
                  </span>
                  <span className="font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark">
                    {formatPrice(order.pricing.tax_amount)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
                    Shipping
                  </span>
                  <span className="font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark">
                    {order.pricing.shipping_cost === 0
                      ? "FREE"
                      : `${formatPrice(order.pricing.shipping_cost)}`}
                  </span>
                </div>
                <div className="border-t-2 border-theme-border-light dark:border-theme-border-dark pt-3 flex justify-between items-center">
                  <span className="text-lg font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                    Total
                  </span>
                  <span className="text-2xl font-bold text-theme-primary">
                    {formatPrice(order.pricing.total)}
                  </span>
                </div>
              </div>
            </section>
          </div>

          {/* Action Buttons */}
          <nav className="flex flex-col sm:flex-row gap-4 justify-center pt-6" aria-label="Order actions">
            <button
              onClick={() => router.push("/account?tab=orders")}
              className="flex items-center justify-center gap-2 px-8 py-4 bg-theme-primary text-white font-semibold rounded-lg hover:bg-theme-primary-hover transition-colors shadow-lg hover:shadow-xl min-h-[44px]"
              aria-label="View all your orders"
            >
              View All Orders
              <ArrowRight size={20} />
            </button>
            <button
              onClick={() => router.push("/")}
              className="px-8 py-4 border-2 border-theme-border-light dark:border-theme-border-dark text-theme-text-primary-light dark:text-theme-text-primary-dark font-semibold rounded-lg hover:bg-theme-hover-bg-light dark:hover:bg-theme-hover-bg-dark transition-colors min-h-[44px]"
              aria-label="Continue shopping"
            >
              Continue Shopping
            </button>
          </nav>

          {/* Info Banner */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 text-center" role="note">
            <p className="text-sm text-blue-900 dark:text-blue-200">
              <strong>What's next?</strong> You'll receive an email confirmation
              shortly with your order details. We'll notify you when your order
              ships.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}