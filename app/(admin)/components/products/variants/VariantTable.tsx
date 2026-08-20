// app/(admin)/components/products/VariantTable.tsx
"use client";

import { useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import { ProductVariant } from "../../../../../types/product-variants";
import VariantForm from "./VariantForm";

interface VariantTableProps {
  variants: ProductVariant[];
  onUpdate: (variantId: string, updates: Partial<ProductVariant>) => void;
  productCurrency: string;
}

export default function VariantTable({
  variants,
  onUpdate,
  productCurrency,
}: VariantTableProps) {
  const [editingVariantId, setEditingVariantId] = useState<string | null>(null);
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null);

  const handleSaveVariant = async (variant: ProductVariant) => {
    if (editingVariant?._id) {
      await onUpdate(editingVariant._id, variant);
      setEditingVariantId(null);
      setEditingVariant(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="border border-theme-border-light dark:border-theme-border-dark rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-theme-bg-light dark:bg-theme-bg-dark">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-theme-text-muted-light dark:text-theme-text-muted-dark">
                  Image
                </th>
                <th className="px-4 py-3 text-left font-semibold text-theme-text-muted-light dark:text-theme-text-muted-dark">
                  SKU
                </th>
                <th className="px-4 py-3 text-left font-semibold text-theme-text-muted-light dark:text-theme-text-muted-dark">
                  Attributes
                </th>
                <th className="px-4 py-3 text-left font-semibold text-theme-text-muted-light dark:text-theme-text-muted-dark">
                  Price
                </th>
                <th className="px-4 py-3 text-left font-semibold text-theme-text-muted-light dark:text-theme-text-muted-dark">
                  Stock
                </th>
                <th className="px-4 py-3 text-left font-semibold text-theme-text-muted-light dark:text-theme-text-muted-dark">
                  Available
                </th>
                <th className="px-4 py-3 text-right font-semibold text-theme-text-muted-light dark:text-theme-text-muted-dark">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-theme-border-light dark:divide-theme-border-dark">
              {variants.map((variant) => (
                <tr
                  key={variant._id}
                  className="bg-theme-surface-light dark:bg-theme-surface-dark hover:bg-theme-hover-bg-light dark:hover:bg-theme-hover-bg-dark"
                >
                  <td className="px-4 py-3">
                    {variant.imageUrl ? (
                      <img
                        src={variant.imageUrl}
                        alt="Variant"
                        className="w-10 h-10 object-cover rounded border border-theme-border-light dark:border-theme-border-dark"
                      />
                    ) : (
                      <span className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark italic">No image</span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-theme-text-primary-light dark:text-theme-text-primary-dark">
                    {variant.sku}
                  </td>
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
                  <td className="px-4 py-3 text-theme-text-primary-light dark:text-theme-text-primary-dark">
                    {productCurrency} {variant.price.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-theme-text-primary-light dark:text-theme-text-primary-dark">
                    {variant.stockQuantity}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded ${
                        variant.isAvailable && variant.stockQuantity > 0
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                      }`}
                    >
                      {variant.isAvailable && variant.stockQuantity > 0
                        ? "Yes"
                        : "No"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => {
                          setEditingVariant(variant);
                          setEditingVariantId(variant._id || "");
                        }}
                        className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        <FaEdit />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editingVariant && (
        <VariantForm
          isOpen={!!editingVariantId}
          onClose={() => {
            setEditingVariantId(null);
            setEditingVariant(null);
          }}
          onSave={handleSaveVariant}
          variant={editingVariant}
          productCurrency={productCurrency}
        />
      )}
    </div>
  );
}

