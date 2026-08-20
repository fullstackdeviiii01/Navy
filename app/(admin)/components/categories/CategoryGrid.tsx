"use client";

import CategoryCard from "./CategoryCard";

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

interface CategoryGridProps {
  categories: Category[];
  onEditCategory: (category: Category) => void;
  onDeleteCategory: (categoryId: string) => void;
}

export default function CategoryGrid({ 
  categories, 
  onEditCategory, 
  onDeleteCategory 
}: CategoryGridProps) {
  
  if (categories.length === 0) {
    return (
      <div className="text-center py-8 sm:py-12 text-sm sm:text-base text-theme-text-muted-light dark:text-theme-text-muted-dark px-4">
        No categories found. Click "Add Category" to create your first category.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
      {categories.map((category) => (
        <CategoryCard
          key={category._id}
          category={category}
          onEdit={onEditCategory}
          onDelete={onDeleteCategory}
        />
      ))}
    </div>
  );
}