// app/components/product/ProductFilters.tsx
"use client";

import { useState, useEffect } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import Rating from "../shared/Rating";

interface ProductFiltersProps {
  categories: any[];
  selectedCategory: string;
  onCategoryChange: (categoryId: string) => void;
  priceRange: { min: number; max: number };
  onPriceChange: (range: { min: number; max: number }) => void;
  inStock: boolean;
  onStockChange: (inStock: boolean) => void;
  selectedRating: number;
  onRatingChange: (rating: number) => void;
  selectedBrands: string[];
  onBrandChange: (brands: string[]) => void;
  availableBrands: string[];
}

export default function ProductFilters({
  categories,
  selectedCategory,
  onCategoryChange,
  priceRange,
  onPriceChange,
  inStock,
  onStockChange,
  selectedRating,
  onRatingChange,
  selectedBrands,
  onBrandChange,
  availableBrands,
}: ProductFiltersProps) {
    const [expandedSection, setExpandedSection] = useState<string>("categories");

  // Local state for price inputs
  const [localPriceRange, setLocalPriceRange] = useState({ min: 0, max: 0 });

  useEffect(() => {
    if (priceRange.min > 0 || priceRange.max > 0) {
      const convertedMin = Math.round(priceRange.min);
      const convertedMax = Math.round(priceRange.max);
      setLocalPriceRange({ min: convertedMin, max: convertedMax });
    } else {
      setLocalPriceRange({ min: 0, max: 0 });
    }
  }, [priceRange]);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? "" : section);
  };

  const handlePriceApply = () => {
    onPriceChange({ min: localPriceRange.min, max: localPriceRange.max });
  };

  const handlePriceClear = () => {
    setLocalPriceRange({ min: 0, max: 0 });
    onPriceChange({ min: 0, max: 0 });
  };

  return (
    <div
      className="bg-theme-surface-light dark:bg-theme-surface-dark border border-theme-border-light dark:border-theme-border-dark rounded-lg p-2.5 sm:p-3 md:p-4 space-y-1.5 sm:space-y-2 lg:sticky lg:top-4 max-h-[calc(100vh-2rem)] overflow-y-auto"
      style={{
        scrollbarWidth: "none",
        msOverflowStyle: "none",
      }}
    >
      <style jsx>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      <h3 className="text-theme-text-primary-light dark:text-theme-text-primary-dark text-base sm:text-lg md:text-xl font-semibold sticky top-0 bg-theme-surface-light dark:bg-theme-surface-dark pb-1 z-10">
        Filters
      </h3>

      {/* Categories */}
      <div className="border-b border-theme-border-light dark:border-theme-border-dark pb-1.5 sm:pb-2">
        <button
          onClick={() => toggleSection("categories")}
          aria-expanded={expandedSection === "categories"}
          aria-controls="categories-section"
          aria-label="Product Categories"
          className="flex items-center justify-between w-full text-theme-text-primary-light dark:text-theme-text-primary-dark font-medium text-sm sm:text-base mb-1.5 sm:mb-2 hover:text-theme-primary transition-colors"
        >
          <span>Categories</span>
          {expandedSection === "categories" ? (
            <FaChevronUp className="text-xs sm:text-sm" />
          ) : (
            <FaChevronDown className="text-xs sm:text-sm" />
          )}
        </button>
        <div
          id="categories-section"
          className={`transition-all duration-300 ease-in-out overflow-hidden ${
            expandedSection === "categories"
              ? "max-h-64 opacity-100"
              : "max-h-0 opacity-0"
          }`}
        >
          <div className="space-y-0.5 sm:space-y-1 max-h-48 overflow-y-auto pr-1 sm:pr-2 custom-scrollbar">
            <label className="flex items-center gap-1.5 sm:gap-2 cursor-pointer hover:bg-theme-hover-bg-light dark:hover:bg-theme-hover-bg-dark p-1 rounded transition-colors">
              <input
                type="radio"
                name="category"
                checked={selectedCategory === ""}
                onChange={() => onCategoryChange("")}
                className="text-theme-primary focus:ring-theme-primary w-3.5 h-3.5 sm:w-4 sm:h-4"
              />
              <span className="text-theme-text-secondary-light dark:text-theme-text-secondary-dark text-xs sm:text-sm">
                All Categories
              </span>
            </label>
            {categories.map((cat) => (
              <label
                key={cat._id}
                className="flex items-center gap-1.5 sm:gap-2 cursor-pointer hover:bg-theme-hover-bg-light dark:hover:bg-theme-hover-bg-dark p-1 rounded transition-colors"
              >
                <input
                  type="radio"
                  name="category"
                  onChange={() => onCategoryChange(cat.slug)}
                  checked={selectedCategory === cat.slug}
                  className="text-theme-primary focus:ring-theme-primary w-3.5 h-3.5 sm:w-4 sm:h-4"
                />
                <span className="text-theme-text-secondary-light dark:text-theme-text-secondary-dark text-xs sm:text-sm">
                  {cat.name} ({cat.product_count})
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Price Range with Currency Conversion */}
      <div className="border-b border-theme-border-light dark:border-theme-border-dark pb-1.5 sm:pb-2">
        <button
          aria-label="Price range of the product"
          onClick={() => toggleSection("price")}
          className="flex items-center justify-between w-full text-theme-text-primary-light dark:text-theme-text-primary-dark font-medium text-sm sm:text-base mb-1.5 sm:mb-2 hover:text-theme-primary transition-colors"
        >
          <span>Price Range</span>
          {expandedSection === "price" ? (
            <FaChevronUp className="text-xs sm:text-sm" />
          ) : (
            <FaChevronDown className="text-xs sm:text-sm" />
          )}
        </button>
        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden ${
            expandedSection === "price"
              ? "max-h-40 opacity-100"
              : "max-h-0 opacity-0"
          }`}
        >
          <div className="space-y-1.5 sm:space-y-2">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <input
                type="number"
                placeholder="Min"
                aria-label="Minimum price"
                value={localPriceRange.min || ""}
                onChange={(e) =>
                  setLocalPriceRange({
                    ...localPriceRange,
                    min: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark text-xs sm:text-sm focus:ring-2 focus:ring-theme-primary"
              />
              <span className="text-theme-text-muted-light dark:text-theme-text-muted-dark text-xs sm:text-sm">
                -
              </span>
              <input
                type="number"
                placeholder="Max"
                aria-label="Maximum price"
                value={localPriceRange.max || ""}
                onChange={(e) =>
                  setLocalPriceRange({
                    ...localPriceRange,
                    max: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark text-xs sm:text-sm focus:ring-2 focus:ring-theme-primary"
              />
            </div>
            <p className="text-[10px] sm:text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark">
              Price in {"PKR"}
            </p>
            {"PKR" !== "USD" &&
              (priceRange.min > 0 || priceRange.max > 0) && (
                <p className="text-[10px] sm:text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark">
                  ≈${priceRange.min} - ${priceRange.max} USD
                </p>
              )}
            <div className="flex gap-1.5 sm:gap-2">
              <button
                aria-label="Handle price apply for the product"
                onClick={handlePriceApply}
                className="flex-1 px-2.5 sm:px-3 py-1.5 bg-theme-primary text-white rounded text-xs sm:text-sm hover:opacity-90 transition-opacity"
              >
                Apply
              </button>
              <button
                aria-label="Handle price clear for the product"
                onClick={handlePriceClear}
                className="px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm text-theme-text-muted-light dark:text-theme-text-muted-dark hover:text-theme-text-secondary-light dark:hover:text-theme-text-secondary-dark border border-theme-border-light dark:border-theme-border-dark rounded transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Rating Filter */}
      <div className="border-b border-theme-border-light dark:border-theme-border-dark pb-1.5 sm:pb-2">
        <button
          aria-label="Handle toggle section for customer rating"
          onClick={() => toggleSection("rating")}
          className="flex items-center justify-between w-full text-theme-text-primary-light dark:text-theme-text-primary-dark font-medium text-sm sm:text-base mb-1.5 sm:mb-2 hover:text-theme-primary transition-colors"
        >
          <span>Customer Rating</span>
          {expandedSection === "rating" ? (
            <FaChevronUp className="text-xs sm:text-sm" />
          ) : (
            <FaChevronDown className="text-xs sm:text-sm" />
          )}
        </button>
        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden ${
            expandedSection === "rating"
              ? "max-h-48 opacity-100"
              : "max-h-0 opacity-0"
          }`}
        >
          <div className="space-y-0.5 sm:space-y-1">
            {[4, 3, 2, 1].map((rating) => (
              <label
                key={rating}
                className="flex items-center gap-1.5 sm:gap-2 cursor-pointer hover:bg-theme-hover-bg-light dark:hover:bg-theme-hover-bg-dark p-1 rounded transition-colors"
              >
                <input
                  type="radio"
                  name="rating"
                  aria-label="product rating"
                  checked={selectedRating === rating}
                  onChange={() => onRatingChange(rating)}
                  className="text-theme-primary focus:ring-theme-primary w-3.5 h-3.5 sm:w-4 sm:h-4"
                />
                <div className="flex items-center gap-1">
                  <Rating
                    rating={rating}
                    count={0}
                    size="sm"
                    showCount={false}
                  />
                  <span className="text-theme-text-secondary-light dark:text-theme-text-secondary-dark text-xs sm:text-sm">
                    & Up
                  </span>
                </div>
              </label>
            ))}
            {selectedRating > 0 && (
              <button
                aria-label="Clear product filters"
                onClick={() => onRatingChange(0)}
                className="text-xs sm:text-sm text-theme-text-muted-light dark:text-theme-text-muted-dark hover:text-theme-text-secondary-light dark:hover:text-theme-text-secondary-dark transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Brands Filter */}
      {availableBrands.length > 0 && (
        <div className="border-b border-theme-border-light dark:border-theme-border-dark pb-1.5 sm:pb-2">
          <button
            aria-label="Toggle product brands"
            onClick={() => toggleSection("brands")}
            className="flex items-center justify-between w-full text-theme-text-primary-light dark:text-theme-text-primary-dark font-medium text-sm sm:text-base mb-1.5 sm:mb-2 hover:text-theme-primary transition-colors"
          >
            <span>Brands</span>
            {expandedSection === "brands" ? (
              <FaChevronUp className="text-xs sm:text-sm" />
            ) : (
              <FaChevronDown className="text-xs sm:text-sm" />
            )}
          </button>
          <div
            className={`transition-all duration-300 ease-in-out overflow-hidden ${
              expandedSection === "brands"
                ? "max-h-56 opacity-100"
                : "max-h-0 opacity-0"
            }`}
          >
            <div className="space-y-0.5 sm:space-y-1 max-h-48 overflow-y-auto pr-1 sm:pr-2 custom-scrollbar">
              {availableBrands.map((brand) => (
                <label
                  key={brand}
                  className="flex items-center gap-1.5 sm:gap-2 cursor-pointer hover:bg-theme-hover-bg-light dark:hover:bg-theme-hover-bg-dark p-1 rounded transition-colors"
                >
                  <input
                    type="checkbox"
                    aria-label="Product Brands check"
                    checked={selectedBrands.includes(brand)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        onBrandChange([...selectedBrands, brand]);
                      } else {
                        onBrandChange(
                          selectedBrands.filter((b) => b !== brand),
                        );
                      }
                    }}
                    className="rounded text-theme-primary focus:ring-theme-primary w-3.5 h-3.5 sm:w-4 sm:h-4"
                  />
                  <span className="text-theme-text-secondary-light dark:text-theme-text-secondary-dark text-xs sm:text-sm">
                    {brand}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Availability */}
      <div className="pb-1">
        <button
          aria-label="product availability check"
          onClick={() => toggleSection("availability")}
          className="flex items-center justify-between w-full text-theme-text-primary-light dark:text-theme-text-primary-dark font-medium text-sm sm:text-base mb-1.5 sm:mb-2 hover:text-theme-primary transition-colors"
        >
          <span>Availability</span>
          {expandedSection === "availability" ? (
            <FaChevronUp className="text-xs sm:text-sm" />
          ) : (
            <FaChevronDown className="text-xs sm:text-sm" />
          )}
        </button>
        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden ${
            expandedSection === "availability"
              ? "max-h-16 opacity-100"
              : "max-h-0 opacity-0"
          }`}
        >
          <label className="flex items-center gap-1.5 sm:gap-2 cursor-pointer hover:bg-theme-hover-bg-light dark:hover:bg-theme-hover-bg-dark p-1 rounded transition-colors">
            <input
              type="checkbox"
              aria-label="Products in the stock"
              checked={inStock}
              onChange={(e) => onStockChange(e.target.checked)}
              className="rounded text-theme-primary focus:ring-theme-primary w-3.5 h-3.5 sm:w-4 sm:h-4"
            />
            <span className="text-theme-text-secondary-light dark:text-theme-text-secondary-dark text-xs sm:text-sm">
              In Stock Only
            </span>
          </label>
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        @media (min-width: 640px) {
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e0;
          border-radius: 3px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #4a5568;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a0aec0;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #718096;
        }
      `}</style>
    </div>
  );
}
