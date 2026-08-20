// app/components/cart/CouponSection.tsx - PROFESSIONAL DESIGN
"use client";

import { useState } from "react";
import { cartApi } from "../../../lib/api/cart";
import { Tag, X, Check, Loader2 } from "lucide-react";

interface CouponSectionProps {
  cart: any;
  onUpdate: () => void;
}

export default function CouponSection({ cart, onUpdate }: CouponSectionProps) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    setMessage("");

    try {
      const data = await cartApi.applyCoupon(code);
      setMessage(`Saved Rs. ${data.discount.toFixed(2)}`);
      setIsError(false);
      setCode("");
      onUpdate();
    } catch (error: any) {
      setMessage(error.message || "Invalid code");
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCoupon = async () => {
    setLoading(true);
    setMessage("");
    try {
      await cartApi.removeCoupon();
      setMessage("Coupon removed");
      setIsError(false);
      onUpdate();
    } catch (error: any) {
      setMessage(error.message || "Failed to remove");
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
        Coupon Code
      </label>

      {cart.applied_coupon_id ? (
        <div className="flex items-center justify-between p-2 sm:p-2.5 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600 dark:text-green-400" />
            <span className="text-xs sm:text-sm font-medium text-green-800 dark:text-green-200">
              Applied
            </span>
          </div>
          <button
            onClick={handleRemoveCoupon}
            disabled={loading}
            className="p-2 sm:p-1 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200 transition-colors disabled:opacity-50"
            aria-label="Remove applied coupon code"
          >
            <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      ) : (
        <form onSubmit={handleApplyCoupon} className="flex gap-1.5 sm:gap-2">
          <div className="relative flex-1">
            <Tag className="absolute left-2 sm:left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <input
              id="coupon-code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="SAVE10"
              className="w-full pl-7 sm:pl-8 pr-2 sm:pr-2.5 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-mono uppercase focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            aria-label="Apply coupon code"
            disabled={loading || !code.trim()}
            className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 whitespace-nowrap"
          >
            {loading ? (
              <Loader2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 animate-spin" />
            ) : (
              "Apply"
            )}
          </button>
        </form>
      )}

      {message && (
        <p
          className={`text-[10px] sm:text-xs flex items-center gap-1 ${
            isError
              ? "text-red-600 dark:text-red-400"
              : "text-green-600 dark:text-green-400"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
