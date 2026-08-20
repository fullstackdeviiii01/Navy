// app/components/Header.tsx - REDESIGNED VERSION (Admin Panel opens in new tab)
"use client";
import {
  Avatar,
  Dropdown,
  DropdownDivider,
  DropdownHeader,
  DropdownItem,
  Navbar,
  NavbarBrand,
  NavbarCollapse,
  NavbarLink,
  NavbarToggle,
} from "flowbite-react";
import { FaPhone, FaRegHeart } from "react-icons/fa6";
import { Package } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import Darkmode from "./Darkmode";
import Cart from "./Cart";
import { useRouter } from "next/navigation";
import { useUser } from "../context/UserContext";
import { useWishlist } from "../context/WishlistContext";
import SearchBar from "./shared/SearchBar";
import CategoryNavigation from "./shared/CategoryNavigation";
import { useState, useEffect } from "react";
import { siteSettingsApi } from "../../lib/api/siteSettings";

interface CompanyInfo {
  company_name?: string;
  company_logo?: string;
  company_phone?: string;
  company_email?: string;
  company_address?: string;
  company_location_link?: string;
  company_website?: string;
  working_hours?: any;
  social_media?: {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    tiktok?: string;
    snapchat?: string;
    whatsapp?: string;
    twitter?: string;
    github?: string;
    youtube?: string;
    pinterest?: string;
  };
  copyright_text?: string;
}

