// app/(public)/pages/CartPage.tsx - UPDATE

"use client";

import { useState, useEffect } from "react";
import { useUser } from "../../context/UserContext";
import { cartApi } from "../../../lib/api/cart";
import CartItem from "../../components/cart/CartItem";
import CartSummary from "../../components/cart/CartSummary";
import EmptyCart from "../../components/cart/EmptyCart";
import ExitIntentPopup from "../../components/cart/ExitIntentPopup"; // ← ADD THIS
import Loader from "../../components/shared/Loader";

export default function CartPage() {
  const { loading: userLoading, refreshCart, isAuthenticated } = useUser(); // ← ADD isAuthenticated
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!userLoading) {
      fetchCart();
    }
  }, [userLoading]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const data = await cartApi.getCart();
      setCart(data.cart);
      setError("");
    } catch (err: any) {
      console.error("Failed to fetch cart:", err);
      setError("Failed to load cart");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (itemId: string, quantity: number) => {
    setUpdating(true);
    setError("");
    try {
      const data = await cartApi.updateQuantity(itemId, quantity);
      setCart(data.cart);
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
      setCart(data.cart);
      await refreshCart();
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
      setCart(data.cart);
      await refreshCart();
    } catch (err: any) {
      setError(err.message || "Failed to clear cart");
    } finally {
      setUpdating(false);
    }
  };

  const handleCouponUpdate = async () => {
    await fetchCart();
    await refreshCart();
  };

if (loading || userLoading) {
    return (
      <div className="relative h-64 md:h-80">
        <Loader />
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return <EmptyCart />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
       <ExitIntentPopup 
        isGuestUser={!isAuthenticated}
        hasItems={cart.items.length > 0}
      />
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-3 sm:py-4 md:py-6 lg:py-8">
        <h1 className="sr-only">Shopping Cart</h1>
        
        {error && (
          <div className="mb-3 sm:mb-4 p-2 sm:p-2.5 md:p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg" role="alert">
            <p className="text-xs sm:text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
          {/* Cart Items Section */}
          <section className="lg:col-span-2 space-y-2 sm:space-y-2.5 md:space-y-3" aria-labelledby="cart-heading">
            {/* Header */}
            <div className="flex items-center justify-between px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 md:py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h2 id="cart-heading" className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-gray-900 dark:text-white">
                  Shopping Cart
                </h2>
                <span className="px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs font-semibold bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full" aria-label={`${cart.items.length} items in cart`}>
                  {cart.items.length}
                </span>
              </div>
              <button
                onClick={handleClearCart}
                disabled={updating}
                className="text-xs sm:text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 disabled:opacity-50 transition-colors px-2 py-1 min-h-[44px]"
                aria-label="Clear all items from cart"
              >
                Clear
              </button>
            </div>

            {/* Cart Items */}
            <div className="space-y-2 sm:space-y-2.5">
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
          </section>

          {/* Summary Section */}
          <aside className="lg:col-span-1" aria-labelledby="summary-heading">
            <h2 id="summary-heading" className="sr-only">Order Summary</h2>
            <div className="lg:sticky lg:top-4">
              <CartSummary cart={cart} onCouponUpdate={handleCouponUpdate} />
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}