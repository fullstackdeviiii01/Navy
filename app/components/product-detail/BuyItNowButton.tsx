// app/components/product-detail/BuyItNowButton.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useUser } from "../../context/UserContext";
import { cartApi } from "../../../lib/api/cart";
import { trackAddToCart } from "../../../lib/meta/pixel";

interface BuyItNowButtonProps {
  productId: string;
  quantity: number;
  disabled?: boolean;
  variantId?: string;
  variantAttributes?: Record<string, string>;
  productName?: string;
  productImage?: string;
  onBeforeBuy?: () => void;
}

export default function BuyItNowButton({
  productId,
  quantity,
  disabled,
  variantId,
  variantAttributes,
  productName,
  productImage,
  onBeforeBuy,
}: BuyItNowButtonProps) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleBuyItNow = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (disabled || isProcessing) return;

    if (onBeforeBuy) onBeforeBuy();

    setIsProcessing(true);

    try {
      // 1. Initialize dedicated Buy-It-Now session containing ONLY this product/quantity
      // (Customer's regular cart is NOT touched or modified)
      const data = await cartApi.initiateBuyNow(
        productId,
        quantity,
        variantId,
        variantAttributes,
        productName,
        productImage
      );

      // 2. Meta Pixel Event Tracking
      const addedItem = data?.cart?.items?.[0];
      const itemPrice = addedItem?.price_at_addition || 0;
      trackAddToCart({
        content_ids: [productId],
        content_name: productName || "Handcrafted Wooden Lamp",
        value: itemPrice * quantity,
        currency: "PKR",
        quantity,
      });

      // 3. Immediately navigate to checkout in express single-item mode
      router.push("/checkout?buy_now=1");
    } catch (error) {
      console.error("Failed to process Buy It Now:", error);
      alert("Failed to proceed to checkout. Please try again.");
      setIsProcessing(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleBuyItNow}
      disabled={disabled || isProcessing}
      className="w-full h-12 flex items-center justify-center gap-2 px-6 bg-[#FFCC00] hover:bg-[#E6B800] active:bg-[#CCA300] text-[#1C140E] font-sans font-bold text-xs sm:text-sm uppercase tracking-[0.15em] rounded-xs transition-colors duration-200 shadow-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
      aria-label="Buy it now"
    >
      {isProcessing ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin text-[#1C140E]" />
          <span>PROCESSING...</span>
        </>
      ) : (
        <span>BUY IT NOW</span>
      )}
    </button>
  );
}
