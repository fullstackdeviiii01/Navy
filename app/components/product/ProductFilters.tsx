// app/components/product/ProductFilters.tsx
"use client";

import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
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
    <div className="border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark p-5 space-y-4 lg:sticky lg:top-24 max-h-[calc(100vh-8rem)] overflow-y-auto scrollbar-hide transition-colors">
      <div className="pb-3 border-b border-theme-border-light dark:border-theme-border-dark">
        <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
          Filter Pieces
        </h3>
      </div>

      {/* Categories */}
      <div className="border-b border-theme-border-light/60 dark:border-theme-border-dark/60 pb-3">
        <button
          onClick={() => toggleSection("categories")}
          aria-expanded={expandedSection === "categories"}
          aria-controls="categories-section"
          aria-label="Product Categories"
          className="flex items-center justify-between w-full text-left font-serif text-sm font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark hover:text-theme-hover-light dark:hover:text-theme-hover-dark transition-colors py-1"
        >
          <span>Categories</span>
          {expandedSection === "categories" ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
        </button>
        <div
          id="categories-section"
          className={`transition-all duration-300 ease-in-out overflow-hidden ${
            expandedSection === "categories"
              ? "max-h-64 opacity-100 mt-2"
              : "max-h-0 opacity-0"
          }`}
        >
          <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
            <label className="flex items-center gap-2.5 cursor-pointer py-1 text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark hover:text-theme-text-primary-light dark:hover:text-theme-text-primary-dark transition-colors">
              <input
                type="radio"
                name="category"
                checked={selectedCategory === ""}
                onChange={() => onCategoryChange("")}
                className="w-3.5 h-3.5 text-theme-primary focus:ring-0 cursor-pointer accent-[#241910] dark:accent-[#D7D3CF]"
              />
              <span>All Categories</span>
            </label>
            {categories.map((cat) => (
              <label
                key={cat._id}
                className="flex items-center gap-2.5 cursor-pointer py-1 text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark hover:text-theme-text-primary-light dark:hover:text-theme-text-primary-dark transition-colors"
              >
                <input
                  type="radio"
                  name="category"
                  onChange={() => onCategoryChange(cat.slug)}
                  checked={selectedCategory === cat.slug}
                  className="w-3.5 h-3.5 text-theme-primary focus:ring-0 cursor-pointer accent-[#241910] dark:accent-[#D7D3CF]"
                />
                <span className="truncate">
                  {cat.name} ({cat.product_count})
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Price Range */}
      <div className="border-b border-theme-border-light/60 dark:border-theme-border-dark/60 pb-3">
        <button
          aria-label="Price range of the product"
          onClick={() => toggleSection("price")}
          className="flex items-center justify-between w-full text-left font-serif text-sm font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark hover:text-theme-hover-light dark:hover:text-theme-hover-dark transition-colors py-1"
        >
          <span>Price Range</span>
          {expandedSection === "price" ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
        </button>
        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden ${
            expandedSection === "price"
              ? "max-h-48 opacity-100 mt-2"
              : "max-h-0 opacity-0"
          }`}
        >
          <div className="space-y-2">
            <div className="flex items-center gap-2">
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
                className="w-full px-2.5 py-1.5 border border-theme-border-light dark:border-theme-border-dark bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark text-xs focus:outline-none focus:border-theme-hover-light"
              />
              <span className="text-theme-text-muted-light dark:text-theme-text-muted-dark text-xs">
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
                className="w-full px-2.5 py-1.5 border border-theme-border-light dark:border-theme-border-dark bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark text-xs focus:outline-none focus:border-theme-hover-light"
              />
            </div>
            <div className="flex gap-2 pt-1">
              <button
                aria-label="Handle price apply for the product"
                onClick={handlePriceApply}
                className="flex-1 py-1.5 px-3 bg-theme-primary hover:bg-theme-hover-light dark:hover:bg-theme-hover-dark text-theme-btn-text text-[11px] uppercase tracking-wider font-medium transition-colors"
              >
                Apply
              </button>
              <button
                aria-label="Handle price clear for the product"
                onClick={handlePriceClear}
                className="py-1.5 px-3 text-[11px] uppercase tracking-wider text-theme-text-muted-light dark:text-theme-text-muted-dark hover:text-theme-text-primary-light dark:hover:text-theme-text-primary-dark border border-theme-border-light dark:border-theme-border-dark transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Rating */}
      <div className="border-b border-theme-border-light/60 dark:border-theme-border-dark/60 pb-3">
        <button
          aria-label="Handle toggle section for customer rating"
          onClick={() => toggleSection("rating")}
          className="flex items-center justify-between w-full text-left font-serif text-sm font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark hover:text-theme-hover-light dark:hover:text-theme-hover-dark transition-colors py-1"
        >
          <span>Customer Rating</span>
          {expandedSection === "rating" ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
        </button>
        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden ${
            expandedSection === "rating"
              ? "max-h-48 opacity-100 mt-2"
              : "max-h-0 opacity-0"
          }`}
        >
          <div className="space-y-1">
            {[4, 3, 2, 1].map((rating) => (
              <label
                key={rating}
                className="flex items-center gap-2 cursor-pointer py-1 text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark hover:text-theme-text-primary-light dark:hover:text-theme-text-primary-dark transition-colors"
              >
                <input
                  type="radio"
                  name="rating"
                  aria-label="product rating"
                  checked={selectedRating === rating}
                  onChange={() => onRatingChange(rating)}
                  className="w-3.5 h-3.5 text-theme-primary focus:ring-0 cursor-pointer accent-[#241910] dark:accent-[#D7D3CF]"
                />
                <div className="flex items-center gap-1">
                  <Rating
                    rating={rating}
                    count={0}
                    size="sm"
                    showCount={false}
                  />
                  <span>& Up</span>
                </div>
              </label>
            ))}
            {selectedRating > 0 && (
              <button
                aria-label="Clear product filters"
                onClick={() => onRatingChange(0)}
                className="text-[11px] uppercase tracking-wider text-theme-hover-light dark:text-theme-hover-dark hover:underline pt-1 block"
              >
                Clear Rating
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Brands Filter */}
      {availableBrands.length > 0 && (
        <div className="border-b border-theme-border-light/60 dark:border-theme-border-dark/60 pb-3">
          <button
            aria-label="Toggle product brands"
            onClick={() => toggleSection("brands")}
            className="flex items-center justify-between w-full text-left font-serif text-sm font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark hover:text-theme-hover-light dark:hover:text-theme-hover-dark transition-colors py-1"
          >
            <span>Brands</span>
            {expandedSection === "brands" ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
          <div
            className={`transition-all duration-300 ease-in-out overflow-hidden ${
              expandedSection === "brands"
                ? "max-h-56 opacity-100 mt-2"
                : "max-h-0 opacity-0"
            }`}
          >
            <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
              {availableBrands.map((brand) => (
                <label
                  key={brand}
                  className="flex items-center gap-2 cursor-pointer py-1 text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark hover:text-theme-text-primary-light dark:hover:text-theme-text-primary-dark transition-colors"
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
                    className="w-3.5 h-3.5 text-theme-primary focus:ring-0 cursor-pointer accent-[#241910] dark:accent-[#D7D3CF]"
                  />
                  <span>{brand}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* In Stock Filter */}
      <div className="pt-1">
        <label className="flex items-center gap-2 cursor-pointer py-1 text-xs uppercase tracking-wider font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark hover:text-theme-hover-light dark:hover:text-theme-hover-dark transition-colors">
          <input
            type="checkbox"
            aria-label="Products in the stock"
            checked={inStock}
            onChange={(e) => onStockChange(e.target.checked)}
            className="w-3.5 h-3.5 text-theme-primary focus:ring-0 cursor-pointer accent-[#241910] dark:accent-[#D7D3CF]"
          />
          <span>In Stock Only</span>
        </label>
      </div>
    </div>
  );
}
