// app/(admin)/taxonomy/views/TaxonomyDirectoryView.tsx
"use client";

import { useState, useEffect } from "react";
import { categoriesApi } from "../../../../lib/api/categories";
import TaxonomyActionBar from "../components/TaxonomyActionBar";
import TaxonomyCollectionGrid from "../components/TaxonomyCollectionGrid";
import TaxonomyCollectionModal from "../components/TaxonomyCollectionModal";
import Loader from "../../../components/shared/Loader";
import {
  FaTags,
  FaCheckCircle,
  FaBoxes,
  FaExclamationCircle,
  FaSearch,
  FaTimes,
  FaThLarge,
  FaList,
} from "react-icons/fa";

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

export default function TaxonomyDirectoryView() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);

  // Filters & UI state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await categoriesApi.getAll(true);
      setCategories(data.categories || []);
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
        alert(
          `Cannot delete this collection!\n\nThis category currently has ${count} ${
            count === 1 ? "product" : "products"
          } assigned.\nPlease reassign or delete the products first.`
        );
        return;
      }

      if (
        !confirm(
          "Are you sure you want to delete this collection? Any associated cover images will also be removed."
        )
      ) {
        return;
      }

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

  const openEditModal = (category: CategoryItem) => {
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

  // Filter categories client-side
  const filteredCategories = categories.filter((cat) => {
    const matchesSearch =
      cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cat.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cat.description && cat.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === "all"
        ? true
        : statusFilter === "active"
        ? cat.is_active
        : !cat.is_active;

    return matchesSearch && matchesStatus;
  });

  // KPI Calculations
  const totalCollections = categories.length;
  const activeCollections = categories.filter((c) => c.is_active).length;
  const totalAssignedProducts = categories.reduce((sum, c) => sum + (c.product_count || 0), 0);
  const emptyCollections = categories.filter((c) => (c.product_count || 0) === 0).length;

  return (
    <div className="space-y-6 pb-16">
      {/* Header Action Bar */}
      <TaxonomyActionBar
        onAddNewCollection={openAddModal}
        totalCount={totalCollections}
      />

      {/* KPI Stats Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Categories */}
        <div className="p-4 rounded-xl border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-theme-text-muted-light dark:text-theme-text-muted-dark">
              Total Categories
            </span>
            <div className="p-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200">
              <FaTags className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark">
            {totalCollections}
          </p>
          <p className="text-[11px] text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
            Created categories
          </p>
        </div>

        {/* Active Categories */}
        <div className="p-4 rounded-xl border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-theme-text-muted-light dark:text-theme-text-muted-dark">
              Active Categories
            </span>
            <div className="p-1.5 rounded-lg bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400">
              <FaCheckCircle className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark">
            {activeCollections}
          </p>
          <p className="text-[11px] text-green-700 dark:text-green-400 font-medium">
            Visible in store
          </p>
        </div>

        {/* Products Linked */}
        <div className="p-4 rounded-xl border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-theme-text-muted-light dark:text-theme-text-muted-dark">
              Total Products
            </span>
            <div className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400">
              <FaBoxes className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark">
            {totalAssignedProducts}
          </p>
          <p className="text-[11px] text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
            Products in categories
          </p>
        </div>

        {/* Empty Categories Warning */}
        <div className="p-4 rounded-xl border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-theme-text-muted-light dark:text-theme-text-muted-dark">
              Empty Categories
            </span>
            <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
              <FaExclamationCircle className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark">
            {emptyCollections}
          </p>
          <p className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">
            0 products assigned
          </p>
        </div>
      </div>

      {/* Filter & View Toolbar */}
      <div className="bg-theme-surface-light dark:bg-theme-surface-dark p-3.5 sm:p-4 rounded-xl border border-theme-border-light dark:border-theme-border-dark flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="flex-1 relative max-w-md">
          <FaSearch className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-theme-text-muted-light w-3.5 h-3.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search collections by title or slug..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark placeholder:text-theme-text-muted-light focus:outline-none focus:ring-2 focus:ring-neutral-500/40"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="absolute right-2.5 top-1/2 transform -translate-y-1/2 p-1 text-theme-text-muted-light hover:text-theme-text-primary-light"
            >
              <FaTimes className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2.5 self-end sm:self-auto">
          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-neutral-500/40 cursor-pointer"
          >
            <option value="all">All Visibility</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>

          {/* View mode toggle */}
          <div className="inline-flex rounded-lg border border-theme-border-light dark:border-theme-border-dark bg-theme-bg-light dark:bg-theme-bg-dark p-0.5">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === "grid"
                  ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 shadow-xs"
                  : "text-theme-text-muted-light hover:text-theme-text-primary-light"
              }`}
              title="Grid View"
            >
              <FaThLarge className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === "table"
                  ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 shadow-xs"
                  : "text-theme-text-muted-light hover:text-theme-text-primary-light"
              }`}
              title="Table View"
            >
              <FaList className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="relative h-64 bg-theme-surface-light dark:bg-theme-surface-dark rounded-xl border border-theme-border-light dark:border-theme-border-dark flex items-center justify-center">
          <Loader />
        </div>
      ) : (
        <TaxonomyCollectionGrid
          categories={filteredCategories}
          viewMode={viewMode}
          onEdit={openEditModal}
          onDelete={deleteCategory}
        />
      )}

      {/* Editor Modal */}
      <TaxonomyCollectionModal
        isOpen={showModal}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
        category={editingCategory}
      />
    </div>
  );
}
