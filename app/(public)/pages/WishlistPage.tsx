// app/(public)/pages/WishlistPage.tsx
"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Heart, Trash2, ChevronRight, ChevronsRight, Sparkles } from "lucide-react";
import { useUser } from "../../context/UserContext";
import { useWishlist } from "../../context/WishlistContext";
import ProductCard from "../../components/product/ProductCard";
import Loader from "../../components/shared/Loader";

export default function WishlistPage() {
  const router = useRouter();
  const { isLoading } = useUser();
  const { wishlist, wishlistCount, clearWishlist, loading } = useWishlist();

  const handleClearAll = async () => {
    if (!confirm("Are you sure you want to remove all saved pieces from your wishlist?")) {
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
      <div className="min-h-[60vh] flex items-center justify-center bg-theme-bg-light dark:bg-theme-bg-dark" role="status" aria-live="polite" aria-label="Loading wishlist">
        <Loader text="LOADING WISHLIST..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-theme-bg-light dark:bg-theme-bg-dark py-12 sm:py-16 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] mb-8" aria-label="Breadcrumb">
          <Link
            href="/"
            className="text-theme-text-muted-light dark:text-theme-text-muted-dark hover:text-theme-text-primary-light dark:hover:text-theme-text-primary-dark transition-colors"
          >
            HOME
          </Link>
          <ChevronRight className="w-3 h-3 text-theme-text-muted-light dark:text-theme-text-muted-dark" />
          <span className="text-theme-text-primary-light dark:text-theme-text-primary-dark font-medium">
            WISHLIST
          </span>
        </nav>

        {/* Editorial Header */}
        <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-8 border-b border-theme-border-light dark:border-theme-border-dark mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-medium tracking-[0.25em] uppercase text-theme-hover-light dark:text-theme-hover-dark">
                SAVED PIECES
              </span>
              <span className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark font-mono">
                ({wishlistCount})
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif text-theme-text-primary-light dark:text-theme-text-primary-dark">
              Your <span className="italic font-normal font-serif text-theme-hover-light dark:text-theme-hover-dark">Collection</span>
            </h1>
            <p className="text-xs sm:text-sm text-theme-text-secondary-light dark:text-theme-text-secondary-dark mt-2">
              Artisanal pieces curated for your living spaces and architectural projects.
            </p>
          </div>

          {wishlistCount > 0 && (
            <button
              onClick={handleClearAll}
              className="self-start sm:self-auto inline-flex items-center gap-2 px-5 py-3 border border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-500/10 text-xs uppercase tracking-[0.2em] font-medium transition-colors"
              aria-label={`Clear all ${wishlistCount} items from wishlist`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>CLEAR ALL</span>
            </button>
          )}
        </header>

        {/* Wishlist Items Content */}
        <main role="main" aria-label="Wishlist products">
          {wishlistCount === 0 ? (
            <div className="border border-dashed border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark p-12 sm:p-20 text-center max-w-2xl mx-auto space-y-6" role="status" aria-live="polite">
              <div className="inline-flex items-center justify-center w-16 h-16 border border-theme-border-light dark:border-theme-border-dark bg-theme-card-light/50 dark:bg-theme-card-dark/30 text-theme-hover-light dark:text-theme-hover-dark mb-2">
                <Heart className="w-7 h-7" strokeWidth={1.5} />
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium tracking-[0.25em] uppercase text-theme-hover-light dark:text-theme-hover-dark">
                  EMPTY WISHLIST
                </p>
                <h2 className="text-2xl sm:text-3xl font-serif italic text-theme-text-primary-light dark:text-theme-text-primary-dark">
                  Your collection is currently empty
                </h2>
                <p className="text-xs sm:text-sm text-theme-text-secondary-light dark:text-theme-text-secondary-dark max-w-md mx-auto leading-relaxed">
                  Explore our handcrafted luminaires, bespoke solid wood designs, and ambient lighting fixtures to save your favorites.
                </p>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => router.push("/products")}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 text-white dark:text-neutral-900 text-xs uppercase tracking-[0.2em] font-medium transition-colors shadow-sm group"
                  aria-label="Browse all products"
                >
                  <span>EXPLORE THE COLLECTION</span>
                  <ChevronsRight className="w-4 h-4 text-white dark:text-neutral-900 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          ) : (
            <section aria-label={`${wishlistCount} wishlist products`}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
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