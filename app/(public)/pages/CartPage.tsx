// app/(public)/pages/CartPage.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useUser } from "../../context/UserContext";
import { cartApi } from "../../../lib/api/cart";
import CartItem from "../../components/cart/CartItem";
import CartSummary from "../../components/cart/CartSummary";
import EmptyCart from "../../components/cart/EmptyCart";
import ExitIntentPopup from "../../components/cart/ExitIntentPopup";
import Loader from "../../components/shared/Loader";
import { ArrowLeft } from "lucide-react";

export default function CartPage() {
  const { cart: contextCart, loading: userLoading, refreshCart, updateCart, isAuthenticated } = useUser();
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(false);

  const cart = contextCart;

  const handleUpdateQuantity = async (itemId: string, quantity: number) => {
    setUpdating(true);
    setError("");
    try {
      const data = await cartApi.updateQuantity(itemId, quantity);
      if (data?.cart) {
        updateCart(data.cart);
      }
      await refreshCart();
    } catch (err: any) {
      setError(err.message || "Failed to update cart");
    } finally {
      setUpdating(false);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    setUpdating(true);
    setError("");
    try {
      const data = await cartApi.removeItem(itemId);
      if (data?.cart) {
        updateCart(data.cart);
      }
      await refreshCart();
    } catch (err: any) {
      setError(err.message || "Failed to remove item");
    } finally {
      setUpdating(false);
    }
  };

  const handleClearCart = async () => {
    if (!confirm("Are you sure you want to clear your cart?")) return;

    setUpdating(true);
    setError("");
    try {
      const data = await cartApi.clearCart();
      if (data?.cart) {
        updateCart(data.cart);
      }
      await refreshCart();
    } catch (err: any) {
      setError(err.message || "Failed to clear cart");
    } finally {
      setUpdating(false);
    }
  };

  const handleCouponUpdate = async () => {
    await refreshCart();
  };

  if (userLoading) {
    return (
      <div className="relative h-64 md:h-80 flex items-center justify-center bg-theme-bg-light dark:bg-theme-bg-dark">
        <Loader />
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return <EmptyCart />;
  }

  return (
    <div className="min-h-screen bg-theme-bg-light dark:bg-theme-bg-dark transition-colors">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        {/* Breadcrumb / Back Link */}
        <div className="mb-6">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-theme-text-muted-light dark:text-theme-text-muted-dark hover:text-theme-hover-light dark:hover:text-theme-hover-dark font-medium transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Continue Shopping</span>
          </Link>
        </div>

        {/* Editorial Heading */}
        <div className="mb-10 border-b border-theme-border-light dark:border-theme-border-dark pb-6">
          <p className="text-xs uppercase tracking-[0.2em] font-medium text-theme-hover-light dark:text-theme-hover-dark mb-2">
            Selected Luminaires
          </p>
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif text-theme-text-primary-light dark:text-theme-text-primary-dark">
              Shopping <span className="italic font-normal font-serif text-theme-hover-light dark:text-theme-hover-dark">Cart</span>
            </h1>
            <span className="text-xs uppercase tracking-[0.15em] text-theme-text-muted-light dark:text-theme-text-muted-dark">
              {cart.items.length} {cart.items.length === 1 ? "Piece" : "Pieces"} Selected
            </span>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs">
            <p>{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Items List (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-theme-border-light dark:border-theme-border-dark">
              <span className="text-xs uppercase tracking-[0.15em] font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
                Piece Details
              </span>
              <button
                onClick={handleClearCart}
                disabled={updating}
                className="text-xs uppercase tracking-[0.15em] text-theme-text-muted-light dark:text-theme-text-muted-dark hover:text-red-600 dark:hover:text-red-400 transition-colors disabled:opacity-50"
              >
                Clear Cart
              </button>
            </div>

            <div className="divide-y divide-theme-border-light dark:divide-theme-border-dark">
              {cart.items.map((item: any) => (
                <CartItem
                  key={item._id}
                  item={item}
                  onUpdateQuantity={handleUpdateQuantity}
                  onRemove={handleRemoveItem}
                  updating={updating}
                />
              ))}
            </div>
          </div>

          {/* Summary (5 cols) */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-24">
              <CartSummary
                cart={cart}
                onCouponUpdate={handleCouponUpdate}
              />
            </div>
          </div>
        </div>
      </main>

      {!isAuthenticated && (
        <ExitIntentPopup
          isGuestUser={!isAuthenticated}
          hasItems={cart.items.length > 0}
        />
      )}
    </div>
  );
}