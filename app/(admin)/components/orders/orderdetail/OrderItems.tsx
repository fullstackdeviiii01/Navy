// app/(admin)/components/orders/orderdetail/OrderItems.tsx (UPDATED WITH VARIANT SUPPORT)
"use client";

interface OrderItem {
  product_image: string;
  product_name: string;
  variant_attributes?: { [key: string]: string };
  price: number;
  quantity: number;
  subtotal: number;
}

interface AdminOrderItemsProps {
  items: OrderItem[];
}

export default function OrderItems({ items }: AdminOrderItemsProps) {
  return (
    <div className="space-y-3">
      {items.map((item: OrderItem, index: number) => (
        <div
          key={index}
          className="flex gap-3 py-3 border-b border-theme-border-light dark:border-theme-border-dark last:border-0 last:pb-0"
        >
          <div className="flex-shrink-0 w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
            {item.product_image && (
              <img
                src={item.product_image}
                alt={item.product_name}
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm text-theme-text-primary-light dark:text-theme-text-primary-dark truncate">
              {item.product_name}
            </h3>

            {/* Variant Attributes */}
            {item.variant_attributes && Object.keys(item.variant_attributes).length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {Object.entries(item.variant_attributes).map(([key, value]) => (
                  <span
                    key={key}
                    className="inline-flex items-center px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded"
                  >
                    <span className="capitalize">{key}:</span>
                    <span className="ml-1 font-medium">{value}</span>
                  </span>
                ))}
              </div>
            )}

            <p className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark mt-1">
              ${item.price.toFixed(2)} × {item.quantity}
            </p>
            <p className="text-sm font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark mt-1">
              ${item.subtotal.toFixed(2)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}