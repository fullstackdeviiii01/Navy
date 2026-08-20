"use client";

import Image from "next/image";
import { FaFolder, FaImage, FaEdit, FaTrash } from "react-icons/fa";

interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  sort_order: number;
  is_active: boolean;
  is_featured: boolean;
  product_count: number;
  created_at: string;
}

interface CategoryCardProps {
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (categoryId: string) => void;
}

export default function CategoryCard({ category, onEdit, onDelete }: CategoryCardProps) {
  return (
    <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg shadow border border-theme-border-light dark:border-theme-border-dark overflow-hidden">
      {/* Category Image */}
      {category.image_url ? (
        <div className="relative w-full h-32 sm:h-40 bg-gray-200 dark:bg-gray-700">
          <Image
            src={category.image_url}
            alt={category.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      ) : (
        <div className="w-full h-32 sm:h-40 bg-gradient-to-br from-purple-400 to-pink-400 dark:from-purple-600 dark:to-pink-600 flex items-center justify-center">
          <FaImage className="text-white text-3xl sm:text-5xl opacity-50" aria-hidden="true"/>
        </div>
      )}

      {/* Category Info */}
      <div className="p-3 sm:p-4">
        <div className="flex items-start justify-between gap-2 mb-2 sm:mb-3">
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <FaFolder className="text-blue-600 dark:text-blue-400 text-base sm:text-xl flex-shrink-0" aria-hidden="true"/>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm sm:text-base text-theme-text-primary-light dark:text-theme-text-primary-dark truncate">
                {category.name}
              </h3>
              <p className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark">
                {category.product_count} {category.product_count === 1 ? 'product' : 'products'}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-1 flex-shrink-0">
            {category.is_featured && (
              <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs font-semibold rounded bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 whitespace-nowrap">
                Featured
              </span>
            )}
            {!category.is_active && (
              <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs font-semibold rounded bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 whitespace-nowrap">
                Inactive
              </span>
            )}
          </div>
        </div>

        {category.description && (
          <p className="text-xs sm:text-sm text-theme-text-muted-light dark:text-theme-text-muted-dark mb-2 sm:mb-3 line-clamp-2">
            {category.description}
          </p>
        )}

        <div className="flex items-center justify-between pt-2 sm:pt-3 border-t border-theme-border-light dark:border-theme-border-dark gap-2">
          <p className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark truncate flex-1 min-w-0">
            /{category.slug}
          </p>
          <div className="flex gap-2 sm:gap-3 flex-shrink-0">
            <button
              onClick={() => onEdit(category)}
              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 text-sm sm:text-base relative after:absolute after:inset-[-4px] after:content-['']"
              title="Edit"
              aria-label="Edit category"
            >
              <FaEdit />
            </button>
            <button
              onClick={() => onDelete(category._id)}
              className="text-theme-error hover:text-red-500 text-sm sm:text-base relative after:absolute after:inset-[-4px] after:content-['']"
              title="Delete"
              aria-label="Delete category"
              disabled={category.product_count > 0}
            >
              <FaTrash className={category.product_count > 0 ? 'opacity-50 cursor-not-allowed' : ''}/>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}