"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
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
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={closeCart}
      />

      {/* Sidebar */}
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white dark:bg-gray-900 shadow-xl flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Shopping Cart ({itemCount})
          </h2>
          <button
            onClick={closeCart}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Close cart"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">
                Your cart is empty
              </p>
              <button
                onClick={() => { closeCart(); router.push("/"); }}
                className="px-6 py-2 bg-theme-primary text-white rounded-lg hover:bg-theme-primary-hover transition-colors"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            items.map((item: any) => {
              const product = item.product_id;
              const image = product?.images?.[0]?.url;
              return (
                <div key={item._id} className="flex gap-3 py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
                  {/* Image */}
                  {image && (
                    <img
                      src={image}
                      alt={product?.name || "Product"}
                      className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                    />
                  )}

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {product?.name}
                    </p>
                    {item.variant_attributes && Object.keys(item.variant_attributes).length > 0 && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {Object.entries(item.variant_attributes).map(([k, v]) => `${k}: ${v}`).join(", ")}
                      </p>
                    )}
                    <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">
                      {formatPrice(item.price_at_addition)}
                    </p>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-2 mt-1">
                      <button
                        onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                        className="w-6 h-6 flex items-center justify-center rounded border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 text-sm"
                      >
                        -
                      </button>
                      <span className="text-sm text-gray-900 dark:text-white min-w-[1.5rem] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                        className="w-6 h-6 flex items-center justify-center rounded border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 text-sm"
                      >
                        +
                      </button>
                      <button
                        onClick={() => handleRemove(item._id)}
                        className="ml-auto text-xs text-red-500 hover:text-red-700"
                      >
                        Remove
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
          <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-4 space-y-3">
            {/* Total */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Subtotal</span>
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                {formatPrice(cart?.subtotal || 0)}
              </span>
            </div>

            {/* Buttons */}
            <button
              onClick={handleViewCart}
              className="w-full py-3 bg-theme-primary hover:bg-theme-primary-hover text-white font-semibold rounded-lg transition-colors"
            >
              View Cart
            </button>
            <button
              onClick={closeCart}
              className="w-full py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Keep Browsing
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
