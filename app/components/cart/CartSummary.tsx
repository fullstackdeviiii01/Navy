// app/components/cart/CartSummary.tsx
"use client";

import { useRouter } from "next/navigation";
import CouponSection from "./CouponSection";
import { formatPrice } from "../../../lib/utils/formatPrice";

interface CartSummaryProps {
  cart: any;
  onCouponUpdate: (updatedCart?: any) => void;
}

export default function CartSummary({
  cart,
  onCouponUpdate,
}: CartSummaryProps) {
  const router = useRouter();

  const shippingService = cart.selected_shipping_service_id;

  return (
    <div className="border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark p-6 transition-colors">
      <h2 className="text-xs uppercase tracking-[0.25em] font-medium text-theme-hover-light dark:text-theme-hover-dark pb-4 border-b border-theme-border-light dark:border-theme-border-dark">
        ORDER SUMMARY
      </h2>

      <div className="mt-5 space-y-4 text-xs sm:text-sm">
        {/* Subtotal */}
        <div className="flex justify-between text-theme-text-primary-light dark:text-theme-text-primary-dark">
          <span className="text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
            Subtotal
          </span>
          <span>{formatPrice(cart.subtotal)}</span>
        </div>

        {/* Discount */}
        {((cart.discount_amount && cart.discount_amount > 0) || (cart.discount && cart.discount > 0)) && (
          <div className="flex justify-between text-emerald-700 dark:text-emerald-400 font-medium">
            <span>
              Discount (
              {typeof cart.applied_coupon_id === "object" && cart.applied_coupon_id?.code
                ? cart.applied_coupon_id.code
                : cart.coupon_code || "Promo"}
              )
            </span>
            <span>-{formatPrice(cart.discount_amount || cart.discount || 0)}</span>
          </div>
        )}

        {/* Shipping */}
        <div className="flex justify-between text-theme-text-primary-light dark:text-theme-text-primary-dark">
          <span className="text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
            Shipping
          </span>
          <span>
            {cart.shipping_cost === undefined || cart.shipping_cost === null || !shippingService
              ? "Calculated at checkout"
              : cart.shipping_cost === 0
              ? <span className="text-emerald-700 dark:text-emerald-400 font-medium">Free</span>
              : formatPrice(cart.shipping_cost)}
          </span>
        </div>

        {/* Selected shipping service info if any */}
        {typeof shippingService === "object" && Boolean(shippingService?.display_name || shippingService?.name) && (
          <div className="p-2.5 bg-theme-card-light/40 dark:bg-theme-card-dark/40 border border-theme-border-light dark:border-theme-border-dark text-[11px]">
            <p className="font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark">
              {shippingService.display_name || shippingService.name}
            </p>
            {shippingService.description && (
              <p className="text-theme-text-muted-light dark:text-theme-text-muted-dark mt-0.5 text-[10px]">
                {shippingService.description}
              </p>
            )}
          </div>
        )}

        {/* Promotional Code */}
        <div className="pt-4 border-t border-theme-border-light dark:border-theme-border-dark">
          <CouponSection cart={cart} onUpdate={onCouponUpdate} />
        </div>

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
