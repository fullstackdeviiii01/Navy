"use client";

import { useState, useEffect } from "react";
import { FaPlus, FaTrash, FaInfoCircle, FaEdit } from "react-icons/fa";
import { VariantOption, ProductVariant, VariantAttribute } from "../../../../../types/product-variants";

interface InlineVariantConfigurationProps {
  variantOptions: VariantOption[];
  variants: ProductVariant[];
  onVariantOptionsChange: (options: VariantOption[]) => void;
  onVariantsChange: (variants: ProductVariant[]) => void;
  basePrice: number;
  baseSku: string;
  productCurrency: string;
}

export default function VariantConfiguration({
  variantOptions,
  variants,
  onVariantOptionsChange,
  onVariantsChange,
  basePrice,
  baseSku,
  productCurrency,
}: InlineVariantConfigurationProps) {
  const [valueInputs, setValueInputs] = useState<{ [key: number]: string }>({});
  const [showVariantTable, setShowVariantTable] = useState(false);

  useEffect(() => {
    const inputs: { [key: number]: string } = {};
    variantOptions.forEach((option, index) => {
      inputs[index] = option.values.join(", ");
    });
    setValueInputs(inputs);
  }, []);

  useEffect(() => {
    if (variantOptions.length > 0 && variantOptions.every(opt => opt.values.length > 0)) {
      generateVariants();
    }
  }, [variantOptions, basePrice, baseSku]);

  const generateNameFromDisplay = (displayName: string): string => {
    return displayName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");
  };

  const addOption = () => {
    const newIndex = variantOptions.length;
    const newOptions = [
      ...variantOptions,
      {
        name: "",
        displayName: "",
        values: [],
        position: newIndex,
      },
    ];
    onVariantOptionsChange(newOptions);
    setValueInputs({ ...valueInputs, [newIndex]: "" });
  };

  const updateOption = (
    index: number,
    field: keyof VariantOption,
    value: any
  ) => {
    const updated = [...variantOptions];
    updated[index] = { ...updated[index], [field]: value };
    onVariantOptionsChange(updated);
  };

  const removeOption = (index: number) => {
    const updated = variantOptions.filter((_, i) => i !== index);
    onVariantOptionsChange(updated);
    const newInputs = { ...valueInputs };
    delete newInputs[index];
    setValueInputs(newInputs);
  };

  const handleValueInputChange = (index: number, rawValue: string) => {
    setValueInputs({ ...valueInputs, [index]: rawValue });
    
    const parsedValues = rawValue
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);
    
    updateOption(index, "values", parsedValues);
  };

  const generateVariants = () => {
    if (variantOptions.length === 0 || variantOptions.some(opt => opt.values.length === 0)) {
      onVariantsChange([]);
      return;
    }

    const combinations = generateAllCombinations(variantOptions);
    const newVariants: ProductVariant[] = combinations.map((attrs, index) => {
      const existingVariant = variants.find((v) =>
        arraysEqual(
          v.attributes.map((a) => `${a.name}:${a.value}`).sort(),
          attrs.map((a) => `${a.name}:${a.value}`).sort()
        )
      );

      if (existingVariant) {
        return existingVariant;
      }

      return {
        sku: `${baseSku}-V${String(index + 1).padStart(3, "0")}`,
        attributes: attrs,
        price: basePrice || 0,
        compareAtPrice: undefined,
        stockQuantity: 0,
        isAvailable: true,
        position: index,
      };
    });

    onVariantsChange(newVariants);
    setShowVariantTable(true);
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

  const estimatedVariantCount = variantOptions.reduce((acc, opt) => {
    if (acc === 0) return opt.values.length;
    return acc * opt.values.length;
  }, 0);

  return (
    <div className="space-y-6">
      {/* Variant Options Configuration */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
            Configure Variant Options
          </h4>
          {estimatedVariantCount > 0 && (
            <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
              Will create {estimatedVariantCount} variant{estimatedVariantCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-start gap-3">
            <FaInfoCircle className="text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">
                How to Configure Variants
              </p>
              <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1.5">
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 bg-blue-600 dark:bg-blue-400 rounded-full mt-1.5 flex-shrink-0"></span>
                  <span><strong>Display Name:</strong> What customers see (e.g., "Color", "Size", "Material")</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 bg-blue-600 dark:bg-blue-400 rounded-full mt-1.5 flex-shrink-0"></span>
                  <span><strong>Values:</strong> Separate with commas (e.g., "Small, Medium, Large")</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 bg-blue-600 dark:bg-blue-400 rounded-full mt-1.5 flex-shrink-0"></span>
                  <span><strong>Auto-generation:</strong> Variants are created automatically from all combinations</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Option Configuration Cards */}
        <div className="space-y-4">
          {variantOptions.map((option, index) => (
            <div
              key={index}
              className="p-5 border-2 border-theme-border-light dark:border-theme-border-dark rounded-lg bg-white dark:bg-gray-900/50 space-y-4 hover:border-theme-primary/30 transition-colors"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-theme-primary/10 text-theme-primary rounded-full font-semibold text-sm">
                    {index + 1}
                  </div>
                  <h5 className="font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                    Option {index + 1}
                  </h5>
                </div>
                <button
                  type="button"
                  onClick={() => removeOption(index)}
                  className="flex items-center gap-2 px-3 py-1.5 text-red-600 hover:text-white hover:bg-red-600 border border-red-600 rounded-lg transition-colors text-sm"
                >
                  <FaTrash size={12} />
                  <span>Remove</span>
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-2">
                    Display Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={option.displayName}
                    onChange={(e) => {
                      const displayName = e.target.value;
                      const updated = [...variantOptions];
                      updated[index] = {
                        ...updated[index],
                        displayName,
                        name: generateNameFromDisplay(displayName),
                      };
                      onVariantOptionsChange(updated);
                    }}
                    placeholder="e.g., Color, Size, Material"
                    className="w-full px-4 py-2.5 border border-theme-border-light dark:border-theme-border-dark rounded-lg text-sm bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:ring-2 focus:ring-theme-primary focus:border-transparent transition-all"
                  />
                  {option.displayName && (
                    <div className="mt-2 flex items-center gap-2 text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark">
                      <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                      <span>Internal ID:</span>
                      <code className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded font-mono text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
                        {option.name || "—"}
                      </code>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-2">
                    Values <span className="text-red-500">*</span>
                    <span className="text-xs font-normal text-theme-text-muted-light dark:text-theme-text-muted-dark ml-2">
                      (Separate with commas)
                    </span>
                  </label>
                  <input
                    type="text"
                    value={valueInputs[index] || ""}
                    onChange={(e) => handleValueInputChange(index, e.target.value)}
                    placeholder="e.g., Red, Blue, Green"
                    className="w-full px-4 py-2.5 border border-theme-border-light dark:border-theme-border-dark rounded-lg text-sm bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:ring-2 focus:ring-theme-primary focus:border-transparent transition-all"
                  />
                  {option.values.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {option.values.map((value, vIdx) => (
                        <span
                          key={vIdx}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-theme-primary/10 text-theme-primary rounded-full text-xs font-medium border border-theme-primary/20"
                        >
                          {value}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Add Option Button */}
          <button
            type="button"
            onClick={addOption}
            className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors shadow-sm hover:shadow-md"
          >
            <FaPlus size={14} />
            <span>Add Option</span>
          </button>
        </div>
      </div>

      {/* Variants Preview/Edit Table */}
      {variants.length > 0 && showVariantTable && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
              Generated Variants ({variants.length})
            </h4>
            <button
              type="button"
              onClick={() => setShowVariantTable(!showVariantTable)}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              {showVariantTable ? "Hide" : "Show"} Table
            </button>
          </div>

          <div className="border border-theme-border-light dark:border-theme-border-dark rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-theme-bg-light dark:bg-theme-bg-dark">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-theme-text-muted-light dark:text-theme-text-muted-dark">
                      Variant
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-theme-text-muted-light dark:text-theme-text-muted-dark">
                      SKU
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-theme-text-muted-light dark:text-theme-text-muted-dark">
                      Price ({productCurrency})
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-theme-text-muted-light dark:text-theme-text-muted-dark">
                      Compare Price ({productCurrency})
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-theme-text-muted-light dark:text-theme-text-muted-dark">
                      Stock
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-theme-text-muted-light dark:text-theme-text-muted-dark">
                      Available
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-theme-border-light dark:divide-theme-border-dark">
                  {variants.map((variant, index) => (
                    <tr
                      key={index}
                      className="bg-theme-surface-light dark:bg-theme-surface-dark hover:bg-theme-hover-bg-light dark:hover:bg-theme-hover-bg-dark"
                    >
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {variant.attributes.map((attr) => (
                            <span
                              key={attr.name}
                              className="inline-flex px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded"
                            >
                              {attr.value}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={variant.sku}
                          onChange={(e) => updateVariant(index, "sku", e.target.value)}
                          className="w-full px-2 py-1 border border-theme-border-light dark:border-theme-border-dark rounded text-xs font-mono bg-theme-surface-light dark:bg-theme-surface-dark"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={variant.price}
                          onChange={(e) => updateVariant(index, "price", parseFloat(e.target.value) || 0)}
                          className="w-24 px-2 py-1 border border-theme-border-light dark:border-theme-border-dark rounded text-xs bg-theme-surface-light dark:bg-theme-surface-dark"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={variant.compareAtPrice || ''}
                          onChange={(e) => updateVariant(index, "compareAtPrice", e.target.value ? parseFloat(e.target.value) : undefined)}
                          placeholder="Optional"
                          className="w-24 px-2 py-1 border border-theme-border-light dark:border-theme-border-dark rounded text-xs bg-theme-surface-light dark:bg-theme-surface-dark"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min="0"
                          value={variant.stockQuantity}
                          onChange={(e) => updateVariant(index, "stockQuantity", parseInt(e.target.value) || 0)}
                          className="w-20 px-2 py-1 border border-theme-border-light dark:border-theme-border-dark rounded text-xs bg-theme-surface-light dark:bg-theme-surface-dark"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={variant.isAvailable}
                          onChange={(e) => updateVariant(index, "isAvailable", e.target.checked)}
                          className="rounded"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-sm text-green-800 dark:text-green-200">
              <strong>Note:</strong> All variants will be created when you save the product. You can edit prices, compare prices, and stock quantities in the table above.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}