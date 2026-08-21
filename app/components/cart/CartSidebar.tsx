// app/components/cart/CartSidebar.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, Minus, Plus, Trash2 } from "lucide-react";
import { useUser } from "../../context/UserContext";
import { cartApi } from "../../../lib/api/cart";
import { formatPrice } from "../../../lib/utils/formatPrice";

export default function CartSidebar() {
  const { cart, isCartOpen, closeCart, refreshCart } = useUser();
  const router = useRouter();

  const items = cart?.items || [];
  const itemCount = items.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0);

  // Close on escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCart();
    };
    if (isCartOpen) {
      document.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [isCartOpen, closeCart]);

  const handleRemove = async (itemId: string) => {
    try {
      await cartApi.removeItem(itemId);
      await refreshCart();
    } catch (error) {
      console.error("Failed to remove item:", error);
    }
  };

  const handleQuantityChange = async (itemId: string, newQty: number) => {
    if (newQty < 1) return handleRemove(itemId);
    try {
      await cartApi.updateQuantity(itemId, newQty);
      await refreshCart();
    } catch (error) {
      console.error("Failed to update quantity:", error);
    }
  };

  const handleViewCart = () => {
    closeCart();
    router.push("/cart");
  };

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Shopping cart">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={closeCart}
      />

      {/* Sidebar */}
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-theme-surface-light dark:bg-theme-surface-dark border-l border-theme-border-light dark:border-theme-border-dark shadow-2xl flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-theme-border-light dark:border-theme-border-dark">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] font-medium text-theme-hover-light dark:text-theme-hover-dark">
              YOUR BASKET
            </p>
            <h2 className="text-lg font-serif italic text-theme-text-primary-light dark:text-theme-text-primary-dark">
              Shopping Cart ({itemCount})
            </h2>
          </div>
          <button
            onClick={closeCart}
            className="p-1.5 text-theme-text-muted-light dark:text-theme-text-muted-dark hover:text-theme-text-primary-light dark:hover:text-theme-text-primary-dark transition-colors"
            aria-label="Close cart"
          >
            <X size={20} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <p className="text-sm font-serif italic text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-6">
                Your basket is empty
              </p>
              <button
                onClick={() => { closeCart(); router.push("/products"); }}
                className="px-6 py-3 bg-theme-primary hover:bg-theme-hover-light dark:hover:bg-theme-hover-dark text-theme-btn-text text-xs uppercase tracking-[0.2em] font-medium transition-colors"
              >
                START SHOPPING
              </button>
            </div>
          ) : (
            items.map((item: any) => {
              const product = item.product_id;
              const image = product?.images?.[0]?.url;
              return (
                <div key={item._id} className="flex gap-4 py-4 border-b border-theme-border-light/60 dark:border-theme-border-dark/60 last:border-0">
                  {/* Image */}
                  <div className="relative aspect-[4/5] w-20 flex-shrink-0 bg-theme-card-light dark:bg-theme-card-dark border border-theme-border-light/60 dark:border-theme-border-dark/60 overflow-hidden">
                    {image ? (
                      <img
                        src={image}
                        alt={product?.name || "Product"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-theme-text-muted-light dark:text-theme-text-muted-dark text-[10px]">
                        No image
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <p className="text-sm font-serif text-theme-text-primary-light dark:text-theme-text-primary-dark truncate">
                        {product?.name}
                      </p>
                      {item.variant_attributes && Object.keys(item.variant_attributes).length > 0 && (
                        <p className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark mt-0.5">
                          {Object.entries(item.variant_attributes).map(([k, v]) => `${k}: ${v}`).join(", ")}
                        </p>
                      )}
                      <p className="text-xs font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark mt-1">
                        {formatPrice(item.price_at_addition)}
                      </p>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center justify-between gap-2 mt-3 pt-2 border-t border-theme-border-light/40 dark:border-theme-border-dark/40">
                      <div className="inline-flex items-center border border-theme-border-light dark:border-theme-border-dark bg-theme-bg-light dark:bg-theme-bg-dark">
                        <button
                          onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                          className="w-6 h-6 flex items-center justify-center text-theme-text-primary-light dark:text-theme-text-primary-dark hover:bg-theme-card-light dark:hover:bg-theme-card-dark transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark min-w-[1.5rem] text-center px-1 border-x border-theme-border-light dark:border-theme-border-dark">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                          className="w-6 h-6 flex items-center justify-center text-theme-text-primary-light dark:text-theme-text-primary-dark hover:bg-theme-card-light dark:hover:bg-theme-card-dark transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => handleRemove(item._id)}
                        className="text-theme-text-muted-light dark:text-theme-text-muted-dark hover:text-red-600 dark:hover:text-red-400 p-1 transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-theme-border-light dark:border-theme-border-dark px-6 py-5 space-y-4 bg-theme-card-light/30 dark:bg-theme-card-dark/20">
            {/* Total */}
            <div className="flex items-baseline justify-between">
              <span className="text-xs uppercase tracking-[0.2em] font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
                Subtotal
              </span>
              <span className="text-lg font-serif text-theme-text-primary-light dark:text-theme-text-primary-dark">
                {formatPrice(cart?.subtotal || 0)}
              </span>
            </div>

            {/* Buttons */}
            <button
              onClick={handleViewCart}
              className="w-full py-3.5 bg-theme-primary hover:bg-theme-hover-light dark:hover:bg-theme-hover-dark text-theme-btn-text text-xs uppercase tracking-[0.2em] font-medium transition-colors"
            >
              VIEW BASKET & CHECKOUT
            </button>
            <button
              onClick={closeCart}
              className="w-full py-3 border border-theme-border-light dark:border-theme-border-dark text-theme-text-secondary-light dark:text-theme-text-secondary-dark text-xs uppercase tracking-[0.15em] font-medium hover:bg-theme-card-light dark:hover:bg-theme-card-dark transition-colors"
            >
              KEEP BROWSING
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slide-in-right {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
