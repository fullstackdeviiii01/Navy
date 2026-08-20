// app/wishlist/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { FaHeart, FaTrash } from "react-icons/fa";
import { useUser } from "../../context/UserContext";
import { useWishlist } from "../../context/WishlistContext";
import ProductCard from "../../components/product/ProductCard";
import Loader from "../../components/shared/Loader";

export default function WishlistPage() {
  const router = useRouter();
  const { isLoading } = useUser();
  const { wishlist, wishlistCount, clearWishlist, loading } = useWishlist();

  const handleClearAll = async () => {
    if (!confirm("Are you sure you want to clear your entire wishlist?")) {
      return;
    }
    try {
      await clearWishlist();
    } catch (error) {
      console.error("Failed to clear wishlist:", error);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="relative h-64" role="status" aria-live="polite" aria-label="Loading wishlist">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-theme-bg-light dark:bg-theme-bg-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark flex items-center gap-3">
              <FaHeart className="text-red-500" aria-hidden="true" />
              <span>My Wishlist</span>
            </h1>
            <p className="text-theme-text-secondary-light dark:text-theme-text-secondary-dark mt-2" role="status" aria-live="polite" aria-atomic="true">
              {wishlistCount} {wishlistCount === 1 ? "item" : "items"} saved
            </p>
          </div>
          {wishlistCount > 0 && (
            <button
              onClick={handleClearAll}
              className="flex items-center gap-2 px-4 py-2 text-red-600 dark:text-red-400 border border-red-600 dark:border-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors min-h-[44px] min-w-[44px]"
              aria-label={`Clear all ${wishlistCount} items from wishlist`}
            >
              <FaTrash />
              <span>Clear All</span>
            </button>
          )}
        </header>

        {/* Wishlist Items */}
        <main role="main" aria-label="Wishlist products">
          {wishlistCount === 0 ? (
            <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg shadow-sm p-12 text-center" role="status" aria-live="polite">
              <FaHeart className="text-6xl text-gray-300 dark:text-gray-600 mx-auto mb-4" aria-hidden="true" />
              <h2 className="text-xl font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark mb-2">
                Your wishlist is empty
              </h2>
              <p className="text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-6">
                Start adding items you love to your wishlist!
              </p>
              <button
                onClick={() => router.push("/products")}
                className="px-6 py-3 bg-theme-primary text-white rounded-lg hover:bg-theme-primary-hover transition-colors min-h-[44px] min-w-[44px]"
                aria-label="Browse all products"
              >
                Browse Products
              </button>
            </div>
          ) : (
            <section aria-label={`${wishlistCount} wishlist products`}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {wishlist.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}