const Header = () => {
  const {
    isAuthenticated,
    name,
    email,
    avatar,
    loading,
    isAdmin,
    logout,
  } = useUser();
  const { wishlistCount } = useWishlist();
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({});

  const router = useRouter();

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

  const handleSignOut = async () => {
    try {
      await logout();
      router.push("/sign-in");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  return (
    <>
      {/* Top Bar */}
      <div className="flex items-center justify-between w-full bg-gray-100 dark:bg-gray-700 px-5 py-3">
        <div className="flex items-center gap-2">
          <FaPhone
            className="text-gray-600 dark:text-gray-300"
            aria-hidden="true"
          />
          <a
            href={`tel:${companyInfo.company_phone || "(555) 555-1234"}`}
            className="text-gray-600 dark:text-gray-300 hover:text-theme-primary transition-colors"
            aria-label={`Call us at ${companyInfo.company_phone || "(555) 555-1234"}`}
          >
            {companyInfo.company_phone || "(555) 555-1234"}
          </a>
        </div>
        <div className="text-center hidden md:block">
          <span className="dark:text-gray-300">
            Get 50% off on Member Exclusive Month |{" "}
            <Link
              href="/products"
              className="underline hover:text-theme-primary transition-colors"
              aria-label="Shop now for 50% off"
            >
              Shop Now
            </Link>
          </span>
        </div>
        <div>
          <Darkmode />
        </div>
      </div>

      {/* Main Header */}
      <Navbar className="shadow-md w-full">
        <div className="flex items-center justify-between w-full gap-3 lg:gap-6">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link
              href="/"
              aria-label={`Go to ${companyInfo.company_name || "homepage"}`}
            >
              <div className="flex items-center gap-2">
                {companyInfo.company_logo && (
                  <Image
                    src={companyInfo.company_logo}
                    width={48}
                    height={48}
                    className="object-contain"
                    alt={`${companyInfo.company_name || "Company"} logo`}
                  />
                )}
                <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white max-w-[200px] truncate">
                  {companyInfo.company_name}
                </span>
              </div>
            </Link>
          </div>

          {/* Search Bar - Desktop */}
          <div className="flex-1 max-w-2xl hidden lg:block">
            <SearchBar />
          </div>

          {/* Right Side Actions - Desktop */}
          <div className="hidden md:flex items-center gap-1 flex-shrink-0">
            {/* Divider */}
            <div className="h-8 w-px bg-gray-300 dark:bg-gray-600 mx-1"></div>

            {/* Action Icons */}
            <nav className="flex items-center gap-1" aria-label="Quick actions">
              {/* Wishlist Button */}
              <Link
                href="/wishlist"
                className="group relative p-2.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
                title="Wishlist"
                aria-label={
                  wishlistCount > 0
                    ? `Wishlist, ${wishlistCount} items`
                    : "Wishlist, empty"
                }
                style={{
                  minWidth: "44px",
                  minHeight: "44px",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <FaRegHeart className="w-5 h-5 group-hover:scale-110 transition-transform" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 right-0.5 bg-theme-primary text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-sm">
                    {wishlistCount > 9 ? "9+" : wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <div className="flex items-center">
                <Cart />
              </div>
            </nav>

            {/* Divider */}
            <div
              className="h-8 w-px bg-gray-300 dark:bg-gray-600 mx-2"
              aria-hidden="true"
            ></div>

            {/* User Menu */}
            <div className="flex items-center">
              {loading ? (
                <div className="px-3 py-2" role="status" aria-live="polite">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Loading...
                  </span>
                </div>
              ) : isAuthenticated && name ? (
                <Dropdown
                  arrowIcon={true}
                  inline
                  label={
                    <div
                      className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 cursor-pointer"
                      style={{ minHeight: "44px" }}
                    >
                      <Avatar
                        size="sm"
                        rounded
                        img={
                          avatar ||
                          "https://www.shutterstock.com/image-vector/default-avatar-profile-icon-social-600nw-1906669723.jpg"
                        }
                        alt={`${name}'s profile picture`}
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden xl:block max-w-[100px] truncate">
                        {name}
                      </span>
                    </div>
                  }
                >
                  <div className="min-w-[200px]">
                    <DropdownHeader>
                      <span className="block text-sm font-medium">
                        {name || "User"}
                      </span>
                      <span className="block truncate text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {email}
                      </span>
                    </DropdownHeader>
                    <DropdownItem onClick={() => router.push("/account")}>
                      Profile
                    </DropdownItem>
                    <DropdownItem
                      onClick={() => router.push("/account?tab=orders")}
                    >
                      My Orders
                    </DropdownItem>
                    <DropdownItem onClick={() => router.push("/wishlist")}>
                      Wishlist
                    </DropdownItem>
                    {isAdmin() && (
                      <a
                        href="/admin/dashboard"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex w-full cursor-pointer items-center justify-start px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:text-white"
                      >
                        Admin Panel
                      </a>
                    )}
                    <DropdownDivider />
                    <DropdownItem onClick={handleSignOut}>
                      Sign out
                    </DropdownItem>
                  </div>
                </Dropdown>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href="/track-order"
                    className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 hidden lg:inline-flex items-center"
                    aria-label="Track your order"
                    style={{ minHeight: "44px" }}
                  >
                    Track Order
                  </Link>
                  <Link
                    href="/sign-in"
                    className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 dark:from-blue-500 dark:to-blue-600 dark:hover:from-blue-600 dark:hover:to-blue-700 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                    aria-label="Sign in to your account"
                    style={{
                      minHeight: "44px",
                      display: "inline-flex",
                      alignItems: "center",
                    }}
                  >
                    Sign In
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Toggle */}
          <div className="md:hidden flex-shrink-0">
            <NavbarToggle aria-label="Toggle navigation menu" />
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="w-full lg:hidden mt-4">
          <SearchBar />
        </div>

        {/* Mobile Navigation */}
        <NavbarCollapse className="md:hidden">
          <NavbarLink href="/" active color="dark" aria-current="page">
            Home
          </NavbarLink>
          <NavbarLink href="/products">All Products</NavbarLink>
          {!isAuthenticated && (
            <NavbarLink href="/track-order">
              <span className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                Track Order
              </span>
            </NavbarLink>
          )}
          <NavbarLink href="/wishlist">
            <span className="flex items-center gap-2">
              <FaRegHeart className="w-4 h-4" />
              Wishlist
              {wishlistCount > 0 && (
                <span
                  className="ml-auto bg-theme-primary text-white text-xs font-bold rounded-full px-2 py-0.5"
                  aria-label={`${wishlistCount} items`}
                >
                  {wishlistCount}
                </span>
              )}
            </span>
          </NavbarLink>
          <NavbarLink href="/cart">Cart</NavbarLink>
          {isAdmin() && (
            <a
              href="/admin/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="block py-2 pl-3 pr-4 text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white md:p-0"
            >
              Admin Panel
            </a>
          )}
        </NavbarCollapse>

        {/* Desktop Category Navigation */}
        <nav
          className="hidden md:flex w-full items-center gap-x-5 border-t border-gray-200 dark:border-gray-700 mt-4 pt-3"
          aria-label="Product categories"
        >
          <CategoryNavigation />
        </nav>
      </Navbar>

      {/* Add scrollbar hide utility */}
      <style jsx global>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </>
  );
};

export default Header;
