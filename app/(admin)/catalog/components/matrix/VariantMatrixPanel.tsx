// app/(admin)/catalog/components/matrix/VariantMatrixPanel.tsx
"use client";

import { useState, useEffect } from "react";
import { FaPlus, FaSync, FaCog, FaInfoCircle } from "react-icons/fa";
import { variantsApi } from "../../../../../lib/api/variants";
import { ProductVariant, VariantOption, VariantAttribute } from "../../../../../types/product-variants";
import AttributeOptionsEditor from "./AttributeOptionsEditor";
import MatrixGeneratorEngine from "./MatrixGeneratorEngine";
import MatrixPermutationTable from "./MatrixPermutationTable";
import MatrixStockMetrics from "./MatrixStockMetrics";

interface VariantMatrixPanelProps {
  productId: string;
  hasVariants: boolean;
  onToggleVariants: (enabled: boolean) => void;
}

export default function VariantMatrixPanel({
  productId,
  hasVariants: initialHasVariants,
  onToggleVariants,
}: VariantMatrixPanelProps) {
  const [loading, setLoading] = useState(false);
  const [hasVariants, setHasVariants] = useState(initialHasVariants);
  const [variantData, setVariantData] = useState<{
    variantOptions: VariantOption[];
    variants: ProductVariant[];
    pricing: any;
    inventory: any;
  } | null>(null);

  const [showOptionsEditor, setShowOptionsEditor] = useState(false);
  const [showGenerator, setShowGenerator] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    setHasVariants(initialHasVariants);
  }, [initialHasVariants]);

  useEffect(() => {
    if (hasVariants && productId) {
      fetchVariantData();
    }
  }, [hasVariants, productId]);

  const fetchVariantData = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await variantsApi.listVariants(productId);
      setVariantData(data.data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch variant data");
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const generateNewVariantCombinations = (
    newOptions: VariantOption[],
    existingVariants: ProductVariant[],
    basePrice: number
  ): ProductVariant[] => {
    const allCombinations = generateAllCombinations(newOptions);
    const preservedVariants: ProductVariant[] = [];
    const newCombinations: ProductVariant[] = [];

    allCombinations.forEach((combination) => {
      const existingVariant = existingVariants.find((existing) =>
        arraysEqual(
          existing.attributes.map((a) => `${a.name}:${a.value}`).sort(),
          combination.attributes.map((a) => `${a.name}:${a.value}`).sort()
        )
      );

      if (existingVariant) {
        preservedVariants.push(existingVariant);
      } else {
        newCombinations.push({
          attributes: combination.attributes,
          price: basePrice,
          stockQuantity: 0,
          isAvailable: true,
          position: existingVariants.length + newCombinations.length,
        });
      }
    });

    return [...preservedVariants, ...newCombinations];
  };

  const generateAllCombinations = (
    options: VariantOption[]
  ): { attributes: VariantAttribute[] }[] => {
    if (options.length === 0) return [];
    const combinations: { attributes: VariantAttribute[] }[] = [];

    const generate = (
      optionIndex: number,
      currentAttributes: VariantAttribute[]
    ) => {
      if (optionIndex === options.length) {
        combinations.push({ attributes: [...currentAttributes] });
        return;
      }

      const currentOption = options[optionIndex];
      currentOption.values.forEach((value) => {
        generate(optionIndex + 1, [
          ...currentAttributes,
          { name: currentOption.name, value },
        ]);
      });
    };

    generate(0, []);
    return combinations;
  };

  const arraysEqual = (a: string[], b: string[]) => {
    if (a.length !== b.length) return false;
    return a.every((val, index) => val === b[index]);
  };

  const handleToggleVariants = async (enabled: boolean) => {
    try {
      setLoading(true);
      setError("");

      await variantsApi.configureVariants(productId, { hasVariants: enabled });
      setHasVariants(enabled);

      if (enabled) {
        await fetchVariantData();
        setSuccess("Variants enabled for product");
      } else {
        setVariantData(null);
        setSuccess("Variants disabled for product");
      }
    } catch (err: any) {
      setError(err.message || "Failed to toggle variants");
    } finally {
      setLoading(false);
    }
  };

  const handleConfigureOptions = async (options: VariantOption[]) => {
    try {
      setLoading(true);
      setError("");

      const currentVariants = variantData?.variants || [];
      const basePrice = currentVariants[0]?.price || 0;

      const updatedVariants = generateNewVariantCombinations(
        options,
        currentVariants,
        basePrice
      );

      await variantsApi.configureVariants(productId, {
        hasVariants: true,
        variantOptions: options,
        variants: updatedVariants,
      });

      await fetchVariantData();
      setShowOptionsEditor(false);
      setSuccess("Options updated and new combinations created");
    } catch (err: any) {
      setError(err.message || "Failed to configure options");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateVariants = async (
    optionNames: string[],
    basePrice: number
  ) => {
    try {
      setLoading(true);
      setError("");

      const response = await variantsApi.generateVariants(productId, {
        optionNames,
        basePrice,
      });

      setVariantData((prev) =>
        prev
          ? {
              ...prev,
              variants: response.data.variants,
              pricing: response.data.pricing,
              inventory: response.data.inventory,
            }
          : null
      );

      setShowGenerator(false);
      setSuccess(
        `Generated ${response.data.variants.length} variant combinations`
      );
    } catch (err: any) {
      setError(err.message || "Failed to generate variants");
    } finally {
      setLoading(false);
    }
  };

  const handleVariantUpdate = async (
    variantId: string,
    updates: Partial<ProductVariant>
  ) => {
    try {
      setError("");
      await variantsApi.updateVariant(productId, variantId, updates);
      await fetchVariantData();
      setSuccess("Variant updated successfully");
    } catch (err: any) {
      setError(err.message || "Failed to update variant");
    }
  };

  const handleSyncVariants = async () => {
    try {
      setLoading(true);
      setError("");
      await variantsApi.syncVariants(productId);
      await fetchVariantData();
      setSuccess("Variant sync completed");
    } catch (err: any) {
      setError(err.message || "Failed to sync variants");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Notifications */}
      {error && (
        <div className="p-3.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-xl text-xs text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3.5 bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-900/60 rounded-xl text-xs text-green-700 dark:text-green-300">
          {success}
        </div>
      )}

      {/* Main Toggle */}
      <div className="p-4 rounded-xl border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark flex items-center justify-between">
        <div>
          <h3 className="text-base font-serif font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
            Variable Product Features
          </h3>
          <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark mt-0.5">
            Allow this luminaire model to feature individual finishes, sizes, and pricing.
          </p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={hasVariants}
            onChange={(e) => handleToggleVariants(e.target.checked)}
            disabled={loading}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>

      {hasVariants && variantData && (
        <>
          {/* Statistics */}
          <MatrixStockMetrics
            totalVariants={variantData.variants.length}
            availableVariants={variantData.inventory?.availableVariantCount || 0}
            totalStock={variantData.inventory?.totalStock || 0}
          />

          {/* Actions */}
          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={() => setShowOptionsEditor(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900 rounded-lg text-xs font-semibold shadow-xs hover:shadow active:scale-[0.99] transition-all"
            >
              <FaCog size={13} />
              <span>Edit Options</span>
            </button>
            <button
              onClick={() => setShowGenerator(true)}
              disabled={!variantData.variantOptions?.length}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold disabled:opacity-50 shadow-xs transition-colors"
            >
              <FaPlus size={13} />
              <span>Regenerate Matrix</span>
            </button>
            <button
              onClick={handleSyncVariants}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-4 py-2 border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-secondary-light hover:text-theme-text-primary-light rounded-lg text-xs font-semibold disabled:opacity-50 shadow-xs transition-colors"
            >
              <FaSync size={13} />
              <span>Sync Status</span>
            </button>
          </div>

          {/* Variant Options Display */}
          {variantData.variantOptions && variantData.variantOptions.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs uppercase font-semibold text-theme-text-secondary-light dark:text-theme-text-secondary-dark tracking-wider">
                Configured Option Attributes:
              </h4>
              <div className="flex flex-wrap gap-2">
                {variantData.variantOptions.map((option) => (
                  <span
                    key={option.name}
                    className="inline-flex px-3 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700 rounded-full text-xs font-medium"
                  >
                    {option.displayName} ({option.values.length} values)
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Variant Table */}
          {variantData.variants && variantData.variants.length > 0 && (
            <MatrixPermutationTable
              variants={variantData.variants}
              variantOptions={variantData.variantOptions}
              onUpdate={handleVariantUpdate}
              productCurrency="PKR"
            />
          )}

          {/* Empty State */}
          {(!variantData.variants || variantData.variants.length === 0) && (
            <div className="text-center py-10 border-2 border-dashed border-theme-border-light dark:border-theme-border-dark rounded-xl p-4 space-y-3">
              <p className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark">
                No variants generated in matrix yet
              </p>
              <button
                onClick={() => setShowOptionsEditor(true)}
                className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900 rounded-lg text-xs font-semibold shadow-xs"
              >
                Configure Options
              </button>
            </div>
          )}
        </>
      )}

      {/* Modals */}
      <AttributeOptionsEditor
        isOpen={showOptionsEditor}
        onClose={() => setShowOptionsEditor(false)}
        onSave={handleConfigureOptions}
        initialOptions={variantData?.variantOptions || []}
        isLoading={loading}
      />

      <MatrixGeneratorEngine
        isOpen={showGenerator}
        onClose={() => setShowGenerator(false)}
        onGenerate={handleGenerateVariants}
        variantOptions={variantData?.variantOptions || []}
        isLoading={loading}
      />
    </div>
  );
}
