// app/components/shared/SearchBar.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { FaSearch, FaSpinner, FaTimes, FaTag, FaBox } from "react-icons/fa";
import { searchApi } from "../../../lib/api/search";
import { formatPrice } from "../../../lib/utils/formatPrice";
import { getProductMainImage } from "../../../lib/utils/productImages";
import { getProductUrl } from "../../../lib/utils/productUrl";

interface SearchResult {
  products: Array<{
    _id: string;
    name: string;
    images: Array<{ url: string; alt_text?: string }>;
    pricing: {
      price: number;
      currency: string;
    };
    inventory: {
      stock_status: string;
    };
    category_id?: {
      name: string;
      slug: string;
    };
  }>;
  categories: Array<{
    _id: string;
    name: string;
    slug: string;
    image_url?: string;
    product_count: number;
  }>;
}

interface SearchBarProps {
  className?: string;
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

export default function SearchBar({ className = "" }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult>({
    products: [],
    categories: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Debounced search
  useEffect(() => {
    const delaySearch = setTimeout(async () => {
      if (query.trim().length >= 2) {
        setIsLoading(true);
        try {
          const data = await searchApi.search(query);
          setResults(data);
          setShowDropdown(true);
        } catch (error) {
          console.error("Search error:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setResults({ products: [], categories: [] });
        setShowDropdown(false);
      }
    }, 300);

    return () => clearTimeout(delaySearch);
  }, [query]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleClear = () => {
    setQuery("");
    setResults({ products: [], categories: [] });
    setShowDropdown(false);
    inputRef.current?.focus();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/products?search=${encodeURIComponent(query.trim())}`);
      setShowDropdown(false);
      setQuery("");
    }
  };

  const handleResultClick = () => {
    setShowDropdown(false);
    setQuery("");
  };

  const hasResults =
    results.products.length > 0 || results.categories.length > 0;

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <form onSubmit={handleSearch} className="relative">
        <div className="relative">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-sm pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              if (query.trim().length >= 2 && hasResults) {
                setShowDropdown(true);
              }
            }}
            placeholder="Search products, categories..."
            className="w-full pl-11 pr-10 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-theme-primary focus:border-transparent transition-all"
          />
          {isLoading && (
            <FaSpinner className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 animate-spin" />
          )}
          {!isLoading && query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <FaTimes />
            </button>
          )}
        </div>
      </form>

      {/* Search Dropdown */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 max-h-[500px] overflow-y-auto z-50">
          {!isLoading && !hasResults && query.trim().length >= 2 && (
            <div className="p-6 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                No results found for "{query}"
              </p>
            </div>
          )}

          {/* Categories Section */}
          {results.categories.length > 0 && (
            <div className="border-b border-gray-200 dark:border-gray-700">
              <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900/50">
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide flex items-center gap-2">
                  <FaTag className="text-theme-primary" />
                  Categories
                </h3>
              </div>
              <div className="py-1">
                {results.categories.map((category) => (
                  <Link
                    key={category._id}
                    href={`/products?category=${category.slug}`}
                    onClick={handleResultClick}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    {category.image_url ? (
                      <div className="relative w-10 h-10 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                        <Image
                          src={category.image_url}
                          alt={category.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 flex-shrink-0 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                        <FaTag className="text-gray-400 dark:text-gray-500" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white truncate">
                        {category.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {category.product_count}{" "}
                        {category.product_count === 1 ? "product" : "products"}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Products Section */}
          {results.products.length > 0 && (
            <div>
              <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900/50">
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide flex items-center gap-2">
                  <FaBox className="text-theme-primary" />
                  Products
                </h3>
              </div>
              <div className="py-1">
                {results.products.map((product) => {
                  const imageUrl = getValidSearchImageUrl(product);
                  return (
                    <Link
                      key={product._id}
                      href={getProductUrl(product)}
                      onClick={handleResultClick}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700/50 text-left transition-colors border-b border-gray-100 dark:border-gray-800 last:border-b-0"
                    >
                      {imageUrl && (
                        <div className="relative w-10 h-10 flex-shrink-0 rounded-[2px] overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                          <img
                            src={imageUrl}
                            alt={product.name || "Product"}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const parent = e.currentTarget.parentElement;
                              if (parent) parent.style.display = "none";
                            }}
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-gray-900 dark:text-white hover:text-theme-primary truncate">
                          {product.name}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* View All Results */}
          {hasResults && query.trim().length >= 2 && (
            <div className="border-t border-gray-200 dark:border-gray-700">
              <Link
                href={`/products?search=${encodeURIComponent(query.trim())}`}
                onClick={handleResultClick}
                className="block px-4 py-3 text-center text-sm font-medium text-theme-primary hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                View all results for "{query}"
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}