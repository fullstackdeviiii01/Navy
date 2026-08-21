// app/(admin)/components/products/form/VariantConfiguration.tsx
"use client";

import { useState, useEffect } from "react";
import { FaPlus, FaTrash, FaInfoCircle, FaUpload, FaPalette, FaImage } from "react-icons/fa";
import { VariantOption, ProductVariant, VariantAttribute } from "../../../../../types/product-variants";

interface ColorItem {
  id: string;
  name: string;
  hex: string;
  existingImages: string[];
  newFiles: File[];
}

interface InlineVariantConfigurationProps {
  variantOptions: VariantOption[];
  variants: ProductVariant[];
  onVariantOptionsChange: (options: VariantOption[]) => void;
  onVariantsChange: (variants: ProductVariant[]) => void;
  basePrice: number;
  baseSku: string;
  productCurrency: string;
  colorItems?: ColorItem[];
  onColorItemsChange?: (items: ColorItem[]) => void;
}

const LUXURY_PALETTE_PRESETS = [
  { name: "Walnut", hex: "#5D4037" },
  { name: "Warm Brass", hex: "#A8752B" },
  { name: "Amber Gold", hex: "#D4A359" },
  { name: "Smoked Oak", hex: "#3E2723" },
  { name: "Matte Black", hex: "#1A1A1A" },
  { name: "Ivory White", hex: "#F5F5F0" },
  { name: "Forest Green", hex: "#1B382B" },
  { name: "Deep Navy", hex: "#0A192F" },
];

