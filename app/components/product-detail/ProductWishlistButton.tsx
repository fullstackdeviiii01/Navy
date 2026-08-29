// app/components/product-detail/ProductWishlistButton.tsx
"use client";

import { useState } from "react";
import { Heart, Loader2 } from "lucide-react";
import { useWishlist } from "../../context/WishlistContext";

interface ProductWishlistButtonProps {
  productId: string;
  className?: string;
}

export default function ProductWishlistButton({
  productId,
  className = "",
}: ProductWishlistButtonProps) {
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const [loading, setLoading] = useState(false);

  const isSaved = isInWishlist(productId);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (loading) return;

    try {
      setLoading(true);
      if (isSaved) {
        await removeFromWishlist(productId);
      } else {
        await addToWishlist(productId);
      }
    } catch (err) {
      console.error("Failed to update wishlist:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={loading}
      title={isSaved ? "Saved to your Wishlist (Click to remove)" : "Save to your Wishlist"}
      aria-label={isSaved ? "Saved to your Wishlist" : "Save to your Wishlist"}
      className={`h-[50px] w-[50px] shrink-0 flex items-center justify-center border transition-all duration-200 active:scale-[0.97] disabled:opacity-50 ${
        isSaved
          ? "border-rose-500/60 bg-rose-500/10 text-rose-600 dark:text-rose-400 dark:border-rose-500/50"
          : "border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark hover:border-rose-400 hover:text-rose-500 dark:hover:border-rose-500"
      } ${className}`}
    >
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin text-theme-text-muted-light" />
      ) : (
        <Heart
          className={`w-5 h-5 transition-transform duration-200 ${
            isSaved
              ? "fill-rose-500 text-rose-500 scale-110"
              : "stroke-[1.65]"
          }`}
        />
      )}
    </button>
  );
}
