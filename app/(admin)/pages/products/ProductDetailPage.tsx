// app/(admin)/pages/products/ProductDetailPage.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaEdit, FaCog, FaArrowLeft } from "react-icons/fa";
import { productsApi } from "../../../../lib/api/products";
import Loader from "../../../components/shared/Loader";
import JoditHtmlContent from "../../../components/shared/JoditHtmlContent";

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
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <FaEdit />
            Edit Product
          </button>
          <button
            onClick={() => router.push(`/admin/products/${productId}/variants`)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <FaCog />
            Manage Variants
          </button>
        </div>
      </div>

      {/* Product Images */}
      {product.images && product.images.length > 0 && (
        <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg p-6">
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
      <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 text-theme-text-primary-light dark:text-theme-text-primary-dark">
          Basic Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium text-theme-text-muted-light dark:text-theme-text-muted-dark">
              Name
            </label>
            <p className="mt-1 text-theme-text-primary-light dark:text-theme-text-primary-dark">
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

        {product.short_description && (
          <div className="mt-4">
            <label className="text-sm font-medium text-theme-text-muted-light dark:text-theme-text-muted-dark">
              Short Description
            </label>
            <p className="mt-1 text-theme-text-primary-light dark:text-theme-text-primary-dark break-words">
              {product.short_description}
            </p>
          </div>
        )}

        {product.description && (
          <div className="mt-4">
            <label className="text-sm font-medium text-theme-text-muted-light dark:text-theme-text-muted-dark">
              Description
            </label>
            <div className="mt-1">
              <JoditHtmlContent content={product.description} />
            </div>
          </div>
        )}

        {product.tags && product.tags.length > 0 && (
          <div className="mt-4">
            <label className="text-sm font-medium text-theme-text-muted-light dark:text-theme-text-muted-dark">
              Tags
            </label>
            <div className="mt-1 flex flex-wrap gap-2">
              {product.tags.map((tag: string, index: number) => (
                <span
                  key={index}
                  className="inline-flex px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Pricing */}
      <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 text-theme-text-primary-light dark:text-theme-text-primary-dark">
          Pricing
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="text-sm font-medium text-theme-text-muted-light dark:text-theme-text-muted-dark">
              Price
            </label>
            <p className="mt-1 text-xl font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
              {product.pricing?.currency} {product.pricing?.price?.toFixed(2)}
            </p>
          </div>
          {product.pricing?.compare_at_price && (
            <div>
              <label className="text-sm font-medium text-theme-text-muted-light dark:text-theme-text-muted-dark">
                Compare at Price
              </label>
              <p className="mt-1 text-xl font-semibold text-theme-text-muted-light dark:text-theme-text-muted-dark line-through">
                {product.pricing?.currency}{" "}
                {product.pricing?.compare_at_price?.toFixed(2)}
              </p>
            </div>
          )}
          {product.unit_of_measure && (
            <div>
              <label className="text-sm font-medium text-theme-text-muted-light dark:text-theme-text-muted-dark">
                Unit of Measure
              </label>
              <p className="mt-1 text-theme-text-primary-light dark:text-theme-text-primary-dark">
                {product.unit_of_measure}
              </p>
            </div>
          )}
          {product.stripe_tax_code && (
            <div>
              <label className="text-sm font-medium text-theme-text-muted-light dark:text-theme-text-muted-dark">
                Stripe Tax Code
              </label>
              <p className="mt-1 font-mono text-sm text-theme-text-primary-light dark:text-theme-text-primary-dark">
                {product.stripe_tax_code}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Inventory */}
      <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 text-theme-text-primary-light dark:text-theme-text-primary-dark">
          Inventory
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
              Stock Quantity
            </label>
            <p className="mt-1 text-theme-text-primary-light dark:text-theme-text-primary-dark">
              {product.inventory?.stock_quantity}
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
      </div>

      {/* Attributes */}
      {product.attributes && Object.keys(product.attributes).length > 0 && (
        <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-theme-text-primary-light dark:text-theme-text-primary-dark">
            Attributes
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(product.attributes).map(([key, value]) => (
              <div key={key}>
                <label className="text-sm font-medium text-theme-text-muted-light dark:text-theme-text-muted-dark">
                  {key}
                </label>
                <p className="mt-1 text-theme-text-primary-light dark:text-theme-text-primary-dark">
                  {Array.isArray(value) ? value.join(", ") : String(value)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Badges */}
      {product.badges && (
        <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-theme-text-primary-light dark:text-theme-text-primary-dark">
            Badges
          </h3>
          <div className="flex flex-wrap gap-2">
            {product.badges.is_featured && (
              <span className="inline-flex px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                Featured
              </span>
            )}
            {product.badges.is_bestseller && (
              <span className="inline-flex px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                Bestseller
              </span>
            )}
            {product.badges.is_on_sale && (
              <span className="inline-flex px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                On Sale
              </span>
            )}
            {product.badges.is_trending && (
              <span className="inline-flex px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                Trending
              </span>
            )}
          </div>
        </div>
      )}

      {/* SEO */}
      {product.seo && (
        <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg p-6">
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
            {product.seo.meta_description && (
              <div>
                <label className="text-sm font-medium text-theme-text-muted-light dark:text-theme-text-muted-dark">
                  Meta Description
                </label>
                <p className="mt-1 text-theme-text-primary-light dark:text-theme-text-primary-dark break-words">
                  {product.seo.meta_description}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