export default function VariantConfiguration({
  variantOptions,
  variants,
  onVariantOptionsChange,
  onVariantsChange,
  basePrice,
  baseSku,
  productCurrency,
  colorItems: externalColorItems,
  onColorItemsChange,
}: InlineVariantConfigurationProps) {
  // Color items internal state
  const [internalColorItems, setInternalColorItems] = useState<ColorItem[]>([]);
  const colorItems = externalColorItems ?? internalColorItems;
  const setColorItems = (items: ColorItem[]) => {
    if (onColorItemsChange) {
      onColorItemsChange(items);
    } else {
      setInternalColorItems(items);
    }
  };

  const [valueInputs, setValueInputs] = useState<{ [key: number]: string }>({});
  const [showVariantTable, setShowVariantTable] = useState(true);

  // Initialize colorItems and other variant options on mount or prop change
  useEffect(() => {
    const colorOpt = variantOptions.find((opt) => opt.name === "color" || opt.displayName.toLowerCase() === "color");
    if (colorOpt && colorItems.length === 0) {
      const rawHex: any = colorOpt.colorHexCodes || {};
      const rawImgs: any = colorOpt.colorImages || {};

      const initialColors: ColorItem[] = colorOpt.values.map((val, idx) => {
        const hexVal =
          (typeof rawHex?.get === "function" ? rawHex.get(val) : rawHex?.[val]) ||
          LUXURY_PALETTE_PRESETS.find((p) => p.name.toLowerCase() === val.toLowerCase())?.hex ||
          "#5D4037";

        let existing =
          (typeof rawImgs?.get === "function" ? rawImgs.get(val) : rawImgs?.[val]) || [];

        if (existing.length === 0 && variants.length > 0) {
          const matchedVar = variants.find((v) =>
            v.attributes?.some((a) => a.name === "color" && a.value === val)
          );
          if (matchedVar?.imageUrl) {
            existing = [matchedVar.imageUrl];
          }
        }

        return {
          id: `color-${idx}-${Date.now()}`,
          name: val,
          hex: hexVal,
          existingImages: existing,
          newFiles: [],
        };
      });

      if (initialColors.length > 0) {
        setColorItems(initialColors);
      }
    }

    const nonColorOptions = variantOptions.filter(
      (opt) => opt.name !== "color" && opt.displayName.toLowerCase() !== "color"
    );
    const inputs: { [key: number]: string } = {};
    nonColorOptions.forEach((option, index) => {
      inputs[index] = option.values.join(", ");
    });
    setValueInputs(inputs);
  }, []);

  // Sync color items and non-color options into full variantOptions and generate variants
  const nonColorOptions = variantOptions.filter(
    (opt) => opt.name !== "color" && opt.displayName.toLowerCase() !== "color"
  );

  const syncAllOptionsAndVariants = (
    updatedColors: ColorItem[],
    updatedNonColorOptions: VariantOption[]
  ) => {
    const fullOptions: VariantOption[] = [];

    // Add color option first if colors exist
    const validColors = updatedColors.filter((c) => c.name.trim().length > 0);
    if (validColors.length > 0) {
      const colorHexCodes: Record<string, string> = {};
      const colorImages: Record<string, string[]> = {};

      validColors.forEach((c) => {
        colorHexCodes[c.name.trim()] = c.hex;
        colorImages[c.name.trim()] = c.existingImages;
      });

      fullOptions.push({
        name: "color",
        displayName: "Color",
        values: validColors.map((c) => c.name.trim()),
        colorHexCodes,
        colorImages,
        position: 0,
      });
    }

    // Add other options with updated positions
    updatedNonColorOptions.forEach((opt, idx) => {
      fullOptions.push({
        ...opt,
        position: fullOptions.length,
      });
    });

    onVariantOptionsChange(fullOptions);

    // Generate variants
    if (fullOptions.length === 0 || fullOptions.some((opt) => opt.values.length === 0)) {
      onVariantsChange([]);
      return;
    }

    const combinations = generateAllCombinations(fullOptions);
    const newVariants: ProductVariant[] = combinations.map((attrs, index) => {
      const existingVariant = variants.find((v) =>
        arraysEqual(
          v.attributes.map((a) => `${a.name}:${a.value}`).sort(),
          attrs.map((a) => `${a.name}:${a.value}`).sort()
        )
      );

      // Find color image if variant has color
      const colorAttr = attrs.find((a) => a.name === "color");
      const matchedColor = colorAttr ? validColors.find((c) => c.name.trim() === colorAttr.value) : null;
      let matchedImageUrl: string | undefined = undefined;
      if (matchedColor) {
        if (matchedColor.existingImages.length > 0) {
          matchedImageUrl = matchedColor.existingImages[0];
        } else if (matchedColor.newFiles.length > 0) {
          matchedImageUrl = URL.createObjectURL(matchedColor.newFiles[0]);
        }
      }

      if (existingVariant) {
        return {
          ...existingVariant,
          imageUrl: existingVariant.imageUrl || matchedImageUrl,
        };
      }

      return {
        sku: `${baseSku || "PROD"}-V${String(index + 1).padStart(3, "0")}`,
        attributes: attrs,
        price: basePrice || 0,
        compareAtPrice: undefined,
        stockQuantity: 0,
        imageUrl: matchedImageUrl,
        isAvailable: true,
        position: index,
      };
    });

    onVariantsChange(newVariants);
  };

  // Color handlers
  const addColorItem = () => {
    const newColor: ColorItem = {
      id: `color-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      name: "",
      hex: "#5D4037",
      existingImages: [],
      newFiles: [],
    };
    const updated = [...colorItems, newColor];
    setColorItems(updated);
    syncAllOptionsAndVariants(updated, nonColorOptions);
  };

  const updateColorItem = (index: number, updates: Partial<ColorItem>) => {
    const updated = [...colorItems];
    updated[index] = { ...updated[index], ...updates };
    setColorItems(updated);
    syncAllOptionsAndVariants(updated, nonColorOptions);
  };

  const removeColorItem = (index: number) => {
    const updated = colorItems.filter((_, i) => i !== index);
    setColorItems(updated);
    syncAllOptionsAndVariants(updated, nonColorOptions);
  };

  const handleColorFileUpload = (index: number, files: FileList | null) => {
    if (!files) return;
    const fileArray = Array.from(files);
    const updated = [...colorItems];
    updated[index] = {
      ...updated[index],
      newFiles: [...updated[index].newFiles, ...fileArray],
    };
    setColorItems(updated);
    syncAllOptionsAndVariants(updated, nonColorOptions);
  };

  const removeColorExistingImage = (colorIndex: number, imgIndex: number) => {
    const updated = [...colorItems];
    const newExisting = updated[colorIndex].existingImages.filter((_, i) => i !== imgIndex);
    updated[colorIndex] = { ...updated[colorIndex], existingImages: newExisting };
    setColorItems(updated);
    syncAllOptionsAndVariants(updated, nonColorOptions);
  };

  const removeColorNewFile = (colorIndex: number, fileIndex: number) => {
    const updated = [...colorItems];
    const newFiles = updated[colorIndex].newFiles.filter((_, i) => i !== fileIndex);
    updated[colorIndex] = { ...updated[colorIndex], newFiles };
    setColorItems(updated);
    syncAllOptionsAndVariants(updated, nonColorOptions);
  };

  // Non-color options handlers
  const generateNameFromDisplay = (displayName: string): string => {
    return displayName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");
  };

  const addNonColorOption = () => {
    const newIndex = nonColorOptions.length;
    const newOptions: VariantOption[] = [
      ...nonColorOptions,
      {
        name: "",
        displayName: "",
        values: [],
        position: nonColorOptions.length + (colorItems.length > 0 ? 1 : 0),
      },
    ];
    setValueInputs({ ...valueInputs, [newIndex]: "" });
    syncAllOptionsAndVariants(colorItems, newOptions);
  };

  const updateNonColorOption = (index: number, field: keyof VariantOption, value: any) => {
    const updated = [...nonColorOptions];
    updated[index] = { ...updated[index], [field]: value };
    syncAllOptionsAndVariants(colorItems, updated);
  };

  const removeNonColorOption = (index: number) => {
    const updated = nonColorOptions.filter((_, i) => i !== index);
    const newInputs = { ...valueInputs };
    delete newInputs[index];
    setValueInputs(newInputs);
    syncAllOptionsAndVariants(colorItems, updated);
  };

  const handleNonColorValueInputChange = (index: number, rawValue: string) => {
    setValueInputs({ ...valueInputs, [index]: rawValue });
    const parsedValues = rawValue
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);

    const updated = [...nonColorOptions];
    updated[index] = { ...updated[index], values: parsedValues };
    syncAllOptionsAndVariants(colorItems, updated);
  };

  const generateAllCombinations = (options: VariantOption[]): VariantAttribute[][] => {
    if (options.length === 0) return [];
    const combinations: VariantAttribute[][] = [[]];

    options.forEach((option) => {
      const newCombinations: VariantAttribute[][] = [];
      combinations.forEach((combination) => {
        option.values.forEach((value) => {
          newCombinations.push([
            ...combination,
            { name: option.name, value },
          ]);
        });
      });
      combinations.length = 0;
      combinations.push(...newCombinations);
    });

    return combinations;
  };

  const arraysEqual = (a: string[], b: string[]): boolean => {
    if (a.length !== b.length) return false;
    return a.every((val, index) => val === b[index]);
  };

  const updateVariant = (index: number, field: keyof ProductVariant, value: any) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], [field]: value };
    onVariantsChange(updated);
  };

  const totalVariantCount = variants.length;

  return (
    <div className="space-y-6">
      {/* 1. DEDICATED COLOR SECTION */}
      <div className="p-4 sm:p-5 border-2 border-theme-primary/30 rounded-none bg-theme-surface-light dark:bg-theme-surface-dark space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-theme-border-light dark:border-theme-border-dark pb-3">
          <div className="flex items-center gap-2">
            <FaPalette className="text-theme-primary w-5 h-5" />
            <div>
              <h4 className="text-base sm:text-lg font-serif font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark">
                Color & Finish Palette (With Color Photos)
              </h4>
              <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
                Pick colors, specify custom Hex codes, and attach photos specific to each color.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={addColorItem}
            className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 bg-theme-primary text-theme-btn-text text-xs uppercase tracking-wider font-medium hover:opacity-90 transition-opacity"
          >
            <FaPlus size={10} />
            <span>Add Color</span>
          </button>
        </div>

        {colorItems.length === 0 ? (
          <div className="py-6 text-center border border-dashed border-theme-border-light dark:border-theme-border-dark p-4">
            <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-2">
              No color variations added yet.
            </p>
            <button
              type="button"
              onClick={addColorItem}
              className="inline-flex items-center gap-1.5 px-4 py-2 border border-theme-border-light dark:border-theme-border-dark text-xs uppercase tracking-wider font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark hover:bg-theme-card-light dark:hover:bg-theme-card-dark transition-colors"
            >
              <FaPlus size={10} />
              <span>Create First Color</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {colorItems.map((color, cIdx) => (
              <div
                key={color.id || cIdx}
                className="p-3 sm:p-4 border border-theme-border-light dark:border-theme-border-dark bg-theme-card-light/40 dark:bg-theme-card-dark/30 space-y-3"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  {/* Color Name Input */}
                  <div className="flex-1">
                    <label className="block text-[11px] uppercase tracking-wider font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1">
                      Color / Finish Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={color.name}
                      onChange={(e) => updateColorItem(cIdx, { name: e.target.value })}
                      placeholder="e.g. American Walnut, Warm Brass, Matte Black"
                      className="w-full px-3 py-1.5 border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark text-xs text-theme-text-primary-light dark:text-theme-text-primary-dark"
                    />
                  </div>

                  {/* Hex Color Picker & Input */}
                  <div className="flex items-center gap-2">
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1">
                        Color Swatch & Hex
                      </label>
                      <div className="flex items-center gap-1.5">
                        {/* Native Color Input */}
                        <div className="relative w-8 h-8 border border-theme-border-light dark:border-theme-border-dark overflow-hidden flex-shrink-0 cursor-pointer">
                          <input
                            type="color"
                            value={color.hex.startsWith("#") && color.hex.length === 7 ? color.hex : "#5D4037"}
                            onChange={(e) => updateColorItem(cIdx, { hex: e.target.value })}
                            className="absolute -top-2 -left-2 w-12 h-12 cursor-pointer border-0 p-0"
                          />
                        </div>
                        {/* Text Hex Code Input */}
                        <input
                          type="text"
                          value={color.hex}
                          onChange={(e) => updateColorItem(cIdx, { hex: e.target.value })}
                          placeholder="#5D4037"
                          className="w-24 px-2 py-1.5 border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark text-xs font-mono text-theme-text-primary-light dark:text-theme-text-primary-dark uppercase"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Remove Color Button */}
                  <div className="self-end lg:self-center pt-2 lg:pt-0">
                    <button
                      type="button"
                      onClick={() => removeColorItem(cIdx)}
                      className="p-2 text-red-600 hover:text-white hover:bg-red-600 border border-red-600/40 transition-colors text-xs inline-flex items-center gap-1"
                      title="Remove Color"
                    >
                      <FaTrash size={11} />
                      <span className="text-[11px]">Delete</span>
                    </button>
                  </div>
                </div>

                {/* Quick Luxury Presets */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] uppercase tracking-wider text-theme-text-muted-light font-medium mr-1">
                    Presets:
                  </span>
                  {LUXURY_PALETTE_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => updateColorItem(cIdx, { hex: preset.hex, name: color.name || preset.name })}
                      className="inline-flex items-center gap-1 px-1.5 py-0.5 border border-theme-border-light/60 dark:border-theme-border-dark/60 text-[10px] bg-theme-surface-light dark:bg-theme-surface-dark hover:border-theme-primary transition-colors"
                    >
                      <span className="w-2.5 h-2.5 inline-block border border-black/20" style={{ backgroundColor: preset.hex }} />
                      <span>{preset.name}</span>
                    </button>
                  ))}
                </div>

                {/* Color-Specific Images Uploader */}
                <div className="pt-2 border-t border-theme-border-light/60 dark:border-theme-border-dark/60">
                  <label className="block text-[11px] uppercase tracking-wider font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1.5 flex items-center gap-1.5">
                    <FaImage className="text-theme-hover-light dark:text-theme-hover-dark" />
                    <span>Images for {color.name || "this color"}</span>
                  </label>

                  <div className="flex flex-wrap items-center gap-2.5">
                    {/* Existing Images */}
                    {color.existingImages.map((imgUrl, imgIdx) => (
                      <div key={`exist-img-${imgIdx}`} className="relative group w-16 h-16 border border-theme-border-light dark:border-theme-border-dark bg-black/5">
                        <img src={imgUrl} alt={`${color.name} preview`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeColorExistingImage(cIdx, imgIdx)}
                          className="absolute top-0 right-0 bg-red-600 text-white p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <FaTrash size={9} />
                        </button>
                      </div>
                    ))}

                    {/* New Upload Files */}
                    {color.newFiles.map((file, fileIdx) => {
                      const objUrl = URL.createObjectURL(file);
                      return (
                        <div key={`new-file-${fileIdx}`} className="relative group w-16 h-16 border border-theme-primary bg-black/5">
                          <img src={objUrl} alt={file.name} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeColorNewFile(cIdx, fileIdx)}
                            className="absolute top-0 right-0 bg-red-600 text-white p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <FaTrash size={9} />
                          </button>
                          <span className="absolute bottom-0 left-0 bg-theme-primary text-theme-btn-text text-[8px] px-1 uppercase font-semibold">
                            New
                          </span>
                        </div>
                      );
                    })}

                    {/* Upload button for this color */}
                    <label className="w-16 h-16 flex flex-col items-center justify-center border border-dashed border-theme-border-light dark:border-theme-border-dark cursor-pointer hover:border-theme-primary transition-colors text-theme-text-muted-light dark:text-theme-text-muted-dark hover:text-theme-primary">
                      <FaUpload size={12} className="mb-0.5" />
                      <span className="text-[9px] uppercase font-medium">Add Photo</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => {
                          handleColorFileUpload(cIdx, e.target.files);
                          e.target.value = "";
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. ADDITIONAL VARIANT OPTIONS (e.g. Size, Material, Cord Length) */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h4 className="text-base sm:text-lg font-serif font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark">
            Additional Variant Options (e.g. Size, Material)
          </h4>
          <button
            type="button"
            onClick={addNonColorOption}
            className="flex items-center gap-1 px-3 py-1.5 border border-theme-border-light dark:border-theme-border-dark text-xs uppercase tracking-wider font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark hover:bg-theme-card-light dark:hover:bg-theme-card-dark transition-colors"
          >
            <FaPlus size={10} />
            <span>Add Another Option</span>
          </button>
        </div>

        {nonColorOptions.length > 0 && (
          <div className="space-y-3">
            {nonColorOptions.map((option, index) => (
              <div
                key={index}
                className="p-3 sm:p-4 border border-theme-border-light dark:border-theme-border-dark bg-theme-card-light/30 dark:bg-theme-card-dark/20 space-y-3"
              >
                <div className="flex justify-between items-center">
                  <h5 className="font-semibold text-xs uppercase tracking-wider text-theme-text-primary-light dark:text-theme-text-primary-dark">
                    Option {index + 1}
                  </h5>
                  <button
                    type="button"
                    onClick={() => removeNonColorOption(index)}
                    className="flex items-center gap-1 px-2 py-1 text-red-600 hover:text-white hover:bg-red-600 border border-red-600/40 text-xs transition-colors"
                  >
                    <FaTrash size={10} />
                    <span>Remove</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1">
                      Option Name (e.g. Size, Material) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={option.displayName}
                      onChange={(e) => {
                        const displayName = e.target.value;
                        const updated = [...nonColorOptions];
                        updated[index] = {
                          ...updated[index],
                          displayName,
                          name: generateNameFromDisplay(displayName),
                        };
                        syncAllOptionsAndVariants(colorItems, updated);
                      }}
                      placeholder="e.g. Size, Wood Type"
                      className="w-full px-3 py-1.5 border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark text-xs text-theme-text-primary-light dark:text-theme-text-primary-dark"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1">
                      Values (comma separated) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={valueInputs[index] || ""}
                      onChange={(e) => handleNonColorValueInputChange(index, e.target.value)}
                      placeholder="e.g. Small, Medium, Large"
                      className="w-full px-3 py-1.5 border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark text-xs text-theme-text-primary-light dark:text-theme-text-primary-dark"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. GENERATED VARIANTS COMBINATION MATRIX */}
      {variants.length > 0 && showVariantTable && (
        <div className="space-y-3 pt-3 border-t border-theme-border-light dark:border-theme-border-dark">
          <div className="flex items-center justify-between">
            <h4 className="text-base sm:text-lg font-serif font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark">
              Generated Variant Matrix ({variants.length} combinations)
            </h4>
            <span className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
              Photos & SKUs linked automatically
            </span>
          </div>

          <div className="border border-theme-border-light dark:border-theme-border-dark overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-theme-surface-light dark:bg-theme-surface-dark border-b border-theme-border-light dark:border-theme-border-dark">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold text-theme-text-muted-light dark:text-theme-text-muted-dark">
                    Variant
                  </th>
                  <th className="px-3 py-2 text-left font-semibold text-theme-text-muted-light dark:text-theme-text-muted-dark">
                    Image
                  </th>
                  <th className="px-3 py-2 text-left font-semibold text-theme-text-muted-light dark:text-theme-text-muted-dark">
                    SKU
                  </th>
                  <th className="px-3 py-2 text-left font-semibold text-theme-text-muted-light dark:text-theme-text-muted-dark">
                    Price ({productCurrency})
                  </th>
                  <th className="px-3 py-2 text-left font-semibold text-theme-text-muted-light dark:text-theme-text-muted-dark">
                    Compare Price
                  </th>
                  <th className="px-3 py-2 text-left font-semibold text-theme-text-muted-light dark:text-theme-text-muted-dark">
                    Stock
                  </th>
                  <th className="px-3 py-2 text-left font-semibold text-theme-text-muted-light dark:text-theme-text-muted-dark">
                    Active
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-theme-border-light dark:divide-theme-border-dark">
                {variants.map((variant, index) => (
                  <tr
                    key={index}
                    className="bg-theme-bg-light dark:bg-theme-bg-dark hover:bg-theme-card-light dark:hover:bg-theme-card-dark transition-colors"
                  >
                    {/* Attributes tags */}
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap gap-1">
                        {variant.attributes.map((attr) => (
                          <span
                            key={attr.name}
                            className="inline-flex px-1.5 py-0.5 bg-theme-primary/10 text-theme-primary text-[10px] font-medium border border-theme-primary/20"
                          >
                            {attr.value}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Variant Image Preview */}
                    <td className="px-3 py-2">
                      {variant.imageUrl ? (
                        <img
                          src={variant.imageUrl}
                          alt="Variant"
                          className="w-8 h-8 object-cover border border-theme-border-light dark:border-theme-border-dark"
                        />
                      ) : (
                        <span className="text-[10px] text-theme-text-muted-light">—</span>
                      )}
                    </td>

                    {/* SKU */}
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={variant.sku}
                        onChange={(e) => updateVariant(index, "sku", e.target.value)}
                        className="w-full px-2 py-1 border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark text-xs font-mono"
                      />
                    </td>

                    {/* Price */}
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={variant.price}
                        onChange={(e) => updateVariant(index, "price", parseFloat(e.target.value) || 0)}
                        className="w-20 px-2 py-1 border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark text-xs"
                      />
                    </td>

                    {/* Compare Price */}
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={variant.compareAtPrice || ""}
                        onChange={(e) => updateVariant(index, "compareAtPrice", e.target.value ? parseFloat(e.target.value) : undefined)}
                        placeholder="Optional"
                        className="w-20 px-2 py-1 border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark text-xs"
                      />
                    </td>

                    {/* Stock */}
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        min="0"
                        value={variant.stockQuantity}
                        onChange={(e) => updateVariant(index, "stockQuantity", parseInt(e.target.value) || 0)}
                        className="w-16 px-2 py-1 border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark text-xs"
                      />
                    </td>

                    {/* Availability */}
                    <td className="px-3 py-2">
                      <input
                        type="checkbox"
                        checked={variant.isAvailable}
                        onChange={(e) => updateVariant(index, "isAvailable", e.target.checked)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}