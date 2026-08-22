// app/(admin)/catalog/components/matrix/MatrixPermutationTable.tsx
"use client";

import { useState } from "react";
import { FaEdit } from "react-icons/fa";
import { ProductVariant } from "../../../../../types/product-variants";
import PermutationItemForm from "./PermutationItemForm";
import { formatPrice } from "../../../../../lib/utils/formatPrice";

interface MatrixPermutationTableProps {
  variants: ProductVariant[];
  onUpdate: (variantId: string, updates: Partial<ProductVariant>) => void;
  productCurrency: string;
}

export default function MatrixPermutationTable({
  variants,
  onUpdate,
  productCurrency,
}: MatrixPermutationTableProps) {
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
      <div className="border border-theme-border-light dark:border-theme-border-dark rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-theme-card-light/60 dark:bg-theme-card-dark/40 border-b border-theme-border-light dark:border-theme-border-dark text-[11px] uppercase tracking-wider text-theme-text-secondary-light dark:text-theme-text-secondary-dark font-semibold">
              <tr>
                <th className="px-4 py-3">Photo</th>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3">Attributes</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Available</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-theme-border-light/60 dark:divide-theme-border-dark/60">
              {variants.map((variant) => (
                <tr
                  key={variant._id}
                  className="hover:bg-theme-card-light/40 dark:hover:bg-theme-card-dark/30 transition-colors"
                >
                  <td className="px-4 py-3">
                    {variant.imageUrl ? (
                      <img
                        src={variant.imageUrl}
                        alt="Variant"
                        className="w-10 h-10 object-cover rounded-lg border border-theme-border-light dark:border-theme-border-dark"
                      />
                    ) : (
                      <span className="text-xs text-theme-text-muted-light italic">No image</span>
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
                          className="inline-flex px-2 py-0.5 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-xs rounded border border-blue-200 dark:border-blue-900/60"
                        >
                          {attr.value}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                    {formatPrice(variant.price)}
                  </td>
                  <td className="px-4 py-3 text-theme-text-primary-light dark:text-theme-text-primary-dark">
                    {variant.stockQuantity} units
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex px-2 py-0.5 text-[10px] font-semibold rounded-full ${
                        variant.isAvailable && variant.stockQuantity > 0
                          ? "bg-green-100 dark:bg-green-950/60 text-green-800 dark:text-green-300"
                          : "bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300"
                      }`}
                    >
                      {variant.isAvailable && variant.stockQuantity > 0
                        ? "Active"
                        : "Unavailable"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => {
                        setEditingVariant(variant);
                        setEditingVariantId(variant._id || "");
                      }}
                      className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded transition-colors"
                      title="Edit Variant"
                    >
                      <FaEdit className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editingVariant && (
        <PermutationItemForm
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
