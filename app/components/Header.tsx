// app/components/Header.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  Search,
  Heart,
  User,
  ShoppingCart,
  Menu,
  X,
  Loader2,
  Package,
} from "lucide-react";
import { useUser } from "../context/UserContext";
import { useWishlist } from "../context/WishlistContext";
import { siteSettingsApi } from "../../lib/api/siteSettings";
import TopAnnouncementBar from "./shared/TopAnnouncementBar";

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
  const pathname = usePathname();

  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({});
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ProductSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

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

    if (isSearchOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isSearchOpen]);

  // Debounced Product-Only Live Search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery.trim())}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.products || []);
        } else {
          setSearchResults([]);
        }
      } catch (err) {
        console.error("Product search failed:", err);
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

  // Navigation Items matching the reference screenshot:
  // HOME, SHOP, CATEGORIES, TRACK ORDER (instead of about us), CONTACT US
  const navLinks = [
    { label: "HOME", href: "/" },
    { label: "SHOP", href: "/products", hasDropdown: true },
    { label: "CATEGORIES", href: "/categories", hasDropdown: true },
    { label: "TRACK ORDER", href: "/track-order" },
    { label: "CONTACT US", href: "/contact" },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#120D09] border-b border-[#3A2A1D] text-[#F3E8D6] shadow-md transition-colors select-none">
      <TopAnnouncementBar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18 md:h-20 gap-4">

          {/* 1. START: Dynamic Brand Logo */}
          <div className="flex items-center shrink-0">
            <Link
              href="/"
              className="flex items-center py-0 group"
              aria-label={companyInfo.company_name || "Talal Wooden Lamps"}
            >
              {companyInfo.company_logo ? (
                <div className="relative h-12 w-12 sm:h-16 sm:w-16 md:h-20 md:w-20 -my-2 shrink-0">
                  <Image
                    src={companyInfo.company_logo}
                    alt={companyInfo.company_name || "Logo"}
                    fill
                    className="object-contain"
                    priority
                    sizes="(max-width: 640px) 48px, (max-width: 768px) 64px, 80px"
                  />
                </div>
              ) : (
                /* Pure Monogram Box (T | L) */
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-sm border border-[#C59345]/80 bg-[#1A120B] flex items-center justify-center text-[#C59345] font-serif font-bold text-lg sm:text-xl shadow-sm">
                    T
                  </div>
                  <div className="flex flex-col">
                    <span className="font-serif font-bold tracking-[0.14em] text-white text-xs sm:text-sm uppercase">
                      TALAL
                    </span>
                    <span className="text-[9px] font-sans tracking-[0.18em] text-[#C59345] uppercase">
                      WOODEN LAMP
                    </span>
                  </div>
                </div>
              )}
            </Link>
          </div>

          {/* 2. CENTER: Clean Navigation (HOME, SHOP, CATEGORIES, TRACK ORDER, CONTACT US) */}
          <nav className="hidden lg:flex items-center justify-center gap-6 xl:gap-8 flex-1">
            {navLinks.map((link) => {
              const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);

              return (
                <div key={link.label} className="relative group py-2">
                  <Link
                    href={link.href}
                    className={`inline-flex items-center gap-1 text-xs xl:text-[13px] font-sans uppercase tracking-[0.12em] font-semibold transition-colors duration-200 ${
                      isActive ? "text-white" : "text-[#D8CEBC] hover:text-[#C59345]"
                    }`}
                  >
                    <span>{link.label}</span>
                    {link.hasDropdown && (
                      <span className="text-[9px] opacity-70 group-hover:rotate-180 transition-transform duration-200">
                        ▼
                      </span>
                    )}
                  </Link>

                  {/* Gold Active / Hover Line Indicator */}
                  {isActive ? (
                    <div className="absolute bottom-0 inset-x-0 h-[2px] bg-[#C59345] rounded-full shadow-[0_0_8px_rgba(197,147,69,0.6)]" />
                  ) : (
                    <div className="absolute bottom-0 inset-x-0 h-[2px] bg-[#C59345] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  )}
                </div>
              );
            })}
          </nav>

          {/* 3. END: Actions Hub (Search, Account, Wishlist, Cart) */}
          <div className="flex items-center gap-2 sm:gap-3.5 shrink-0">

            {/* Search Trigger */}
            <div className="relative" ref={searchContainerRef}>
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className={`p-2 transition-colors cursor-pointer rounded-full ${
                  isSearchOpen ? "text-[#C59345] bg-[#1E150E]" : "text-[#F3E8D6] hover:text-[#C59345]"
                }`}
                aria-label="Search luminaires"
              >
                <Search size={18} className="stroke-[2]" />
              </button>

              {/* Instant Live Search Dropdown */}
              {isSearchOpen && (
                <>
                  <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40 sm:hidden"
                    onClick={() => setIsSearchOpen(false)}
                  />

                  <div className="fixed left-3 right-3 top-16 sm:top-18 sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-2 sm:w-[380px] md:w-[420px] max-h-[75vh] flex flex-col bg-[#1A120B] border border-[#3A2A1D] shadow-2xl p-3.5 z-50 rounded-sm">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#3A2A1D]">
                      <span className="text-[10px] font-mono uppercase tracking-[0.16em] text-[#C59345] font-semibold">
                        PRODUCT SEARCH
                      </span>
                      <button
                        onClick={() => setIsSearchOpen(false)}
                        className="text-[#A89B8C] hover:text-white text-xs font-mono cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>

                    <form onSubmit={handleSearchSubmit} className="relative mb-2">
                      <input
                        ref={searchInputRef}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search lamps, categories..."
                        className="w-full bg-[#120D09] text-white placeholder-[#8A7A6C] text-xs px-3.5 py-2.5 border border-[#3A2A1D] focus:outline-none focus:border-[#C59345] pr-9 rounded-[2px]"
                      />
                      <button
                        type="submit"
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-[#C59345] p-1 cursor-pointer"
                        aria-label="Submit search"
                      >
                        {isSearching ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
                      </button>
                    </form>

                    <div className="flex-1 overflow-y-auto space-y-1 divide-y divide-[#2A1D13] max-h-[260px] pr-1">
                      {isSearching && (
                        <div className="py-4 text-center text-xs text-[#A89B8C] flex items-center justify-center gap-2">
                          <Loader2 size={13} className="animate-spin text-[#C59345]" />
                          <span>Searching lamps...</span>
                        </div>
                      )}

                      {!isSearching && searchQuery.trim() && searchResults.length === 0 && (
                        <div className="py-4 text-center space-y-1.5">
                          <Package className="w-6 h-6 text-[#A89B8C]/50 mx-auto" />
                          <p className="text-xs text-[#A89B8C]">No products found matching &ldquo;{searchQuery}&rdquo;</p>
                        </div>
                      )}

                      {!isSearching &&
                        searchResults.map((product) => {
                          const rawImage = product.images?.[0]?.url || "/images/hero-atelier-lamp.jpg";
                          return (
                            <button
                              key={product._id}
                              onClick={() => handleProductClick(product._id)}
                              className="w-full pt-1.5 flex items-center gap-2.5 p-1.5 hover:bg-[#241A12] text-left transition-colors group rounded-sm cursor-pointer"
                            >
                              <div className="relative w-10 h-10 bg-[#120D09] border border-[#3A2A1D] shrink-0 overflow-hidden rounded-[2px]">
                                <Image src={rawImage} alt={product.name} fill className="object-cover" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-xs font-serif font-medium text-[#F3E8D6] group-hover:text-[#C59345] truncate">
                                  {product.name}
                                </h4>
                                <p className="text-[11px] font-bold text-[#C59345]">
                                  Rs. {(product.price || product.sale_price || product.regular_price || 0).toLocaleString()}
                                </p>
                              </div>
                            </button>
                          );
                        })}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Account Icon */}
            <Link
              href={isAuthenticated ? "/account" : "/sign-in"}
              className="p-2 text-[#F3E8D6] hover:text-[#C59345] transition-colors cursor-pointer rounded-full"
              aria-label="Account"
            >
              <User size={18} className="stroke-[2]" />
            </Link>

            {/* Wishlist Icon */}
            <Link
              href="/wishlist"
              className="relative p-2 text-[#F3E8D6] hover:text-[#C59345] transition-colors cursor-pointer rounded-full"
              aria-label="Wishlist"
            >
              <Heart size={18} className="stroke-[2]" />
              {wishlistCount > 0 && (
                <span className="absolute 0 top-0.5 right-0.5 w-3.5 h-3.5 bg-[#C59345] text-[#120D09] text-[9px] font-bold rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Icon with Golden Count Badge */}
            <button
              onClick={openCart}
              className="relative p-2 text-[#F3E8D6] hover:text-[#C59345] transition-colors cursor-pointer rounded-full"
              aria-label="Shopping Cart"
            >
              <ShoppingCart size={19} className="stroke-[2]" />
              {cartItemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#C59345] text-[#120D09] text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
                  {cartItemCount}
                </span>
              )}
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-[#F3E8D6] hover:text-[#C59345] transition-colors lg:hidden cursor-pointer"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

          </div>

        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 top-16 sm:top-20 bg-[#120D09] z-50 overflow-y-auto border-t border-[#3A2A1D] px-6 py-6 lg:hidden animate-in fade-in duration-200">
          <div className="flex flex-col space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-base font-serif font-bold tracking-wider text-white hover:text-[#C59345] py-2 border-b border-[#2A1D13] flex items-center justify-between"
              >
                <span>{link.label}</span>
                <span className="text-xs text-[#C59345]">→</span>
              </Link>
            ))}

            <div className="pt-4 flex flex-col gap-3">
              <Link
                href="/wishlist"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2.5 text-xs tracking-wider text-[#D8CEBC] hover:text-[#C59345] py-1"
              >
                <Heart size={16} />
                <span>WISHLIST ({wishlistCount})</span>
              </Link>

              <Link
                href={isAuthenticated ? "/account" : "/sign-in"}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2.5 text-xs tracking-wider text-[#D8CEBC] hover:text-[#C59345] py-1"
              >
                <User size={16} />
                <span>{isAuthenticated ? `MY ACCOUNT (${name || "USER"})` : "SIGN IN / REGISTER"}</span>
              </Link>

              {isAuthenticated && (
                <button
                  onClick={handleSignOut}
                  className="text-left text-xs font-mono uppercase tracking-wider text-rose-400 hover:text-rose-300 py-1"
                >
                  SIGN OUT
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
