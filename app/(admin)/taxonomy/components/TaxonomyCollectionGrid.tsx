// app/(admin)/taxonomy/components/TaxonomyCollectionGrid.tsx
"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { FaFolder, FaImage, FaEdit, FaTrash, FaBoxes, FaExternalLinkAlt } from "react-icons/fa";

interface CategoryItem {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  is_active: boolean;
  product_count: number;
  created_at: string;
}

interface TaxonomyCollectionGridProps {
  categories: CategoryItem[];
  viewMode: "grid" | "table";
  onEdit: (category: CategoryItem) => void;
  onDelete: (categoryId: string) => void;
}

export default function TaxonomyCollectionGrid({
  categories,
  viewMode,
  onEdit,
  onDelete,
}: TaxonomyCollectionGridProps) {
  const router = useRouter();

  if (categories.length === 0) {
    return (
      <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-xl border border-theme-border-light dark:border-theme-border-dark p-12 text-center">
        <div className="w-12 h-12 rounded-full bg-theme-hover-light/10 text-theme-hover-light dark:text-theme-hover-dark flex items-center justify-center mx-auto mb-3">
          <FaFolder className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
          No Collections Found
        </h3>
        <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark max-w-sm mx-auto mt-1">
          No categories match your search or filter criteria.
        </p>
      </div>
    );
  }

  if (viewMode === "table") {
    return (
      <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-xl border border-theme-border-light dark:border-theme-border-dark overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-theme-card-light/60 dark:bg-theme-card-dark/40 border-b border-theme-border-light dark:border-theme-border-dark text-[11px] uppercase tracking-wider text-theme-text-secondary-light dark:text-theme-text-secondary-dark font-semibold">
                <th className="py-3 px-4 w-16">Cover</th>
                <th className="py-3 px-4">Collection Title & Slug</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Products Linked</th>
                <th className="py-3 px-4">Visibility</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-theme-border-light/60 dark:divide-theme-border-dark/60">
              {categories.map((category) => (
                <tr
                  key={category._id}
                  className="hover:bg-theme-card-light/40 dark:hover:bg-theme-card-dark/30 transition-colors group"
                >
                  <td className="py-3 px-4">
                    <div className="w-12 h-12 rounded-lg border border-theme-border-light dark:border-theme-border-dark overflow-hidden bg-black/5 shrink-0 relative">
                      {category.image_url ? (
                        <Image
                          src={category.image_url}
                          alt={category.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-theme-text-muted-light">
                          <FaImage className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 min-w-[180px]">
                    <div className="font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                      {category.name}
                    </div>
                    <span className="text-[11px] text-theme-text-muted-light">
                      /{category.slug}
                    </span>
                  </td>
                  <td className="py-3 px-4 max-w-xs truncate text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
                    {category.description || "—"}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => router.push(`/admin/products?category=${category._id}`)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-theme-border-light dark:border-theme-border-dark bg-theme-bg-light dark:bg-theme-bg-dark text-[11px] font-semibold text-theme-text-secondary-light hover:border-theme-hover-light transition-colors"
                    >
                      <FaBoxes className="w-3 h-3 text-purple-600" />
                      <span>{category.product_count} items</span>
                    </button>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        category.is_active
                          ? "bg-green-100 dark:bg-green-950/60 text-green-800 dark:text-green-300"
                          : "bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300"
                      }`}
                    >
                      {category.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onEdit(category)}
                        className="p-1.5 text-theme-text-muted-light hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                        title="Edit Collection"
                      >
                        <FaEdit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(category._id)}
                        disabled={category.product_count > 0}
                        className={`p-1.5 rounded-lg transition-colors ${
                          category.product_count > 0
                            ? "text-neutral-300 dark:text-neutral-700 cursor-not-allowed"
                            : "text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        }`}
                        title={
                          category.product_count > 0
                            ? `Cannot delete: ${category.product_count} products assigned`
                            : "Delete Collection"
                        }
                      >
                        <FaTrash className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {categories.map((category) => (
        <div
          key={category._id}
          className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-xl border border-theme-border-light dark:border-theme-border-dark overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 group flex flex-col justify-between"
        >
          <div>
            {/* Visual Cover */}
            <div className="relative w-full h-36 bg-black/5 overflow-hidden">
              {category.image_url ? (
                <Image
                  src={category.image_url}
                  alt={category.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-theme-text-muted-light bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-900 dark:to-neutral-800">
                  <FaImage className="text-3xl opacity-40 mb-1" />
                  <span className="text-[10px] uppercase tracking-wider opacity-60">
                    No Imagery
                  </span>
                </div>
              )}
              <div className="absolute top-2.5 right-2.5">
                <span
                  className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold shadow-xs ${
                    category.is_active
                      ? "bg-green-100/90 dark:bg-green-950/80 text-green-800 dark:text-green-200 backdrop-blur-xs"
                      : "bg-red-100/90 dark:bg-red-950/80 text-red-800 dark:text-red-200 backdrop-blur-xs"
                  }`}
                >
                  {category.is_active ? "Active" : "Inactive"}
                </span>
              </div>
            </div>

            {/* Collection Metadata */}
            <div className="p-4 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-semibold text-sm sm:text-base text-theme-text-primary-light dark:text-theme-text-primary-dark truncate">
                  {category.name}
                </h3>
              </div>

              <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark line-clamp-2 min-h-[32px]">
                {category.description || "No collection description provided."}
              </p>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-theme-text-muted-light truncate max-w-[140px]">
                  /{category.slug}
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                  <FaBoxes className="w-3 h-3 text-purple-600" />
                  <span>{category.product_count} items</span>
                </span>
              </div>
            </div>
          </div>

          {/* Footer Controls */}
          <div className="p-3 bg-theme-bg-light/60 dark:bg-theme-bg-dark/40 border-t border-theme-border-light/80 dark:border-theme-border-dark/80 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => onEdit(category)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark text-xs font-semibold text-theme-text-secondary-light hover:text-theme-text-primary-light hover:border-theme-hover-light transition-colors"
            >
              <FaEdit className="w-3 h-3" />
              <span>Edit</span>
            </button>

            <button
              type="button"
              onClick={() => onDelete(category._id)}
              disabled={category.product_count > 0}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                category.product_count > 0
                  ? "border border-theme-border-light/40 dark:border-theme-border-dark/40 text-neutral-400 dark:text-neutral-600 cursor-not-allowed"
                  : "border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 hover:bg-rose-100"
              }`}
              title={
                category.product_count > 0
                  ? `Cannot delete: ${category.product_count} products assigned`
                  : "Delete Collection"
              }
            >
              <FaTrash className="w-2.5 h-2.5" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
