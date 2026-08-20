// app/(admin)/components/products/VariantGenerator.tsx
"use client";

import { useState, useMemo } from "react";
import { FaTimes } from "react-icons/fa";
import { VariantOption } from "../../../../../types/product-variants";

interface VariantGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (optionNames: string[], basePrice: number, baseSku: string) => void;
  variantOptions?: VariantOption[];
  isLoading?: boolean;
}

export default function VariantGenerator({
  isOpen,
  onClose,
  onGenerate,
  variantOptions = [],
  isLoading = false,
}: VariantGeneratorProps) {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [basePrice, setBasePrice] = useState("");
  const [baseSku, setBaseSku] = useState("");

  const estimatedVariantCount = useMemo(() => {
    const selected = variantOptions.filter((opt) =>
      selectedOptions.includes(opt.name)
    );
    return selected.reduce((acc, opt) => acc * opt.values.length, 1);
  }, [selectedOptions, variantOptions]);

  if (!isOpen) return null;

  const handleGenerate = () => {
    if (selectedOptions.length === 0) {
      alert("Select at least one option");
      return;
    }
    if (!basePrice || !baseSku) {
      alert("Base price and SKU are required");
      return;
    }

    onGenerate(selectedOptions, parseFloat(basePrice), baseSku);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg max-w-md w-full">
        {/* Header */}
        <div className="border-b border-theme-border-light dark:border-theme-border-dark p-4 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
            Generate Variants
          </h3>
          <button
            onClick={onClose}
            className="text-theme-text-muted-light hover:text-theme-text-primary-light"
          >
            <FaTimes />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-2">
              Select Options to Generate
            </label>
            <div className="space-y-2">
              {variantOptions.map((option) => (
                <label key={option.name} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedOptions.includes(option.name)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedOptions([...selectedOptions, option.name]);
                      } else {
                        setSelectedOptions(
                          selectedOptions.filter((n) => n !== option.name)
                        );
                      }
                    }}
                    className="rounded"
                  />
                  <span className="text-sm text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
                    {option.displayName} ({option.values.length} values)
                  </span>
                </label>
              ))}
            </div>
          </div>

          {selectedOptions.length > 0 && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                This will generate <strong>{estimatedVariantCount}</strong> variants
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-2">
              Base Price
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={basePrice}
              onChange={(e) => setBasePrice(e.target.value)}
              className="w-full px-3 py-2 border border-theme-border-light dark:border-theme-border-dark rounded bg-theme-surface-light dark:bg-theme-surface-dark"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-2">
              Base SKU
            </label>
            <input
              type="text"
              value={baseSku}
              onChange={(e) => setBaseSku(e.target.value)}
              placeholder="PROD-001"
              className="w-full px-3 py-2 border border-theme-border-light dark:border-theme-border-dark rounded bg-theme-surface-light dark:bg-theme-surface-dark"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-theme-border-light dark:border-theme-border-dark p-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg text-theme-text-secondary-light dark:text-theme-text-secondary-dark hover:bg-theme-hover-bg-light dark:hover:bg-theme-hover-bg-dark"
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            disabled={isLoading || selectedOptions.length === 0}
            className="px-6 py-2 bg-theme-primary text-white rounded-lg hover:bg-theme-primary-hover disabled:opacity-50"
          >
            {isLoading ? "Generating..." : "Generate"}
          </button>
        </div>
      </div>
    </div>
  );
}

