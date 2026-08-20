// app/components/product-detail/AddToWishlistButton.tsx
"use client";

import { useState } from "react";
import { FaHeart, FaRegHeart, FaSpinner } from "react-icons/fa";
import { useWishlist } from "../../context/WishlistContext";

interface AddToWishlistButtonProps {
  productId: string;
  variant?: "default" | "floating";
}

export default function AddToWishlistButton({
  productId,
  variant = "default",
}: AddToWishlistButtonProps) {
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const [isProcessing, setIsProcessing] = useState(false);

  const inWishlist = isInWishlist(productId);

  const handleToggleWishlist = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    setIsProcessing(true);
    try {
      if (inWishlist) {
        await removeFromWishlist(productId);
      } else {
        await addToWishlist(productId);
      }
    } catch (error: any) {
      console.error("Wishlist operation failed:", error);
      alert(error.message || "Failed to update wishlist. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (variant === "floating") {
    return (
      <button
        onClick={handleToggleWishlist}
        disabled={isProcessing}
        className="p-1.5 sm:p-2 bg-white dark:bg-gray-800 rounded-full shadow-md hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center"
        title={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
        aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
        aria-pressed={inWishlist}
        style={{ minWidth: "44px", minHeight: "44px" }}
      >
        {isProcessing ? (
          <FaSpinner
            className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-300 animate-spin"
             
          />
        ) : inWishlist ? (
          <FaHeart
            className="text-sm sm:text-base md:text-lg text-red-500"
             
          />
        ) : (
          <FaRegHeart
            className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-300"
             
          />
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleToggleWishlist}
      disabled={isProcessing}
      className={`flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-2.5 rounded-md sm:rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md ${
        inWishlist
          ? "bg-red-500 hover:bg-red-600 text-white"
          : "border border-theme-border-light dark:border-theme-border-dark text-theme-text-secondary-light dark:text-theme-text-secondary-dark hover:border-red-500 hover:text-red-500"
      }`}
      title={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
      aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
      aria-pressed={inWishlist}
      style={{ minWidth: "44px", minHeight: "44px" }}
    >
      {isProcessing ? (
        <FaSpinner
          className="text-xs sm:text-sm md:text-base animate-spin"
         
        />
      ) : inWishlist ? (
        <>
          <FaHeart
            className="text-xs sm:text-sm md:text-base"
            
          />
          <span className="font-semibold text-xs sm:text-sm md:text-base whitespace-nowrap">
            Wishlisted
          </span>
        </>
      ) : (
        <>
          <FaRegHeart
            className="text-xs sm:text-sm md:text-base"
            
          />
          <span className="font-semibold text-xs sm:text-sm md:text-base whitespace-nowrap">
            Add to Wishlist
          </span>
        </>
      )}
    </button>
  );
}
