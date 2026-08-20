// app/dashboard/coupons/components/CouponFormSections/ApplicableToForm.tsx
"use client";

import { useState, useEffect } from "react";
import { categoriesApi } from "../../../../../lib/api/categories";
import { productsApi } from "../../../../../lib/api/products";
import Loader from "../../../../components/shared/Loader";

interface ApplicableTo {
  type: "all" | "categories" | "products";
  category_ids: string[];
  product_ids: string[];
}

interface ApplicableToFormProps {
  applicableTo: ApplicableTo;
  onApplicableToChange: (applicableTo: ApplicableTo) => void;
}

export default function ApplicableToForm({
  applicableTo,
  onApplicableToChange,
}: ApplicableToFormProps) {
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const data = await categoriesApi.getAll(false);
      setCategories(data.categories);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    } finally {
      setLoadingCategories(false);
    }
  };

  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const data = await productsApi.getAll({ limit: 1000 });
      setProducts(data.products);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleCategoryToggle = (categoryId: string) => {
    const newIds = applicableTo.category_ids.includes(categoryId)
      ? applicableTo.category_ids.filter((id) => id !== categoryId)
      : [...applicableTo.category_ids, categoryId];

    onApplicableToChange({
      ...applicableTo,
      category_ids: newIds,
    });
  };

  const handleProductToggle = (productId: string) => {
    const newIds = applicableTo.product_ids.includes(productId)
      ? applicableTo.product_ids.filter((id) => id !== productId)
      : [...applicableTo.product_ids, productId];

    onApplicableToChange({
      ...applicableTo,
      product_ids: newIds,
    });
  };

  return (
    <>
      <div>
        <label htmlFor="applicable-to-type" className="block text-xs sm:text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-2">
          Apply To *
        </label>
        <select
          id="applicable-to-type"
          value={applicableTo.type}
          onChange={(e) =>
            onApplicableToChange({
              type: e.target.value as "all" | "categories" | "products",
              category_ids: [],
              product_ids: [],
            })
          }
          className="w-full px-2 sm:px-4 py-1.5 sm:py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary"
        >
          <option value="all">All Products</option>
          <option value="categories">Specific Categories</option>
          <option value="products">Specific Products</option>
        </select>
      </div>

      {applicableTo.type === "categories" && (
        <div>
          <label className="block text-xs sm:text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-2">
            Select Categories
          </label>
          <div className="border border-theme-border-light dark:border-theme-border-dark rounded-lg p-2 sm:p-4 max-h-40 sm:max-h-60 overflow-y-auto">
            {loadingCategories ? (
              <div className="relative h-24 sm:h-32">
                <Loader size="sm" text="Loading categories..." />
              </div>
            ) : categories.length === 0 ? (
              <p className="text-xs sm:text-sm text-theme-text-muted-light dark:text-theme-text-muted-dark p-2">
                No categories available
              </p>
            ) : (
              <div className="space-y-1 sm:space-y-2">
                {categories.map((category) => (
                  <label
                    key={category._id}
                    htmlFor={`category-${category._id}`}
                    className="flex items-center gap-2 sm:gap-3 p-1.5 sm:p-2 hover:bg-theme-hover-bg-light dark:hover:bg-theme-hover-bg-dark rounded cursor-pointer"
                  >
                    <input
                      id={`category-${category._id}`}
                      type="checkbox"
                      checked={applicableTo.category_ids.includes(category._id)}
                      onChange={() => handleCategoryToggle(category._id)}
                      className="rounded text-theme-primary focus:ring-theme-primary w-3 h-3 sm:w-4 sm:h-4"
                    />
                    <span className="text-xs sm:text-sm text-theme-text-primary-light dark:text-theme-text-primary-dark truncate">
                      {category.name}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {applicableTo.type === "products" && (
        <div>
          <label className="block text-xs sm:text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-2">
            Select Products
          </label>
          <div className="border border-theme-border-light dark:border-theme-border-dark rounded-lg p-2 sm:p-4 max-h-40 sm:max-h-60 overflow-y-auto">
            {loadingProducts ? (
              <div className="relative h-24 sm:h-32">
                <Loader size="sm" text="Loading products..." />
              </div>
            ) : products.length === 0 ? (
              <p className="text-xs sm:text-sm text-theme-text-muted-light dark:text-theme-text-muted-dark p-2">
                No products available
              </p>
            ) : (
              <div className="space-y-1 sm:space-y-2">
                {products.map((product) => (
                  <label
                    key={product._id}
                    htmlFor={`product-${product._id}`}
                    className="flex items-center gap-2 sm:gap-3 p-1.5 sm:p-2 hover:bg-theme-hover-bg-light dark:hover:bg-theme-hover-bg-dark rounded cursor-pointer"
                  >
                    <input
                      id={`product-${product._id}`}
                      type="checkbox"
                      checked={applicableTo.product_ids.includes(product._id)}
                      onChange={() => handleProductToggle(product._id)}
                      className="rounded text-theme-primary focus:ring-theme-primary w-3 h-3 sm:w-4 sm:h-4"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm text-theme-text-primary-light dark:text-theme-text-primary-dark truncate">
                        {product.name}
                      </p>
                      <p className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark">
                        Rs. ${product.pricing.price}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}