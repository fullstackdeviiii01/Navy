// // app/(admin)/components/products/VariantConfigurationPanel.tsx
"use client";

import { useState, useEffect } from "react";
import { FaPlus, FaSync, FaCog, FaInfoCircle } from "react-icons/fa";
import { variantsApi } from "../../../../../lib/api/variants";
import { ProductVariant, VariantOption, VariantAttribute } from "../../../../../types/product-variants";
import VariantOptionsEditor from "./VariantOptionsEditor";
import VariantGenerator from "./VariantGenerator";
import VariantTable from "./VariantTable";

interface VariantConfigurationPanelProps {
  productId: string;
  hasVariants: boolean;
  onToggleVariants: (enabled: boolean) => void;
}

export default function VariantConfigurationPanel({
  productId,
  hasVariants: initialHasVariants,
  onToggleVariants,
}: VariantConfigurationPanelProps) {
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

  // Smart variant generation - preserves existing variants and adds new ones
  const generateNewVariantCombinations = (
    newOptions: VariantOption[],
    existingVariants: ProductVariant[],
    basePrice: number,
    baseSku: string
  ): ProductVariant[] => {
    // Generate all possible combinations from new options
    const allCombinations = generateAllCombinations(newOptions);
    
    // Separate existing and new combinations
    const preservedVariants: ProductVariant[] = [];
    const newCombinations: ProductVariant[] = [];
    
    allCombinations.forEach((combination) => {
      // Check if this combination already exists
      const existingVariant = existingVariants.find((existing) =>
        arraysEqual(
          existing.attributes.map((a) => `${a.name}:${a.value}`).sort(),
          combination.attributes.map((a) => `${a.name}:${a.value}`).sort()
        )
      );

      if (existingVariant) {
        // Preserve existing variant with all its data
        preservedVariants.push(existingVariant);
      } else {
        // This is a new combination - add it
        newCombinations.push({
          sku: `${baseSku}-V${String(existingVariants.length + newCombinations.length + 1).padStart(3, "0")}`,
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

  const generateAllCombinations = (options: VariantOption[]): ProductVariant[] => {
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

    return combinations.map((attrs, index) => ({
      sku: "",
      attributes: attrs,
      price: 0,
      stockQuantity: 0,
      isAvailable: true,
      position: index,
    }));
  };

  const arraysEqual = (a: string[], b: string[]): boolean => {
    if (a.length !== b.length) return false;
    return a.every((val, index) => val === b[index]);
  };

  const handleToggleVariants = async (enabled: boolean) => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      if (enabled) {
        // Enable variants
        await variantsApi.configureVariants(productId, {
          hasVariants: true,
          variantOptions: [],
          variants: [],
        });
        setHasVariants(true);
        onToggleVariants(true);
        setSuccess("Variants enabled. Click 'Edit Options' to configure.");
        setShowOptionsEditor(true);
        await fetchVariantData();
      } else {
        // Disable variants
        if (confirm("Disabling variants will remove all variant data. Are you sure?")) {
          await variantsApi.configureVariants(productId, {
            hasVariants: false,
          });
          setHasVariants(false);
          onToggleVariants(false);
          setVariantData(null);
          setSuccess("Variants disabled");
        }
      }
    } catch (err: any) {
      setError(err.message || "Failed to toggle variants");
      console.error("Toggle error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfigureOptions = async (options: VariantOption[]) => {
    try {
      setLoading(true);
      setError("");
      
      const existingVariants = variantData?.variants || [];
      
      // Get base price and SKU from first existing variant or defaults
      const basePrice = existingVariants.length > 0 
        ? existingVariants[0].price 
        : 0;
      const baseSku = existingVariants.length > 0 
        ? existingVariants[0].sku.split('-V')[0]
        : 'PROD';
      
      // Smart generation: preserve existing + add new combinations
      const updatedVariants = generateNewVariantCombinations(
        options,
        existingVariants,
        basePrice,
        baseSku
      );
      
      const newVariantsCount = updatedVariants.length - existingVariants.length;
      
      await variantsApi.configureVariants(productId, {
        hasVariants: true,
        variantOptions: options,
        variants: updatedVariants,
      });
      
      await fetchVariantData();
      setShowOptionsEditor(false);
      
      if (newVariantsCount > 0) {
        setSuccess(`Success! Added ${newVariantsCount} new variant(s). ${existingVariants.length} existing variant(s) preserved with their pricing and inventory.`);
      } else if (newVariantsCount < 0) {
        setSuccess(`Updated options. Removed ${Math.abs(newVariantsCount)} variant(s) that no longer match the new options.`);
      } else {
        setSuccess("Variant options updated successfully. No new variants needed.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to configure options");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateVariants = async (
    optionNames: string[],
    basePrice: number,
    baseSku: string
  ) => {
    const confirmRegenerate = confirm(
      "WARNING: This will DELETE all existing variants and regenerate from scratch.\n\n" +
      "All pricing and inventory data will be LOST.\n\n" +
      "To ADD new values without losing data, use 'Edit Options' instead.\n\n" +
      "Are you sure you want to continue?"
    );

    if (!confirmRegenerate) return;

    try {
      setLoading(true);
      setError("");
      await variantsApi.generateVariants(productId, {
        optionNames,
        basePrice,
        baseSku,
      });
      await fetchVariantData();
      setShowGenerator(false);
      setSuccess("All variants regenerated from scratch");
    } catch (err: any) {
      setError(err.message || "Failed to generate variants");
    } finally {
      setLoading(false);
    }
  };

  const handleSyncVariants = async () => {
    try {
      setLoading(true);
      setError("");
      await variantsApi.syncVariants(productId);
      await fetchVariantData();
      setSuccess("Variants synced successfully");
    } catch (err: any) {
      setError(err.message || "Failed to sync variants");
    } finally {
      setLoading(false);
    }
  };

  const handleVariantUpdate = async (variantId: string, updates: any) => {
    try {
      setError("");
      await variantsApi.updateVariant(productId, variantId, updates);
      await fetchVariantData();
      setSuccess("Variant updated successfully");
    } catch (err: any) {
      setError(err.message || "Failed to update variant");
    }
  };

  return (
    <div className="space-y-6 p-6 bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg border border-theme-border-light dark:border-theme-border-dark">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark flex items-center gap-2">
          <FaCog className="text-theme-primary" />
          Product Variants
        </h3>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={hasVariants}
            onChange={(e) => handleToggleVariants(e.target.checked)}
            disabled={loading}
            className="rounded"
          />
          <span className="text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
            Enable Variants
          </span>
        </label>
      </div>

      {/* Info Banner */}
      {hasVariants && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-start gap-3">
            <FaInfoCircle className="text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">
                How Variant Management Works
              </p>
              <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1.5">
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 bg-blue-600 dark:bg-blue-400 rounded-full mt-1.5 flex-shrink-0"></span>
                  <span><strong>Edit Options:</strong> Add/modify variant options (e.g., add "Microfiber" to Fabric). New combinations are automatically created while preserving existing variants and their data.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 bg-blue-600 dark:bg-blue-400 rounded-full mt-1.5 flex-shrink-0"></span>
                  <span><strong>Generate Variants:</strong> DESTRUCTIVE - Deletes everything and recreates all combinations. Only use for major restructuring.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 bg-blue-600 dark:bg-blue-400 rounded-full mt-1.5 flex-shrink-0"></span>
                  <span><strong>Edit Variants:</strong> Click edit icon on any variant to update price, stock, and availability individually.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-sm text-green-800 dark:text-green-200">{success}</p>
        </div>
      )}

      {!hasVariants && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            Enable variants to manage product options like size, color, material, etc.
          </p>
        </div>
      )}

      {hasVariants && variantData && (
        <>
          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-theme-bg-light dark:bg-theme-bg-dark rounded-lg">
              <div className="text-2xl font-bold text-theme-primary">
                {variantData.variants.length}
              </div>
              <div className="text-sm text-theme-text-muted-light dark:text-theme-text-muted-dark">
                Total Variants
              </div>
            </div>
            <div className="p-4 bg-theme-bg-light dark:bg-theme-bg-dark rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {variantData.inventory?.availableVariantCount || 0}
              </div>
              <div className="text-sm text-theme-text-muted-light dark:text-theme-text-muted-dark">
                Available Variants
              </div>
            </div>
            <div className="p-4 bg-theme-bg-light dark:bg-theme-bg-dark rounded-lg">
              <div className="text-2xl font-bold text-theme-primary">
                {variantData.inventory?.totalStock || 0}
              </div>
              <div className="text-sm text-theme-text-muted-light dark:text-theme-text-muted-dark">
                Total Stock
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowOptionsEditor(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium shadow-sm hover:shadow-md transition-all"
            >
              <FaCog size={14} />
              Edit Options (Safe)
            </button>
            <button
              onClick={() => setShowGenerator(true)}
              disabled={!variantData.variantOptions?.length}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium disabled:opacity-50 shadow-sm hover:shadow-md transition-all"
            >
              <FaPlus size={14} />
              Regenerate All (Destructive)
            </button>
            <button
              onClick={handleSyncVariants}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium disabled:opacity-50 shadow-sm hover:shadow-md transition-all"
            >
              <FaSync size={14} />
              Sync Data
            </button>
          </div>

          {/* Variant Options Display */}
          {variantData.variantOptions && variantData.variantOptions.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark text-sm">
                Variant Options:
              </h4>
              <div className="flex flex-wrap gap-2">
                {variantData.variantOptions.map((option) => (
                  <span
                    key={option.name}
                    className="inline-flex px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                  >
                    {option.displayName} ({option.values.length})
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Variant Table */}
          {variantData.variants && variantData.variants.length > 0 && (
            <VariantTable
              variants={variantData.variants}
              onUpdate={handleVariantUpdate}
              productCurrency="USD"
            />
          )}

          {/* Empty State */}
          {(!variantData.variants || variantData.variants.length === 0) && (
            <div className="text-center py-8 border-2 border-dashed border-theme-border-light dark:border-theme-border-dark rounded-lg">
              <p className="text-theme-text-muted-light dark:text-theme-text-muted-dark mb-4">
                No variants created yet
              </p>
              <button
                onClick={() => setShowOptionsEditor(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Configure Options First
              </button>
            </div>
          )}
        </>
      )}

      {/* Modals */}
      <VariantOptionsEditor
        isOpen={showOptionsEditor}
        onClose={() => setShowOptionsEditor(false)}
        onSave={handleConfigureOptions}
        initialOptions={variantData?.variantOptions || []}
        isLoading={loading}
      />

      <VariantGenerator
        isOpen={showGenerator}
        onClose={() => setShowGenerator(false)}
        onGenerate={handleGenerateVariants}
        variantOptions={variantData?.variantOptions || []}
        isLoading={loading}
      />
    </div>
  );
}