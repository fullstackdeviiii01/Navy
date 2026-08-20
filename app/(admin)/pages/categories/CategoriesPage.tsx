"use client";

import { useState, useEffect } from "react";
import CategoryHeader from "../../components/categories/CategoryHeader";
import CategoryGrid from "../../components/categories/CategoryGrid";
import CategoryModal from "../../components/categories/CategoryModal";
import { categoriesApi } from "../../../../lib/api/categories";
import Loader from "../../../components/shared/Loader";

interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  is_active: boolean;
  product_count: number;
  created_at: string;
}

export default function CategoriesPage() {
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
    <div className="space-y-4 sm:space-y-6">
      <CategoryHeader onAddCategory={openAddModal} />
      
      <CategoryGrid
        categories={categories}
        onEditCategory={openEditModal}
        onDeleteCategory={deleteCategory}
      />

      <CategoryModal
        isOpen={showModal}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
        category={editingCategory}
      />
    </div>
  );
}