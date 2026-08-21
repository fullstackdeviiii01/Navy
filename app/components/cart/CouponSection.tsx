// app/components/cart/CouponSection.tsx
"use client";

import { useState } from "react";
import { cartApi } from "../../../lib/api/cart";
import { X, Check, Loader2 } from "lucide-react";

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
      <label
        htmlFor="coupon-code"
        className="block text-[11px] uppercase tracking-[0.2em] font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark"
      >
        PROMOTIONAL CODE
      </label>

      {cart.applied_coupon_id ? (
        <div className="flex items-center justify-between p-3 border border-green-600/30 bg-green-500/10 text-green-700 dark:text-green-300">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span className="text-xs uppercase tracking-wider font-medium">
              Coupon Applied
            </span>
          </div>
          <button
            onClick={handleRemoveCoupon}
            disabled={loading}
            className="p-1 text-green-700 dark:text-green-300 hover:text-red-500 transition-colors disabled:opacity-50"
            aria-label="Remove applied coupon code"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <form onSubmit={handleApplyCoupon} className="flex gap-2">
          <input
            id="coupon-code"
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Enter code"
            className="flex-1 px-3 py-2.5 text-xs bg-theme-bg-light dark:bg-theme-bg-dark border border-theme-border-light dark:border-theme-border-dark text-theme-text-primary-light dark:text-theme-text-primary-dark placeholder:text-theme-text-muted-light dark:placeholder:text-theme-text-muted-dark uppercase tracking-wider font-mono focus:outline-none focus:border-theme-hover-light dark:focus:border-theme-hover-dark transition-colors"
          />
          <button
            type="submit"
            aria-label="Apply promotional code"
            disabled={loading || !code.trim()}
            className="px-4 py-2.5 text-xs uppercase tracking-[0.15em] font-medium bg-theme-primary hover:bg-theme-hover-light dark:hover:bg-theme-hover-dark text-theme-btn-text disabled:opacity-40 disabled:cursor-not-allowed transition-colors whitespace-nowrap flex items-center justify-center min-w-[70px]"
          >
            {loading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              "Apply"
            )}
          </button>
        </form>
      )}

      {message && (
        <p
          className={`text-xs mt-1.5 ${
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
