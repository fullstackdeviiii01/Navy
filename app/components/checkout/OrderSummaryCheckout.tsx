// app/components/checkout/OrderSummaryCheckout.tsx
"use client";

import { Tag, Truck, User, ShoppingBag } from "lucide-react";
import Image from "next/image";
import { formatPrice } from "../../../lib/utils/formatPrice";

interface OrderSummaryCheckoutProps {
  cart: any;
  guestInfo?: {
    email: string;
    name: string;
    phone: string;
  };
  shippingAddress: any;
  billingAddress: any;
  onPlaceOrder: () => void;
  processing: boolean;
}

export default function OrderSummaryCheckout({
  cart,
  guestInfo,
  onPlaceOrder,
  processing,
}: OrderSummaryCheckoutProps) {
  return (
    <div className="border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark transition-colors">
      {/* Header */}
      <div className="p-5 border-b border-theme-border-light dark:border-theme-border-dark flex items-center justify-between">
        <h2 className="text-base font-serif italic text-theme-text-primary-light dark:text-theme-text-primary-dark">
          Order Summary
        </h2>
        <span className="text-[11px] uppercase tracking-[0.15em] text-theme-text-muted-light dark:text-theme-text-muted-dark">
          {cart.items?.length || 0} {cart.items?.length === 1 ? "piece" : "pieces"}
        </span>
      </div>

      {/* Items Preview */}
      <div className="p-5 border-b border-theme-border-light dark:border-theme-border-dark">
        <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
          {cart.items.map((item: any) => {
            const matchedVariant = item.variant_id && item.product_id?.variants?.find((v: any) => v._id === item.variant_id);
            const itemImageUrl = matchedVariant?.imageUrl || item.product_id?.images?.[0]?.url;

            return (
              <div key={item._id} className="flex gap-3">
                <div className="flex-shrink-0 w-14 h-14 bg-theme-card-light dark:bg-theme-card-dark border border-theme-border-light dark:border-theme-border-dark relative overflow-hidden">
                  {itemImageUrl ? (
                    <Image
                      src={itemImageUrl}
                      alt={item.product_id?.name || "Product"}
                      fill
                      className="object-cover"
                      sizes="56px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[9px] text-theme-text-muted-light">
                      No Img
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-serif text-theme-text-primary-light dark:text-theme-text-primary-dark truncate">
                    {item.product_id?.name}
                  </p>
                  <div className="flex items-baseline justify-between mt-1 gap-2">
                    <p className="text-[10px] uppercase tracking-wider text-theme-text-muted-light dark:text-theme-text-muted-dark">
                      Qty: {item.quantity}
                    </p>
                    <p className="text-xs font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark">
                      {formatPrice(item.price_at_addition * item.quantity)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pricing Details */}
      <div className="p-5 space-y-3">
        {/* Subtotal */}
        <div className="flex items-center justify-between text-xs">
          <span className="uppercase tracking-wider text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
            Subtotal
          </span>
          <span className="font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark">
            {formatPrice(cart.subtotal)}
          </span>
        </div>

        {/* Discount */}
        {cart.discount_amount > 0 && (
          <div className="flex items-center justify-between text-xs text-green-600 dark:text-green-400">
            <span className="flex items-center gap-1 uppercase tracking-wider">
              <Tag className="w-3 h-3" aria-hidden="true" />
              Promotion
            </span>
            <span className="font-medium">
              -{formatPrice(cart.discount_amount)}
            </span>
          </div>
        )}

        {/* Shipping */}
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1 uppercase tracking-wider text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
            <Truck className="w-3 h-3" aria-hidden="true" />
            Delivery
          </span>
          <span className="font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark">
            {cart.shipping_cost === 0 ? (
              <span className="text-green-600 dark:text-green-400 uppercase tracking-wider text-[11px]">FREE</span>
            ) : (
              formatPrice(cart.shipping_cost)
            )}
          </span>
        </div>

        {/* Total */}
        <div className="pt-3 border-t border-theme-border-light dark:border-theme-border-dark">
          <div className="flex items-baseline justify-between mb-4">
            <span className="text-xs uppercase tracking-[0.2em] font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
              Estimated Total
            </span>
            <span className="text-xl font-serif text-theme-text-primary-light dark:text-theme-text-primary-dark font-semibold">
              {formatPrice(cart?.total || 0)}
            </span>
          </div>

          {/* Desktop Proceed Button */}
          <button
            onClick={onPlaceOrder}
            disabled={processing}
            className="w-full py-3.5 px-4 bg-theme-primary hover:bg-theme-hover-light dark:hover:bg-theme-hover-dark text-theme-btn-text text-xs uppercase tracking-[0.2em] font-medium transition-all disabled:opacity-40 shadow-sm hidden lg:block"
          >
            {processing ? "PROCESSING..." : "CONTINUE TO PAYMENT"}
          </button>
        </div>
      </div>

      {/* Guest Info Display */}
      {guestInfo && (
        <div className="p-4 bg-theme-card-light/30 dark:bg-theme-card-dark/20 border-t border-theme-border-light dark:border-theme-border-dark">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-theme-hover-light dark:text-theme-hover-dark mb-1.5 flex items-center gap-1.5">
            <User className="w-3 h-3" aria-hidden="true" />
            Delivering To
          </p>
          <div className="space-y-0.5 text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
            <p className="font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark truncate">
              {guestInfo.name}
            </p>
            <p className="truncate text-theme-text-muted-light dark:text-theme-text-muted-dark">{guestInfo.email}</p>
            <p>{guestInfo.phone}</p>
          </div>
        </div>
      )}
    </div>
  );
}