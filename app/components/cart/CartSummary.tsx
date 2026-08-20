// app/components/cart/CartSummary.tsx - UPDATED WITH SHIPPING SERVICE
"use client";

import { useRouter } from "next/navigation";
import { ShoppingBag, Tag, Truck, Receipt } from "lucide-react";
import CouponSection from "./CouponSection";
import SaveCartEmail from "./SaveCartEmail";
import { useCurrency } from "../../context/CurrencyContext";
import { useUser } from "../../context/UserContext";

interface CartSummaryProps {
  cart: any;
  onCouponUpdate: () => void;
}

export default function CartSummary({
  cart,
  onCouponUpdate,
}: CartSummaryProps) {
  const router = useRouter();
  const { formatPrice } = useCurrency();
  const { isAuthenticated } = useUser();

  const shippingService = cart.selected_shipping_service_id;

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      <div className="px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 md:py-3 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-sm sm:text-base md:text-lg font-bold text-gray-900 dark:text-white flex items-center gap-1.5 sm:gap-2">
          <Receipt className="w-4 h-4 sm:w-5 sm:h-5" />
          Order Summary
        </h2>
      </div>

      <div className="p-3 sm:p-4 md:p-5 space-y-2.5 sm:space-y-3 md:space-y-4">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Subtotal ({cart.items.length})
          </span>
          <span className="text-xs sm:text-sm md:text-base font-semibold text-gray-900 dark:text-white">
            {formatPrice(cart.subtotal)}
          </span>
        </div>

        {cart.discount_amount > 0 && (
          <div className="flex items-center justify-between text-green-600 dark:text-green-400">
            <span className="flex items-center gap-1.5 text-xs sm:text-sm">
              <Tag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Discount
            </span>
            <span className="text-xs sm:text-sm md:text-base font-semibold">
              -{formatPrice(cart.discount_amount)}
            </span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            <Truck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Shipping
          </span>
          <span className="text-xs sm:text-sm md:text-base font-semibold text-gray-900 dark:text-white">
            {!cart.selected_shipping_service_id ? (
              <span className="text-gray-400 dark:text-gray-500 text-xs">
                Calculated at checkout
              </span>
            ) : cart.shipping_cost === 0 ? (
              <span className="text-green-600 dark:text-green-400">FREE</span>
            ) : (
              formatPrice(cart.shipping_cost)
            )}
          </span>
        </div>

        {shippingService && (
          <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-xs text-blue-800 dark:text-blue-200">
              {shippingService.display_name}
            </p>
            {shippingService.description && (
              <p className="text-xs text-blue-600 dark:text-blue-300 mt-0.5">
                {shippingService.description}
              </p>
            )}
          </div>
        )}

        <div className="pt-2 sm:pt-2.5 md:pt-3 border-t border-gray-200 dark:border-gray-700">
          <CouponSection cart={cart} onUpdate={onCouponUpdate} />
        </div>

        {!isAuthenticated && cart.items.length > 0 && (
          <div className="pt-2 sm:pt-2.5 md:pt-3 border-t border-gray-200 dark:border-gray-700">
            <SaveCartEmail source="cart_sidebar" />
          </div>
        )}

        <div className="pt-2 sm:pt-2.5 md:pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <span className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 dark:text-white">
              Total
            </span>
            <span className="text-lg sm:text-xl md:text-2xl font-bold text-blue-600 dark:text-blue-400">
              {formatPrice(cart.total)}
            </span>
          </div>

          <button
            onClick={() => router.push("/checkout")}
            className="w-full px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 md:py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm md:text-base font-semibold rounded-lg transition-colors shadow-sm hover:shadow-md"
          >
            Proceed to Checkout
          </button>

          <button
            onClick={() => router.push("/")}
            className="w-full mt-2 px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-xs sm:text-sm md:text-base font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}
