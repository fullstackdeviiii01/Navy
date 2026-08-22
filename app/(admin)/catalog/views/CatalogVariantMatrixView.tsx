// app/(admin)/catalog/views/CatalogVariantMatrixView.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaArrowLeft } from "react-icons/fa";
import { productsApi } from "../../../../lib/api/products";
import VariantMatrixPanel from "../components/matrix/VariantMatrixPanel";
import Loader from "../../../components/shared/Loader";

interface CatalogVariantMatrixViewProps {
  productId: string;
}

export default function CatalogVariantMatrixView({
  productId,
}: CatalogVariantMatrixViewProps) {
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const data = await productsApi.getById(productId);
      setProduct(data.product);
    } catch (error) {
      console.error("Failed to fetch product:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[350px] flex items-center justify-center bg-theme-surface-light dark:bg-theme-surface-dark rounded-xl border border-theme-border-light dark:border-theme-border-dark p-12">
        <Loader />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-16 bg-theme-surface-light dark:bg-theme-surface-dark rounded-xl border border-theme-border-light dark:border-theme-border-dark p-8">
        <p className="text-sm text-theme-text-muted-light dark:text-theme-text-muted-dark">
          Product not found or has been removed.
        </p>
        <button
          onClick={() => router.push("/admin/products")}
          className="mt-4 px-4 py-2 text-xs font-semibold bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900 rounded-lg shadow-xs"
        >
          Return to Catalog
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-theme-border-light/80 dark:border-theme-border-dark/80">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push(`/admin/products/${productId}`)}
            className="p-2.5 rounded-lg border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-secondary-light dark:text-theme-text-secondary-dark hover:text-theme-text-primary-light hover:border-theme-hover-light transition-colors"
            title="Back to Product Details"
          >
            <FaArrowLeft className="w-3.5 h-3.5" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-serif font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark tracking-tight">
              Variant Matrix Studio
            </h1>
            <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark mt-0.5">
              Managing permutations and specifications for: <strong className="text-theme-text-primary-light dark:text-theme-text-primary-dark">{product.name}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => router.push(`/admin/products/${productId}`)}
            className="px-4 py-2 text-xs font-semibold text-theme-text-secondary-light dark:text-theme-text-secondary-dark border border-theme-border-light dark:border-theme-border-dark rounded-lg hover:bg-theme-card-light transition-colors"
          >
            Done
          </button>
        </div>
      </div>

      {/* Variant Matrix Panel */}
      <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-xl border border-theme-border-light dark:border-theme-border-dark p-4 sm:p-6">
        <VariantMatrixPanel
          productId={productId}
          hasVariants={product.hasVariants || false}
          onToggleVariants={(enabled) => {
            setProduct((prev: any) => ({ ...prev, hasVariants: enabled }));
          }}
        />
      </div>
    </div>
  );
}
