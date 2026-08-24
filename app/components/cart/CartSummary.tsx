// app/components/cart/CartSummary.tsx
"use client";

import { useRouter } from "next/navigation";
import CouponSection from "./CouponSection";
import SaveCartEmail from "./SaveCartEmail";
import { useUser } from "../../context/UserContext";
import { formatPrice } from "../../../lib/utils/formatPrice";

interface CartSummaryProps {
  cart: any;
  onCouponUpdate: () => void;
}

export default function CartSummary({
  cart,
  onCouponUpdate,
}: CartSummaryProps) {
  const router = useRouter();
  const { isAuthenticated } = useUser();

  const shippingService = cart.selected_shipping_service_id;

  return (
    <div className="border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark p-6 transition-colors">
      <h2 className="text-xl sm:text-2xl font-serif italic text-theme-text-primary-light dark:text-theme-text-primary-dark pb-4 border-b border-theme-border-light dark:border-theme-border-dark mb-6">
        Order Summary
      </h2>

      <div className="space-y-4">
        {/* Subtotal */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
            Subtotal ({cart.items.length} {cart.items.length === 1 ? "item" : "items"})
          </span>
          <span className="font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
            {formatPrice(cart.subtotal)}
          </span>
        </div>

        {/* Discount */}
        {cart.discount_amount > 0 && (
          <div className="flex items-center justify-between text-sm text-green-600 dark:text-green-400">
            <span>Discount</span>
            <span className="font-semibold">
              -{formatPrice(cart.discount_amount)}
            </span>
          </div>
        )}

        {/* Shipping */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
            Estimated Shipping
          </span>
          <span className="font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
            {!cart.selected_shipping_service_id ? (
              <span className="text-theme-text-muted-light dark:text-theme-text-muted-dark text-xs font-normal">
                Calculated at checkout
              </span>
            ) : (
              formatPrice(cart.shipping_cost || 0)
            )}
          </span>
        </div>

        {shippingService && (
          <div className="p-2.5 bg-theme-card-light/40 dark:bg-theme-card-dark/30 border border-theme-border-light/60 dark:border-theme-border-dark/60 text-xs">
            <p className="font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark">
              {shippingService.display_name}
            </p>
            {shippingService.description && (
              <p className="text-theme-text-muted-light dark:text-theme-text-muted-dark mt-0.5">
                {shippingService.description}
              </p>
            )}
          </div>
        )}

        {/* Promotional Code */}
        <div className="pt-4 border-t border-theme-border-light dark:border-theme-border-dark">
          <CouponSection cart={cart} onUpdate={onCouponUpdate} />
        </div>

        {!isAuthenticated && cart.items.length > 0 && (
          <div className="pt-4 border-t border-theme-border-light dark:border-theme-border-dark">
            <SaveCartEmail source="cart_sidebar" />
          </div>
        )}

        {/* Total & Action */}
        <div className="pt-5 border-t border-theme-border-light dark:border-theme-border-dark space-y-4">
          <div className="flex items-baseline justify-between">
            <span className="text-base font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark">
              Total
            </span>
            <span className="text-xl sm:text-2xl font-serif text-theme-text-primary-light dark:text-theme-text-primary-dark">
              {formatPrice(cart.total)}
            </span>
          </div>

          <button
            onClick={() => router.push("/checkout")}
            className="w-full py-4 px-6 bg-theme-primary hover:bg-theme-hover-light dark:hover:bg-theme-hover-dark text-theme-btn-text uppercase tracking-[0.2em] text-xs font-medium transition-all shadow-sm active:scale-[0.99] flex items-center justify-center gap-2"
          >
            PROCEED TO CHECKOUT
          </button>
        </div>
      </div>
    </div>
  );
}
