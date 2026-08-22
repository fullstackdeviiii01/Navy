// app/(admin)/catalog/components/matrix/AttributeOptionsEditor.tsx
"use client";

import { useState, useEffect } from "react";
import { FaTimes, FaPlus, FaTrash, FaPalette } from "react-icons/fa";
import { VariantOption } from "../../../../../types/product-variants";

interface AttributeOptionsEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (options: VariantOption[]) => void;
  initialOptions?: VariantOption[];
  isLoading?: boolean;
}

export default function AttributeOptionsEditor({
  isOpen,
  onClose,
  onSave,
  initialOptions = [],
  isLoading = false,
}: AttributeOptionsEditorProps) {
  const [options, setOptions] = useState<VariantOption[]>(initialOptions);
  const [valueInputs, setValueInputs] = useState<{ [key: number]: string }>({});

  useEffect(() => {
    if (isOpen) {
      setOptions(initialOptions);
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
    setValueInputs({ ...valueInputs, [index]: rawValue });
    const parsedValues = rawValue
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);

    updateOption(index, "values", parsedValues);
  };

  const handleSave = () => {
    const valid = options.filter(
      (opt) => opt.displayName.trim() && opt.values.length > 0
    );

    if (valid.length === 0) {
      alert("At least one option with values is required");
      return;
    }

    const formatted = valid.map((opt, index) => ({
      ...opt,
      name: opt.name || generateNameFromDisplay(opt.displayName),
      position: index,
    }));

    onSave(formatted);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-xl max-w-2xl w-full border border-theme-border-light dark:border-theme-border-dark shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="border-b border-theme-border-light dark:border-theme-border-dark p-4.5 flex justify-between items-center shrink-0">
          <h3 className="text-base font-serif font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
            Manage Product Options & Specifications
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-theme-text-muted-light hover:text-theme-text-primary-light rounded"
          >
            <FaTimes className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {options.map((option, index) => {
            const isColor =
              option.name === "color" ||
              option.displayName.toLowerCase() === "color";

            return (
              <div
                key={index}
                className="p-4 border border-theme-border-light dark:border-theme-border-dark rounded-xl bg-theme-card-light/40 dark:bg-theme-card-dark/30 space-y-3"
              >
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold text-xs uppercase tracking-wider text-theme-text-primary-light dark:text-theme-text-primary-dark flex items-center gap-2">
                    {isColor && <FaPalette className="text-theme-hover-light" />}
                    <span>Option {index + 1}</span>
                  </h4>
                  <button
                    type="button"
                    onClick={() => removeOption(index)}
                    className="flex items-center gap-1 px-2 py-1 text-red-600 hover:text-white hover:bg-red-600 rounded text-xs transition-colors"
                  >
                    <FaTrash size={10} />
                    <span>Remove</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1">
                      Display Name *
                    </label>
                    <input
                      type="text"
                      value={option.displayName}
                      onChange={(e) => {
                        updateOption(index, "displayName", e.target.value);
                        updateOption(
                          index,
                          "name",
                          generateNameFromDisplay(e.target.value)
                        );
                      }}
                      placeholder="e.g., Color, Size, Material"
                      className="w-full px-3 py-1.5 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark text-xs text-theme-text-primary-light focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1">
                      Values (comma separated) *
                    </label>
                    <input
                      type="text"
                      value={valueInputs[index] || ""}
                      onChange={(e) =>
                        handleValueInputChange(index, e.target.value)
                      }
                      placeholder="e.g., Red, Blue, Green"
                      className="w-full px-3 py-1.5 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark text-xs text-theme-text-primary-light focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                    />
                  </div>
                </div>
              </div>
            );
          })}

          <button
            type="button"
            onClick={addOption}
            className="w-full py-2.5 border-2 border-dashed border-theme-border-light dark:border-theme-border-dark rounded-xl text-xs font-semibold text-theme-text-secondary-light hover:border-theme-hover-light hover:text-theme-hover-light transition-colors flex items-center justify-center gap-1.5"
          >
            <FaPlus size={10} />
            <span>Add Option</span>
          </button>
        </div>

        {/* Footer */}
        <div className="border-t border-theme-border-light dark:border-theme-border-dark p-4 flex justify-end gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg text-xs font-semibold text-theme-text-secondary-light hover:bg-theme-card-light transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isLoading}
            className="px-5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900 rounded-lg text-xs font-semibold disabled:opacity-50 transition-all shadow-xs hover:shadow active:scale-[0.99]"
          >
            {isLoading ? "Saving..." : "Save Options"}
          </button>
        </div>
      </div>
    </div>
  );
}
