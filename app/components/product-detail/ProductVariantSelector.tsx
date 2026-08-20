"use client";

import { useState, useMemo } from "react";
import Image from "next/image";

interface VariantAttribute {
  name: string;
  value: string;
}

interface ProductVariant {
  _id?: string;
  sku: string;
  aliexpressSkuId?: string;
  aliexpressSkuAttr?: string;
  attributes: VariantAttribute[];
  price: number;
  compareAtPrice?: number;
  stockQuantity: number;
  isAvailable: boolean;
  position: number;
  imageUrl?: string; // Per-variant swatch image (e.g. colour photo from AliExpress)
}

interface VariantOption {
  name: string;
  displayName: string;
  values: string[];
  position: number;
}

interface VariantSelection {
  [key: string]: string;
}

interface ProductVariantSelectorProps {
  variants: ProductVariant[];
  variantAttributes: VariantOption[];
  onSelectionChange: (
    selection: VariantSelection,
    variant: ProductVariant | null,
  ) => void;
  selectedVariant?: ProductVariant | null;
}

export default function ProductVariantSelector({
  variants,
  variantAttributes,
  onSelectionChange,
  selectedVariant = null,
}: ProductVariantSelectorProps) {
  const [currentSelection, setCurrentSelection] = useState<VariantSelection>({});

  const isFullySelected = useMemo(() => {
    return variantAttributes.every((attr) => currentSelection[attr.name]);
  }, [currentSelection, variantAttributes]);

  /**
   * Build a map of { optionName → { value → imageUrl } } from all variants.
   * Used to show colour swatch images next to option buttons.
   */
  const variantImageMap = useMemo(() => {
    const map: Record<string, Record<string, string>> = {};
    for (const variant of variants) {
      if (!variant.imageUrl) continue;
      for (const attr of variant.attributes) {
        if (!map[attr.name]) map[attr.name] = {};
        // First image wins — stable across identical colour values
        if (!map[attr.name][attr.value]) {
          map[attr.name][attr.value] = variant.imageUrl;
        }
      }
    }
    return map;
  }, [variants]);

  const getAvailableValues = (
    attributeName: string,
  ): { value: string; inStock: boolean }[] => {
    const valuesMap = new Map<string, boolean>();

    variants.forEach((variant) => {
      if (!variant.isAvailable) return;

      const matchesOtherSelections = Object.entries(currentSelection).every(
        ([key, value]) => {
          if (key === attributeName) return true;
          const attr = variant.attributes.find(
            (a) => a.name.toLowerCase() === key.toLowerCase(),
          );
          return attr && attr.value === value;
        },
      );

      if (matchesOtherSelections) {
        const attr = variant.attributes.find(
          (a) => a.name.toLowerCase() === attributeName.toLowerCase(),
        );
        if (attr) {
          const hasStock = variant.stockQuantity > 0;
          const currentStock = valuesMap.get(attr.value);
          valuesMap.set(attr.value, currentStock === true || hasStock);
        }
      }
    });

    return Array.from(valuesMap.entries())
      .map(([value, inStock]) => ({ value, inStock }))
      .sort((a, b) => {
        if (a.inStock === b.inStock) return a.value.localeCompare(b.value);
        return a.inStock ? -1 : 1;
      });
  };

  const findMatchingVariant = (
    selection: VariantSelection,
  ): ProductVariant | null => {
    const allSelected = variantAttributes.every((attr) => selection[attr.name]);
    if (!allSelected) return null;

    return (
      variants.find((variant) => {
        if (!variant.isAvailable) return false;
        return Object.entries(selection).every(([key, value]) => {
          const attr = variant.attributes.find(
            (a) => a.name.toLowerCase() === key.toLowerCase(),
          );
          return attr && attr.value === value;
        });
      }) || null
    );
  };

  const handleSelect = (attributeName: string, value: string) => {
    const newSelection: VariantSelection = {
      ...currentSelection,
      [attributeName]: value,
    };
    setCurrentSelection(newSelection);
    const matchingVariant = findMatchingVariant(newSelection);
    onSelectionChange(newSelection, matchingVariant);
  };

  const getMissingSelections = (): string[] => {
    return variantAttributes
      .filter((attr) => !currentSelection[attr.name])
      .map((attr) => attr.displayName);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Selection Progress Indicator */}
      {!isFullySelected && variantAttributes.length > 1 && (
        <div
          className="p-2.5 sm:p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg"
          role="status"
          aria-live="polite"
        >
          <p className="text-xs sm:text-sm text-amber-800 dark:text-amber-200 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
            <span className="inline-flex items-center gap-1.5 sm:gap-2">
              <span
                className="inline-block w-2 h-2 bg-amber-500 rounded-full animate-pulse flex-shrink-0"
                aria-hidden="true"
              ></span>
              <strong>Please select:</strong>
            </span>
            <span>{getMissingSelections().join(", ")}</span>
          </p>
        </div>
      )}

      {variantAttributes
        .sort((a, b) => a.position - b.position)
        .map((attributeOption) => {
          const availableValues = getAvailableValues(attributeOption.name);
          const selectedValue = currentSelection[attributeOption.name];
          const swatchMap = variantImageMap[attributeOption.name] || {};
          const hasSwatches = Object.keys(swatchMap).length > 0;

          return (
            <div key={attributeOption.name} className="space-y-2 sm:space-y-3">
              {/* Label */}
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                  {attributeOption.displayName}
                </span>
                {selectedValue && (
                  <span className="text-sm text-theme-text-muted-light dark:text-theme-text-muted-dark">
                    :{" "}
                    <span className="font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
                      {selectedValue}
                    </span>
                  </span>
                )}
              </div>

              <fieldset>
                <legend className="sr-only">{attributeOption.displayName}</legend>
                <div
                  className="flex flex-wrap gap-1.5 sm:gap-2"
                  role="group"
                  aria-label={attributeOption.displayName}
                >
                  {availableValues.map(({ value, inStock }) => {
                    const isSelected = selectedValue === value;
                    const isDisabled = !inStock;
                    const swatchUrl = swatchMap[value];

                    const hexMatch = value.match(/#(?:[0-9a-fA-F]{3}){1,2}\b/);
                    const hexCode = hexMatch ? hexMatch[0] : null;
                    const cleanDisplayName = hexCode ? value.replace(hexMatch[0], "").trim() : value;

                    // ── Hex Color Drop Button ──────────────────────────────
                    if (hexCode) {
                      return (
                        <button
                          key={value}
                          onClick={() =>
                            !isDisabled && handleSelect(attributeOption.name, value)
                          }
                          disabled={isDisabled}
                          title={cleanDisplayName || value}
                          className={`
                            relative w-9 h-9 sm:w-11 sm:h-11 rounded-full border-2 transition-all flex items-center justify-center
                            ${
                              isSelected
                                ? "border-blue-600 ring-2 ring-blue-500 ring-offset-2 scale-110 shadow-md"
                                : inStock
                                  ? "border-gray-300 dark:border-gray-600 hover:scale-105 hover:border-blue-500"
                                  : "border-gray-200 dark:border-gray-700 opacity-40 cursor-not-allowed"
                            }
                          `}
                          style={{ backgroundColor: hexCode, minWidth: "36px", minHeight: "36px" }}
                          aria-label={`${cleanDisplayName || value}${isSelected ? " (selected)" : ""}${!inStock ? " (sold out)" : ""}`}
                          aria-pressed={isSelected}
                        >
                          {isSelected && (
                            <svg className="w-3.5 h-3.5 text-white drop-shadow-md" fill="currentColor" viewBox="0 0 12 12">
                              <path d="M10 3L5 8.5 2 5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                            </svg>
                          )}
                          {!inStock && (
                            <div className="absolute inset-0 bg-white/60 dark:bg-black/60 rounded-full flex items-center justify-center">
                              <span className="text-[8px] font-bold text-red-600">X</span>
                            </div>
                          )}
                        </button>
                      );
                    }

                    // ── Swatch button (has image) ─────────────────────────
                    if (hasSwatches && swatchUrl) {
                      return (
                        <button
                          key={value}
                          onClick={() =>
                            !isDisabled && handleSelect(attributeOption.name, value)
                          }
                          disabled={isDisabled}
                          title={value}
                          className={`
                            relative w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden border-2 transition-all
                            ${
                              isSelected
                                ? "border-theme-primary scale-105"
                                : inStock
                                  ? "border-theme-border-light dark:border-theme-border-dark hover:border-theme-primary"
                                  : "border-gray-200 dark:border-gray-700 opacity-40 cursor-not-allowed"
                            }
                          `}
                          aria-label={`${value}${isSelected ? " (selected)" : ""}${!inStock ? " (sold out)" : ""}`}
                          aria-pressed={isSelected}
                          style={{ minWidth: "40px", minHeight: "40px" }}
                        >
                          <Image
                            src={swatchUrl}
                            alt={value}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                          {/* Sold out diagonal stripe */}
                          {!inStock && (
                            <div
                              className="absolute inset-0 bg-white/60 dark:bg-black/60 flex items-center justify-center"
                              aria-hidden="true"
                            >
                              <span className="text-[8px] font-bold text-red-600 rotate-[-30deg]">
                                SOLD
                              </span>
                            </div>
                          )}
                          {/* Selected checkmark */}
                          {isSelected && (
                            <div
                              className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-theme-primary rounded-full flex items-center justify-center"
                              aria-hidden="true"
                            >
                              <svg
                                className="w-2 h-2 text-white"
                                fill="currentColor"
                                viewBox="0 0 12 12"
                              >
                                <path d="M10 3L5 8.5 2 5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                              </svg>
                            </div>
                          )}
                        </button>
                      );
                    }

                    // ── Text button (no image) ────────────────────────────
                    return (
                      <button
                        key={value}
                        onClick={() =>
                          !isDisabled && handleSelect(attributeOption.name, value)
                        }
                        disabled={isDisabled}
                        className={`
                          relative px-3 sm:px-4 py-2 sm:py-2.5 border-2 rounded-lg text-xs sm:text-sm font-medium transition-all
                          ${
                            isSelected
                              ? "border-theme-primary bg-theme-primary text-white shadow-md scale-105"
                              : inStock
                                ? "border-theme-border-light dark:border-theme-border-dark text-theme-text-primary-light dark:text-theme-text-primary-dark hover:border-theme-primary hover:bg-theme-hover-bg-light dark:hover:bg-theme-hover-bg-dark"
                                : "border-gray-300 dark:border-gray-600 text-theme-text-muted-light dark:text-theme-text-muted-dark bg-gray-100 dark:bg-gray-800 cursor-not-allowed opacity-50"
                          }
                        `}
                        aria-label={`${value}${isSelected ? " (selected)" : ""}${!inStock ? " (sold out)" : ""}`}
                        aria-pressed={isSelected}
                        style={{ minWidth: "44px", minHeight: "44px" }}
                      >
                        <span className="whitespace-nowrap">{value}</span>
                        {!inStock && (
                          <span
                            className="absolute -top-2 sm:-top-3 -right-1 sm:-right-2 px-1.5 sm:px-2 py-0.5 bg-red-500 text-white text-[9px] sm:text-[10px] font-bold rounded-full"
                            aria-hidden="true"
                          >
                            Sold
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            </div>
          );
        })}

      {/* Validation Message */}
      {!isFullySelected && Object.keys(currentSelection).length > 0 && (
        <div
          className="p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg"
          role="status"
        >
          <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-200">
            <strong>Tip:</strong> Complete all selections to see the final price
            and add to cart.
          </p>
        </div>
      )}
    </div>
  );
}