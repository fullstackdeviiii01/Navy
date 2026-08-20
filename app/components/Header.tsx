// app/components/Header.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  FaBars,
  FaTimes,
  FaChevronDown,
  FaRegHeart,
  FaUser,
  FaSignOutAlt,
  FaShieldAlt,
  FaBox,
} from "react-icons/fa";
import Cart from "./Cart";
import SearchBar from "./shared/SearchBar";
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
  const { isAuthenticated, name, email, avatar, loading, isAdmin, logout } =
    useUser();
  const { wishlistCount } = useWishlist();
  const router = useRouter();

  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileCategoriesOpen, setIsMobileCategoriesOpen] = useState(false);

  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

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
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(event.target as Node)
      ) {
        setIsCategoryOpen(false);
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
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-gray-200 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          
          {/* 1. LEFT: Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8 flex-1">
            <Link
              href="/"
              className="text-sm font-medium text-gray-700 hover:text-theme-primary transition-colors"
            >
              Home
            </Link>
            <Link
              href="/products"
              className="text-sm font-medium text-gray-700 hover:text-theme-primary transition-colors"
            >
              All Products
            </Link>

            {/* Categories Dropdown */}
            <div className="relative" ref={categoryDropdownRef}>
              <button
                onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                className="flex items-center gap-1.5 text-sm font-medium text-gray-700 hover:text-theme-primary transition-colors py-2"
                aria-expanded={isCategoryOpen}
                aria-haspopup="true"
              >
                <span>Categories</span>
                <FaChevronDown
                  className={`text-[10px] transition-transform duration-200 ${
                    isCategoryOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isCategoryOpen && (
                <div className="absolute left-0 mt-1 w-56 bg-white border border-gray-200 rounded-xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <Link
                    href="/categories"
                    onClick={() => setIsCategoryOpen(false)}
                    className="block px-4 py-2 text-xs font-semibold text-theme-primary hover:bg-gray-50 border-b border-gray-100"
                  >
                    View All Categories →
                  </Link>
                  <div className="max-h-64 overflow-y-auto py-1">
                    {categories.map((cat) => (
                      <Link
                        key={cat._id}
                        href={`/products?category=${cat.slug || cat._id}`}
                        onClick={() => setIsCategoryOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-theme-primary transition-colors"
                      >
                        {cat.name}
                      </Link>
                    ))}
                    {categories.length === 0 && (
                      <p className="px-4 py-2 text-xs text-gray-400">
                        No categories found
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <Link
              href="/track-order"
              className="text-sm font-medium text-gray-700 hover:text-theme-primary transition-colors"
            >
              Track Order
            </Link>
          </nav>

          {/* Mobile Menu Button (Left on mobile) */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMobileMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
            </button>
          </div>

          {/* 2. CENTER: Prominent Centered Logo */}
          <div className="flex justify-center flex-shrink-0">
            <Link
              href="/"
              className="flex items-center gap-2.5 group"
              aria-label={`Go to ${companyInfo.company_name || "Home"}`}
            >
              {companyInfo.company_logo ? (
                <div className="relative w-8 h-8 sm:w-10 sm:h-10">
                  <Image
                    src={companyInfo.company_logo}
                    alt={`${companyInfo.company_name || "Store"} logo`}
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
              ) : null}
              <span className="font-bold text-lg sm:text-2xl text-gray-900 tracking-tight">
                {companyInfo.company_name || "STORE"}
              </span>
            </Link>
          </div>

          {/* 3. RIGHT: Actions (Search, Wishlist, Cart, User) */}
          <div className="flex items-center justify-end gap-2 sm:gap-4 flex-1">
            {/* Desktop Search Bar */}
            <div className="hidden lg:block w-48 xl:w-64">
              <SearchBar />
            </div>

            {/* Wishlist */}
            <Link
              href="/wishlist"
              className="relative p-2 text-gray-700 hover:text-theme-primary hover:bg-gray-100 rounded-lg transition-colors"
              aria-label={`Wishlist (${wishlistCount} items)`}
            >
              <FaRegHeart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-theme-primary text-white text-[11px] font-bold rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
                  {wishlistCount > 9 ? "9+" : wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Icon (opens CartSidebar) */}
            <Cart />

            {/* User Account / Auth */}
            {loading ? (
              <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
            ) : isAuthenticated && name ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                  aria-expanded={isUserMenuOpen}
                  aria-haspopup="true"
                >
                  {avatar ? (
                    <div className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden border border-gray-200">
                      <Image
                        src={avatar}
                        alt={name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs font-semibold">
                      {name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-xs sm:text-sm font-medium text-gray-700 hidden xl:block max-w-[100px] truncate">
                    {name}
                  </span>
                  <FaChevronDown className="text-[9px] text-gray-500 hidden xl:block" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-200 rounded-xl shadow-xl py-2 z-50 animate-in fade-in duration-150">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{email}</p>
                    </div>

                    <Link
                      href="/account"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-theme-primary transition-colors"
                    >
                      <FaUser className="text-gray-400 text-xs" />
                      <span>My Profile</span>
                    </Link>

                    <Link
                      href="/account?tab=orders"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-theme-primary transition-colors"
                    >
                      <FaBox className="text-gray-400 text-xs" />
                      <span>My Orders</span>
                    </Link>

                    {isAdmin() && (
                      <a
                        href="/admin/dashboard"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-purple-700 font-medium hover:bg-purple-50 transition-colors"
                      >
                        <FaShieldAlt className="text-purple-600 text-xs" />
                        <span>Admin Panel</span>
                      </a>
                    )}

                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <button
                        onClick={handleSignOut}
                        className="flex items-center gap-2.5 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <FaSignOutAlt className="text-xs" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/sign-in"
                className="px-3.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors shadow-sm"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="block lg:hidden pb-3">
          <SearchBar />
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white px-4 pt-3 pb-6 space-y-3 shadow-lg">
          <Link
            href="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-gray-800 hover:text-theme-primary"
          >
            Home
          </Link>
          <Link
            href="/products"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-gray-800 hover:text-theme-primary"
          >
            All Products
          </Link>

          {/* Categories Accordion in Mobile */}
          <div>
            <button
              onClick={() => setIsMobileCategoriesOpen(!isMobileCategoriesOpen)}
              className="flex items-center justify-between w-full py-2 text-base font-medium text-gray-800 hover:text-theme-primary"
            >
              <span>Categories</span>
              <FaChevronDown
                className={`text-xs transition-transform ${
                  isMobileCategoriesOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            {isMobileCategoriesOpen && (
              <div className="pl-4 py-1 space-y-2 border-l-2 border-gray-100 ml-1">
                <Link
                  href="/categories"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block py-1 text-sm font-semibold text-theme-primary"
                >
                  All Categories →
                </Link>
                {categories.map((cat) => (
                  <Link
                    key={cat._id}
                    href={`/products?category=${cat.slug || cat._id}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block py-1 text-sm text-gray-600 hover:text-theme-primary"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link
            href="/track-order"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-gray-800 hover:text-theme-primary"
          >
            Track Order
          </Link>

          <Link
            href="/wishlist"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center justify-between py-2 text-base font-medium text-gray-800 hover:text-theme-primary"
          >
            <span>Wishlist</span>
            {wishlistCount > 0 && (
              <span className="bg-theme-primary text-white text-xs font-bold rounded-full px-2 py-0.5">
                {wishlistCount}
              </span>
            )}
          </Link>

          {isAuthenticated && isAdmin() && (
            <a
              href="/admin/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="block py-2 text-base font-semibold text-purple-700 hover:bg-purple-50 rounded"
            >
              Admin Panel ↗
            </a>
          )}
        </div>
      )}
    </header>
  );
}
