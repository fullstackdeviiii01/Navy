// app/components/Header.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Search,
  Heart,
  User,
  ShoppingCart,
  Menu,
  X,
  ChevronsRight,
  Loader2,
  Package,
} from "lucide-react";
import { useUser } from "../context/UserContext";
import { useWishlist } from "../context/WishlistContext";
import { siteSettingsApi } from "../../lib/api/siteSettings";

interface CompanyInfo {
  company_name?: string;
  company_logo?: string;
}

interface ProductSearchResult {
  _id: string;
  name: string;
  slug?: string;
  price?: number;
  regular_price?: number;
  sale_price?: number;
  images?: Array<{ url: string; alt_text?: string }>;
  categoryName?: string;
}

export default function Header() {
  const { isAuthenticated, name, logout, cart, openCart } = useUser();
  const { wishlistCount } = useWishlist();
  const router = useRouter();

  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({});
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ProductSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const cartItemCount =
    cart?.items?.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0) || 0;

  useEffect(() => {
    fetchCompanyInfo();
  }, []);

  const fetchCompanyInfo = async () => {
    try {
      const data = await siteSettingsApi.getCompanyInfo();
      setCompanyInfo(data.company_info || {});
    } catch (error) {
      console.error("Failed to fetch company info:", error);
    }
  };

  // Close search dropdown on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsSearchOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  // Live Debounced Product-Only Search (with title-first accuracy)
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(
          `/api/products?search=${encodeURIComponent(searchQuery.trim())}&limit=6&status=active&titleOnly=true`
        );
        const data = await res.json();
        if (data && data.products) {
          setSearchResults(data.products);
        } else {
          setSearchResults([]);
        }
      } catch (err) {
        console.error("Search error:", err);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  };

  const handleProductClick = (productId: string) => {
    setIsSearchOpen(false);
    setSearchQuery("");
    router.push(`/product/${productId}`);
  };

  const handleSignOut = async () => {
    try {
      await logout();
      setIsMobileMenuOpen(false);
      router.push("/sign-in");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-theme-bg-light dark:bg-theme-bg-dark border-b border-theme-border-light dark:border-theme-border-dark text-theme-text-primary-light dark:text-theme-text-primary-dark shadow-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          
          {/* 1. START: Pure Monogram Emblem Box Logo (R | L) */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Mobile Menu Trigger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-1.5 text-theme-text-primary-light dark:text-theme-text-primary-dark hover:text-theme-hover-light dark:hover:text-theme-hover-dark transition-colors"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            <Link
              href="/"
              className="flex items-center group"
              aria-label="Rehan Wooden Lamps Home"
            >
              {companyInfo.company_logo ? (
                <div className="relative w-8 h-8 sm:w-10 sm:h-10">
                  <Image
                    src={companyInfo.company_logo}
                    alt="Logo"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
              ) : (
                /* Pure Monogram Box (R | L) */
                <div className="flex items-center border border-theme-hover-light/70 dark:border-theme-hover-dark/70 bg-theme-surface-light dark:bg-theme-surface-dark px-3 py-1.5 group-hover:border-theme-hover-light transition-all duration-300 shadow-sm">
                  <span className="font-serif text-xl sm:text-2xl text-theme-text-primary-light dark:text-theme-text-primary-dark tracking-tight font-normal">
                    R
                  </span>
                  <span className="h-5 w-[1.5px] bg-theme-hover-light dark:bg-theme-hover-dark mx-2 inline-block" />
                  <span className="font-serif text-xl sm:text-2xl text-theme-hover-light dark:text-theme-hover-dark tracking-tight font-normal">
                    L
                  </span>
                </div>
              )}
            </Link>
          </div>

          {/* 2. DEAD CENTER: Clean Editorial Navigation */}
          <nav className="hidden lg:flex items-center justify-center gap-7 xl:gap-9 flex-1">
            <Link
              href="/products"
              className="text-[11px] xl:text-xs font-mono uppercase tracking-[0.22em] text-theme-text-primary-light dark:text-theme-text-primary-dark hover:text-theme-hover-light dark:hover:text-theme-hover-dark transition-colors font-medium py-1"
            >
              COLLECTIONS
            </Link>

            <Link
              href="/categories"
              className="text-[11px] xl:text-xs font-mono uppercase tracking-[0.22em] text-theme-text-primary-light dark:text-theme-text-primary-dark hover:text-theme-hover-light dark:hover:text-theme-hover-dark transition-colors font-medium py-1"
            >
              CATEGORIES
            </Link>

            <Link
              href="/about"
              className="text-[11px] xl:text-xs font-mono uppercase tracking-[0.22em] text-theme-text-primary-light dark:text-theme-text-primary-dark hover:text-theme-hover-light dark:hover:text-theme-hover-dark transition-colors font-medium py-1"
            >
              CRAFTSMANSHIP
            </Link>

            <Link
              href="/contact"
              className="text-[11px] xl:text-xs font-mono uppercase tracking-[0.22em] text-theme-text-primary-light dark:text-theme-text-primary-dark hover:text-theme-hover-light dark:hover:text-theme-hover-dark transition-colors font-medium py-1"
            >
              BESPOKE & CONTACT
            </Link>

            <Link
              href="/track-order"
              className="text-[11px] xl:text-xs font-mono uppercase tracking-[0.22em] text-theme-text-primary-light dark:text-theme-text-primary-dark hover:text-theme-hover-light dark:hover:text-theme-hover-dark transition-colors font-medium py-1"
            >
              TRACK ORDER
            </Link>
          </nav>

          {/* 3. END: Actions Hub (Search, Wishlist, Account, Cart) */}
          <div className="flex items-center gap-3 sm:gap-5 shrink-0">
            
            {/* Search Trigger */}
            <div className="relative" ref={searchContainerRef}>
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className={`p-2 transition-colors ${
                  isSearchOpen ? "text-theme-hover-light dark:text-theme-hover-dark bg-theme-surface-light dark:bg-theme-surface-dark" : "text-theme-text-primary-light dark:text-theme-text-primary-dark hover:text-theme-hover-light dark:hover:text-theme-hover-dark"
                }`}
                aria-label="Search luminaires"
              >
                <Search size={19} className="stroke-[1.75]" />
              </button>

              {/* Instant Professional Product-Only Search Modal / Dropdown */}
              {isSearchOpen && (
                <div className="absolute right-[-60px] sm:right-0 mt-3 w-[calc(100vw-32px)] sm:w-[380px] md:w-[420px] max-w-[420px] bg-theme-card-light dark:bg-theme-card-dark border border-theme-border-light dark:border-theme-border-dark shadow-2xl p-3.5 sm:p-4 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center justify-between pb-2 mb-3 border-b border-theme-border-light/60 dark:border-theme-border-dark/60">
                    <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-theme-hover-light dark:text-theme-hover-dark font-medium">
                      PRODUCT SEARCH
                    </span>
                    <button
                      onClick={() => setIsSearchOpen(false)}
                      className="text-theme-text-muted-light dark:text-theme-text-muted-dark hover:text-theme-text-primary-light dark:hover:text-theme-text-primary-dark text-xs font-mono"
                    >
                      ESC / ✕
                    </button>
                  </div>

                  <form onSubmit={handleSearchSubmit} className="relative mb-3">
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search lamps, timber, finishes..."
                      className="w-full bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark placeholder-theme-text-muted-light/60 dark:placeholder-theme-text-muted-dark/60 text-xs px-3.5 py-3 border border-theme-border-light dark:border-theme-border-dark focus:outline-none focus:border-theme-hover-light dark:focus:border-theme-hover-dark pr-10 font-sans"
                    />
                    <button
                      type="submit"
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-theme-hover-light dark:text-theme-hover-dark hover:text-theme-text-primary-light dark:hover:text-theme-text-primary-dark p-1"
                      aria-label="Submit search"
                    >
                      {isSearching ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Search size={16} />
                      )}
                    </button>
                  </form>

                  {/* Product-Only Search Results Dropdown (NO PRICE, TRUE IMAGES ONLY) */}
                  <div className="max-h-[320px] overflow-y-auto space-y-2 divide-y divide-theme-border-light/60 dark:divide-theme-border-dark/60">
                    {isSearching && (
                      <div className="py-6 text-center text-xs font-mono text-theme-text-muted-light dark:text-theme-text-muted-dark flex items-center justify-center gap-2">
                        <Loader2 size={14} className="animate-spin text-theme-hover-light dark:text-theme-hover-dark" />
                        <span>Searching product catalog...</span>
                      </div>
                    )}

                    {!isSearching && searchQuery.trim() && searchResults.length === 0 && (
                      <div className="py-6 text-center space-y-2">
                        <Package className="w-8 h-8 text-theme-text-muted-light/40 dark:text-theme-text-muted-dark/40 mx-auto" />
                        <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark">No products found matching &ldquo;{searchQuery}&rdquo;</p>
                        <Link
                          href="/products"
                          onClick={() => setIsSearchOpen(false)}
                          className="inline-block text-[11px] font-mono uppercase tracking-wider text-theme-hover-light dark:text-theme-hover-dark hover:underline"
                        >
                          View All Lamps →
                        </Link>
                      </div>
                    )}

                    {!isSearching &&
                      searchResults.map((product) => {
                        const rawImage =
                          product.images?.[0]?.url ||
                          (typeof product.images?.[0] === "string" ? product.images[0] : null) ||
                          (product as any).imageUrl ||
                          null;

                        return (
                          <button
                            key={product._id}
                            onClick={() => handleProductClick(product._id)}
                            className="w-full pt-2.5 first:pt-0 flex items-center gap-3 p-2 hover:bg-theme-surface-light dark:hover:bg-theme-surface-dark text-left transition-colors group"
                          >
                            <div className="relative w-12 h-12 bg-theme-surface-light dark:bg-theme-surface-dark border border-theme-border-light dark:border-theme-border-dark shrink-0 overflow-hidden flex items-center justify-center">
                              {rawImage ? (
                                <Image
                                  src={rawImage}
                                  alt={product.name}
                                  fill
                                  className="object-cover group-hover:scale-105 transition-transform"
                                  sizes="48px"
                                />
                              ) : (
                                <span className="font-mono text-[8px] uppercase tracking-wider text-theme-text-muted-light dark:text-theme-text-muted-dark text-center px-1">
                                  NO IMAGE
                                </span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-xs sm:text-sm font-serif text-theme-text-primary-light dark:text-theme-text-primary-dark group-hover:text-theme-hover-light dark:group-hover:text-theme-hover-dark truncate transition-colors">
                                {product.name}
                              </h4>
                            </div>
                            <ChevronsRight className="w-4 h-4 text-theme-text-muted-light/60 dark:text-theme-text-muted-dark/60 group-hover:text-theme-hover-light dark:group-hover:text-theme-hover-dark transition-transform group-hover:translate-x-1 shrink-0" />
                          </button>
                        );
                      })}
                  </div>

                  {/* View All Products Link at Bottom of Search */}
                  {searchQuery.trim() && (
                    <div className="pt-3 border-t border-theme-border-light/60 dark:border-theme-border-dark/60 mt-2">
                      <button
                        onClick={handleSearchSubmit}
                        className="w-full py-2 bg-theme-primary hover:bg-theme-hover-light dark:hover:bg-theme-hover-dark text-theme-btn-text text-[10px] font-mono uppercase tracking-[0.18em] font-medium transition-colors text-center"
                      >
                        VIEW ALL MATCHING PRODUCTS →
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Wishlist */}
            <Link
              href="/wishlist"
              className="relative p-2 text-theme-text-primary-light dark:text-theme-text-primary-dark hover:text-theme-hover-light dark:hover:text-theme-hover-dark transition-colors"
              aria-label={`Wishlist, ${wishlistCount} items`}
            >
              <Heart size={19} className="stroke-[1.75]" />
              {wishlistCount > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-theme-hover-light dark:bg-theme-hover-dark text-white text-[9px] font-mono font-bold w-4 h-4 flex items-center justify-center shadow-sm">
                  {wishlistCount > 9 ? "9+" : wishlistCount}
                </span>
              )}
            </Link>

            {/* User Account */}
            <Link
              href={isAuthenticated ? "/account" : "/sign-in"}
              className="p-2 text-theme-text-primary-light dark:text-theme-text-primary-dark hover:text-theme-hover-light dark:hover:text-theme-hover-dark transition-colors"
              aria-label="Account details"
            >
              <User size={19} className="stroke-[1.75]" />
            </Link>

            {/* Cart Button */}
            <button
              onClick={openCart}
              className="relative p-2 text-theme-text-primary-light dark:text-theme-text-primary-dark hover:text-theme-hover-light dark:hover:text-theme-hover-dark transition-colors"
              aria-label={`Cart, ${cartItemCount} items`}
            >
              <ShoppingCart size={19} className="stroke-[1.75]" />
              {cartItemCount > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-theme-hover-light dark:bg-theme-hover-dark text-white text-[9px] font-mono font-bold w-4 h-4 flex items-center justify-center shadow-sm">
                  {cartItemCount > 9 ? "9+" : cartItemCount}
                </span>
              )}
            </button>

          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-theme-border-light dark:border-theme-border-dark bg-theme-card-light dark:bg-theme-card-dark px-5 py-6 space-y-4 shadow-2xl animate-in slide-in-from-top duration-200">
          <Link
            href="/products"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block text-xs font-mono uppercase tracking-[0.22em] text-theme-text-primary-light dark:text-theme-text-primary-dark hover:text-theme-hover-light dark:hover:text-theme-hover-dark"
          >
            COLLECTIONS
          </Link>
          <Link
            href="/categories"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block text-xs font-mono uppercase tracking-[0.22em] text-theme-text-primary-light dark:text-theme-text-primary-dark hover:text-theme-hover-light dark:hover:text-theme-hover-dark"
          >
            CATEGORIES
          </Link>
          <Link
            href="/about"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block text-xs font-mono uppercase tracking-[0.22em] text-theme-text-primary-light dark:text-theme-text-primary-dark hover:text-theme-hover-light dark:hover:text-theme-hover-dark"
          >
            CRAFTSMANSHIP
          </Link>
          <Link
            href="/contact"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block text-xs font-mono uppercase tracking-[0.22em] text-theme-text-primary-light dark:text-theme-text-primary-dark hover:text-theme-hover-light dark:hover:text-theme-hover-dark"
          >
            BESPOKE & CONTACT
          </Link>
          <Link
            href="/track-order"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block text-xs font-mono uppercase tracking-[0.22em] text-theme-text-primary-light dark:text-theme-text-primary-dark hover:text-theme-hover-light dark:hover:text-theme-hover-dark"
          >
            TRACK ORDER
          </Link>

          <div className="border-t border-theme-border-light/60 dark:border-theme-border-dark/60 pt-4 space-y-2">
            {isAuthenticated ? (
              <>
                <Link
                  href="/account"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-xs font-mono text-theme-hover-light dark:text-theme-hover-dark uppercase tracking-wider"
                >
                  My Account ({name})
                </Link>
                <button
                  onClick={handleSignOut}
                  className="block text-xs text-red-500 font-mono uppercase tracking-wider pt-1"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                href="/sign-in"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-xs font-mono text-theme-hover-light dark:text-theme-hover-dark uppercase tracking-wider"
              >
                Sign In / Register →
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
