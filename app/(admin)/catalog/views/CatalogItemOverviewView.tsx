// app/(admin)/catalog/views/CatalogItemOverviewView.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FaEdit,
  FaCog,
  FaArrowLeft,
  FaExternalLinkAlt,
  FaBoxes,
  FaLayerGroup,
  FaTag,
  FaMoneyBillWave,
  FaVideo,
  FaPlay,
} from "react-icons/fa";
import { productsApi } from "../../../../lib/api/products";
import Loader from "../../../components/shared/Loader";
import JoditHtmlContent from "../../../components/shared/JoditHtmlContent";
import { formatPrice } from "../../../../lib/utils/formatPrice";
import {
  getPrimaryProductImage,
  getAllProductImages,
  getAllProductMedia,
  getColorImagesMap,
} from "../../../../lib/utils/productImageUtils";

interface CatalogItemOverviewViewProps {
  productId: string;
}

export default function CatalogItemOverviewView({
  productId,
}: CatalogItemOverviewViewProps) {
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
          Product not found or has been deleted.
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

  const isVariableProduct = product.hasVariants && product.variants?.length > 0;
  const colorOpt = product.variantOptions?.find(
    (opt: any) => opt.name === "color" || opt.displayName?.toLowerCase() === "color"
  );
  const totalStock = isVariableProduct
    ? product.variantInventory?.totalStock ?? product.inventory?.stock_quantity ?? 0
    : product.inventory?.stock_quantity ?? 0;

  return (
    <div className="space-y-6 pb-16">
      {/* Executive Command Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-theme-border-light/80 dark:border-theme-border-dark/80">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/admin/products")}
            className="p-2.5 rounded-lg border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-secondary-light dark:text-theme-text-secondary-dark hover:text-theme-text-primary-light hover:border-theme-hover-light transition-colors"
            title="Back to Catalog"
          >
            <FaArrowLeft className="w-3.5 h-3.5" />
          </button>
          <div className="w-14 h-14 rounded-xl border border-theme-border-light dark:border-theme-border-dark overflow-hidden bg-black/5 shrink-0 relative shadow-xs">
            <img
              src={getPrimaryProductImage(product)}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-serif font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark tracking-tight">
                {product.name}
              </h1>
              <span
                className={`inline-flex px-2 py-0.5 text-[10px] uppercase font-bold rounded-full ${
                  product.status === "active"
                    ? "bg-green-100 dark:bg-green-950/60 text-green-800 dark:text-green-300"
                    : product.status === "draft"
                      ? "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                }`}
              >
                {product.status}
              </span>
            </div>
            <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark mt-0.5 flex items-center gap-2">
              <span className="capitalize">{product.category_id?.name || "Uncategorized"}</span>
            </p>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          {/* View on Live Storefront */}
          {product.seo?.slug && (
            <Link
              href={`/products/${product.seo.slug}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-theme-border-light dark:border-theme-border-dark hover:border-theme-hover-light dark:hover:border-theme-hover-dark text-xs font-semibold rounded-lg text-theme-text-primary-light dark:text-theme-text-primary-dark transition-colors"
            >
              <FaExternalLinkAlt className="w-3 h-3" />
              <span>Storefront View</span>
            </Link>
          )}

          {/* Edit Product */}
          <Link
            href={`/admin/products/${productId}/edit`}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900 text-xs font-semibold rounded-lg shadow-xs hover:shadow active:scale-[0.99] transition-all"
          >
            <FaEdit className="w-3 h-3" />
            <span>Edit Product</span>
          </Link>

          {/* Manage Variants */}
          {isVariableProduct && (
            <button
              type="button"
              onClick={() => router.push(`/admin/products/${productId}/variants`)}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
            >
              <FaCog className="w-3 h-3" />
              <span>Configure Variants</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Metric Overview Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Pricing Metric */}
        <div className="p-4 rounded-xl border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase font-mono tracking-wider font-semibold text-theme-text-muted-light dark:text-theme-text-muted-dark">
              {isVariableProduct ? "Variant Price Range" : "Selling Price"}
            </span>
            <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600">
              <FaMoneyBillWave className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-xl font-bold font-serif text-theme-text-primary-light dark:text-theme-text-primary-dark">
            {isVariableProduct && product.variantPricing
              ? `${formatPrice(product.variantPricing.minPrice)}${
                  product.variantPricing.priceVaries
                    ? ` – ${formatPrice(product.variantPricing.maxPrice)}`
                    : ""
                }`
              : formatPrice(product.pricing?.price || 0)}
          </p>
          <p className="text-[11px] text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
            PKR Currency
          </p>
        </div>

        {/* Stock Level */}
        <div className="p-4 rounded-xl border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase font-mono tracking-wider font-semibold text-theme-text-muted-light dark:text-theme-text-muted-dark">
              Inventory Units
            </span>
            <div className="p-1.5 rounded-lg bg-green-50 dark:bg-green-950/40 text-green-600">
              <FaBoxes className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-xl font-bold font-serif text-theme-text-primary-light dark:text-theme-text-primary-dark">
            {totalStock}
          </p>
          <p className="text-[11px] text-green-700 dark:text-green-400 font-medium">
            {totalStock > 10 ? "Optimal Stock Level" : totalStock > 0 ? "Low Stock Warning" : "Out of Stock"}
          </p>
        </div>

        {/* Variants Count */}
        <div className="p-4 rounded-xl border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase font-mono tracking-wider font-semibold text-theme-text-muted-light dark:text-theme-text-muted-dark">
              Model Structure
            </span>
            <div className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600">
              <FaLayerGroup className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-xl font-bold font-serif text-theme-text-primary-light dark:text-theme-text-primary-dark">
            {isVariableProduct ? `${product.variants?.length || 0} Variants` : "Simple"}
          </p>
          <p className="text-[11px] text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
            {isVariableProduct ? "Multi-attribute variant matrix" : "Single catalog item"}
          </p>
        </div>

        {/* Category & Brand */}
        <div className="p-4 rounded-xl border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase font-mono tracking-wider font-semibold text-theme-text-muted-light dark:text-theme-text-muted-dark">
              Collection Line
            </span>
            <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600">
              <FaTag className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-base font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark truncate mt-1">
            {product.category_id?.name || "Unassigned"}
          </p>
          <p className="text-[11px] text-theme-text-secondary-light dark:text-theme-text-secondary-dark truncate">
            {product.brand || "Rehan Lamps"}
          </p>
        </div>
      </div>

      {/* Media & Finish Palette Gallery */}
      <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-xl border border-theme-border-light dark:border-theme-border-dark p-4 sm:p-6 space-y-5">
        {(() => {
          const allMedia = getAllProductMedia(product);
          const photoCount = allMedia.filter((m) => m.type === "image").length;
          const videoCount = allMedia.filter((m) => m.type === "video").length;

          return (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-theme-border-light/80 dark:border-theme-border-dark/80 pb-3">
                <div>
                  <h3 className="text-base font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                    Visual Media & Color Finishes
                  </h3>
                  <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark mt-0.5">
                    Unified gallery of general product photography, showreels, and finish-specific media.
                  </p>
                </div>
                <span className="text-xs font-mono text-theme-text-muted-light bg-theme-bg-light/80 dark:bg-theme-bg-dark/60 px-2.5 py-1 rounded-lg border border-theme-border-light dark:border-theme-border-dark self-start sm:self-auto">
                  {photoCount} Photos • {videoCount} Videos ({allMedia.length} Total)
                </span>
              </div>

              {/* All Product Media Unified Showcase */}
              {allMedia.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-theme-border-light dark:border-theme-border-dark rounded-xl bg-black/[0.02]">
                  <p className="text-xs text-theme-text-muted-light italic">
                    No images or videos uploaded yet.
                  </p>
                  <button
                    type="button"
                    onClick={() => router.push(`/admin/products/${productId}/edit`)}
                    className="mt-2 text-xs font-semibold text-theme-hover-light dark:text-theme-hover-dark hover:underline"
                  >
                    Upload media in editor →
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <span className="text-xs uppercase font-semibold text-theme-text-secondary-light dark:text-theme-text-secondary-dark tracking-wider block">
                    All Active Media Assets ({allMedia.length})
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {allMedia.map((item, idx) => (
                      <div
                        key={idx}
                        className={`relative group rounded-xl overflow-hidden border aspect-square ${
                          item.type === "video"
                            ? "border-purple-500/80 bg-black/10"
                            : "border-theme-border-light dark:border-theme-border-dark bg-black/5"
                        }`}
                      >
                        {item.type === "image" ? (
                          <img
                            src={item.url}
                            alt={item.alt_text || product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <>
                            <video
                              src={item.url}
                              className="w-full h-full object-cover"
                              muted
                              loop
                              onMouseEnter={(e) => e.currentTarget.play()}
                              onMouseLeave={(e) => {
                                e.currentTarget.pause();
                                e.currentTarget.currentTime = 0;
                              }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none group-hover:opacity-0 transition-opacity">
                              <div className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-xs flex items-center justify-center text-white">
                                <FaPlay className="ml-0.5" size={10} />
                              </div>
                            </div>
                          </>
                        )}

                        <div className="absolute top-2 left-2 flex flex-col gap-1 pointer-events-none">
                          {item.is_primary && (
                            <span className="bg-blue-600 text-white text-[8px] uppercase font-bold px-1.5 py-0.5 rounded shadow">
                              Primary
                            </span>
                          )}
                          {item.type === "video" && (
                            <span className="bg-purple-600 text-white text-[8px] uppercase font-bold px-1.5 py-0.5 rounded shadow flex items-center gap-1">
                              <FaVideo size={8} /> Video
                            </span>
                          )}
                          {item.colorName && (
                            <span className="bg-purple-800/90 text-white text-[8px] font-semibold px-1.5 py-0.5 rounded shadow backdrop-blur-xs">
                              {item.colorName}
                            </span>
                          )}
                          {item.source === "general" && !item.is_primary && item.type === "image" && (
                            <span className="bg-black/60 text-white text-[8px] uppercase font-semibold px-1.5 py-0.5 rounded shadow">
                              General
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          );
        })()}

        {/* Color-Specific Photo & Video Palette */}
        {colorOpt && colorOpt.values?.length > 0 && (
          <div className="space-y-3 pt-2">
            <span className="text-xs uppercase font-semibold text-theme-text-secondary-light dark:text-theme-text-secondary-dark tracking-wider block">
              Color & Material Finishes
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {colorOpt.values.map((val: string, cIdx: number) => {
                const rawHex = colorOpt.colorHexCodes || {};
                const hex =
                  (typeof rawHex.get === "function" ? rawHex.get(val) : rawHex[val]) ||
                  "#5D4037";
                const rawImgs = colorOpt.colorImages || {};
                let imgs: string[] =
                  (typeof rawImgs.get === "function" ? rawImgs.get(val) : rawImgs[val]) || [];

                if (imgs.length === 0 && product.variants) {
                  const vMatch = product.variants.find((v: any) =>
                    v.attributes?.some((a: any) => a.name === "color" && a.value === val)
                  );
                  if (vMatch?.imageUrl) imgs = [vMatch.imageUrl];
                }

                const rawVids = colorOpt.colorVideos || {};
                const vids: string[] =
                  (typeof rawVids.get === "function" ? rawVids.get(val) : rawVids[val]) || [];

                const hasMedia = imgs.length > 0 || vids.length > 0;

                return (
                  <div
                    key={cIdx}
                    className="p-3.5 rounded-xl border border-theme-border-light dark:border-theme-border-dark bg-theme-bg-light/60 dark:bg-theme-bg-dark/40 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                          {val}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-theme-text-muted-light">
                        {imgs.length} Photos
                      </span>
                    </div>

                    {hasMedia ? (
                      <div className="flex flex-wrap gap-2">
                        {/* Images */}
                        {imgs.map((cImg, iIdx) => (
                          <div
                            key={`img-${iIdx}`}
                            className="w-14 h-14 rounded-lg border border-theme-border-light dark:border-theme-border-dark overflow-hidden bg-black/5"
                          >
                            <img
                              src={cImg}
                              alt={`${val} photo ${iIdx + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}

                        {/* Videos */}
                        {vids.map((cVid, vIdx) => (
                          <div
                            key={`vid-${vIdx}`}
                            className="relative group w-14 h-14 rounded-lg border border-purple-500/80 overflow-hidden bg-black/10"
                          >
                            <video
                              src={cVid}
                              className="w-full h-full object-cover"
                              muted
                              loop
                              onMouseEnter={(e) => e.currentTarget.play()}
                              onMouseLeave={(e) => {
                                e.currentTarget.pause();
                                e.currentTarget.currentTime = 0;
                              }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none group-hover:opacity-0 transition-opacity">
                              <FaPlay className="text-white text-[10px]" />
                            </div>
                            <span className="absolute top-0.5 left-0.5 bg-purple-600 text-white text-[7px] uppercase font-bold px-1 rounded">
                              Video
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[11px] text-theme-text-muted-light italic">
                        No finish media uploaded
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Editorial Description & Details */}
      <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-xl border border-theme-border-light dark:border-theme-border-dark p-4 sm:p-6 space-y-4">
        <div className="border-b border-theme-border-light/80 dark:border-theme-border-dark/80 pb-3">
          <h3 className="text-base font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
            Editorial Description & Care Details
          </h3>
        </div>

        {product.description ? (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <JoditHtmlContent content={product.description} />
          </div>
        ) : (
          <p className="text-xs text-theme-text-muted-light italic">No description provided.</p>
        )}

        {(product.care_guide || product.shipping_info || product.return_info) && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-theme-border-light/80 dark:border-theme-border-dark/80">
            {product.care_guide && (
              <div className="space-y-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-theme-text-secondary-light dark:text-theme-text-secondary-dark block">
                  Care Guide
                </span>
                <p className="text-xs text-theme-text-primary-light dark:text-theme-text-primary-dark whitespace-pre-wrap">
                  {product.care_guide}
                </p>
              </div>
            )}
            {product.shipping_info && (
              <div className="space-y-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-theme-text-secondary-light dark:text-theme-text-secondary-dark block">
                  Shipping Info
                </span>
                <p className="text-xs text-theme-text-primary-light dark:text-theme-text-primary-dark whitespace-pre-wrap">
                  {product.shipping_info}
                </p>
              </div>
            )}
            {product.return_info && (
              <div className="space-y-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-theme-text-secondary-light dark:text-theme-text-secondary-dark block">
                  Return Info
                </span>
                <p className="text-xs text-theme-text-primary-light dark:text-theme-text-primary-dark whitespace-pre-wrap">
                  {product.return_info}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Full Variant Combination Matrix */}
      {isVariableProduct && (
        <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-xl border border-theme-border-light dark:border-theme-border-dark p-4 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-theme-border-light/80 dark:border-theme-border-dark/80 pb-3">
            <div>
              <h3 className="text-base font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                Variant Combination Matrix ({product.variants?.length || 0} Combinations)
              </h3>
              <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark mt-0.5">
                Every generated specification permutation with custom pricing, stock, and live availability.
              </p>
            </div>
            <button
              type="button"
              onClick={() => router.push(`/admin/products/${productId}/variants`)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              <FaCog className="w-3 h-3" />
              <span>Configure Matrix</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-theme-card-light/60 dark:bg-theme-card-dark/40 text-[11px] uppercase tracking-wider text-theme-text-secondary-light dark:text-theme-text-secondary-dark font-semibold border-b border-theme-border-light dark:border-theme-border-dark">
                  <th className="py-2.5 px-3 w-16">Photo</th>
                  <th className="py-2.5 px-3">Attributes & Finish</th>
                  <th className="py-2.5 px-3">Price</th>
                  <th className="py-2.5 px-3">Stock</th>
                  <th className="py-2.5 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-theme-border-light/60 dark:divide-theme-border-dark/60">
                {product.variants.map((v: any, index: number) => {
                  const colorAttr = v.attributes?.find((a: any) => a.name === "color");
                  const rawImgs = colorOpt?.colorImages || {};
                  const colorImg = colorAttr
                    ? typeof rawImgs.get === "function"
                      ? rawImgs.get(colorAttr.value)?.[0]
                      : rawImgs[colorAttr.value]?.[0]
                    : undefined;
                  const displayImg = v.imageUrl || colorImg || getPrimaryProductImage(product);

                  const rawHex = colorOpt?.colorHexCodes || {};
                  const hex = colorAttr
                    ? typeof rawHex.get === "function"
                      ? rawHex.get(colorAttr.value)
                      : rawHex[colorAttr.value]
                    : undefined;

                  return (
                    <tr
                      key={v._id || index}
                      className="hover:bg-theme-card-light/30 dark:hover:bg-theme-card-dark/20 transition-colors"
                    >
                      <td className="py-2 px-3">
                        <div className="w-10 h-10 rounded-lg border border-theme-border-light dark:border-theme-border-light/40 overflow-hidden bg-black/5">
                          {displayImg ? (
                            <img src={displayImg} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[8px] text-theme-text-muted-light">
                              None
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-2 px-3">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {v.attributes?.map((attr: any, aIdx: number) => (
                            <span
                              key={aIdx}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark text-[11px]"
                            >
                              <span className="text-theme-text-muted-light capitalize">
                                {attr.name}:
                              </span>
                              <span className="font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                                {attr.value}
                              </span>
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-2 px-3 font-semibold">
                        {formatPrice(v.price)}
                        {v.compareAtPrice && v.compareAtPrice > v.price && (
                          <span className="block text-[10px] text-theme-text-muted-light line-through font-normal">
                            {formatPrice(v.compareAtPrice)}
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-3">
                        <span
                          className={`font-semibold ${
                            v.stockQuantity > 0 ? "text-theme-text-primary-light" : "text-red-500"
                          }`}
                        >
                          {v.stockQuantity} units
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right">
                        <span
                          className={`inline-flex px-2 py-0.5 text-[10px] font-semibold rounded-full ${
                            v.isAvailable !== false && v.stockQuantity > 0
                              ? "bg-green-100 dark:bg-green-950/60 text-green-800 dark:text-green-300"
                              : "bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300"
                          }`}
                        >
                          {v.isAvailable !== false && v.stockQuantity > 0 ? "In Stock" : "Unavailable"}
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
    </div>
  );
}
