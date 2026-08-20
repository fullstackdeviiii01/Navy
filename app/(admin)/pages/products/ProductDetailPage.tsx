// app/(admin)/pages/products/ProductDetailPage.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaEdit, FaCog, FaArrowLeft } from "react-icons/fa";
import { productsApi } from "../../../../lib/api/products";
import Loader from "../../../components/shared/Loader";
import JoditHtmlContent from "../../../components/shared/JoditHtmlContent";
import { formatPrice } from "../../../../lib/utils/formatPrice";

interface ProductDetailPageProps {
  productId: string;
}

export default function ProductDetailPage({
  productId,
}: ProductDetailPageProps) {
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
      <div className="relative h-64">
        <Loader />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <p className="text-theme-text-muted-light dark:text-theme-text-muted-dark">
          Product not found
        </p>
      </div>
    );
  }

  const isVariableProduct = product.hasVariants && product.variants?.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/admin/products")}
            className="text-theme-text-muted-light hover:text-theme-text-primary-light"
          >
            <FaArrowLeft size={20} />
          </button>
          <h2 className="text-2xl font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
            Product Details
          </h2>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => router.push(`/admin/products/${productId}/edit`)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FaEdit />
            Edit Product
          </button>
          {isVariableProduct && (
            <button
              onClick={() => router.push(`/admin/products/${productId}/variants`)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <FaCog />
              Manage Variants
            </button>
          )}
        </div>
      </div>

      {/* Product Images */}
      {product.images && product.images.length > 0 && (
        <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg p-6 border border-theme-border-light dark:border-theme-border-dark">
          <h3 className="text-lg font-semibold mb-4 text-theme-text-primary-light dark:text-theme-text-primary-dark">
            Images
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {product.images.map((img: any, index: number) => (
              <div key={index} className="relative">
                <img
                  src={img.url}
                  alt={img.alt_text || product.name}
                  className="w-full h-48 object-cover rounded-lg border border-theme-border-light dark:border-theme-border-dark"
                />
                {img.is_primary && (
                  <span className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                    Primary
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Basic Information */}
      <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg p-6 border border-theme-border-light dark:border-theme-border-dark">
        <h3 className="text-lg font-semibold mb-4 text-theme-text-primary-light dark:text-theme-text-primary-dark">
          Basic Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium text-theme-text-muted-light dark:text-theme-text-muted-dark">
              Name
            </label>
            <p className="mt-1 text-theme-text-primary-light dark:text-theme-text-primary-dark font-medium">
              {product.name}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-theme-text-muted-light dark:text-theme-text-muted-dark">
              Brand
            </label>
            <p className="mt-1 text-theme-text-primary-light dark:text-theme-text-primary-dark">
              {product.brand || "N/A"}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-theme-text-muted-light dark:text-theme-text-muted-dark">
              Category
            </label>
            <p className="mt-1 text-theme-text-primary-light dark:text-theme-text-primary-dark">
              {product.category_id?.name || "N/A"}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-theme-text-muted-light dark:text-theme-text-muted-dark">
              Status
            </label>
            <p className="mt-1">
              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                {product.status}
              </span>
            </p>
          </div>
        </div>

        {product.description && (
          <div className="mt-4 pt-4 border-t border-theme-border-light dark:border-theme-border-dark">
            <label className="text-sm font-medium text-theme-text-muted-light dark:text-theme-text-muted-dark">
              Description
            </label>
            <div className="mt-2">
              <JoditHtmlContent content={product.description} />
            </div>
          </div>
        )}
      </div>

      {/* Pricing */}
      <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg p-6 border border-theme-border-light dark:border-theme-border-dark">
        <h3 className="text-lg font-semibold mb-4 text-theme-text-primary-light dark:text-theme-text-primary-dark">
          Pricing
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {isVariableProduct && product.variantPricing ? (
            <div>
              <label className="text-sm font-medium text-theme-text-muted-light dark:text-theme-text-muted-dark">
                Variant Price Range
              </label>
              <p className="mt-1 text-xl font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                {formatPrice(product.variantPricing.minPrice)}
                {product.variantPricing.priceVaries && ` – ${formatPrice(product.variantPricing.maxPrice)}`}
              </p>
            </div>
          ) : (
            <div>
              <label className="text-sm font-medium text-theme-text-muted-light dark:text-theme-text-muted-dark">
                Price
              </label>
              <p className="mt-1 text-xl font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                {formatPrice(product.pricing?.price || 0)}
              </p>
            </div>
          )}
          {product.pricing?.compare_at_price && !isVariableProduct && (
            <div>
              <label className="text-sm font-medium text-theme-text-muted-light dark:text-theme-text-muted-dark">
                Compare at Price
              </label>
              <p className="mt-1 text-xl font-semibold text-theme-text-muted-light dark:text-theme-text-muted-dark line-through">
                {formatPrice(product.pricing.compare_at_price)}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Inventory & Variants */}
      <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg p-6 border border-theme-border-light dark:border-theme-border-dark">
        <h3 className="text-lg font-semibold mb-4 text-theme-text-primary-light dark:text-theme-text-primary-dark">
          Inventory {isVariableProduct ? "& Variants" : ""}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="text-sm font-medium text-theme-text-muted-light dark:text-theme-text-muted-dark">
              SKU
            </label>
            <p className="mt-1 font-mono text-theme-text-primary-light dark:text-theme-text-primary-dark">
              {product.inventory?.sku}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-theme-text-muted-light dark:text-theme-text-muted-dark">
              {isVariableProduct ? "Total Variant Stock" : "Stock Quantity"}
            </label>
            <p className="mt-1 text-theme-text-primary-light dark:text-theme-text-primary-dark">
              {isVariableProduct
                ? product.variantInventory?.totalStock ?? product.inventory?.stock_quantity
                : product.inventory?.stock_quantity}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-theme-text-muted-light dark:text-theme-text-muted-dark">
              Stock Status
            </label>
            <p className="mt-1">
              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                {product.inventory?.stock_status}
              </span>
            </p>
          </div>
        </div>

        {isVariableProduct && (
          <div className="mt-6 pt-4 border-t border-theme-border-light dark:border-theme-border-dark">
            <h4 className="text-sm font-semibold mb-2 text-theme-text-primary-light dark:text-theme-text-primary-dark">
              Configured Options ({product.variants?.length || 0} Variants)
            </h4>
            <div className="flex flex-wrap gap-2">
              {product.variantOptions?.map((opt: any, idx: number) => (
                <div key={idx} className="bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-lg text-xs">
                  <span className="font-semibold text-gray-700 dark:text-gray-300">{opt.name}: </span>
                  <span className="text-gray-600 dark:text-gray-400">{opt.values?.join(", ")}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Care Guide, Shipping Info, Return Info */}
      {(product.care_guide || product.shipping_info || product.return_info) && (
        <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg p-6 border border-theme-border-light dark:border-theme-border-dark space-y-4">
          <h3 className="text-lg font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
            Additional Information
          </h3>
          {product.care_guide && (
            <div>
              <label className="text-xs font-semibold uppercase text-theme-text-muted-light dark:text-theme-text-muted-dark">
                Care Guide
              </label>
              <p className="mt-1 text-sm text-theme-text-primary-light dark:text-theme-text-primary-dark whitespace-pre-wrap">
                {product.care_guide}
              </p>
            </div>
          )}
          {product.shipping_info && (
            <div>
              <label className="text-xs font-semibold uppercase text-theme-text-muted-light dark:text-theme-text-muted-dark">
                Shipping Information
              </label>
              <p className="mt-1 text-sm text-theme-text-primary-light dark:text-theme-text-primary-dark whitespace-pre-wrap">
                {product.shipping_info}
              </p>
            </div>
          )}
          {product.return_info && (
            <div>
              <label className="text-xs font-semibold uppercase text-theme-text-muted-light dark:text-theme-text-muted-dark">
                Return Information
              </label>
              <p className="mt-1 text-sm text-theme-text-primary-light dark:text-theme-text-primary-dark whitespace-pre-wrap">
                {product.return_info}
              </p>
            </div>
          )}
        </div>
      )}

      {/* SEO */}
      {product.seo && (
        <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg p-6 border border-theme-border-light dark:border-theme-border-dark">
          <h3 className="text-lg font-semibold mb-4 text-theme-text-primary-light dark:text-theme-text-primary-dark">
            SEO Information
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-theme-text-muted-light dark:text-theme-text-muted-dark">
                Slug
              </label>
              <p className="mt-1 font-mono text-sm text-theme-text-primary-light dark:text-theme-text-primary-dark">
                {product.seo.slug}
              </p>
            </div>
            {product.seo.meta_title && (
              <div>
                <label className="text-sm font-medium text-theme-text-muted-light dark:text-theme-text-muted-dark">
                  Meta Title
                </label>
                <p className="mt-1 text-theme-text-primary-light dark:text-theme-text-primary-dark break-words">
                  {product.seo.meta_title}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
