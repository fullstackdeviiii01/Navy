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
  ChevronDown,
  Menu,
  X,
  Shield,
  Package,
  LogOut,
  UserCheck,
} from "lucide-react";
import { useUser } from "../context/UserContext";
import { useWishlist } from "../context/WishlistContext";
import { siteSettingsApi } from "../../lib/api/siteSettings";
import { categoriesApi } from "../../lib/api/categories";

interface CompanyInfo {
  company_name?: string;
  company_logo?: string;
}

interface Category {
  _id: string;
  name: string;
  slug: string;
}

export default function Header() {
  const { isAuthenticated, name, email, avatar, loading, isAdmin, logout, cart, openCart } =
    useUser();
  const { wishlistCount } = useWishlist();
  const router = useRouter();

  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const shopDropdownRef = useRef<HTMLDivElement>(null);
  const moreDropdownRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const cartItemCount =
    cart?.items?.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0) || 0;

  useEffect(() => {
    fetchCompanyInfo();
    fetchCategories();
  }, []);

  const fetchCompanyInfo = async () => {
    try {
      const data = await siteSettingsApi.getCompanyInfo();
      setCompanyInfo(data.company_info || {});
    } catch (error) {
      console.error("Failed to fetch company info:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await categoriesApi.getAll(false);
      setCategories(data.categories || []);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        shopDropdownRef.current &&
        !shopDropdownRef.current.contains(event.target as Node)
      ) {
        setIsShopOpen(false);
      }
      if (
        moreDropdownRef.current &&
        !moreDropdownRef.current.contains(event.target as Node)
      ) {
        setIsMoreOpen(false);
      }
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
      setIsUserMenuOpen(false);
      setIsMobileMenuOpen(false);
      router.push("/sign-in");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#281E10] border-b border-[#3D2E18] text-[#F3EBDC] shadow-lg">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-[#F3EBDC] hover:text-[#D4A359] transition-colors"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>

          {/* Left / Center Navigation & Monogram Logo */}
          <div className="flex items-center gap-6 xl:gap-8">
            <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
              
              {/* SHOP ∨ */}
              <div className="relative" ref={shopDropdownRef}>
                <button
                  onClick={() => {
                    setIsShopOpen(!isShopOpen);
                    setIsMoreOpen(false);
                  }}
                  className="flex items-center gap-1.5 text-[12px] xl:text-[13px] font-medium tracking-[0.2em] uppercase text-[#F3EBDC] hover:text-[#D4A359] transition-colors py-2"
                >
                  <span>SHOP</span>
                  <ChevronDown
                    size={13}
                    className={`transition-transform duration-200 ${
                      isShopOpen ? "rotate-180 text-[#D4A359]" : "text-[#D7D3CF]/70"
                    }`}
                  />
                </button>

                {isShopOpen && (
                  <div className="absolute left-0 mt-2 w-64 bg-[#23180B] border border-[#3E2D18] shadow-2xl py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150 rounded-sm">
                    <Link
                      href="/products"
                      onClick={() => setIsShopOpen(false)}
                      className="block px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#D4A359] hover:bg-white/5 border-b border-[#3E2D18]/60"
                    >
                      All Products →
                    </Link>
                    <div className="max-h-72 overflow-y-auto py-1">
                      {categories.map((cat) => (
                        <Link
                          key={cat._id}
                          href={`/products?category=${cat.slug || cat._id}`}
                          onClick={() => setIsShopOpen(false)}
                          className="block px-5 py-2.5 text-xs text-[#E3D8C8] hover:text-[#D4A359] hover:bg-white/5 tracking-wider transition-colors"
                        >
                          {cat.name}
                        </Link>
                      ))}
                      {categories.length === 0 && (
                        <p className="px-5 py-2 text-xs text-[#D7D3CF]/40">
                          No categories available
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* COLLECTIONS */}
              <Link
                href="/categories"
                className="text-[12px] xl:text-[13px] font-medium tracking-[0.2em] uppercase text-[#F3EBDC] hover:text-[#D4A359] transition-colors"
              >
                COLLECTIONS
              </Link>

              {/* SIGNATURE */}
              <Link
                href="/products"
                className="text-[12px] xl:text-[13px] font-medium tracking-[0.2em] uppercase text-[#F3EBDC] hover:text-[#D4A359] transition-colors"
              >
                SIGNATURE
              </Link>

              {/* ATELIER */}
              <Link
                href="/about"
                className="text-[12px] xl:text-[13px] font-medium tracking-[0.2em] uppercase text-[#F3EBDC] hover:text-[#D4A359] transition-colors"
              >
                ATELIER
              </Link>

              {/* CONTACT */}
              <Link
                href="/contact"
                className="text-[12px] xl:text-[13px] font-medium tracking-[0.2em] uppercase text-[#F3EBDC] hover:text-[#D4A359] transition-colors"
              >
                CONTACT
              </Link>

              {/* MORE ∨ */}
              <div className="relative" ref={moreDropdownRef}>
                <button
                  onClick={() => {
                    setIsMoreOpen(!isMoreOpen);
                    setIsShopOpen(false);
                  }}
                  className="flex items-center gap-1.5 text-[12px] xl:text-[13px] font-medium tracking-[0.2em] uppercase text-[#F3EBDC] hover:text-[#D4A359] transition-colors py-2"
                >
                  <span>MORE</span>
                  <ChevronDown
                    size={13}
                    className={`transition-transform duration-200 ${
                      isMoreOpen ? "rotate-180 text-[#D4A359]" : "text-[#D7D3CF]/70"
                    }`}
                  />
                </button>

                {isMoreOpen && (
                  <div className="absolute left-0 mt-2 w-52 bg-[#23180B] border border-[#3E2D18] shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150 rounded-sm">
                    <Link
                      href="/track-order"
                      onClick={() => setIsMoreOpen(false)}
                      className="block px-5 py-2.5 text-xs text-[#E3D8C8] hover:text-[#D4A359] hover:bg-white/5 tracking-wider transition-colors"
                    >
                      Track Order
                    </Link>
                    <Link
                      href="/wishlist"
                      onClick={() => setIsMoreOpen(false)}
                      className="block px-5 py-2.5 text-xs text-[#E3D8C8] hover:text-[#D4A359] hover:bg-white/5 tracking-wider transition-colors"
                    >
                      Wishlist
                    </Link>
                    <Link
                      href="/about"
                      onClick={() => setIsMoreOpen(false)}
                      className="block px-5 py-2.5 text-xs text-[#E3D8C8] hover:text-[#D4A359] hover:bg-white/5 tracking-wider transition-colors"
                    >
                      About Us
                    </Link>
                    <Link
                      href="/contact"
                      onClick={() => setIsMoreOpen(false)}
                      className="block px-5 py-2.5 text-xs text-[#E3D8C8] hover:text-[#D4A359] hover:bg-white/5 tracking-wider transition-colors"
                    >
                      Customer Support
                    </Link>
                  </div>
                )}
              </div>
            </nav>

            {/* Centered / Flowing Luxury Brand Logo */}
            <Link
              href="/"
              className="flex items-center gap-2 group pl-2 lg:pl-4 transition-transform duration-300 group-hover:scale-105"
              aria-label="Lamp and Glow Home"
            >
              {companyInfo.company_logo ? (
                <div className="relative w-9 h-9 sm:w-11 sm:h-11">
                  <Image
                    src={companyInfo.company_logo}
                    alt="Logo"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  {/* Monogram L | G Emblem */}
                  <div className="flex items-center">
                    <span className="font-serif text-2xl sm:text-3xl text-[#F3EBDC] tracking-tighter select-none font-light">
                      L
                    </span>
                    <span className="h-6 sm:h-7 w-[1.5px] bg-[#A8752B] mx-1.5 inline-block"></span>
                    <span className="font-serif text-2xl sm:text-3xl text-[#F3EBDC] tracking-tighter select-none font-light">
                      G
                    </span>
                  </div>
                  <div className="hidden sm:flex flex-col pl-1 leading-none">
                    <span className="text-[8px] font-medium tracking-[0.25em] text-[#D4A359] uppercase">
                      LAMP AND GLOW
                    </span>
                  </div>
                </div>
              )}
            </Link>
          </div>

          {/* Right Action Icons: Search, Wishlist, User Icon Only, Cart */}
          <div className="flex items-center gap-4 sm:gap-6">
            
            {/* 1. Search Icon */}
            <div className="relative">
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="p-1.5 text-[#F3EBDC] hover:text-[#D4A359] transition-colors"
                aria-label="Search store"
              >
                <Search size={20} className="stroke-[1.75]" />
              </button>

              {/* Expandable Search Input */}
              {isSearchOpen && (
                <div className="absolute right-0 mt-3 w-72 sm:w-80 bg-[#23180B] border border-[#3E2D18] shadow-2xl p-3 z-50 rounded-sm animate-in fade-in slide-in-from-top-1">
                  <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search sculptural lamps..."
                      className="w-full bg-[#181107] text-[#F3EBDC] placeholder-[#D7D3CF]/40 text-xs px-3.5 py-2.5 border border-[#3E2D18] focus:outline-none focus:border-[#A8752B]"
                    />
                    <button
                      type="submit"
                      className="px-3.5 py-2.5 bg-[#A8752B] hover:bg-[#C08A38] text-white text-xs font-semibold uppercase tracking-wider transition-colors"
                    >
                      <Search size={14} />
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* 2. Wishlist Icon */}
            <Link
              href="/wishlist"
              className="relative p-1.5 text-[#F3EBDC] hover:text-[#D4A359] transition-colors"
              aria-label={`Wishlist (${wishlistCount} items)`}
            >
              <Heart size={20} className="stroke-[1.75]" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#A8752B] text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {wishlistCount > 9 ? "9+" : wishlistCount}
                </span>
              )}
            </Link>

            {/* 3. User Icon Only - Direct link to Account/SignIn (No Dropdown) */}
            <Link
              href={isAuthenticated ? "/account" : "/sign-in"}
              className="p-1.5 text-[#F3EBDC] hover:text-[#D4A359] transition-colors"
              aria-label="User Account"
            >
              <User size={20} className="stroke-[1.75]" />
            </Link>

            {/* 4. Cart Icon (Trolley with golden count badge) */}
            <button
              onClick={openCart}
              className="relative p-1.5 text-[#F3EBDC] hover:text-[#D4A359] transition-colors"
              aria-label={`Cart, ${cartItemCount} items`}
            >
              <ShoppingCart size={20} className="stroke-[1.75]" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#A8752B] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-sm">
                  {cartItemCount > 9 ? "9+" : cartItemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-[#3E2D18] bg-[#23180B] px-5 py-6 space-y-4 shadow-2xl animate-in slide-in-from-top duration-200">
          <Link
            href="/products"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block text-sm font-medium tracking-[0.2em] uppercase text-[#F3EBDC] hover:text-[#D4A359]"
          >
            SHOP ALL
          </Link>
          <Link
            href="/categories"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block text-sm font-medium tracking-[0.2em] uppercase text-[#F3EBDC] hover:text-[#D4A359]"
          >
            COLLECTIONS
          </Link>
          <Link
            href="/products"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block text-sm font-medium tracking-[0.2em] uppercase text-[#F3EBDC] hover:text-[#D4A359]"
          >
            SIGNATURE
          </Link>
          <Link
            href="/about"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block text-sm font-medium tracking-[0.2em] uppercase text-[#F3EBDC] hover:text-[#D4A359]"
          >
            ATELIER
          </Link>
          <Link
            href="/contact"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block text-sm font-medium tracking-[0.2em] uppercase text-[#F3EBDC] hover:text-[#D4A359]"
          >
            CONTACT
          </Link>
          <Link
            href="/track-order"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block text-sm font-medium tracking-[0.2em] uppercase text-[#F3EBDC] hover:text-[#D4A359]"
          >
            TRACK ORDER
          </Link>

          <div className="border-t border-[#3E2D18] pt-4 space-y-2">
            {isAuthenticated ? (
              <>
                <Link
                  href="/account"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-xs font-semibold text-[#D4A359] uppercase tracking-wider"
                >
                  My Account ({name})
                </Link>
                {isAdmin() && (
                  <a
                    href="/admin/dashboard"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-xs font-semibold text-[#A8752B] uppercase tracking-wider"
                  >
                    Admin Panel ↗
                  </a>
                )}
                <button
                  onClick={handleSignOut}
                  className="block text-xs text-red-400 uppercase tracking-wider pt-1"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                href="/sign-in"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-xs font-semibold text-[#D4A359] uppercase tracking-wider"
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
