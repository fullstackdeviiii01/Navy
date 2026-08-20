// // app/(admin)/components/categories/CategoryManagement.tsx
"use client";

import { useState, useEffect } from "react";
import { FaPlus, FaEdit, FaTrash, FaFolder, FaImage } from "react-icons/fa";
import CategoryModal from "./CategoryModal";
import { categoriesApi } from "../../../../lib/api/categories";
import Image from "next/image";
import Loader from "../../../components/shared/Loader";

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

export default function CategoryManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await categoriesApi.getAll(true);
      setCategories(data.categories);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (categoryId: string) => {
    try {
      const { count } = await categoriesApi.getProducts(categoryId);
      
      if (count > 0) {
        alert(`Cannot delete this category!\n\nThis category contains ${count} ${count === 1 ? 'product' : 'products'}.\nPlease reassign or delete the products first.`);
        return;
      }

      if (!confirm("Are you sure you want to delete this category? The associated image will also be deleted.")) return;

      await categoriesApi.delete(categoryId);
      fetchCategories();
    } catch (error: any) {
      alert(error.message || "Failed to delete category");
    }
  };

  const openAddModal = () => {
    setEditingCategory(null);
    setShowModal(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setShowModal(true);
  };

  const handleModalSuccess = () => {
    fetchCategories();
    setShowModal(false);
    setEditingCategory(null);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingCategory(null);
  };

  if (loading) {
    return (
      <div className="relative h-64">
        <Loader />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-2 sm:p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
          Category Management
        </h2>
        <button
          onClick={openAddModal}
          className="flex items-center justify-center sm:justify-start px-4 py-2 bg-theme-primary text-white rounded-lg hover:bg-theme-primary-hover transition-colors text-sm sm:text-base relative after:absolute after:inset-[-4px] after:content-['']"
          aria-label="Add category"
        >
          <FaPlus className="mr-2 text-xs sm:text-sm" />
          Add Category
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {categories.map((category) => (
          <div
            key={category._id}
            className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg shadow border border-theme-border-light dark:border-theme-border-dark overflow-hidden"
          >
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
                <FaImage className="text-white text-3xl sm:text-5xl opacity-50" />
              </div>
            )}

            {/* Category Info */}
            <div className="p-3 sm:p-4">
              <div className="flex items-start justify-between gap-2 mb-2 sm:mb-3">
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                  <FaFolder className="text-blue-600 dark:text-blue-400 text-base sm:text-xl flex-shrink-0" />
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
                    onClick={() => openEditModal(category)}
                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 text-sm sm:text-base relative after:absolute after:inset-[-4px] after:content-['']"
                    title="Edit"
                    aria-label="Edit category"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => deleteCategory(category._id)}
                    className="text-theme-error hover:text-red-500 text-sm sm:text-base relative after:absolute after:inset-[-4px] after:content-['']"
                    title="Delete"
                    aria-label="Delete category"
                    disabled={category.product_count > 0}
                  >
                    <FaTrash className={category.product_count > 0 ? 'opacity-50 cursor-not-allowed' : ''} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-8 sm:py-12 text-sm sm:text-base text-theme-text-muted-light dark:text-theme-text-muted-dark px-4">
          No categories found. Click "Add Category" to create your first category.
        </div>
      )}

      {/* Modal */}
      <CategoryModal
        isOpen={showModal}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
        category={editingCategory}
      />
    </div>
  );
}