// app/components/shared/CategoryNavigation.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { categoriesApi } from "../../../lib/api/categories";

interface Category {
  _id: string;
  name: string;
  slug: string;
  product_count: number;
}

export default function CategoryNavigation() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await categoriesApi.getAll(false);
      setCategories(data.categories.slice(0, 6));
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-x-6">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-6 w-20 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-x-5 overflow-x-auto scrollbar-hide">
      <Link
        href="/"
        className="text-gray-800 hover:text-gray-900 dark:text-gray-300 whitespace-nowrap font-medium transition-colors"
      >
        Home
      </Link>
      <Link
        href="/products"
        className="text-gray-800 hover:text-gray-900 dark:text-gray-300 whitespace-nowrap font-medium transition-colors"
      >
        All Products
      </Link>
      {categories.map((category) => (
        <Link
          key={category._id}
          href={`/products?category=${category.slug}`}
          className="text-gray-800 hover:text-gray-900 dark:text-gray-300 whitespace-nowrap font-medium transition-colors"
        >
          {category.name}
        </Link>
      ))}
    </div>
  );
}
