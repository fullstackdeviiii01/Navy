// app/components/orders/orderdetail/OrderItems.tsx
"use client";

import Image from "next/image";
import { formatPrice } from "../../../../lib/utils/formatPrice";

interface OrderItem {
  product_image: string;
  product_name: string;
  variant_attributes?: { [key: string]: string };
  price: number;
  quantity: number;
  subtotal: number;
}

interface OrderItemsProps {
  items: OrderItem[];
}

export default function OrderItems({ items }: OrderItemsProps) {
  return (
    <div className="space-y-4">
      {items.map((item: OrderItem, index: number) => (
        <div
          key={index}
          className="flex gap-4 py-3 border-b border-theme-border-light dark:border-theme-border-dark last:border-0 last:pb-0"
        >
          <div className="relative flex-shrink-0 w-16 h-16 bg-theme-card-light dark:bg-theme-card-dark border border-theme-border-light dark:border-theme-border-dark overflow-hidden">
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

            {/* Variant Attributes */}
            {item.variant_attributes && Object.keys(item.variant_attributes).length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-1">
                {Object.entries(item.variant_attributes).map(([key, value]) => (
                  <span
                    key={key}
                    className="inline-flex items-center px-2 py-0.5 border border-theme-border-light dark:border-theme-border-dark bg-theme-card-light/40 dark:bg-theme-card-dark/30 text-theme-text-secondary-light dark:text-theme-text-secondary-dark text-[11px] uppercase tracking-wider"
                  >
                    <span className="text-theme-text-muted-light dark:text-theme-text-muted-dark mr-1">{key}:</span>
                    <span className="font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark">{value}</span>
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-baseline justify-between mt-2">
              <p className="text-xs uppercase tracking-wider text-theme-text-muted-light dark:text-theme-text-muted-dark">
                {formatPrice(item.price)} × {item.quantity}
              </p>
              <p className="text-xs sm:text-sm font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                {formatPrice(item.subtotal)}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}