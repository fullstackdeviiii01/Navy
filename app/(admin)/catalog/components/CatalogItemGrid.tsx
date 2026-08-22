// app/(admin)/catalog/components/CatalogItemGrid.tsx
"use client";

import { FaEdit, FaTrash, FaEye, FaCog, FaBoxes, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { formatPrice } from "../../../../lib/utils/formatPrice";

interface CatalogItem {
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
  category_id?: {
    _id: string;
    name: string;
    slug: string;
  };
  status: string;
  images: any[];
  created_at: string;
  hasVariants?: boolean;
  variantOptions?: any[];
  variants?: any[];
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

interface CatalogItemGridProps {
  products: CatalogItem[];
  onDeleteItem: (productId: string) => void;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  onPageChange: (page: number) => void;
}

export default function CatalogItemGrid({
  products,
  onDeleteItem,
  pagination,
  onPageChange,
}: CatalogItemGridProps) {
  const router = useRouter();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-green-100 dark:bg-green-950/60 text-green-800 dark:text-green-300">
            Active
          </span>
        );
      case "draft":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
            Draft
          </span>
        );
      case "archived":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
            Archived
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-700">
            {status}
          </span>
        );
    }
  };

  const getStockDisplay = (product: CatalogItem): { qty: number; statusText: string; statusClass: string } => {
    let qty = 0;
    if (product.hasVariants && product.variantInventory) {
      qty = product.variantInventory.totalStock ?? 0;
    } else {
      qty = product.inventory?.stock_quantity ?? 0;
    }

    if (qty === 0) {
      return {
        qty: 0,
        statusText: "Out of Stock",
        statusClass: "bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300",
      };
    }
    if (qty <= 10) {
      return {
        qty,
        statusText: "Low Stock",
        statusClass: "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300",
      };
    }
    return {
      qty,
      statusText: "In Stock",
      statusClass: "bg-green-100 dark:bg-green-950/60 text-green-800 dark:text-green-300",
    };
  };

  const resolveProductImage = (product: CatalogItem): string => {
    if (product.images && product.images.length > 0 && product.images[0]?.url) {
      return product.images[0].url;
    }
    const colorOpt = product.variantOptions?.find(
      (opt: any) => opt.name === "color" || opt.displayName?.toLowerCase() === "color"
    );
    if (colorOpt?.colorImages) {
      for (const key of Object.keys(colorOpt.colorImages)) {
        const imgs = colorOpt.colorImages[key];
        if (imgs && imgs.length > 0) return imgs[0];
      }
    }
    if (product.variants && product.variants.length > 0) {
      const vWithImg = product.variants.find((v) => v.imageUrl);
      if (vWithImg?.imageUrl) return vWithImg.imageUrl;
    }
    return "https://placehold.co/100x100?text=No+Photo";
  };

  if (!products || products.length === 0) {
    return (
      <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-xl border border-theme-border-light dark:border-theme-border-dark p-12 text-center">
        <div className="w-12 h-12 rounded-full bg-theme-hover-light/10 text-theme-hover-light dark:text-theme-hover-dark flex items-center justify-center mx-auto mb-3">
          <FaBoxes className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
          No products found
        </h3>
        <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark max-w-sm mx-auto mt-1 mb-4">
          Try adjusting your search criteria, category, or status filter.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Desktop & Tablet Table View */}
      <div className="hidden md:block bg-theme-surface-light dark:bg-theme-surface-dark rounded-xl border border-theme-border-light dark:border-theme-border-dark overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-theme-card-light/60 dark:bg-theme-card-dark/40 border-b border-theme-border-light dark:border-theme-border-dark text-[11px] uppercase tracking-wider text-theme-text-secondary-light dark:text-theme-text-secondary-dark font-semibold">
                <th className="py-3 px-4 w-16">Item</th>
                <th className="py-3 px-4">Title & Details</th>
                <th className="py-3 px-4">SKU & Category</th>
                <th className="py-3 px-4">Pricing</th>
                <th className="py-3 px-4">Inventory</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-theme-border-light/60 dark:divide-theme-border-dark/60 text-xs">
              {products.map((product) => {
                const imgUrl = resolveProductImage(product);
                const stock = getStockDisplay(product);
                const isVariable = product.hasVariants && (product.variants?.length || 0) > 0;
                const colorOpt = product.variantOptions?.find(
                  (opt: any) => opt.name === "color" || opt.displayName?.toLowerCase() === "color"
                );

                return (
                  <tr
                    key={product._id}
                    className="hover:bg-theme-card-light/40 dark:hover:bg-theme-card-dark/30 transition-colors group"
                  >
                    {/* Thumbnail */}
                    <td className="py-3 px-4">
                      <div className="w-12 h-12 rounded-lg border border-theme-border-light dark:border-theme-border-light/40 overflow-hidden bg-black/5 shrink-0 relative">
                        <img
                          src={imgUrl}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    </td>

                    {/* Product Name & Color Swatches */}
                    <td className="py-3 px-4 min-w-[200px]">
                      <button
                        onClick={() => router.push(`/admin/products/${product._id}`)}
                        className="text-left font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark hover:text-theme-hover-light dark:hover:text-theme-hover-dark transition-colors line-clamp-1 block"
                      >
                        {product.name}
                      </button>

                      {/* Color dots preview */}
                      {colorOpt && colorOpt.values && colorOpt.values.length > 0 && (
                        <div className="flex items-center gap-1 mt-1">
                          {colorOpt.values.slice(0, 5).map((cVal: string, cIdx: number) => {
                            const rawHex = colorOpt.colorHexCodes || {};
                            const hex = (typeof rawHex.get === "function" ? rawHex.get(cVal) : rawHex[cVal]) || "#5D4037";
                            return (
                              <span
                                key={cIdx}
                                className="w-2.5 h-2.5 rounded-full border border-black/20 shrink-0"
                                style={{ backgroundColor: hex }}
                                title={cVal}
                              />
                            );
                          })}
                          {colorOpt.values.length > 5 && (
                            <span className="text-[10px] text-theme-text-muted-light font-mono">
                              +{colorOpt.values.length - 5}
                            </span>
                          )}
                        </div>
                      )}
                    </td>

                    {/* SKU & Category */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-mono text-[11px] text-theme-text-secondary-light dark:text-theme-text-secondary-dark block">
                        {product.inventory?.sku || "N/A"}
                      </span>
                      <span className="text-[10px] font-medium text-theme-text-muted-light dark:text-theme-text-muted-dark capitalize">
                        {product.category_id?.name || "Uncategorized"}
                      </span>
                    </td>

                    {/* Pricing */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {isVariable && product.variantPricing ? (
                        <div>
                          <span className="font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                            {formatPrice(product.variantPricing.minPrice)}
                            {product.variantPricing.priceVaries && ` – ${formatPrice(product.variantPricing.maxPrice)}`}
                          </span>
                          <span className="block text-[10px] text-theme-hover-light dark:text-theme-hover-dark font-mono">
                            {product.variants?.length} Variant SKUs
                          </span>
                        </div>
                      ) : (
                        <div>
                          <span className="font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                            {formatPrice(product.pricing?.price || 0)}
                          </span>
                          {product.pricing?.compare_at_price && product.pricing.compare_at_price > product.pricing.price && (
                            <span className="block text-[10px] text-theme-text-muted-light line-through font-normal">
                              {formatPrice(product.pricing.compare_at_price)}
                            </span>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Stock */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${stock.statusClass}`}>
                        {stock.qty} units ({stock.statusText})
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {getStatusBadge(product.status)}
                    </td>

                    {/* Actions Toolbar */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        {/* View */}
                        <button
                          type="button"
                          onClick={() => router.push(`/admin/products/${product._id}`)}
                          className="p-1.5 text-theme-text-muted-light hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded transition-colors"
                          title="View Product"
                        >
                          <FaEye className="w-3.5 h-3.5" />
                        </button>

                        {/* Edit */}
                        <button
                          type="button"
                          onClick={() => router.push(`/admin/products/${product._id}/edit`)}
                          className="p-1.5 text-theme-text-muted-light hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded transition-colors"
                          title="Edit Product"
                        >
                          <FaEdit className="w-3.5 h-3.5" />
                        </button>

                        {/* Manage Variants */}
                        {isVariable && (
                          <button
                            type="button"
                            onClick={() => router.push(`/admin/products/${product._id}/variants`)}
                            className="p-1.5 text-theme-text-muted-light hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40 rounded transition-colors"
                            title="Manage Variants"
                          >
                            <FaCog className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() => onDeleteItem(product._id)}
                          className="p-1.5 text-theme-text-muted-light hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded transition-colors"
                          title="Delete Product"
                        >
                          <FaTrash className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {products.map((product) => {
          const imgUrl = resolveProductImage(product);
          const stock = getStockDisplay(product);
          const isVariable = product.hasVariants && (product.variants?.length || 0) > 0;

          return (
            <div
              key={product._id}
              className="bg-theme-surface-light dark:bg-theme-surface-dark p-4 rounded-xl border border-theme-border-light dark:border-theme-border-dark space-y-3"
            >
              <div className="flex items-start gap-3">
                <div className="w-16 h-16 rounded-lg border border-theme-border-light dark:border-theme-border-dark overflow-hidden bg-black/5 shrink-0">
                  <img src={imgUrl} alt={product.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[10px] text-theme-text-muted-light">
                      {product.inventory?.sku || "N/A"}
                    </span>
                    {getStatusBadge(product.status)}
                  </div>
                  <h4
                    onClick={() => router.push(`/admin/products/${product._id}`)}
                    className="text-sm font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark truncate mt-0.5 cursor-pointer"
                  >
                    {product.name}
                  </h4>
                  <p className="text-xs text-theme-text-muted-light">
                    {product.category_id?.name || "Uncategorized"}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-theme-border-light/60 dark:border-theme-border-dark/60 text-xs">
                <div>
                  <span className="font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                    {isVariable && product.variantPricing
                      ? formatPrice(product.variantPricing.minPrice)
                      : formatPrice(product.pricing?.price || 0)}
                  </span>
                  {isVariable && (
                    <span className="text-[10px] text-theme-hover-light ml-1 font-mono">
                      ({product.variants?.length} variants)
                    </span>
                  )}
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${stock.statusClass}`}>
                  {stock.qty} in stock
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-theme-border-light/60 dark:border-theme-border-dark/60">
                <button
                  type="button"
                  onClick={() => router.push(`/admin/products/${product._id}`)}
                  className="px-2.5 py-1 text-xs border border-theme-border-light rounded bg-theme-bg-light text-theme-text-secondary-light flex items-center gap-1"
                >
                  <FaEye size={11} />
                  <span>View</span>
                </button>
                <button
                  type="button"
                  onClick={() => router.push(`/admin/products/${product._id}/edit`)}
                  className="px-2.5 py-1 text-xs border border-amber-300 rounded bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 flex items-center gap-1"
                >
                  <FaEdit size={11} />
                  <span>Edit</span>
                </button>
                {isVariable && (
                  <button
                    type="button"
                    onClick={() => router.push(`/admin/products/${product._id}/variants`)}
                    className="px-2.5 py-1 text-xs border border-purple-300 rounded bg-purple-50 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300 flex items-center gap-1"
                  >
                    <FaCog size={11} />
                    <span>Variants</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onDeleteItem(product._id)}
                  className="px-2.5 py-1 text-xs border border-red-300 rounded bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 flex items-center gap-1"
                >
                  <FaTrash size={11} />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination Footer */}
      {pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-theme-surface-light dark:bg-theme-surface-dark p-3.5 sm:p-4 rounded-xl border border-theme-border-light dark:border-theme-border-dark text-xs">
          <span className="text-theme-text-muted-light dark:text-theme-text-muted-dark">
            Showing Page <strong className="text-theme-text-primary-light dark:text-theme-text-primary-dark">{pagination.page}</strong> of{" "}
            <strong className="text-theme-text-primary-light dark:text-theme-text-primary-dark">{pagination.totalPages}</strong> ({pagination.total} total items)
          </span>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="px-3 py-1.5 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-secondary-light disabled:opacity-40 disabled:cursor-not-allowed hover:border-theme-primary transition-colors inline-flex items-center gap-1"
            >
              <FaChevronLeft className="w-2.5 h-2.5" />
              <span>Previous</span>
            </button>

            {/* Page number buttons */}
            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              let pageNum = i + 1;
              if (pagination.totalPages > 5 && pagination.page > 3) {
                pageNum = pagination.page - 2 + i;
                if (pageNum > pagination.totalPages) pageNum = pagination.totalPages - (4 - i);
              }
              const isCurrent = pageNum === pagination.page;

              return (
                <button
                  type="button"
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  className={`w-7 h-7 rounded-lg text-xs font-semibold transition-colors ${
                    isCurrent
                      ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900"
                      : "border border-theme-border-light dark:border-theme-border-dark bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-secondary-light hover:border-theme-hover-light"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="px-3 py-1.5 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-secondary-light disabled:opacity-40 disabled:cursor-not-allowed hover:border-theme-primary transition-colors inline-flex items-center gap-1"
            >
              <span>Next</span>
              <FaChevronRight className="w-2.5 h-2.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
