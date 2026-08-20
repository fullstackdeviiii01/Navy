// app/components/product-detail/AddToCartButton.tsx
"use client";

import { useState } from "react";
import { FaShoppingCart, FaCheck } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useUser } from "../../context/UserContext";
import { cartApi } from "../../../lib/api/cart";

interface AddToCartButtonProps {
  productId: string;
  quantity: number;
  disabled?: boolean;
  variantId?: string;
  onSuccess?: () => void;
}

export default function AddToCartButton({
  productId,
  quantity,
  disabled,
  variantId,
  onSuccess,
}: AddToCartButtonProps) {
  const { isAuthenticated, refreshCart } = useUser();
  const router = useRouter();
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    setIsAdding(true);
    try {
      await cartApi.addItem(productId, quantity, variantId);
      await refreshCart();
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 2000);
      
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
      className="flex-1 flex items-center justify-center gap-1 sm:gap-1.5 md:gap-2 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-2.5 bg-theme-primary hover:bg-theme-primary-hover text-white font-semibold text-xs sm:text-sm md:text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      aria-label={isAdded ? "Item added to cart" : isAdding ? "Adding item to cart" : "Add item to cart"}
      aria-live="polite"
      aria-atomic="true"
    >
      {isAdded ? (
        <>
          <FaCheck className="text-xs sm:text-sm md:text-base"/>
          <span className="whitespace-nowrap">Added!</span>
        </>
      ) : (
        <span className="whitespace-nowrap">{isAdding ? "Adding..." : "Add to Cart"}</span>
      )}
    </button>
  );
}