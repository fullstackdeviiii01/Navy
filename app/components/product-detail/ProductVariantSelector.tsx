// app/components/product-detail/ProductVariantSelector.tsx
"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";

interface VariantAttribute {
  name: string;
  value: string;
}

interface ProductVariant {
  _id?: string;
  sku?: string;
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
  colorHexCodes?: Record<string, string>;
  colorImages?: Record<string, string[]>;
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
    previewImageUrl?: string,
  ) => void;
  selectedVariant?: ProductVariant | null;
}

export default function ProductVariantSelector({
  variants,
  variantAttributes,
  onSelectionChange,
}: ProductVariantSelectorProps) {
  // Auto-select initial options from the first available variant by default
  const initialSelection = useMemo(() => {
    if (!variants?.length && !variantAttributes?.length) return {};
    const firstVar = variants.find((v) => v.isAvailable !== false) || variants[0];
    const sel: VariantSelection = {};
    if (firstVar?.attributes) {
      firstVar.attributes.forEach((attr) => {
        sel[attr.name] = attr.value;
      });
    }
    variantAttributes?.forEach((attr) => {
      if (!sel[attr.name] && attr.values?.[0]) {
        sel[attr.name] = attr.values[0];
      }
    });
    return sel;
  }, [variants, variantAttributes]);

  const [currentSelection, setCurrentSelection] = useState<VariantSelection>(initialSelection);

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

  // Auto-emit default variant on mount or when options load
  useEffect(() => {
    if (Object.keys(initialSelection).length > 0) {
      setCurrentSelection(initialSelection);
      const matched = findMatchingVariant(initialSelection) || (variants.find((v) => v.isAvailable !== false) || variants[0]) || null;
      let previewImg = matched?.imageUrl;
      if (!previewImg) {
        for (const [k, v] of Object.entries(initialSelection)) {
          const opt = variantAttributes.find((o) => o.name.toLowerCase() === k.toLowerCase());
          if (opt?.colorImages?.[v]) {
            const img = opt.colorImages[v];
            previewImg = Array.isArray(img) ? img[0] : img;
            if (previewImg) break;
          }
        }
      }
      onSelectionChange(initialSelection, matched, previewImg);
    }
  }, [initialSelection]);

  const handleSelect = (attributeName: string, value: string) => {
    const newSelection: VariantSelection = {
      ...currentSelection,
      [attributeName]: value,
    };
    setCurrentSelection(newSelection);

    const matchingVariant = findMatchingVariant(newSelection);
    let previewImg: string | undefined = undefined;

    // 1. If full variant matched and has an imageUrl, that is the primary source of truth
    if (matchingVariant?.imageUrl) {
      previewImg = matchingVariant.imageUrl;
    }

    // 2. If no direct variant imageUrl, check if the selected option has colorImages
    if (!previewImg) {
      const optObj = variantAttributes.find(
        (opt) => opt.name.toLowerCase() === attributeName.toLowerCase()
      );
      if (optObj?.colorImages) {
        const imgVal = optObj.colorImages[value];
        if (imgVal) {
          previewImg = Array.isArray(imgVal) ? imgVal[0] : imgVal;
        }
      }
    }

    // 3. Check if ANY currently selected color/finish attribute has a colorImage
    if (!previewImg) {
      for (const [attrKey, attrVal] of Object.entries(newSelection)) {
        const colorOpt = variantAttributes.find(
          (opt) =>
            opt.name.toLowerCase() === attrKey.toLowerCase() ||
            opt.displayName.toLowerCase() === attrKey.toLowerCase()
        );
        if (colorOpt?.colorImages?.[attrVal]) {
          const imgVal = colorOpt.colorImages[attrVal];
          previewImg = Array.isArray(imgVal) ? imgVal[0] : imgVal;
          if (previewImg) break;
        }
      }
    }

    // 4. Check if any variant matching the selected color has an imageUrl
    if (!previewImg) {
      const colorEntry = Object.entries(newSelection).find(([k]) => {
        const opt = variantAttributes.find((o) => o.name.toLowerCase() === k.toLowerCase());
        return (
          opt &&
          (opt.name.toLowerCase() === "color" ||
            opt.displayName.toLowerCase() === "color" ||
            opt.name.toLowerCase().includes("finish") ||
            opt.displayName.toLowerCase().includes("finish") ||
            (opt.colorHexCodes && Object.keys(opt.colorHexCodes).length > 0))
        );
      });

      if (colorEntry) {
        const colorVal = colorEntry[1];
        const matchedColorVar = variants.find((v) =>
          v.attributes?.some((a) => a.value.toLowerCase() === colorVal.toLowerCase())
        );
        if (matchedColorVar?.imageUrl) {
          previewImg = matchedColorVar.imageUrl;
        }
      }
    }

    onSelectionChange(newSelection, matchingVariant, previewImg);
  };

  const getMissingSelections = (): string[] => {
    return variantAttributes
      .filter((attr) => !currentSelection[attr.name])
      .map((attr) => attr.displayName);
  };

  return (
    <div className="space-y-2">
      {/* Selection Progress Indicator */}
      {!isFullySelected && variantAttributes.length > 1 && (
        <div
          className="p-2 bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs"
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
          const isColorOption =
            attributeOption.name.toLowerCase() === "color" ||
            attributeOption.displayName.toLowerCase() === "color";

          return (
            <div key={attributeOption.name} className="space-y-1.5">
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

                    const hexMatch = value.match(/#(?:[0-9a-fA-F]{3}){1,2}\b/);
                    const cleanDisplayName = hexMatch ? value.replace(hexMatch[0], "").trim() : value;

                    // COLOR OPTION: Render Product Photo Thumbnail (if image available)
                    if (isColorOption) {
                      const colorThumb =
                        attributeOption.colorImages?.[value]?.[0] ||
                        variantImageMap[attributeOption.name]?.[value] ||
                        variants.find((v) =>
                          v.attributes?.some(
                            (a) => a.value.toLowerCase() === value.toLowerCase()
                          )
                        )?.imageUrl;

                      if (colorThumb) {
                        return (
                          <button
                            key={value}
                            type="button"
                            onClick={() =>
                              !isDisabled && handleSelect(attributeOption.name, value)
                            }
                            disabled={isDisabled}
                            title={`${cleanDisplayName || value}${!inStock ? " (Out of stock)" : ""}`}
                            className={`
                              relative w-12 h-12 sm:w-13 sm:h-13 rounded-lg overflow-hidden border-2 transition-all duration-200 p-0.5 flex-shrink-0 group
                              ${
                                isSelected
                                  ? "border-theme-primary ring-2 ring-theme-primary/30 scale-105 shadow-md"
                                  : inStock
                                    ? "border-theme-border-light dark:border-theme-border-dark hover:border-theme-hover-light dark:hover:border-theme-hover-dark hover:scale-105"
                                    : "opacity-40 cursor-not-allowed border-theme-border-light/40"
                              }
                            `}
                            aria-label={`${cleanDisplayName || value}${isSelected ? " (selected)" : ""}${!inStock ? " (sold out)" : ""}`}
                            aria-pressed={isSelected}
                          >
                            <div className="relative w-full h-full rounded-[4px] overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                              <Image
                                src={colorThumb}
                                alt={cleanDisplayName || value}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform"
                                sizes="52px"
                              />
                            </div>
                            {!inStock && (
                              <span className="absolute inset-0 flex items-center justify-center bg-black/40">
                                <span className="w-full h-[1.5px] bg-red-500/90 -rotate-45" />
                              </span>
                            )}
                          </button>
                        );
                      }
                    }

                    // All other attributes (Finish, Size, Material, or Color without image): Clean Text Pills
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() =>
                          !isDisabled && handleSelect(attributeOption.name, value)
                        }
                        disabled={isDisabled}
                        className={`
                          relative px-3.5 py-1.5 border text-xs uppercase tracking-[0.15em] font-medium transition-all
                          ${
                            isSelected
                              ? "border-theme-primary bg-theme-primary text-theme-btn-text shadow-sm"
                              : inStock
                                ? "border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark hover:border-theme-hover-light dark:hover:border-theme-hover-dark"
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