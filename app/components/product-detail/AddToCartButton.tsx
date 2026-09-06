// app/components/product-detail/AddToCartButton.tsx
"use client";

import { useState } from "react";
import { Check, ShoppingBag, Loader2 } from "lucide-react";
import { useUser } from "../../context/UserContext";
import { cartApi } from "../../../lib/api/cart";
import { trackAddToCart } from "../../../lib/meta/pixel";

interface AddToCartButtonProps {
  productId: string;
  quantity: number;
  disabled?: boolean;
  variantId?: string;
  variantAttributes?: Record<string, string>;
  productName?: string;
  productImage?: string;
  onSuccess?: () => void;
  onBeforeAdd?: () => void;
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
  onBeforeAdd,
}: AddToCartButtonProps) {
  const { refreshCart, updateCart, openCart } = useUser();
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (onBeforeAdd) onBeforeAdd();

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

      // Meta Pixel Event Tracking
      const addedItem = data?.cart?.items?.find(
        (i: any) => (i.product_id?._id || i.product_id)?.toString() === productId?.toString()
      );
      const itemPrice = addedItem?.price || 0;
      trackAddToCart({
        content_ids: [productId],
        content_name: productName || "Handcrafted Wooden Lamp",
        value: itemPrice * quantity,
        currency: "PKR",
        quantity,
      });

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
      className="w-full h-12 flex items-center justify-center gap-2 px-3 sm:px-6 bg-[#4A2E18] hover:bg-[#3B2412] active:bg-[#2C1A0B] text-white font-sans font-bold text-xs sm:text-sm uppercase tracking-[0.15em] rounded-xs transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-xs whitespace-nowrap"
      aria-label={isAdded ? "Item added to cart" : isAdding ? "Adding item to cart" : "Add to cart"}
      aria-live="polite"
      aria-atomic="true"
    >
      {isAdded ? (
        <>
          <Check className="w-4 h-4 text-white"/>
          <span>ADDED TO CART</span>
        </>
      ) : isAdding ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin text-white" />
          <span>ADDING...</span>
        </>
      ) : (
        <span>ADD TO CART</span>
      )}
    </button>
  );
}