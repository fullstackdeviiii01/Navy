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
  ChevronDown,
  Sparkles,
  ArrowRight,
  Compass,
} from "lucide-react";
import { useUser } from "../context/UserContext";
import { useWishlist } from "../context/WishlistContext";
import { siteSettingsApi } from "../../lib/api/siteSettings";
import { categoriesApi } from "../../lib/api/categories";
import { productsApi } from "../../lib/api/products";
import { getProductUrl } from "../../lib/utils/productUrl";
import TopAnnouncementBar from "./shared/TopAnnouncementBar";

interface CompanyInfo {
  company_name?: string;
  company_logo?: string;
}

interface CategoryItem {
  _id: string;
  name: string;
  slug?: string;
  description?: string;
  image?: string;
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

function getValidSearchImageUrl(product: any): string | null {
  if (!product) return null;
  let candidate = "";
  if (Array.isArray(product.images) && product.images.length > 0) {
    const valid = product.images.find((img: any) => {
      const url = typeof img === "string" ? img : img?.url;
      if (!url || typeof url !== "string") return false;
      const isVid = /\.(mp4|webm|ogg|mov|mkv)$/i.test(url) || url.toLowerCase().includes("/video/");
      return !isVid;
    });
    candidate = typeof valid === "string" ? valid : valid?.url || "";
  } else if (typeof product.image === "string") {
    candidate = product.image;
  }

  if (!candidate || typeof candidate !== "string") return null;
  const isVideo = /\.(mp4|webm|ogg|mov|mkv)$/i.test(candidate) || candidate.toLowerCase().includes("/video/");
  if (isVideo) return null;

  return candidate.trim() || null;
}

export default function Header() {
  const { isAuthenticated, name, logout, cart, openCart } = useUser();
  const { wishlistCount } = useWishlist();
  const router = useRouter();
  const pathname = usePathname();

  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({});
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [headerProducts, setHeaderProducts] = useState<any[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ProductSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Active desktop hover dropdown key ('products' | 'categories' | null)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Lock body scroll when mobile menu is open (matching CartSidebar)
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMobileMenuOpen(false);
    };

    if (isMobileMenuOpen) {
      document.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const cartItemCount =
    cart?.items?.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0) || 0;

  useEffect(() => {
    fetchHeaderData();
  }, []);

  const fetchHeaderData = async () => {
    // 1. Fetch Company Info
    try {
      const data = await siteSettingsApi.getCompanyInfo();
      setCompanyInfo(data.company_info || {});
    } catch (error) {
      console.error("Failed to fetch company info:", error);
    }

    // 2. Fetch Categories (Limit to top 8)
    try {
      const catData = await categoriesApi.getAll(false);
      if (catData && catData.categories && catData.categories.length > 0) {
        setCategories(catData.categories.slice(0, 8));
      } else {
        setCategories([
          { _id: "c1", name: "Table Lamps", slug: "table-lamps" },
          { _id: "c2", name: "Floor Lamps", slug: "floor-lamps" },
          { _id: "c3", name: "Wall Sconces", slug: "wall-sconces" },
          { _id: "c4", name: "Lanterns & Accents", slug: "lanterns" },
        ]);
      }
    } catch (err) {
      setCategories([
        { _id: "c1", name: "Table Lamps", slug: "table-lamps" },
        { _id: "c2", name: "Floor Lamps", slug: "floor-lamps" },
        { _id: "c3", name: "Wall Sconces", slug: "wall-sconces" },
        { _id: "c4", name: "Lanterns & Accents", slug: "lanterns" },
      ]);
    }

    // 3. Fetch Exactly 8 Products for the Header Dropdown
    try {
      const prodData = await productsApi.getAll({ limit: 8, status: "active" });
      if (prodData && prodData.products && prodData.products.length > 0) {
        setHeaderProducts(prodData.products.slice(0, 8));
      } else {
        setHeaderProducts([
          { _id: "p1", name: "Geometric Table Lamp", pricing: { price: 6900 } },
          { _id: "p2", name: "Artisanal Wooden Lantern", pricing: { price: 5800 } },
          { _id: "p3", name: "Timber Desk Lamp", pricing: { price: 4200 } },
          { _id: "p4", name: "Square Slatted Lamp", pricing: { price: 5800 } },
          { _id: "p5", name: "Cantilever Desk Luminaire", pricing: { price: 6900 } },
          { _id: "p6", name: "Timber Candle Lantern", pricing: { price: 4200 } },
          { _id: "p7", name: "Rustic Geometric Light", pricing: { price: 3500 } },
          { _id: "p8", name: "Minimalist Bedside Lamp", pricing: { price: 4900 } },
        ]);
      }
    } catch (err) {
      setHeaderProducts([
        { _id: "p1", name: "Geometric Table Lamp", pricing: { price: 6900 } },
        { _id: "p2", name: "Artisanal Wooden Lantern", pricing: { price: 5800 } },
        { _id: "p3", name: "Timber Desk Lamp", pricing: { price: 4200 } },
        { _id: "p4", name: "Square Slatted Lamp", pricing: { price: 5800 } },
        { _id: "p5", name: "Cantilever Desk Luminaire", pricing: { price: 6900 } },
        { _id: "p6", name: "Timber Candle Lantern", pricing: { price: 4200 } },
        { _id: "p7", name: "Rustic Geometric Light", pricing: { price: 3500 } },
        { _id: "p8", name: "Minimalist Bedside Lamp", pricing: { price: 4900 } },
      ]);
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

  const handleProductClick = (product: any) => {
    setIsSearchOpen(false);
    setSearchQuery("");
    router.push(getProductUrl(product));
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

  // Dropdown hover helpers
  const handleDropdownEnter = (menuKey: string) => {
    if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
    setActiveDropdown(menuKey);
  };

  const handleDropdownLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 150);
  };

  // Navigation Items (HOME, PRODUCTS, CATEGORIES, ABOUT, CONTACT US)
  const navLinks = [
    { label: "HOME", href: "/" },
    { label: "PRODUCTS", href: "/products", dropdownKey: "products" },
    { label: "CATEGORIES", href: "/categories", dropdownKey: "categories" },
    { label: "ABOUT", href: "/about" },
    { label: "CONTACT US", href: "/contact" },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#E5E5E5] dark:bg-[#120D09] border-b-0 text-[#241910] dark:text-[#F3E8D6] transition-colors select-none">
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
                    <span className="font-serif font-bold tracking-[0.14em] text-[#1C140E] dark:text-white text-xs sm:text-sm uppercase">
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

          {/* 2. CENTER: Clean Navigation with Dropdowns on Hover */}
          <nav className="hidden lg:flex items-center justify-center gap-6 xl:gap-8 flex-1">
            {navLinks.map((link) => {
              const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
              const isDropdownOpen = activeDropdown === link.dropdownKey;

              return (
                <div
                  key={link.label}
                  onMouseEnter={() => link.dropdownKey && handleDropdownEnter(link.dropdownKey)}
                  onMouseLeave={handleDropdownLeave}
                  className="relative py-5"
                >
                  <Link
                    href={link.href}
                    className={`inline-flex items-center gap-1 text-xs xl:text-[13px] font-sans uppercase tracking-[0.12em] font-semibold transition-colors duration-200 ${isActive ? "text-[#1C140E] dark:text-white font-bold" : "text-[#3D3024] dark:text-[#D8CEBC] hover:text-[#C59345]"
                      }`}
                  >
                    <span>{link.label}</span>
                    {link.dropdownKey && (
                      <ChevronDown
                        className={`w-3 h-3 text-[#C59345] transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""
                          }`}
                      />
                    )}
                  </Link>

                  {/* Gold Active Indicator */}
                  {isActive ? (
                    <div className="absolute bottom-2 inset-x-0 h-[2px] bg-[#C59345] rounded-full shadow-[0_0_8px_rgba(197,147,69,0.6)]" />
                  ) : (
                    <div className="absolute bottom-2 inset-x-0 h-[2px] bg-[#C59345] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  )}

                  {/* ========================================================= */}
                  {/* DESKTOP DROPDOWN: PRODUCTS */}
                  {/* ========================================================= */}
                  {link.dropdownKey === "products" && isDropdownOpen && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-[340px] bg-[#E5E5E5] dark:bg-[#160E0A] border border-[#E8E2D6] dark:border-[#3A2A1D] shadow-[0_15px_35px_rgba(0,0,0,0.12)] rounded-sm p-4 text-[#241910] dark:text-[#F3E8D6] z-50 animate-in fade-in slide-in-from-top-1 duration-200">
                      <p className="text-[10px] font-mono tracking-[0.18em] uppercase text-[#C59345] font-semibold mb-2.5 flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3 text-[#C59345]" />
                        <span>FEATURED PRODUCTS</span>
                      </p>

                      <ul className="space-y-1 divide-y divide-[#E8E2D6] dark:divide-[#2A1D13]/60">
                        {headerProducts.map((prod) => {
                          const price = prod.pricing?.price || prod.variantPricing?.minPrice || 0;
                          return (
                            <li key={prod._id} className="pt-1.5 first:pt-0">
                              <Link
                                href={getProductUrl(prod)}
                                onClick={() => setActiveDropdown(null)}
                                className="flex items-center justify-between py-1 text-xs text-[#3D3024] dark:text-[#E5D7C2] hover:text-[#C59345] transition-colors group"
                              >
                                <span className="truncate pr-2 font-medium">{prod.name}</span>
                                <span className="text-[11px] font-bold text-[#C59345] shrink-0">
                                  Rs. {price.toLocaleString()}
                                </span>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>

                      <div className="mt-3.5 pt-3 border-t border-[#E8E2D6] dark:border-[#2A1D13] text-center">
                        <Link
                          href="/products"
                          onClick={() => setActiveDropdown(null)}
                          className="no-theme-hover inline-flex items-center justify-center gap-1.5 w-full py-2 bg-[#C59345] hover:bg-[#B37F33] text-white hover:text-white text-xs font-semibold uppercase tracking-[0.12em] rounded-sm transition-colors duration-200 cursor-pointer"
                        >
                          <span>EXPLORE ALL PRODUCTS</span>
                          <ArrowRight className="w-3.5 h-3.5 text-white" />
                        </Link>
                      </div>
                    </div>
                  )}

                  {/* ========================================================= */}
                  {/* DESKTOP DROPDOWN: CATEGORIES */}
                  {/* ========================================================= */}
                  {link.dropdownKey === "categories" && isDropdownOpen && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-[340px] bg-[#E5E5E5] dark:bg-[#160E0A] border border-[#E8E2D6] dark:border-[#3A2A1D] shadow-[0_15px_35px_rgba(0,0,0,0.12)] rounded-sm p-4 text-[#241910] dark:text-[#F3E8D6] z-50 animate-in fade-in slide-in-from-top-1 duration-200">
                      <p className="text-[10px] font-mono tracking-[0.18em] uppercase text-[#C59345] font-semibold mb-2.5 flex items-center gap-1.5">
                        <Compass className="w-3 h-3 text-[#C59345]" />
                        <span>STORE CATEGORIES</span>
                      </p>

                      <ul className="space-y-1 divide-y divide-[#E8E2D6] dark:divide-[#2A1D13]/60">
                        {categories.map((cat) => (
                          <li key={cat._id} className="pt-1.5 first:pt-0">
                            <Link
                              href={`/products?category=${cat.slug || cat._id}`}
                              onClick={() => setActiveDropdown(null)}
                              className="flex items-center justify-between py-1 text-xs text-[#3D3024] dark:text-[#E5D7C2] hover:text-[#C59345] transition-colors group"
                            >
                              <span>{cat.name}</span>
                              <span className="text-[10px] text-[#C59345]/70 group-hover:translate-x-1 transition-transform">
                                →
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>

                      <div className="mt-3.5 pt-3 border-t border-[#E8E2D6] dark:border-[#2A1D13] text-center">
                        <Link
                          href="/categories"
                          onClick={() => setActiveDropdown(null)}
                          className="no-theme-hover inline-flex items-center justify-center gap-1.5 w-full py-2 bg-[#C59345] hover:bg-[#B37F33] text-white hover:text-white text-xs font-semibold uppercase tracking-[0.12em] rounded-sm transition-colors duration-200 cursor-pointer"
                        >
                          <span>VIEW ALL CATEGORIES</span>
                          <ArrowRight className="w-3.5 h-3.5 text-white" />
                        </Link>
                      </div>
                    </div>
                  )}

                </div>
              );
            })}
          </nav>

          {/* 3. END: Actions Hub (Search, Account, Wishlist, Cart) */}
          <div className="flex items-center justify-end gap-1 xs:gap-1.5 sm:gap-3 shrink-0 ml-auto -mr-1 sm:mr-0 z-20">

            {/* Search Trigger */}
            <div className="relative" ref={searchContainerRef}>
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className={`p-1.5 sm:p-2 transition-colors cursor-pointer rounded-full ${isSearchOpen ? "text-[#C59345] bg-[#EFE9DF] dark:bg-[#1E150E]" : "text-[#241910] dark:text-[#F3E8D6] hover:text-[#C59345]"
                  }`}
                aria-label="Search luminaires"
              >
                <Search size={18} className="stroke-[2]" />
              </button>

              {/* Instant Live Search Dropdown */}
              {isSearchOpen && (
                <>
                  <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 sm:hidden"
                    onClick={() => setIsSearchOpen(false)}
                  />

                  <div className="fixed left-3 right-3 top-16 sm:top-18 sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-2 sm:w-[380px] md:w-[420px] max-h-[75vh] flex flex-col bg-[#E5E5E5] dark:bg-[#1A120B] border border-[#E8E2D6] dark:border-[#3A2A1D] shadow-2xl p-3.5 z-50 rounded-sm">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#E8E2D6] dark:border-[#3A2A1D]">
                      <span className="text-[10px] font-mono uppercase tracking-[0.16em] text-[#C59345] font-semibold">
                        PRODUCT SEARCH
                      </span>
                      <button
                        onClick={() => setIsSearchOpen(false)}
                        className="text-[#5A4638] dark:text-[#A89B8C] hover:text-[#1C140E] dark:hover:text-white text-xs font-mono cursor-pointer"
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
                        className="w-full bg-white dark:bg-[#120D09] text-[#241910] dark:text-white placeholder-[#8A7A6C] text-xs px-3.5 py-2.5 border border-[#D6CEC2] dark:border-[#3A2A1D] focus:outline-none focus:border-[#C59345] pr-9 rounded-[2px]"
                      />
                      <button
                        type="submit"
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-[#C59345] p-1 cursor-pointer"
                        aria-label="Submit search"
                      >
                        {isSearching ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
                      </button>
                    </form>

                    <div className="flex-1 overflow-y-auto space-y-1 divide-y divide-[#E8E2D6] dark:divide-[#2A1D13] max-h-[260px] pr-1">
                      {isSearching && (
                        <div className="py-4 text-center text-xs text-[#7D6A5A] dark:text-[#A89B8C] flex items-center justify-center gap-2">
                          <Loader2 size={13} className="animate-spin text-[#C59345]" />
                          <span>Searching lamps...</span>
                        </div>
                      )}

                      {!isSearching && searchQuery.trim() && searchResults.length === 0 && (
                        <div className="py-4 text-center space-y-1.5">
                          <Package className="w-6 h-6 text-[#7D6A5A]/50 mx-auto" />
                          <p className="text-xs text-[#7D6A5A] dark:text-[#A89B8C]">No products found matching &ldquo;{searchQuery}&rdquo;</p>
                        </div>
                      )}

                      {!isSearching &&
                        searchResults.map((product) => {
                          const imageUrl = getValidSearchImageUrl(product);
                          return (
                            <button
                              key={product._id}
                              onClick={() => handleProductClick(product)}
                              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[#EFE9DF] dark:hover:bg-[#241A12] text-left transition-colors group rounded-sm cursor-pointer border-b border-[#E8E2D6] dark:border-[#2A1D13]/40 last:border-b-0"
                            >
                              {imageUrl && (
                                <div className="relative w-10 h-10 bg-white dark:bg-[#120D09] border border-[#E8E2D6] dark:border-[#3A2A1D] shrink-0 overflow-hidden rounded-[2px]">
                                  <img
                                    src={imageUrl}
                                    alt={product.name || "Product"}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                       (e.target as HTMLElement).style.display = "none";
                                    }}
                                  />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <h4 className="text-xs sm:text-sm font-serif font-medium text-[#241910] dark:text-[#F3E8D6] group-hover:text-[#C59345] truncate transition-colors">
                                  {product.name}
                                </h4>
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
              className="p-1.5 sm:p-2 text-[#241910] dark:text-[#F3E8D6] hover:text-[#C59345] transition-colors cursor-pointer rounded-full"
              aria-label="Account"
            >
              <User size={18} className="stroke-[2]" />
            </Link>

            {/* Wishlist Icon (visible on md+) */}
            <Link
              href="/wishlist"
              className="relative p-1.5 sm:p-2 text-[#241910] dark:text-[#F3E8D6] hover:text-[#C59345] transition-colors cursor-pointer rounded-full hidden md:block"
              aria-label="Wishlist"
            >
              <Heart size={18} className="stroke-[2]" />
              {wishlistCount > 0 && (
                <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 bg-[#C59345] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Icon with Golden Count Badge */}
            <button
              onClick={openCart}
              className="relative p-1.5 sm:p-2 text-[#241910] dark:text-[#F3E8D6] hover:text-[#C59345] transition-colors cursor-pointer rounded-full"
              aria-label="Shopping Cart"
            >
              <ShoppingCart size={19} className="stroke-[2]" />
              {cartItemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#C59345] text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs">
                  {cartItemCount}
                </span>
              )}
            </button>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-1.5 sm:p-2 text-[#241910] dark:text-[#F3E8D6] hover:text-[#C59345] transition-colors lg:hidden cursor-pointer rounded-full"
              aria-label="Open mobile menu"
            >
              <Menu size={22} />
            </button>

          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. MOBILE SLIDE-OUT DRAWER */}
      {/* ========================================================================= */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Mobile Navigation">

          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Slide-out Drawer */}
          <div className="fixed inset-y-0 right-0 w-full max-w-[85vw] sm:max-w-md bg-[#E5E5E5] dark:bg-[#120D09] border-l border-[#E8E2D6] dark:border-[#3A2A1D] text-[#241910] dark:text-[#F3E8D6] shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 z-50">

            {/* Drawer Header */}
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 sm:py-5 border-b border-[#E8E2D6] dark:border-[#3A2A1D]">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#C59345]">
                  NAVIGATION
                </p>
                <h2 className="text-base sm:text-lg font-serif font-semibold text-[#1C140E] dark:text-white">
                  Menu
                </h2>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1.5 rounded-full hover:bg-[#EFE9DF] dark:hover:bg-[#1C140E] text-[#5A4638] dark:text-[#A89B8C] hover:text-[#1C140E] dark:hover:text-white transition-colors cursor-pointer"
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>

            {/* Drawer Navigation Links */}
            <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-5 space-y-1">

              {/* Main Nav Links */}
              <div className="space-y-1 pb-5 border-b border-[#E8E2D6] dark:border-[#2A1D13]">
                {navLinks.map((link) => {
                  const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
                  return (
                    <Link
                      key={link.label}
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center justify-between py-3 px-2 rounded-sm text-sm font-serif font-semibold tracking-wider transition-colors ${isActive
                          ? "text-[#C59345] bg-[#EFE9DF] dark:bg-[#1A120B]"
                          : "text-[#3D3024] dark:text-[#E5D7C2] hover:text-[#C59345] hover:bg-[#EFE9DF]/60 dark:hover:bg-[#1A120B]/60"
                        }`}
                    >
                      <span>{link.label}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#C59345]/70" />
                    </Link>
                  );
                })}
              </div>

              {/* Quick Account & Utility Links */}
              <div className="pt-4 space-y-2">
                <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#C59345] font-semibold px-2 mb-2">
                  ACCOUNT & SAVED
                </p>

                <Link
                  href="/wishlist"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between py-2 px-2 text-xs text-[#5A4638] dark:text-[#D8CEBC] hover:text-[#C59345] hover:bg-[#EFE9DF]/50 dark:hover:bg-[#1A120B]/50 rounded-sm transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Heart size={16} className="text-[#C59345]" />
                    <span>WISHLIST</span>
                  </div>
                  {wishlistCount > 0 && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 bg-[#C59345] text-white rounded-full">
                      {wishlistCount}
                    </span>
                  )}
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    openCart();
                  }}
                  className="w-full flex items-center justify-between py-2 px-2 text-xs text-[#5A4638] dark:text-[#D8CEBC] hover:text-[#C59345] hover:bg-[#EFE9DF]/50 dark:hover:bg-[#1A120B]/50 rounded-sm transition-colors cursor-pointer text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <ShoppingCart size={16} className="text-[#C59345]" />
                    <span>SHOPPING BASKET</span>
                  </div>
                  {cartItemCount > 0 && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 bg-[#C59345] text-white rounded-full">
                      {cartItemCount}
                    </span>
                  )}
                </button>

                <Link
                  href={isAuthenticated ? "/account" : "/sign-in"}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 py-2 px-2 text-xs text-[#5A4638] dark:text-[#D8CEBC] hover:text-[#C59345] hover:bg-[#EFE9DF]/50 dark:hover:bg-[#1A120B]/50 rounded-sm transition-colors"
                >
                  <User size={16} className="text-[#C59345]" />
                  <span>{isAuthenticated ? `MY ACCOUNT (${name || "USER"})` : "SIGN IN / REGISTER"}</span>
                </Link>

                {isAuthenticated && (
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left py-2 px-2 text-xs font-mono uppercase tracking-wider text-rose-600 hover:text-rose-500 transition-colors"
                  >
                    SIGN OUT
                  </button>
                )}
              </div>

            </div>

            {/* Drawer Footer: Assistance Badge */}
            <div className="p-4 sm:p-5 border-t border-[#E8E2D6] dark:border-[#3A2A1D] bg-[#F3ECE0] dark:bg-[#0E0A07]">
              <div className="flex items-center justify-between text-[11px] text-[#7D6A5A] dark:text-[#A89B8C]">
                <span>Artisanal Solid Wood Lighting</span>
                <span className="text-[#C59345] font-semibold">Handcrafted</span>
              </div>
            </div>

          </div>

        </div>
      )}

    </header>
  );
}
