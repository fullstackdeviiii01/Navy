// app/(admin)/catalog/views/CatalogDirectoryView.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { productsApi } from "../../../../lib/api/products";
import CatalogActionBar from "../components/CatalogActionBar";
import CatalogFilterToolbar from "../components/CatalogFilterToolbar";
import CatalogItemGrid from "../components/CatalogItemGrid";
import Loader from "../../../components/shared/Loader";
import { FaBoxes, FaCheckCircle, FaExclamationTriangle, FaLayerGroup } from "react-icons/fa";

interface CatalogItem {
  _id: string;
  sku?: string;
  name: string;
  description: string;
  pricing: {
    price: number;
    compare_at_price?: number;
    currency: string;
  };
  inventory: {
    sku?: string;
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

export default function CatalogDirectoryView() {
  const router = useRouter();
  const [products, setProducts] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [inStockFilter, setInStockFilter] = useState(false);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  });

  const [catalogStats, setCatalogStats] = useState({
    total: 0,
    active: 0,
    drafts: 0,
    variable: 0,
    lowStock: 0,
  });

  useEffect(() => {
    fetchProducts();
  }, [pagination.page, statusFilter, categoryFilter, inStockFilter]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await productsApi.getAll({
        page: pagination.page,
        limit: pagination.limit,
        status: statusFilter,
        category: categoryFilter !== "all" ? categoryFilter : undefined,
        inStock: inStockFilter ? true : undefined,
        search: searchTerm || undefined,
      });

      setProducts(data.products || []);
      setPagination(data.pagination || { total: 0, page: 1, limit: 20, totalPages: 0 });
      if (data.stats) {
        setCatalogStats(data.stats);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchProducts();
  };

  const handleAddProduct = () => {
    router.push("/admin/products/new");
  };

  const deleteProduct = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      await productsApi.delete(productId);
      fetchProducts();
    } catch (error) {
      console.error("Failed to delete product:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <CatalogActionBar
        onAddNewItem={handleAddProduct}
        totalCount={pagination.total}
      />

      {/* Catalog KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Catalog Items */}
        <div className="p-4 rounded-xl border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-theme-text-muted-light dark:text-theme-text-muted-dark">
              Total Catalog
            </span>
            <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
              <FaBoxes className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark">
            {catalogStats.total || pagination.total}
          </p>
          <p className="text-[11px] text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
            Registered master products
          </p>
        </div>

        {/* Active Live Items */}
        <div className="p-4 rounded-xl border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-theme-text-muted-light dark:text-theme-text-muted-dark">
              Active Storefront
            </span>
            <div className="p-1.5 rounded-lg bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400">
              <FaCheckCircle className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark">
            {catalogStats.active}
          </p>
          <p className="text-[11px] text-green-700 dark:text-green-400 font-medium">
            Live on customer catalog
          </p>
        </div>

        {/* Low / Out of Stock Attention */}
        <div className="p-4 rounded-xl border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-theme-text-muted-light dark:text-theme-text-muted-dark">
              Stock Warnings
            </span>
            <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
              <FaExclamationTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark">
            {catalogStats.lowStock}
          </p>
          <p className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">
            ≤ 10 items remaining
          </p>
        </div>

        {/* Configured Variants */}
        <div className="p-4 rounded-xl border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-theme-text-muted-light dark:text-theme-text-muted-dark">
              Variable Models
            </span>
            <div className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400">
              <FaLayerGroup className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark">
            {catalogStats.variable || catalogStats.total || pagination.total}
          </p>
          <p className="text-[11px] text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
            Multi-finish lamp designs
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <CatalogFilterToolbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusChange={(val) => {
          setStatusFilter(val);
          setPagination((prev) => ({ ...prev, page: 1 }));
        }}
        categoryFilter={categoryFilter}
        onCategoryChange={(val) => {
          setCategoryFilter(val);
          setPagination((prev) => ({ ...prev, page: 1 }));
        }}
        inStockFilter={inStockFilter}
        onInStockChange={(val) => {
          setInStockFilter(val);
          setPagination((prev) => ({ ...prev, page: 1 }));
        }}
        onSearch={handleSearch}
      />

      {/* Loading or Data Table */}
      {loading ? (
        <div className="relative h-64 bg-theme-surface-light dark:bg-theme-surface-dark rounded-xl border border-theme-border-light dark:border-theme-border-dark flex items-center justify-center">
          <Loader />
        </div>
      ) : (
        <CatalogItemGrid
          products={products}
          onDeleteItem={deleteProduct}
          pagination={pagination}
          onPageChange={(page) => setPagination((prev) => ({ ...prev, page }))}
        />
      )}
    </div>
  );
}
