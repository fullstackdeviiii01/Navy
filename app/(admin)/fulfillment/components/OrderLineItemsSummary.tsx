// app/(admin)/fulfillment/components/OrderLineItemsSummary.tsx
"use client";

import { Package } from "lucide-react";

interface OrderLineItemsSummaryProps {
  items: Array<{
    product_id: string;
    variant_id?: string | null;
    product_name: string;
    product_image: string;
    variant_attributes?: Record<string, string>;
    quantity: number;
    price: number;
    subtotal: number;
  }>;
  pricing: {
    subtotal: number;
    discount_amount: number;
    tax_amount: number;
    shipping_cost: number;
    total: number;
    currency: string;
  };
}

export default function OrderLineItemsSummary({
  items,
  pricing,
}: OrderLineItemsSummaryProps) {
  return (
    <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-xl border border-theme-border-light dark:border-theme-border-dark p-4 sm:p-5 space-y-4 shadow-xs">
      <div className="border-b border-theme-border-light/80 dark:border-theme-border-dark/80 pb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark flex items-center gap-2">
          <Package className="w-4 h-4 text-theme-hover-light" />
          <span>Order Items ({items.length})</span>
        </h3>
      </div>

      {/* Items list */}
      <div className="space-y-3">
        {items.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between gap-3 p-3 rounded-lg bg-theme-bg-light/60 dark:bg-theme-bg-dark/40 border border-theme-border-light/60 dark:border-theme-border-dark/60 text-xs"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-12 rounded-lg border border-theme-border-light dark:border-theme-border-dark overflow-hidden bg-black/5 shrink-0">
                <img
                  src={item.product_image || "/placeholder-product.jpg"}
                  alt={item.product_name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="min-w-0">
                <p className="font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark truncate">
                  {item.product_name}
                </p>

                {item.variant_attributes && Object.keys(item.variant_attributes).length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {Object.entries(item.variant_attributes).map(([key, val]) => (
                      <span
                        key={key}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-theme-text-secondary-light dark:text-theme-text-secondary-dark"
                      >
                        {key}: {val}
                      </span>
                    ))}
                  </div>
                )}

                <p className="text-[11px] text-theme-text-muted-light mt-0.5">
                  Rs. {item.price.toLocaleString()} × {item.quantity}
                </p>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                Rs. {item.subtotal.toLocaleString()}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Pricing Summary */}
      <div className="border-t border-theme-border-light/80 dark:border-theme-border-dark/80 pt-3 space-y-1.5 text-xs">
        <div className="flex justify-between text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
          <span>Subtotal</span>
          <span>Rs. {pricing.subtotal.toLocaleString()}</span>
        </div>

        {pricing.discount_amount > 0 && (
          <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
            <span>Discount</span>
            <span>- Rs. {pricing.discount_amount.toLocaleString()}</span>
          </div>
        )}

        {pricing.tax_amount > 0 && (
          <div className="flex justify-between text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
            <span>Tax</span>
            <span>Rs. {pricing.tax_amount.toLocaleString()}</span>
          </div>
        )}

        <div className="flex justify-between text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
          <span>Shipping</span>
          <span>
            {pricing.shipping_cost === 0 ? "Free" : `Rs. ${pricing.shipping_cost.toLocaleString()}`}
          </span>
        </div>

        <div className="flex justify-between text-sm font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark pt-2 border-t border-theme-border-light/60 dark:border-theme-border-dark/60">
          <span>Total</span>
          <span>Rs. {pricing.total.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}
