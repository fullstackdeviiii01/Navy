// app/(public)/pages/CartPage.tsx
"use client";

import { useState, useEffect } from "react";
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
  const { loading: userLoading, refreshCart, isAuthenticated } = useUser();
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
      <div className="relative h-64 md:h-80 flex items-center justify-center bg-theme-bg-light dark:bg-theme-bg-dark">
        <Loader />
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return <EmptyCart />;
  }

  const totalItemsCount = cart.items.reduce(
    (acc: number, item: any) => acc + (item.quantity || 1),
    0
  );

  return (
    <div className="min-h-screen bg-theme-bg-light dark:bg-theme-bg-dark transition-colors">
      <ExitIntentPopup 
        isGuestUser={!isAuthenticated}
        hasItems={cart.items.length > 0}
      />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16">
        <h1 className="sr-only">Shopping Cart</h1>
        
        {/* Editorial Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 pb-8 mb-8 border-b border-theme-border-light dark:border-theme-border-dark">
          <div>
            <p className="text-xs font-medium tracking-[0.25em] uppercase text-theme-hover-light dark:text-theme-hover-dark mb-2">
              SECURE CHECKOUT
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-theme-text-primary-light dark:text-theme-text-primary-dark">
              Your <span className="italic font-normal font-serif text-theme-hover-light dark:text-theme-hover-dark">basket</span>
            </h2>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-theme-text-muted-light dark:text-theme-text-muted-dark">
              TOTAL ITEMS
            </p>
            <p className="text-lg sm:text-xl font-serif text-theme-text-primary-light dark:text-theme-text-primary-dark">
              {totalItemsCount} {totalItemsCount === 1 ? "Piece" : "Pieces"}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-sm" role="alert">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Cart Items Section */}
          <section className="lg:col-span-7 xl:col-span-8 space-y-4" aria-labelledby="cart-heading">
            <div className="flex items-center justify-between pb-3 border-b border-theme-border-light dark:border-theme-border-dark">
              <span className="text-xs uppercase tracking-[0.2em] font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
                Items in order ({cart.items.length})
              </span>
              <button
                onClick={handleClearCart}
                disabled={updating}
                className="text-xs uppercase tracking-[0.15em] font-medium text-theme-text-muted-light dark:text-theme-text-muted-dark hover:text-red-600 dark:hover:text-red-400 disabled:opacity-50 transition-colors"
                aria-label="Clear all items from cart"
              >
                Clear All
              </button>
            </div>

            {/* Cart Items List */}
            <div className="space-y-4">
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

            {/* Continue Shopping Link */}
            <div className="pt-6">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-medium text-theme-hover-light dark:text-theme-hover-dark hover:text-theme-text-primary-light dark:hover:text-theme-text-primary-dark transition-colors group"
              >
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                <span>CONTINUE SHOPPING</span>
              </Link>
            </div>
          </section>

          {/* Summary Section */}
          <aside className="lg:col-span-5 xl:col-span-4" aria-labelledby="summary-heading">
            <h2 id="summary-heading" className="sr-only">Order Summary</h2>
            <div className="lg:sticky lg:top-24">
              <CartSummary cart={cart} onCouponUpdate={handleCouponUpdate} />
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}