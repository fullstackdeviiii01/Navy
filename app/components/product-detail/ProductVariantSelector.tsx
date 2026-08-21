// app/components/product-detail/ProductVariantSelector.tsx
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
  attributes: VariantAttribute[];
  price: number;
  compareAtPrice?: number;
  stockQuantity: number;
  isAvailable: boolean;
  position: number;
  imageUrl?: string;
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
}: ProductVariantSelectorProps) {
  const [currentSelection, setCurrentSelection] = useState<VariantSelection>({});

  const isFullySelected = useMemo(() => {
    return variantAttributes.every((attr) => currentSelection[attr.name]);
  }, [currentSelection, variantAttributes]);

  const variantImageMap = useMemo(() => {
    const map: Record<string, Record<string, string>> = {};
    for (const variant of variants) {
      if (!variant.imageUrl) continue;
      for (const attr of variant.attributes) {
        if (!map[attr.name]) map[attr.name] = {};
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
    <div className="space-y-5">
      {/* Selection Progress Indicator */}
      {!isFullySelected && variantAttributes.length > 1 && (
        <div
          className="p-3 bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs"
          role="status"
          aria-live="polite"
        >
          <span className="font-semibold uppercase tracking-wider">Please select: </span>
          <span>{getMissingSelections().join(", ")}</span>
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
            <div key={attributeOption.name} className="space-y-2">
              {/* Label */}
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-[0.2em] font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
                  {attributeOption.displayName}
                </span>
                {selectedValue && (
                  <span className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark">
                    — <span className="text-theme-text-primary-light dark:text-theme-text-primary-dark font-medium">{selectedValue}</span>
                  </span>
                )}
              </div>

              <fieldset>
                <legend className="sr-only">{attributeOption.displayName}</legend>
                <div
                  className="flex flex-wrap gap-2"
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

                    // Hex Color Swatch (Square)
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
                            relative w-9 h-9 border transition-all flex items-center justify-center
                            ${
                              isSelected
                                ? "border-theme-hover-light dark:border-theme-hover-dark ring-1 ring-theme-hover-light shadow-sm"
                                : inStock
                                  ? "border-theme-border-light dark:border-theme-border-dark hover:border-theme-hover-light"
                                  : "border-theme-border-light/40 dark:border-theme-border-dark/40 opacity-40 cursor-not-allowed"
                            }
                          `}
                          style={{ backgroundColor: hexCode }}
                          aria-label={`${cleanDisplayName || value}${isSelected ? " (selected)" : ""}${!inStock ? " (sold out)" : ""}`}
                          aria-pressed={isSelected}
                        >
                          {!inStock && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                              <span className="text-[8px] font-bold text-white">X</span>
                            </div>
                          )}
                        </button>
                      );
                    }

                    // Image Swatch (Square)
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
                            relative w-12 h-12 border overflow-hidden transition-all
                            ${
                              isSelected
                                ? "border-theme-hover-light dark:border-theme-hover-dark ring-1 ring-theme-hover-light"
                                : inStock
                                  ? "border-theme-border-light dark:border-theme-border-dark hover:border-theme-hover-light"
                                  : "border-theme-border-light/40 dark:border-theme-border-dark/40 opacity-40 cursor-not-allowed"
                            }
                          `}
                          aria-label={`${value}${isSelected ? " (selected)" : ""}${!inStock ? " (sold out)" : ""}`}
                          aria-pressed={isSelected}
                        >
                          <Image
                            src={swatchUrl}
                            alt={value}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                          {!inStock && (
                            <div
                              className="absolute inset-0 bg-black/50 flex items-center justify-center"
                              aria-hidden="true"
                            >
                              <span className="text-[8px] font-bold text-white">
                                SOLD
                              </span>
                            </div>
                          )}
                        </button>
                      );
                    }

                    // Sharp Text Button (No Image)
                    return (
                      <button
                        key={value}
                        onClick={() =>
                          !isDisabled && handleSelect(attributeOption.name, value)
                        }
                        disabled={isDisabled}
                        className={`
                          relative px-4 py-2 border text-xs uppercase tracking-[0.15em] font-medium transition-all
                          ${
                            isSelected
                              ? "border-theme-primary bg-theme-primary text-theme-btn-text"
                              : inStock
                                ? "border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark hover:border-theme-hover-light"
                                : "border-theme-border-light/40 dark:border-theme-border-dark/40 text-theme-text-muted-light dark:text-theme-text-muted-dark opacity-50 cursor-not-allowed line-through"
                          }
                        `}
                        aria-label={`${value}${isSelected ? " (selected)" : ""}${!inStock ? " (sold out)" : ""}`}
                        aria-pressed={isSelected}
                      >
                        <span>{value}</span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            </div>
          );
        })}
    </div>
  );
}