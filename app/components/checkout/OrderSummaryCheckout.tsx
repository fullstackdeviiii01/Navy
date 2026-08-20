// // app/components/checkout/OrderSummaryCheckout.tsx - UPDATED WITH STRIPE TAX
"use client";

import { Tag, Truck, User, Loader2 } from "lucide-react";
import { useCurrency } from "../../context/CurrencyContext";

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
  taxAmount?: number;       // NEW: Stripe Tax amount
  taxLoading?: boolean;     // NEW: Tax calculation loading state
  displayTotal?: number;    // NEW: Total including dynamic tax
}

export default function OrderSummaryCheckout({
  cart,
  guestInfo,
  shippingAddress,
  billingAddress,
  onPlaceOrder,
  processing,
  taxAmount = 0,
  taxLoading = false,
  displayTotal,
}: OrderSummaryCheckoutProps) {
  const { formatPrice } = useCurrency();

  // Use dynamic displayTotal if provided, otherwise fall back to cart.total
  const finalTotal = displayTotal !== undefined ? displayTotal : cart?.total || 0;

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-3 sm:px-4 md:px-5 py-2.5 sm:py-3 md:py-4 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
          Order Summary
        </h2>
      </div>

      {/* Items Preview */}
      <div className="p-3 sm:p-4 md:p-5 border-b border-gray-200 dark:border-gray-700">
        <div className="space-y-2.5 sm:space-y-3 max-h-48 sm:max-h-56 md:max-h-64 overflow-y-auto">
          {cart.items.map((item: any) => (
            <div key={item._id} className="flex gap-2 sm:gap-2.5 md:gap-3">
              <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 bg-gray-100 dark:bg-gray-700 rounded overflow-hidden">
                {item.product_id?.images?.[0]?.url && (
                  <img
                    src={item.product_id.images[0].url}
                    alt={item.product_id.name}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white line-clamp-1">
                  {item.product_id?.name}
                </p>
                <div className="flex items-center justify-between mt-0.5 sm:mt-1 gap-2">
                  <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                    Qty: {item.quantity}
                  </p>
                  <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
                    {formatPrice(item.price_at_addition * item.quantity)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing Details */}
      <div className="p-3 sm:p-4 md:p-5 space-y-2 sm:space-y-2.5 md:space-y-3">
        {/* Subtotal */}
        <div className="flex items-center justify-between text-xs sm:text-sm">
          <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
          <span className="font-semibold text-gray-900 dark:text-white">
            {formatPrice(cart.subtotal)}
          </span>
        </div>

        {/* Discount */}
        {cart.discount_amount > 0 && (
          <div className="flex items-center justify-between text-xs sm:text-sm text-green-600 dark:text-green-400">
            <span className="flex items-center gap-1">
              <Tag className="w-3 h-3 sm:w-3.5 sm:h-3.5" aria-hidden="true" />
              Discount
            </span>
            <span className="font-semibold">
              -{formatPrice(cart.discount_amount)}
            </span>
          </div>
        )}

        {/* Tax — Dynamic Stripe Tax */}
        <div className="flex items-center justify-between text-xs sm:text-sm">
          <span className="text-gray-600 dark:text-gray-400">Tax</span>
          <span className="font-semibold text-gray-900 dark:text-white">
            {taxLoading ? (
              <span className="flex items-center gap-1 text-gray-400 dark:text-gray-500">
                <Loader2 className="w-3 h-3 animate-spin" />
                Calculating...
              </span>
            ) : taxAmount > 0 ? (
              formatPrice(taxAmount)
            ) : (
              <span className="text-gray-400 dark:text-gray-500 text-xs">
                —
              </span>
            )}
          </span>
        </div>

        {/* Shipping */}
        <div className="flex items-center justify-between text-xs sm:text-sm">
          <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
            <Truck className="w-3 h-3 sm:w-3.5 sm:h-3.5" aria-hidden="true" />
            Shipping
          </span>
          <span className="font-semibold text-gray-900 dark:text-white">
            {cart.shipping_cost === 0 ? (
              <span className="text-green-600 dark:text-green-400">FREE</span>
            ) : (
              formatPrice(cart.shipping_cost)
            )}
          </span>
        </div>

        {/* Total */}
        <div className="pt-2 sm:pt-2.5 md:pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <span className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
              Total
            </span>
            <span className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
              {taxLoading ? (
                <span className="flex items-center gap-1">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </span>
              ) : (
                formatPrice(finalTotal)
              )}
            </span>
          </div>

          {/* Desktop Place Order Button */}
          <button
            onClick={onPlaceOrder}
            disabled={processing || taxLoading}
            className="w-full px-4 sm:px-5 py-2.5 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hidden lg:block active:scale-[0.98]"
          >
            {processing ? "Processing..." : "Continue to Payment"}
          </button>
        </div>
      </div>

      {/* Guest Info Display */}
      {guestInfo && (
        <div className="px-3 sm:px-4 md:px-5 py-2.5 sm:py-3 md:py-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
          <p className="text-[10px] sm:text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5 sm:mb-2 flex items-center gap-1">
            <User className="w-3 h-3 sm:w-3.5 sm:h-3.5" aria-hidden="true" />
            Guest Checkout
          </p>
          <div className="space-y-0.5 sm:space-y-1 text-xs sm:text-sm">
            <p className="text-gray-900 dark:text-white font-medium truncate">
              {guestInfo.name}
            </p>
            <p className="text-gray-600 dark:text-gray-400 truncate">
              {guestInfo.email}
            </p>
            <p className="text-gray-600 dark:text-gray-400">{guestInfo.phone}</p>
          </div>
        </div>
      )}
    </div>
  );
}