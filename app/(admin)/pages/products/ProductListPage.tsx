// ============================================
// 1. app/(admin)/pages/products/ProductListPage.tsx
// ============================================
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { productsApi } from "../../../../lib/api/products";
import ProductHeader from "../../components/products/ProductHeader";
import ProductFilters from "../../components/products/ProductFilters";
import ProductTable from "../../components/products/ProductTable";
import Loader from "../../../components/shared/Loader";

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
}

export default function ProductListPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  });

  useEffect(() => {
    fetchProducts();
  }, [pagination.page, statusFilter]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await productsApi.getAll({
        page: pagination.page,
        limit: pagination.limit,
        status: statusFilter,
        search: searchTerm || undefined,
      });

      setProducts(data.products);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPagination({ ...pagination, page: 1 });
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

 if (loading) {
  return (
    <div className="relative h-64">
      <Loader />
    </div>
  );
}

  return (
    <div className="space-y-6">
      <ProductHeader
        onAddProduct={handleAddProduct}
      />

      <ProductFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        onSearch={handleSearch}
      />

      <ProductTable
        products={products}
        onDelete={deleteProduct}
        pagination={pagination}
        onPageChange={(page) => setPagination({ ...pagination, page })}
      />

    </div>
  );
}