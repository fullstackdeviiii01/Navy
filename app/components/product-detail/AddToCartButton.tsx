// app/components/product-detail/AddToCartButton.tsx
"use client";

import { useState } from "react";
import { Check, ShoppingBag, Loader2 } from "lucide-react";
import { useUser } from "../../context/UserContext";
import { cartApi } from "../../../lib/api/cart";

interface AddToCartButtonProps {
  productId: string;
  quantity: number;
  disabled?: boolean;
  variantId?: string;
  variantAttributes?: Record<string, string>;
  productName?: string;
  productImage?: string;
  onSuccess?: () => void;
}

export default function AddToCartButton({
  productId,
  quantity,
  disabled,
  variantId,
  variantAttributes,
  productName,
  productImage,
  onSuccess,
}: AddToCartButtonProps) {
  const { refreshCart, updateCart, openCart } = useUser();
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    setIsAdding(true);

    try {
      const data = await cartApi.addItem(
        productId,
        quantity,
        variantId,
        variantAttributes,
        productName,
        productImage
      );


      if (data?.cart) {
        updateCart?.(data.cart);
      }

      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 2000);
      openCart();
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Failed to add to cart:", error);
      alert("Failed to add item to cart. Please try again.");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <button
      onClick={handleAddToCart}
      disabled={disabled || isAdding}
      className="w-full h-[50px] flex items-center justify-center gap-3 px-6 sm:px-8 bg-theme-primary hover:bg-theme-hover-light dark:hover:bg-theme-hover-dark text-theme-btn-text font-medium text-xs sm:text-sm uppercase tracking-[0.2em] transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.99]"
      aria-label={isAdded ? "Item added to cart" : isAdding ? "Adding item to cart" : "Add item to cart"}
      aria-live="polite"
      aria-atomic="true"
    >
      {isAdded ? (
        <>
          <Check className="w-4 h-4 text-white"/>
          <span>ADDED TO BASKET</span>
        </>
      ) : isAdding ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin text-white" />
          <span>ADDING TO BASKET...</span>
        </>
      ) : (
        <>
          <ShoppingBag className="w-4 h-4" />
          <span>ADD TO BASKET</span>
        </>
      )}
    </button>
  );
}