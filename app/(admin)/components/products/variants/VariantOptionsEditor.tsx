// // app/(admin)/components/products/VariantOptionsEditor.tsx
"use client";

import { useState, useEffect } from "react";
import { FaTimes, FaPlus, FaTrash, FaInfoCircle } from "react-icons/fa";
import { VariantOption } from "../../../../../types/product-variants";

interface VariantOptionsEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (options: VariantOption[]) => void;
  initialOptions?: VariantOption[];
  isLoading?: boolean;
}

export default function VariantOptionsEditor({
  isOpen,
  onClose,
  onSave,
  initialOptions = [],
  isLoading = false,
}: VariantOptionsEditorProps) {
  const [options, setOptions] = useState<VariantOption[]>(initialOptions);
  // Add separate state for raw input text
  const [valueInputs, setValueInputs] = useState<{ [key: number]: string }>({});

  useEffect(() => {
    if (isOpen) {
      setOptions(initialOptions);
      // Initialize value inputs from existing options
      const inputs: { [key: number]: string } = {};
      initialOptions.forEach((option, index) => {
        inputs[index] = option.values.join(", ");
      });
      setValueInputs(inputs);
    }
  }, [isOpen, initialOptions]);

  const generateNameFromDisplay = (displayName: string): string => {
    return displayName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");
  };

  const addOption = () => {
    const newIndex = options.length;
    setOptions([
      ...options,
      {
        name: "",
        displayName: "",
        values: [],
        position: newIndex,
      },
    ]);
    setValueInputs({ ...valueInputs, [newIndex]: "" });
  };

  const updateOption = (
    index: number,
    field: keyof VariantOption,
    value: any
  ) => {
    const updated = [...options];
    updated[index] = { ...updated[index], [field]: value };
    setOptions(updated);
  };

  const removeOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
    const newInputs = { ...valueInputs };
    delete newInputs[index];
    setValueInputs(newInputs);
  };

  const handleValueInputChange = (index: number, rawValue: string) => {
    // Update the raw input text immediately
    setValueInputs({ ...valueInputs, [index]: rawValue });
    
    // Parse values only for internal storage
    const parsedValues = rawValue
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);
    
    updateOption(index, "values", parsedValues);
  };

  const handleSave = () => {
    if (
      options.some(
        (o) => !o.name || !o.displayName || o.values.length === 0
      )
    ) {
      alert("All options must have a display name and at least one value");
      return;
    }

    onSave(options);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-theme-surface-light dark:bg-theme-surface-dark border-b border-theme-border-light dark:border-theme-border-dark p-6 z-10">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                Configure Variant Options
              </h3>
              <p className="text-sm text-theme-text-muted-light dark:text-theme-text-muted-dark mt-1">
                Define the characteristics that make your products unique
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-theme-hover-bg-light dark:hover:bg-theme-hover-bg-dark rounded-lg transition-colors"
            >
              <FaTimes className="text-theme-text-muted-light dark:text-theme-text-muted-dark" />
            </button>
          </div>
        </div>

        {/* Helper Guide */}
        <div className="p-6 pb-4 space-y-3">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-start gap-3">
              <FaInfoCircle className="text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">
                  Quick Guide to Variant Options
                </p>
                <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1.5">
                  <li className="flex items-start gap-2">
                    <span className="inline-block w-1.5 h-1.5 bg-blue-600 dark:bg-blue-400 rounded-full mt-1.5 flex-shrink-0"></span>
                    <span><strong>Display Name:</strong> Customer-facing label (e.g., "Coloring", "Finish", "Pack", "Bulb", "Size")</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="inline-block w-1.5 h-1.5 bg-blue-600 dark:bg-blue-400 rounded-full mt-1.5 flex-shrink-0"></span>
                    <span><strong>Hex Color Codes:</strong> Enter Hex Codes in values for automatic color drops (e.g., "Walnut #5C4033, Oak #C19A6B, Black #1A1A1A")</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="inline-block w-1.5 h-1.5 bg-blue-600 dark:bg-blue-400 rounded-full mt-1.5 flex-shrink-0"></span>
                    <span><strong>Custom Options:</strong> Type any custom option name or size (e.g. "Size", "Height", "Wattage") freely</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs font-semibold text-theme-text-muted-light dark:text-theme-text-muted-dark">Quick Presets:</span>
            <button
              type="button"
              onClick={() => {
                const idx = options.length;
                setOptions([...options, { name: "finish", displayName: "Finish", values: ["Shine Finish", "Matt Finish"], position: idx }]);
                setValueInputs({ ...valueInputs, [idx]: "Shine Finish, Matt Finish" });
              }}
              className="px-2.5 py-1 text-xs bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200 rounded-full hover:bg-amber-200 font-medium transition-colors"
            >
              + Finish (Shine / Matt)
            </button>
            <button
              type="button"
              onClick={() => {
                const idx = options.length;
                setOptions([...options, { name: "pack", displayName: "Pack", values: ["Single", "Pair"], position: idx }]);
                setValueInputs({ ...valueInputs, [idx]: "Single, Pair" });
              }}
              className="px-2.5 py-1 text-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200 rounded-full hover:bg-emerald-200 font-medium transition-colors"
            >
              + Pack (Single / Pair)
            </button>
            <button
              type="button"
              onClick={() => {
                const idx = options.length;
                setOptions([...options, { name: "bulb", displayName: "Bulb Inclusion", values: ["With Bulb", "Without Bulb"], position: idx }]);
                setValueInputs({ ...valueInputs, [idx]: "With Bulb, Without Bulb" });
              }}
              className="px-2.5 py-1 text-xs bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-200 rounded-full hover:bg-indigo-200 font-medium transition-colors"
            >
              + Bulb (With / Without)
            </button>
            <button
              type="button"
              onClick={() => {
                const idx = options.length;
                setOptions([...options, { name: "coloring", displayName: "Coloring", values: ["Walnut #5C4033", "Oak #C19A6B", "Natural #E3C598", "Black #1A1A1A"], position: idx }]);
                setValueInputs({ ...valueInputs, [idx]: "Walnut #5C4033, Oak #C19A6B, Natural #E3C598, Black #1A1A1A" });
              }}
              className="px-2.5 py-1 text-xs bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-200 rounded-full hover:bg-purple-200 font-medium transition-colors"
            >
              + Wood Coloring (Hex Drops)
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-6 space-y-4">
          {options.map((option, index) => (
            <div
              key={index}
              className="p-5 border-2 border-theme-border-light dark:border-theme-border-dark rounded-lg bg-white dark:bg-gray-900/50 space-y-4 hover:border-theme-primary/30 transition-colors"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-theme-primary/10 text-theme-primary rounded-full font-semibold text-sm">
                    {index + 1}
                  </div>
                  <h4 className="font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                    Option {index + 1}
                  </h4>
                </div>
                <button
                  onClick={() => removeOption(index)}
                  className="flex items-center gap-2 px-3 py-1.5 text-red-600 hover:text-white hover:bg-red-600 border border-red-600 rounded-lg transition-colors text-sm"
                  title="Remove option"
                >
                  <FaTrash size={12} />
                  <span>Remove</span>
                </button>
              </div>

              {/* Display Name Field */}
              <div>
                <label className="block text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-2">
                  Display Name <span className="text-red-500">*</span>
                  <span className="text-xs font-normal text-theme-text-muted-light dark:text-theme-text-muted-dark ml-2">
                    (What customers will see)
                  </span>
                </label>
                <input
                  type="text"
                  value={option.displayName}
                  onChange={(e) => {
                    const displayName = e.target.value;
                    const updated = [...options];
                    updated[index] = {
                      ...updated[index],
                      displayName,
                      name: generateNameFromDisplay(displayName),
                    };
                    setOptions(updated);
                  }}
                  placeholder="e.g., Color, Size, Material"
                  className="w-full px-4 py-2.5 border border-theme-border-light dark:border-theme-border-dark rounded-lg text-sm bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:ring-2 focus:ring-theme-primary focus:border-transparent transition-all"
                />
                {option.displayName && (
                  <div className="mt-2 flex items-center gap-2 text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark">
                    <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                    <span>Internal identifier:</span>
                    <code className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded font-mono text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
                      {option.name || "—"}
                    </code>
                  </div>
                )}
              </div>

              {/* Values Field - FIXED */}
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
                {option.values.length === 0 && option.displayName && (
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 flex items-center gap-1">
                    <FaInfoCircle size={10} />
                    <span>Please add at least one value (separate with commas)</span>
                  </p>
                )}
              </div>
            </div>
          ))}

          {/* Empty State */}
          {options.length === 0 && (
            <div className="text-center py-12 border-2 border-dashed border-theme-border-light dark:border-theme-border-dark rounded-lg">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
                <FaPlus className="text-2xl text-theme-text-muted-light dark:text-theme-text-muted-dark" />
              </div>
              <p className="text-theme-text-muted-light dark:text-theme-text-muted-dark font-medium mb-2">
                No variant options yet
              </p>
              <p className="text-sm text-theme-text-muted-light dark:text-theme-text-muted-dark mb-4">
                Click "Add Option" below to create your first variant option
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-theme-surface-light dark:bg-theme-surface-dark border-t border-theme-border-light dark:border-theme-border-dark p-6 flex flex-col sm:flex-row justify-between gap-3">
          <button
            onClick={addOption}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors shadow-sm hover:shadow-md"
          >
            <FaPlus size={14} />
            <span>Add Option</span>
          </button>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2.5 border-2 border-theme-border-light dark:border-theme-border-dark rounded-lg text-theme-text-secondary-light dark:text-theme-text-secondary-dark hover:bg-theme-hover-bg-light dark:hover:bg-theme-hover-bg-dark font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading || options.length === 0}
              className="px-6 py-2.5 bg-theme-primary text-white rounded-lg hover:bg-theme-primary-hover disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all shadow-sm hover:shadow-md"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Saving...
                </span>
              ) : (
                `Save Options${options.length > 0 ? ` (${options.length})` : ""}`
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}