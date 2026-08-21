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

      {/* Product Media & Color Palette Gallery */}
      {(() => {
        const colorOpt = product.variantOptions?.find(
          (opt: any) => opt.name === "color" || opt.displayName?.toLowerCase() === "color"
        );
        const hasTopImages = product.images && product.images.length > 0;
        const hasColorImages = colorOpt?.colorImages && Object.keys(colorOpt.colorImages).length > 0;

        return (
          <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg p-6 border border-theme-border-light dark:border-theme-border-dark space-y-6">
            <div className="flex items-center justify-between border-b border-theme-border-light dark:border-theme-border-dark pb-3">
              <h3 className="text-lg font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                Product Media & Finishes
              </h3>
              {isVariableProduct && (
                <span className="text-xs font-mono uppercase bg-theme-primary/10 text-theme-primary px-2.5 py-1 rounded">
                  {product.variants?.length || 0} Total Variants
                </span>
              )}
            </div>

            {/* Top Product Images */}
            {hasTopImages && (
              <div>
                <h4 className="text-xs uppercase font-semibold text-theme-text-secondary-light dark:text-theme-text-secondary-dark tracking-wider mb-3">
                  General Product Images
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {product.images.map((img: any, index: number) => (
                    <div key={index} className="relative group rounded-lg overflow-hidden border border-theme-border-light dark:border-theme-border-dark bg-black/5">
                      <img
                        src={img.url}
                        alt={img.alt_text || product.name}
                        className="w-full h-32 object-cover"
                      />
                      {img.is_primary && (
                        <span className="absolute top-1.5 left-1.5 bg-blue-600 text-white text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded">
                          Primary
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Color-Specific Photo Palette */}
            {colorOpt && colorOpt.values?.length > 0 && (
              <div>
                <h4 className="text-xs uppercase font-semibold text-theme-text-secondary-light dark:text-theme-text-secondary-dark tracking-wider mb-3 flex items-center gap-2">
                  <span>Color & Finish Palette</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {colorOpt.values.map((val: string, cIdx: number) => {
                    const rawHex = colorOpt.colorHexCodes || {};
                    const hex = (typeof rawHex.get === "function" ? rawHex.get(val) : rawHex[val]) || "#5D4037";
                    const rawImgs = colorOpt.colorImages || {};
                    let imgs: string[] = (typeof rawImgs.get === "function" ? rawImgs.get(val) : rawImgs[val]) || [];

                    // Fallback to variant image
                    if (imgs.length === 0 && product.variants) {
                      const vMatch = product.variants.find((v: any) =>
                        v.attributes?.some((a: any) => a.name === "color" && a.value === val)
                      );
                      if (vMatch?.imageUrl) imgs = [vMatch.imageUrl];
                    }

                    return (
                      <div key={cIdx} className="p-3.5 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-card-light/40 dark:bg-theme-card-dark/30 space-y-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-4 h-4 rounded-full border border-black/20 shadow-sm flex-shrink-0"
                              style={{ backgroundColor: hex }}
                            />
                            <span className="text-sm font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark">
                              {val}
                            </span>
                          </div>
                          <span className="text-[11px] font-mono text-theme-text-muted-light dark:text-theme-text-muted-dark">
                            {hex}
                          </span>
                        </div>

                        {imgs.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {imgs.map((cImg, iIdx) => (
                              <div key={iIdx} className="w-16 h-16 rounded border border-theme-border-light dark:border-theme-border-dark overflow-hidden bg-black/5">
                                <img src={cImg} alt={`${val} image ${iIdx + 1}`} className="w-full h-full object-cover" />
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[11px] text-theme-text-muted-light dark:text-theme-text-muted-dark italic">
                            No color-specific images
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {!hasTopImages && !hasColorImages && (
              <p className="text-sm text-theme-text-muted-light dark:text-theme-text-muted-dark italic">
                No product media uploaded yet.
              </p>
            )}
          </div>
        );
      })()}

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
              <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${
                product.status === "active"
                  ? "bg-green-100 dark:bg-green-950/60 text-green-800 dark:text-green-300"
                  : "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300"
              }`}>
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

      {/* Inventory Summary */}
      <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg p-6 border border-theme-border-light dark:border-theme-border-dark">
        <h3 className="text-lg font-semibold mb-4 text-theme-text-primary-light dark:text-theme-text-primary-dark">
          Inventory Overview
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="text-sm font-medium text-theme-text-muted-light dark:text-theme-text-muted-dark">
              Base SKU
            </label>
            <p className="mt-1 font-mono text-theme-text-primary-light dark:text-theme-text-primary-dark">
              {product.inventory?.sku}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-theme-text-muted-light dark:text-theme-text-muted-dark">
              {isVariableProduct ? "Total Combined Stock" : "Stock Quantity"}
            </label>
            <p className="mt-1 text-theme-text-primary-light dark:text-theme-text-primary-dark font-medium">
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
              <span className="inline-flex px-2.5 py-1 text-xs font-semibold rounded-full bg-green-100 dark:bg-green-950/60 text-green-800 dark:text-green-300">
                {product.inventory?.stock_status || "in_stock"}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* FULL VARIANTS & COMBINATIONS TABLE WITH IMAGES */}
      {isVariableProduct && (
        <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg p-6 border border-theme-border-light dark:border-theme-border-dark space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-theme-border-light dark:border-theme-border-dark pb-3">
            <div>
              <h3 className="text-lg font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                Product Variants & Combinations
              </h3>
              <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
                Showing all {product.variants?.length || 0} variant matrix items with individual images, SKUs, pricing, and stock.
              </p>
            </div>
            <button
              onClick={() => router.push(`/admin/products/${productId}/variants`)}
              className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 text-white text-xs rounded hover:bg-purple-700 transition-colors"
            >
              <FaCog />
              <span>Configure Variants</span>
            </button>
          </div>

          {/* Variants Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-theme-card-light/60 dark:bg-theme-card-dark/40 text-[11px] uppercase tracking-wider text-theme-text-secondary-light dark:text-theme-text-secondary-dark border-b border-theme-border-light dark:border-theme-border-dark">
                <tr>
                  <th className="py-3 px-3">Variant Photo</th>
                  <th className="py-3 px-3">Attributes & Finish</th>
                  <th className="py-3 px-3">SKU</th>
                  <th className="py-3 px-3">Price</th>
                  <th className="py-3 px-3">Stock</th>
                  <th className="py-3 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-theme-border-light/60 dark:divide-theme-border-dark/60">
                {product.variants.map((v: any, index: number) => {
                  // Resolve variant image
                  const colorAttr = v.attributes?.find((a: any) => a.name === "color");
                  const colorOpt = product.variantOptions?.find((o: any) => o.name === "color" || o.displayName?.toLowerCase() === "color");
                  const rawImgs = colorOpt?.colorImages || {};
                  const colorImg = colorAttr ? (typeof rawImgs.get === "function" ? rawImgs.get(colorAttr.value)?.[0] : rawImgs[colorAttr.value]?.[0]) : undefined;
                  const displayImg = v.imageUrl || colorImg || product.images?.[0]?.url;

                  // Resolve color hex
                  const rawHex = colorOpt?.colorHexCodes || {};
                  const hex = colorAttr ? (typeof rawHex.get === "function" ? rawHex.get(colorAttr.value) : rawHex[colorAttr.value]) : undefined;

                  return (
                    <tr key={v._id || index} className="hover:bg-theme-card-light/30 dark:hover:bg-theme-card-dark/20 transition-colors">
                      {/* Thumbnail */}
                      <td className="py-2.5 px-3">
                        <div className="w-12 h-12 rounded border border-theme-border-light dark:border-theme-border-dark overflow-hidden bg-black/5 relative">
                          {displayImg ? (
                            <img src={displayImg} alt={`Variant ${v.sku}`} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[9px] text-theme-text-muted-light">
                              No Img
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Attributes */}
                      <td className="py-2.5 px-3">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {v.attributes?.map((attr: any, aIdx: number) => {
                            const isColor = attr.name === "color";
                            return (
                              <span
                                key={aIdx}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark text-xs"
                              >
                                {isColor && hex && (
                                  <span
                                    className="w-2.5 h-2.5 rounded-full border border-black/20 flex-shrink-0"
                                    style={{ backgroundColor: hex }}
                                  />
                                )}
                                <span className="text-theme-text-muted-light dark:text-theme-text-muted-dark capitalize">
                                  {attr.name}:
                                </span>
                                <span className="font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark">
                                  {attr.value}
                                </span>
                              </span>
                            );
                          })}
                        </div>
                      </td>

                      {/* SKU */}
                      <td className="py-2.5 px-3 font-mono text-xs text-theme-text-primary-light dark:text-theme-text-primary-dark">
                        {v.sku}
                      </td>

                      {/* Price */}
                      <td className="py-2.5 px-3 font-semibold text-xs text-theme-text-primary-light dark:text-theme-text-primary-dark">
                        {formatPrice(v.price)}
                        {v.compareAtPrice && v.compareAtPrice > v.price && (
                          <span className="block text-[10px] text-theme-text-muted-light line-through font-normal">
                            {formatPrice(v.compareAtPrice)}
                          </span>
                        )}
                      </td>

                      {/* Stock */}
                      <td className="py-2.5 px-3 text-xs">
                        <span className={`font-medium ${v.stockQuantity > 0 ? "text-theme-text-primary-light dark:text-theme-text-primary-dark" : "text-red-500 font-semibold"}`}>
                          {v.stockQuantity} in stock
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-2.5 px-3 text-right">
                        <span
                          className={`inline-flex px-2 py-0.5 text-[11px] font-semibold rounded-full ${
                            v.isAvailable !== false && v.stockQuantity > 0
                              ? "bg-green-100 dark:bg-green-950/60 text-green-800 dark:text-green-300"
                              : "bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300"
                          }`}
                        >
                          {v.isAvailable !== false && v.stockQuantity > 0 ? "Available" : "Unavailable"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

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
