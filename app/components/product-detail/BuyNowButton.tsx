// app/components/product-detail/BuyNowButton.tsx
"use client";

import { useState } from "react";
import { FaBolt, FaSpinner } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useUser } from "../../context/UserContext";
import { cartApi } from "../../../lib/api/cart";

interface BuyNowButtonProps {
  productId: string;
  quantity: number;
  disabled?: boolean;
  variantId?: string;
  onSuccess?: () => void;
}

export default function BuyNowButton({
  productId,
  quantity,
  disabled,
  variantId,
  onSuccess,
}: BuyNowButtonProps) {
  const { isAuthenticated, refreshCart } = useUser();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleBuyNow = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    setIsProcessing(true);
    try {
      await cartApi.addItem(productId, quantity, variantId);
      await refreshCart();
      
      if (onSuccess) {
        onSuccess();
      }
      
      router.push("/checkout");
    } catch (error) {
      console.error("Failed to process:", error);
      alert("Failed to process. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <button
      onClick={handleBuyNow}
      disabled={disabled || isProcessing}
      className="flex-1 flex items-center justify-center gap-1 sm:gap-1.5 md:gap-2 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs sm:text-sm md:text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      aria-label={isProcessing ? "Processing purchase" : "Buy now and proceed to checkout"}
      aria-live="polite"
    >
      {isProcessing ? (
        <>
          <FaSpinner className="text-xs sm:text-sm md:text-base animate-spin" />
        </>
      ) : (
        <span className="whitespace-nowrap">Buy Now</span>
      )}
    </button>
  );
}