// app/context/WishlistContext.tsx
"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useUser } from "./UserContext";
import { wishlistApi } from "../../lib/api/wishlist";

interface WishlistContextType {
  wishlist: any[];
  wishlistCount: number;
  isInWishlist: (productId: string) => boolean;
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  clearWishlist: () => Promise<void>;
  refreshWishlist: () => Promise<void>;
  loading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(
  undefined
);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading: userLoading } = useUser();
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch wishlist when user authenticates
  useEffect(() => {
  if (!userLoading) {
    fetchWishlist();
  }
}, [userLoading]);

 const fetchWishlist = async () => {
  try {
    setLoading(true);
    const data = await wishlistApi.getWishlist();
    setWishlist(data.wishlist || []);
  } catch (error) {
    console.error("Failed to fetch wishlist:", error);
    setWishlist([]);
  } finally {
    setLoading(false);
  }
};

  const isInWishlist = (productId: string): boolean => {
    return wishlist.some((item) => item._id?.toString() === productId?.toString());
  };

  const addToWishlist = async (productId: string) => {
    try {
      // Optimistic update
      const tempWishlist = [...wishlist];
      
      const result = await wishlistApi.addToWishlist(productId);
      
      // Refresh to get the full product data
      await fetchWishlist();
    } catch (error: any) {
      // If it's already in wishlist, just refresh to sync state
      if (error.message?.includes("already in wishlist")) {
        await fetchWishlist();
        return;
      }
      console.error("Failed to add to wishlist:", error);
      throw new Error(error.message || "Failed to add to wishlist");
    }
  };

  const removeFromWishlist = async (productId: string) => {
    try {
      // Optimistic update
      setWishlist(wishlist.filter((item) => item._id?.toString() !== productId?.toString()));
      
      await wishlistApi.removeFromWishlist(productId);
      
      // Refresh to ensure sync
      await fetchWishlist();
    } catch (error: any) {
      console.error("Failed to remove from wishlist:", error);
      // Revert on error
      await fetchWishlist();
      throw new Error(error.message || "Failed to remove from wishlist");
    }
  };

  const clearWishlist = async () => {
    try {
      // Optimistic update
      setWishlist([]);
      
      await wishlistApi.clearWishlist();
    } catch (error: any) {
      console.error("Failed to clear wishlist:", error);
      // Revert on error
      await fetchWishlist();
      throw new Error(error.message || "Failed to clear wishlist");
    }
  };

  const refreshWishlist = async () => {
    await fetchWishlist();
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistCount: wishlist.length,
        isInWishlist,
        addToWishlist,
        removeFromWishlist,
        clearWishlist,
        refreshWishlist,
        loading,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}