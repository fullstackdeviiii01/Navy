// app/(admin)/catalog/components/matrix/MatrixGeneratorEngine.tsx
"use client";

import { useState, useMemo } from "react";
import { FaTimes } from "react-icons/fa";
import { VariantOption } from "../../../../../types/product-variants";

interface MatrixGeneratorEngineProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (optionNames: string[], basePrice: number) => void;
  variantOptions?: VariantOption[];
  isLoading?: boolean;
}

export default function MatrixGeneratorEngine({
  isOpen,
  onClose,
  onGenerate,
  variantOptions = [],
  isLoading = false,
}: MatrixGeneratorEngineProps) {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [basePrice, setBasePrice] = useState("");

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
    if (!basePrice) {
      alert("Base price is required");
      return;
    }

    onGenerate(selectedOptions, parseFloat(basePrice));
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-xl max-w-md w-full border border-theme-border-light dark:border-theme-border-dark shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="border-b border-theme-border-light dark:border-theme-border-dark p-4.5 flex justify-between items-center">
          <h3 className="text-base font-serif font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
            Generate Variant Combinations
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-theme-text-muted-light hover:text-theme-text-primary-light rounded"
          >
            <FaTimes className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-2">
              Select Options to Permutate
            </label>
            <div className="space-y-2">
              {variantOptions.map((option) => (
                <label key={option.name} className="flex items-center gap-2 cursor-pointer select-none">
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
                    className="rounded text-blue-600"
                  />
                  <span className="text-xs font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
                    {option.displayName} ({option.values.length} values)
                  </span>
                </label>
              ))}
            </div>
          </div>

          {selectedOptions.length > 0 && (
            <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 rounded-lg">
              <p className="text-xs text-blue-800 dark:text-blue-200">
                This will generate <strong>{estimatedVariantCount}</strong> variant combinations
              </p>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1">
              Base Price (PKR) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={basePrice}
              onChange={(e) => setBasePrice(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-theme-border-light dark:border-theme-border-dark p-4 flex justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg text-xs font-semibold text-theme-text-secondary-light hover:bg-theme-card-light transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isLoading || selectedOptions.length === 0}
            className="px-5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900 rounded-lg text-xs font-semibold disabled:opacity-50 transition-all shadow-xs hover:shadow active:scale-[0.99]"
          >
            {isLoading ? "Generating..." : "Generate Matrix"}
          </button>
        </div>
      </div>
    </div>
  );
}
