// app/(admin)/catalog/components/matrix/FinishMatrixStudio.tsx
"use client";

import { useState, useEffect } from "react";
import { FaPlus, FaTrash, FaUpload, FaPalette, FaImage, FaVideo, FaPlay } from "react-icons/fa";
import { VariantOption, ProductVariant, VariantAttribute } from "../../../../../types/product-variants";

export interface ColorItem {
  id: string;
  name: string;
  hex: string;
  existingImages: string[];
  newFiles: File[];
  existingVideos: string[];
  newVideoFiles: File[];
}

interface FinishMatrixStudioProps {
  variantOptions: VariantOption[];
  variants: ProductVariant[];
  onVariantOptionsChange: (options: VariantOption[]) => void;
  onVariantsChange: (variants: ProductVariant[]) => void;
  basePrice: number;
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

const MAX_VIDEO_SIZE = 50 * 1024 * 1024;
const MAX_VIDEO_DURATION = 30;
const ALLOWED_VIDEO_FORMATS = ["video/mp4", "video/webm", "video/quicktime"];

function ColorVideoPreview({ file, onRemove }: { file: File; onRemove: () => void }) {
  const [url, setUrl] = useState<string>("");

  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  if (!url) return null;

  return (
    <div className="relative group w-16 h-16 rounded-lg border border-purple-500/80 overflow-hidden bg-black/10">
      <video
        src={url}
        className="w-full h-full object-cover"
        muted
        loop
        onMouseEnter={(e) => e.currentTarget.play()}
        onMouseLeave={(e) => {
          e.currentTarget.pause();
          e.currentTarget.currentTime = 0;
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none group-hover:opacity-0 transition-opacity">
        <FaPlay className="text-white text-xs" />
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
        title="Remove video"
      >
        <FaTrash size={8} />
      </button>
      <span className="absolute bottom-0 left-0 right-0 bg-purple-600 text-white text-[7px] uppercase text-center font-bold">
        New Vid
      </span>
    </div>
  );
}

export default function FinishMatrixStudio({
  variantOptions,
  variants,
  onVariantOptionsChange,
  onVariantsChange,
  basePrice,
  productCurrency,
  colorItems: externalColorItems,
  onColorItemsChange,
}: FinishMatrixStudioProps) {
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
  const [videoError, setVideoError] = useState<string | null>(null);

  // Initialize colorItems and other variant options on mount or prop change
  useEffect(() => {
    const colorOpt = variantOptions.find(
      (opt) =>
        opt.name.toLowerCase() === "color" ||
        opt.displayName?.toLowerCase() === "color"
    );

    if (colorOpt && colorItems.length === 0) {
      let rawHex: any = colorOpt.colorHexCodes || {};
      if (rawHex instanceof Map) rawHex = Object.fromEntries(rawHex);
      let rawImgs: any = colorOpt.colorImages || {};
      if (rawImgs instanceof Map) rawImgs = Object.fromEntries(rawImgs);
      let rawVids: any = colorOpt.colorVideos || {};
      if (rawVids instanceof Map) rawVids = Object.fromEntries(rawVids);

      const initialColors: ColorItem[] = colorOpt.values.map((val, idx) => {
        let hexVal = rawHex?.[val];
        if (!hexVal) {
          const matchKey = Object.keys(rawHex).find((k) => k.toLowerCase() === val.toLowerCase());
          if (matchKey) hexVal = rawHex[matchKey];
        }
        if (!hexVal) {
          hexVal =
            LUXURY_PALETTE_PRESETS.find((p) => p.name.toLowerCase() === val.toLowerCase())?.hex ||
            "#5D4037";
        }

        let existing = rawImgs?.[val];
        if (!existing || existing.length === 0) {
          const matchKey = Object.keys(rawImgs).find((k) => k.toLowerCase() === val.toLowerCase());
          if (matchKey) existing = rawImgs[matchKey];
        }

        if ((!existing || existing.length === 0) && variants.length > 0) {
          const matchedVar = variants.find((v) =>
            v.attributes?.some(
              (a) =>
                a.name.toLowerCase() === "color" &&
                a.value.toLowerCase() === val.toLowerCase()
            )
          );
          if (matchedVar?.imageUrl) {
            existing = [matchedVar.imageUrl];
          }
        }

        let existingVids = rawVids?.[val];
        if (!existingVids || existingVids.length === 0) {
          const matchKey = Object.keys(rawVids).find((k) => k.toLowerCase() === val.toLowerCase());
          if (matchKey) existingVids = rawVids[matchKey];
        }

        return {
          id: `color-${idx}-${Date.now()}`,
          name: val,
          hex: hexVal,
          existingImages: Array.isArray(existing) ? existing : typeof existing === "string" ? [existing] : [],
          newFiles: [],
          existingVideos: Array.isArray(existingVids) ? existingVids : typeof existingVids === "string" ? [existingVids] : [],
          newVideoFiles: [],
        };
      });

      if (initialColors.length > 0) {
        setColorItems(initialColors);
      }
    }

    const nonColorOptions = variantOptions.filter(
      (opt) =>
        opt.name.toLowerCase() !== "color" &&
        opt.displayName?.toLowerCase() !== "color"
    );
    const inputs: { [key: number]: string } = {};
    nonColorOptions.forEach((option, index) => {
      inputs[index] = option.values.join(", ");
    });
    setValueInputs(inputs);
  }, []);

  const nonColorOptions = variantOptions.filter(
    (opt) =>
      opt.name.toLowerCase() !== "color" &&
      opt.displayName?.toLowerCase() !== "color"
  );

  const syncAllOptionsAndVariants = (
    updatedColors: ColorItem[],
    updatedNonColorOptions: VariantOption[]
  ) => {
    const fullOptions: VariantOption[] = [];

    const validColors = updatedColors.filter((c) => c.name.trim().length > 0);
    if (validColors.length > 0) {
      const colorHexCodes: Record<string, string> = {};
      const colorImages: Record<string, string[]> = {};
      const colorVideos: Record<string, string[]> = {};

      validColors.forEach((c) => {
        colorHexCodes[c.name.trim()] = c.hex;
        colorImages[c.name.trim()] = c.existingImages;
        colorVideos[c.name.trim()] = c.existingVideos || [];
      });

      fullOptions.push({
        name: "color",
        displayName: "Color",
        values: validColors.map((c) => c.name.trim()),
        colorHexCodes,
        colorImages,
        colorVideos,
        position: 0,
      });
    }

    updatedNonColorOptions.forEach((opt) => {
      fullOptions.push({
        ...opt,
        position: fullOptions.length,
      });
    });

    onVariantOptionsChange(fullOptions);

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

      const colorAttr = attrs.find(
        (a) =>
          a.name.toLowerCase() === "color" ||
          validColors.some((c) => c.name.trim().toLowerCase() === a.value.toLowerCase())
      );
      const matchedColor = colorAttr ? validColors.find((c) => c.name.trim().toLowerCase() === colorAttr.value.toLowerCase()) : null;
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
          imageUrl: matchedImageUrl !== undefined ? matchedImageUrl : existingVariant.imageUrl,
        };
      }

      return {
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

  const addColorItem = () => {
    const newColor: ColorItem = {
      id: `color-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      name: "",
      hex: "#5D4037",
      existingImages: [],
      newFiles: [],
      existingVideos: [],
      newVideoFiles: [],
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

  const validateColorVideo = async (file: File): Promise<string | null> => {
    if (!ALLOWED_VIDEO_FORMATS.includes(file.type)) {
      return `${file.name}: Invalid format. Only MP4, WebM, and MOV are allowed.`;
    }
    if (file.size > MAX_VIDEO_SIZE) {
      return `${file.name}: File too large. Maximum size is 50MB.`;
    }
    return new Promise((resolve) => {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        if (video.duration > MAX_VIDEO_DURATION) {
          resolve(`${file.name}: Video too long. Maximum duration is ${MAX_VIDEO_DURATION} seconds.`);
        } else {
          resolve(null);
        }
      };
      video.onerror = () => resolve(`${file.name}: Failed to load video metadata.`);
      video.src = URL.createObjectURL(file);
    });
  };

  const handleColorVideoUpload = async (index: number, files: FileList | null) => {
    if (!files) return;
    const fileArray = Array.from(files);
    const validVideos: File[] = [];
    for (const file of fileArray) {
      const error = await validateColorVideo(file);
      if (error) {
        setVideoError(error);
        setTimeout(() => setVideoError(null), 6000);
      } else {
        validVideos.push(file);
      }
    }
    if (validVideos.length > 0) {
      const updated = [...colorItems];
      updated[index] = {
        ...updated[index],
        newVideoFiles: [...(updated[index].newVideoFiles || []), ...validVideos],
      };
      setColorItems(updated);
      syncAllOptionsAndVariants(updated, nonColorOptions);
    }
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

  const removeColorExistingVideo = (colorIndex: number, videoIndex: number) => {
    const updated = [...colorItems];
    const newExisting = (updated[colorIndex].existingVideos || []).filter((_, i) => i !== videoIndex);
    updated[colorIndex] = { ...updated[colorIndex], existingVideos: newExisting };
    setColorItems(updated);
    syncAllOptionsAndVariants(updated, nonColorOptions);
  };

  const removeColorNewVideo = (colorIndex: number, fileIndex: number) => {
    const updated = [...colorItems];
    const newVideoFiles = (updated[colorIndex].newVideoFiles || []).filter((_, i) => i !== fileIndex);
    updated[colorIndex] = { ...updated[colorIndex], newVideoFiles };
    setColorItems(updated);
    syncAllOptionsAndVariants(updated, nonColorOptions);
  };

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

  const handleAutoFillSkus = () => {
    const updated = variants.map((v, i) => {
      if (v.sku && v.sku.trim()) return v;
      const attrSuffix = v.attributes
        .map((a) => {
          const val = a.value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
          return val.length > 4 ? val.substring(0, 4) : val;
        })
        .join("-");
      const generated = `SKU-${String(i + 1).padStart(2, "0")}${attrSuffix ? `-${attrSuffix}` : ""}`;
      return { ...v, sku: generated };
    });
    onVariantsChange(updated);
  };

  return (
    <div className="space-y-6">
      {/* 1. DEDICATED COLOR SECTION */}
      <div className="p-4 sm:p-5 rounded-xl border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-theme-border-light/80 dark:border-theme-border-dark/80 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-theme-hover-light/10 text-theme-hover-light">
              <FaPalette className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm sm:text-base font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                Color Variants & Photos (Optional)
              </h4>
              <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
                Enter color names and upload photos dedicated to each color.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={addColorItem}
            className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900 text-xs font-semibold rounded-lg shadow-xs hover:shadow active:scale-[0.99] transition-all"
          >
            <FaPlus size={10} />
            <span>Add Color</span>
          </button>
        </div>

        {videoError && (
          <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-700 dark:text-red-300">
            {videoError}
          </div>
        )}

        {colorItems.length === 0 ? (
          <div className="py-8 text-center border-2 border-dashed border-theme-border-light dark:border-theme-border-dark rounded-xl p-4 space-y-2">
            <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
              No color variants configured for this product.
            </p>
            <button
              type="button"
              onClick={addColorItem}
              className="inline-flex items-center gap-1.5 px-4 py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg text-xs font-semibold hover:border-theme-hover-light transition-colors"
            >
              <FaPlus size={10} />
              <span>Create Initial Color</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3.5">
            {colorItems.map((color, cIdx) => (
              <div
                key={color.id || cIdx}
                className="p-3.5 sm:p-4 rounded-xl border border-theme-border-light dark:border-theme-border-dark bg-theme-bg-light/50 dark:bg-theme-bg-dark/40 space-y-3"
              >
                <div className="flex items-center justify-between gap-3">
                  {/* Color Name Input */}
                  <div className="flex-1">
                    <label className="block text-[11px] uppercase tracking-wider font-semibold text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1">
                      Color Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={color.name}
                      onChange={(e) => updateColorItem(cIdx, { name: e.target.value })}
                      placeholder="e.g. Walnut, Oak, Matte Black, Natural"
                      className="w-full px-3 py-1.5 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark text-xs text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                    />
                  </div>

                  {/* Remove Color Button */}
                  <div className="self-end pb-0.5">
                    <button
                      type="button"
                      onClick={() => removeColorItem(cIdx)}
                      className="px-3 py-1.5 text-red-600 hover:text-white hover:bg-red-600 rounded-lg border border-red-200 dark:border-red-900/60 transition-colors text-xs inline-flex items-center gap-1.5"
                      title="Remove Color"
                    >
                      <FaTrash size={11} />
                      <span className="text-[11px] font-semibold">Delete</span>
                    </button>
                  </div>
                </div>

                {/* Color-Specific Media (Photos & Videos) Uploader */}
                <div className="pt-2.5 border-t border-theme-border-light/60 dark:border-theme-border-dark/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] uppercase tracking-wider font-semibold text-theme-text-secondary-light dark:text-theme-text-secondary-dark flex items-center gap-1.5">
                      <span className="flex items-center gap-1 text-theme-hover-light dark:text-theme-hover-dark">
                        <FaImage size={11} />
                      </span>
                      <span>Photos for {color.name || "this color"}</span>
                    </label>

                    <span className="text-[10px] text-theme-text-muted-light">
                      {color.existingImages.length + color.newFiles.length} Photos
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    {/* Existing Images */}
                    {color.existingImages.map((imgUrl, imgIdx) => (
                      <div key={`exist-img-${imgIdx}`} className="relative group w-16 h-16 rounded-lg border border-theme-border-light dark:border-theme-border-dark overflow-hidden bg-black/5">
                        <img src={imgUrl} alt={`${color.name} preview`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeColorExistingImage(cIdx, imgIdx)}
                          className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Remove photo"
                        >
                          <FaTrash size={8} />
                        </button>
                      </div>
                    ))}

                    {/* New Upload Images */}
                    {color.newFiles.map((file, fileIdx) => {
                      const objUrl = URL.createObjectURL(file);
                      return (
                        <div key={`new-file-${fileIdx}`} className="relative group w-16 h-16 rounded-lg border border-theme-hover-light overflow-hidden bg-black/5">
                          <img src={objUrl} alt={file.name} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeColorNewFile(cIdx, fileIdx)}
                            className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Remove photo"
                          >
                            <FaTrash size={8} />
                          </button>
                          <span className="absolute bottom-0 left-0 right-0 bg-blue-600 text-white text-[8px] uppercase text-center font-bold">
                            New Photo
                          </span>
                        </div>
                      );
                    })}

                    {/* Existing Videos */}
                    {(color.existingVideos || []).map((videoUrl, videoIdx) => (
                      <div key={`exist-video-${videoIdx}`} className="relative group w-16 h-16 rounded-lg border border-purple-500/80 overflow-hidden bg-black/10">
                        <video
                          src={videoUrl}
                          className="w-full h-full object-cover"
                          muted
                          loop
                          onMouseEnter={(e) => e.currentTarget.play()}
                          onMouseLeave={(e) => {
                            e.currentTarget.pause();
                            e.currentTarget.currentTime = 0;
                          }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none group-hover:opacity-0 transition-opacity">
                          <FaPlay className="text-white text-xs" />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeColorExistingVideo(cIdx, videoIdx)}
                          className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Remove video"
                        >
                          <FaTrash size={8} />
                        </button>
                        <span className="absolute top-0.5 left-0.5 bg-purple-600 text-white text-[7px] uppercase font-bold px-1 rounded">
                          Video
                        </span>
                      </div>
                    ))}

                    {/* New Upload Videos */}
                    {(color.newVideoFiles || []).map((file, fileIdx) => (
                      <ColorVideoPreview
                        key={`new-video-${fileIdx}-${file.name}`}
                        file={file}
                        onRemove={() => removeColorNewVideo(cIdx, fileIdx)}
                      />
                    ))}

                    {/* Add Photo Button */}
                    <label className="w-16 h-16 rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-theme-border-light dark:border-theme-border-dark cursor-pointer hover:border-theme-hover-light transition-colors text-theme-text-muted-light hover:text-theme-hover-light group">
                      <FaUpload size={11} className="mb-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      <span className="text-[9px] uppercase font-semibold">Photo</span>
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

                    {/* Add Video Button */}
                    <label className="w-16 h-16 rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-purple-300 dark:border-purple-800 cursor-pointer hover:border-purple-500 transition-colors text-purple-600 dark:text-purple-400 hover:text-purple-700 group bg-purple-50/20 dark:bg-purple-950/20">
                      <FaVideo size={11} className="mb-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      <span className="text-[9px] uppercase font-semibold">Video</span>
                      <input
                        type="file"
                        multiple
                        accept="video/mp4,video/webm,video/quicktime"
                        onChange={(e) => {
                          handleColorVideoUpload(cIdx, e.target.files);
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
          <h4 className="text-sm sm:text-base font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
            Additional Specifications (e.g. Size, Dimension, Drop Length)
          </h4>
          <button
            type="button"
            onClick={addNonColorOption}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-theme-border-light dark:border-theme-border-dark rounded-lg text-xs font-semibold hover:border-theme-hover-light transition-colors"
          >
            <FaPlus size={10} />
            <span>Add Option</span>
          </button>
        </div>

        {nonColorOptions.length > 0 && (
          <div className="space-y-3">
            {nonColorOptions.map((option, index) => (
              <div
                key={index}
                className="p-3 sm:p-4 rounded-xl border border-theme-border-light dark:border-theme-border-dark bg-theme-card-light/40 dark:bg-theme-card-dark/30 space-y-3"
              >
                <div className="flex justify-between items-center">
                  <h5 className="font-semibold text-xs uppercase tracking-wider text-theme-text-primary-light dark:text-theme-text-primary-dark">
                    Specification Option {index + 1}
                  </h5>
                  <button
                    type="button"
                    onClick={() => removeNonColorOption(index)}
                    className="flex items-center gap-1 px-2 py-1 text-red-600 hover:text-white hover:bg-red-600 rounded text-xs transition-colors"
                  >
                    <FaTrash size={10} />
                    <span>Remove</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-semibold text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1">
                      Option Name <span className="text-red-500">*</span>
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
                      placeholder="e.g. Size, Drop Height"
                      className="w-full px-3 py-1.5 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark text-xs text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-semibold text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1">
                      Option Values (Comma separated) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={valueInputs[index] || ""}
                      onChange={(e) => handleNonColorValueInputChange(index, e.target.value)}
                      placeholder="e.g. Small, Medium, Large"
                      className="w-full px-3 py-1.5 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark text-xs text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-blue-500/40"
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
            <h4 className="text-sm sm:text-base font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
              Generated Variant Permutations ({variants.length} combinations)
            </h4>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleAutoFillSkus}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline cursor-pointer"
                title="Automatically generate distinct SKUs for all variants"
              >
                Auto-fill Variant SKUs
              </button>
              <span className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark hidden sm:inline">
                Photos & Finishes linked automatically
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-theme-border-light dark:border-theme-border-light dark:border-theme-border-dark overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-theme-card-light/60 dark:bg-theme-card-dark/40 border-b border-theme-border-light dark:border-theme-border-dark text-[11px] uppercase tracking-wider text-theme-text-secondary-light dark:text-theme-text-secondary-dark font-semibold">
                  <tr>
                    <th className="px-3 py-2.5">Variant</th>
                    <th className="px-3 py-2.5">Photo</th>
                    <th className="px-3 py-2.5">Variant SKU</th>
                    <th className="px-3 py-2.5">Price ({productCurrency})</th>
                    <th className="px-3 py-2.5">Compare Price</th>
                    <th className="px-3 py-2.5">Stock</th>
                    <th className="px-3 py-2.5">Active</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-theme-border-light/60 dark:divide-theme-border-dark/60">
                  {variants.map((variant, index) => (
                    <tr
                      key={index}
                      className="hover:bg-theme-card-light/40 dark:hover:bg-theme-card-dark/30 transition-colors"
                    >
                      <td className="px-3 py-2">
                        <div className="flex flex-wrap gap-1">
                          {variant.attributes.map((attr) => (
                            <span
                              key={attr.name}
                              className="inline-flex px-1.5 py-0.5 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-[10px] font-medium rounded border border-blue-200 dark:border-blue-900/60"
                            >
                              {attr.value}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="px-3 py-2">
                        {variant.imageUrl ? (
                          <img
                            src={variant.imageUrl}
                            alt="Variant"
                            className="w-8 h-8 rounded object-cover border border-theme-border-light dark:border-theme-border-dark"
                          />
                        ) : (
                          <span className="text-[10px] text-theme-text-muted-light">—</span>
                        )}
                      </td>

                      <td className="px-3 py-2">
                        <input
                          type="text"
                          placeholder="e.g. TL-001"
                          value={variant.sku || ""}
                          onChange={(e) => updateVariant(index, "sku", e.target.value.toUpperCase())}
                          className="w-24 sm:w-28 px-2 py-1 border border-theme-border-light dark:border-theme-border-dark rounded bg-theme-surface-light dark:bg-theme-surface-dark text-xs font-mono uppercase focus:ring-1 focus:ring-blue-500"
                        />
                      </td>

                      <td className="px-3 py-2">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={variant.price}
                          onChange={(e) => updateVariant(index, "price", parseFloat(e.target.value) || 0)}
                          className="w-20 px-2 py-1 border border-theme-border-light dark:border-theme-border-dark rounded bg-theme-surface-light dark:bg-theme-surface-dark text-xs"
                        />
                      </td>

                      <td className="px-3 py-2">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={variant.compareAtPrice || ""}
                          onChange={(e) => updateVariant(index, "compareAtPrice", e.target.value ? parseFloat(e.target.value) : undefined)}
                          placeholder="Optional"
                          className="w-20 px-2 py-1 border border-theme-border-light dark:border-theme-border-dark rounded bg-theme-surface-light dark:bg-theme-surface-dark text-xs"
                        />
                      </td>

                      <td className="px-3 py-2">
                        <input
                          type="number"
                          min="0"
                          value={variant.stockQuantity}
                          onChange={(e) => updateVariant(index, "stockQuantity", Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-16 px-2 py-1 border border-theme-border-light dark:border-theme-border-dark rounded bg-theme-surface-light dark:bg-theme-surface-dark text-xs"
                        />
                      </td>

                      <td className="px-3 py-2">
                        <input
                          type="checkbox"
                          checked={variant.isAvailable}
                          onChange={(e) => updateVariant(index, "isAvailable", e.target.checked)}
                          className="rounded text-blue-600"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
