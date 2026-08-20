// app/(admin)/components/products/ProductTable.tsx
"use client";

import { FaEdit, FaTrash, FaEye, FaCog } from "react-icons/fa";
import { useRouter } from "next/navigation";

interface Product {
  _id: string;
  name: string;
  description: string;
  pricing: {
    price: number;
    compare_at_price?: number;
    currency: string;
  };
  inventory: {
    sku: string;
    stock_quantity: number;
    stock_status: string;
  };
  category_id: {
    _id: string;
    name: string;
    slug: string;
  };
  status: string;
  badges?: {
    is_featured?: boolean;
    is_on_sale?: boolean;
  };
  images: any[];
  created_at: string;
  hasVariants?: boolean;
  variantPricing?: {
    minPrice: number;
    maxPrice: number;
    priceVaries: boolean;
  };
  variantInventory?: {
    totalStock: number;
    availableVariantCount: number;
  };
}

interface ProductTableProps {
  products: Product[];
  onDelete: (productId: string) => void;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  onPageChange: (page: number) => void;
}

export default function ProductTable({
  products,
  onDelete,
  pagination,
  onPageChange,
}: ProductTableProps) {
  const router = useRouter();

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "draft":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "archived":
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
      case "out_of_stock":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  const getStockBadgeColor = (status: string) => {
    switch (status) {
      case "in_stock":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "low_stock":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "out_of_stock":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  /**
   * FIX: For variant products, read totalStock from variantInventory.
   * For simple products, read from inventory.stock_quantity as before.
   */
  const getStockDisplay = (product: Product): { qty: number; status: string } => {
    if (product.hasVariants && product.variantInventory) {
      const totalStock = product.variantInventory.totalStock ?? 0;
      let status = "in_stock";
      if (totalStock === 0) status = "out_of_stock";
      else if (totalStock <= 10) status = "low_stock";
      return { qty: totalStock, status };
    }
    return {
      qty: product.inventory.stock_quantity,
      status: product.inventory.stock_status,
    };
  };

  const renderPrice = (product: Product) => {
    const currency = product.pricing.currency;

    if (product.hasVariants && product.variantPricing) {
      const { minPrice, maxPrice, priceVaries } = product.variantPricing;
      return (
        <div className="text-sm font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark">
          <span className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark mr-1">
            From
          </span>
          {currency} {minPrice.toFixed(2)}
          {priceVaries && (
            <div className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark">
              – {currency} {maxPrice.toFixed(2)}
            </div>
          )}
        </div>
      );
    }

    return (
      <div>
        <div className="text-sm font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark">
          {currency} {product.pricing.price.toFixed(2)}
        </div>
        {product.pricing.compare_at_price && (
          <div className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark line-through">
            {currency} {product.pricing.compare_at_price.toFixed(2)}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-theme-border-light dark:divide-theme-border-dark">
          <thead className="bg-theme-bg-light dark:bg-theme-bg-dark">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-theme-text-muted-light dark:text-theme-text-secondary-dark uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-theme-text-muted-light dark:text-theme-text-secondary-dark uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-theme-text-muted-light dark:text-theme-text-secondary-dark uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-theme-text-muted-light dark:text-theme-text-secondary-dark uppercase tracking-wider">
                Stock
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-theme-text-muted-light dark:text-theme-text-secondary-dark uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-theme-text-muted-light dark:text-theme-text-secondary-dark uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-theme-surface-light dark:bg-theme-surface-dark divide-y divide-theme-border-light dark:divide-theme-border-dark">
            {products.map((product) => {
              const stock = getStockDisplay(product);
              return (
                <tr
                  key={product._id}
                  className="hover:bg-theme-hover-bg-light dark:hover:bg-theme-hover-bg-dark"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {product.images?.length > 0 && (
                        <img
                          src={product.images[0].url}
                          alt={product.name}
                          className="h-10 w-10 rounded object-cover mr-3"
                        />
                      )}
                      <div>
                        <div className="text-sm font-medium max-w-[180px] truncate text-theme-text-primary-light dark:text-theme-text-primary-dark">
                          {product.name}
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {product.badges?.is_featured && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                              Featured
                            </span>
                          )}
                          {product.badges?.is_on_sale && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                              Sale
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-theme-text-primary-light dark:text-theme-text-primary-dark">
                    {product.category_id.name}
                  </td>
                  <td className="px-6 py-4 max-w-[160px] truncate whitespace-nowrap">
                    {renderPrice(product)}
                  </td>

                  {/* FIX: Use getStockDisplay which reads variantInventory for variant products */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark">
                      {stock.qty}
                    </div>
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStockBadgeColor(
                        stock.status
                      )}`}
                    >
                      {stock.status.replace(/_/g, " ")}
                    </span>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(
                        product.status
                      )}`}
                    >
                      {product.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-lg font-medium">
                    <div className="flex space-x-6">
                      <button
                        onClick={() =>
                          router.push(`/admin/products/${product._id}`)
                        }
                        className="text-green-600 hover:text-green-900"
                        title="View Product"
                      >
                        <FaEye />
                      </button>
                      <button
                        onClick={() =>
                          router.push(`/admin/products/${product._id}/edit`)
                        }
                        className="text-blue-600 hover:text-blue-900"
                        title="Edit Product"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() =>
                          router.push(`/admin/products/${product._id}/variants`)
                        }
                        className="text-purple-600 hover:text-purple-900"
                        title="Manage Variants"
                      >
                        <FaCog />
                      </button>
                      <button
                        onClick={() => onDelete(product._id)}
                        className="text-theme-error hover:text-red-500"
                        title="Delete Product"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {products.length === 0 && (
        <div className="text-center py-12 text-theme-text-muted-light dark:text-theme-text-muted-dark">
          No products found. Click "Add Product" to create your first product.
        </div>
      )}

      {pagination.totalPages > 1 && (
        <div className="px-6 py-4 flex items-center justify-between border-t border-theme-border-light dark:border-theme-border-dark">
          <div className="text-sm text-theme-text-muted-light dark:text-theme-text-muted-dark">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
            {pagination.total} products
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-3 py-1 border border-theme-border-light dark:border-theme-border-dark rounded disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className="px-3 py-1 border border-theme-border-light dark:border-theme-border-dark rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}