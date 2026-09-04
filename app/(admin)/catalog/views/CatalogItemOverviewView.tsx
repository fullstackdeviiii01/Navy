// app/(admin)/catalog/views/CatalogItemOverviewView.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Edit3,
  ExternalLink,
  SlidersHorizontal,
  Package,
  Layers,
  Tag,
  Banknote,
  Sparkles,
  Play,
  Video,
  Sliders,
} from "lucide-react";
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

  const specEntries = useMemo(() => {
    if (!product?.attributes || typeof product.attributes !== "object") return [];
    const raw = typeof (product.attributes as any).entries === "function" 
      ? Array.from((product.attributes as any).entries()) 
      : Object.entries(product.attributes);
    return raw.filter(
      ([_, val]: any) => val !== null && val !== undefined && String(val).trim().length > 0
    );
  }, [product?.attributes]);

  if (loading) {
    return (
      <div className="min-h-[350px] flex items-center justify-center bg-theme-surface-light dark:bg-theme-surface-dark border border-theme-border-light dark:border-theme-border-dark p-12">
        <Loader />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-16 bg-theme-surface-light dark:bg-theme-surface-dark border border-theme-border-light dark:border-theme-border-dark p-8">
        <p className="text-sm text-theme-text-muted-light dark:text-theme-text-muted-dark">
          Product not found or has been deleted.
        </p>
        <button
          onClick={() => router.push("/admin/products")}
          className="mt-4 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900 transition-colors shadow-xs"
        >
          Return to Catalog
        </button>
      </div>
    );
  }

  const isVariableProduct =
    product?.hasVariants ||
    (product?.variantOptions && product.variantOptions.length > 0);

  const colorOpt = product?.variantOptions?.find(
    (opt: any) => opt.name?.toLowerCase() === "color" || opt.displayName?.toLowerCase() === "color"
  );
  const totalStock = isVariableProduct
    ? product.variantInventory?.totalStock ?? product.inventory?.stock_quantity ?? 0
    : product.inventory?.stock_quantity ?? 0;

  const primaryImgUrl = getPrimaryProductImage(product);

  return (
    <div className="space-y-6 pb-16">
      {/* Top Action & Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Back Link */}
        <button
          type="button"
          onClick={() => router.push("/admin/products")}
          className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-medium text-theme-text-muted-light dark:text-theme-text-muted-dark hover:text-theme-hover-light dark:hover:text-theme-hover-dark transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Products Catalog</span>
        </button>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* View on Live Storefront */}
          {product._id && (
            <Link
              href={`/product/${product._id}`}
              target="_blank"
              className="inline-flex items-center justify-center gap-2 px-3.5 py-2 border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark hover:border-theme-hover-light text-theme-text-primary-light dark:text-theme-text-primary-dark text-xs uppercase tracking-[0.15em] font-medium transition-colors shadow-2xs"
            >
              <ExternalLink className="w-3.5 h-3.5 text-theme-hover-light dark:text-theme-hover-dark" />
              <span>Storefront View</span>
            </Link>
          )}

          {/* Manage Variants */}
          {isVariableProduct && (
            <Link
              href={`/admin/products/${productId}/variants`}
              className="inline-flex items-center justify-center gap-2 px-3.5 py-2 border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark hover:border-theme-hover-light text-theme-text-primary-light dark:text-theme-text-primary-dark text-xs uppercase tracking-[0.15em] font-medium transition-colors shadow-2xs"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-theme-hover-light dark:text-theme-hover-dark" />
              <span>Configure Variants</span>
            </Link>
          )}

          {/* Edit Product */}
          <Link
            href={`/admin/products/${productId}/edit`}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 text-white dark:text-neutral-900 text-xs uppercase tracking-[0.18em] font-medium transition-colors shadow-sm"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Product</span>
          </Link>
        </div>
      </div>

      {/* Spacious Product Banner Card */}
      <div className="bg-theme-surface-light dark:bg-theme-surface-dark border border-theme-border-light dark:border-theme-border-dark p-5 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-6">
          {/* Thumbnail */}
          <div className="relative aspect-square w-20 h-20 sm:w-24 sm:h-24 bg-theme-card-light dark:bg-theme-card-dark border border-theme-border-light dark:border-theme-border-dark overflow-hidden shrink-0 shadow-2xs">
            {primaryImgUrl ? (
              <img
                src={primaryImgUrl}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[9px] uppercase tracking-wider text-theme-text-muted-light">
                No Image
              </div>
            )}
          </div>

          {/* Details & Title */}
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-[11px] font-mono uppercase tracking-[0.22em] text-theme-hover-light dark:text-theme-hover-dark font-semibold">
                {product.category_id?.name || "Uncategorized"}
              </span>
              
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-wider font-semibold border ${
                  product.status === "active"
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300"
                    : product.status === "draft"
                      ? "border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300"
                      : "border-neutral-500/30 bg-neutral-500/10 text-neutral-700 dark:text-neutral-300"
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${product.status === "active" ? "bg-emerald-500" : "bg-amber-500"}`} />
                <span>{product.status}</span>
              </span>

              {product.is_most_loved && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[9.5px] font-mono font-bold uppercase tracking-wider bg-[#C59345]/15 border border-[#C59345]/40 text-[#A8752B] dark:text-[#E5B568] rounded-xs">
                  ★ Most Loved
                </span>
              )}
              {product.is_premium && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[9.5px] font-mono font-bold uppercase tracking-wider bg-[#8E6533]/15 border border-[#8E6533]/40 text-[#8E6533] dark:text-[#E5C189] rounded-xs">
                  ◆ Premium
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-sans font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark tracking-tight leading-snug">
              {product.name}
            </h1>

            <div className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark font-mono flex flex-wrap items-center gap-x-3 gap-y-1">
              <span>Brand: <strong className="text-theme-text-primary-light dark:text-theme-text-primary-dark font-semibold">{product.brand || "Talal Wooden Lamps"}</strong></span>
              <span className="text-theme-text-muted-light">•</span>
              <span>SKU: <strong className="text-theme-text-primary-light dark:text-theme-text-primary-dark font-semibold">{product.sku || product.inventory?.sku || (isVariableProduct ? "Variant Managed" : "—")}</strong></span>
              <span className="text-theme-text-muted-light">•</span>
              <span>Structure: <strong className="text-theme-text-primary-light dark:text-theme-text-primary-dark font-semibold">{isVariableProduct ? `${product.variants?.length || 0} Product Variants` : "Single Model Piece"}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Metric Overview Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Pricing Metric */}
        <div className="p-4 sm:p-5 border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] uppercase font-mono tracking-[0.18em] text-theme-text-muted-light dark:text-theme-text-muted-dark font-medium">
              {isVariableProduct ? "Variant Range" : "Selling Price"}
            </span>
            <Banknote className="w-4 h-4 text-theme-hover-light dark:text-theme-hover-dark" />
          </div>
          <p className="text-lg sm:text-xl font-sans font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark">
            {isVariableProduct && product.variantPricing
              ? `${formatPrice(product.variantPricing.minPrice)}${
                  product.variantPricing.priceVaries
                    ? ` – ${formatPrice(product.variantPricing.maxPrice)}`
                    : ""
                }`
              : formatPrice(product.pricing?.price || 0)}
          </p>
          <p className="text-[11px] text-theme-text-secondary-light dark:text-theme-text-secondary-dark font-mono">
            PKR Currency
          </p>
        </div>

        {/* Stock Level */}
        <div className="p-4 sm:p-5 border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] uppercase font-mono tracking-[0.18em] text-theme-text-muted-light dark:text-theme-text-muted-dark font-medium">
              Inventory Units
            </span>
            <Package className="w-4 h-4 text-theme-hover-light dark:text-theme-hover-dark" />
          </div>
          <p className="text-lg sm:text-xl font-sans font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark">
            {totalStock} Available
          </p>
          <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-mono font-medium">
            {totalStock > 10 ? "Optimal Stock Level" : totalStock > 0 ? "Low Stock Warning" : "Out of Stock"}
          </p>
        </div>

        {/* Variants Count */}
        <div className="p-4 sm:p-5 border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] uppercase font-mono tracking-[0.18em] text-theme-text-muted-light dark:text-theme-text-muted-dark font-medium">
              Model Structure
            </span>
            <Layers className="w-4 h-4 text-theme-hover-light dark:text-theme-hover-dark" />
          </div>
          <p className="text-lg sm:text-xl font-sans font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark">
            {isVariableProduct ? `${product.variants?.length || 0} Variants` : "Simple Piece"}
          </p>
          <p className="text-[11px] text-theme-text-secondary-light dark:text-theme-text-secondary-dark font-mono">
            {isVariableProduct ? "Multi-attribute options" : "Single catalog item"}
          </p>
        </div>

        {/* Category & Brand */}
        <div className="p-4 sm:p-5 border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] uppercase font-mono tracking-[0.18em] text-theme-text-muted-light dark:text-theme-text-muted-dark font-medium">
              Collection Line
            </span>
            <Tag className="w-4 h-4 text-theme-hover-light dark:text-theme-hover-dark" />
          </div>
          <p className="text-base sm:text-lg font-sans font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark truncate">
            {product.category_id?.name || "Unassigned"}
          </p>
          <p className="text-[11px] text-theme-text-secondary-light dark:text-theme-text-secondary-dark font-mono truncate">
            {product.brand || "Talal Wooden Lamps"}
          </p>
        </div>
      </div>

      {/* Media & Finish Palette Gallery */}
      <div className="bg-theme-surface-light dark:bg-theme-surface-dark border border-theme-border-light dark:border-theme-border-dark p-4 sm:p-6 space-y-5 shadow-xs">
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
                <span className="text-xs text-theme-text-muted-light bg-theme-bg-light/80 dark:bg-theme-bg-dark/60 px-2.5 py-1 rounded-lg border border-theme-border-light dark:border-theme-border-dark self-start sm:self-auto">
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
                        className={`relative group overflow-hidden border aspect-square ${
                          item.type === "video"
                            ? "border-theme-border-light dark:border-theme-border-dark bg-black/10"
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
                              <div className="w-8 h-8 rounded-full bg-black/70 backdrop-blur-xs flex items-center justify-center text-white">
                                <Play className="ml-0.5 w-3.5 h-3.5 fill-current" />
                              </div>
                            </div>
                          </>
                        )}

                        <div className="absolute top-2 left-2 flex flex-col gap-1 pointer-events-none">
                          {item.is_primary && (
                            <span className="bg-neutral-900 text-white text-[8px] uppercase font-mono font-bold px-1.5 py-0.5 shadow-sm">
                              Primary
                            </span>
                          )}
                          {item.type === "video" && (
                            <span className="bg-neutral-900 text-white text-[8px] uppercase font-mono font-bold px-1.5 py-0.5 shadow-sm flex items-center gap-1">
                              <Video className="w-2.5 h-2.5" /> Video
                            </span>
                          )}
                          {item.colorName && (
                            <span className="bg-neutral-800 text-white text-[8px] font-mono px-1.5 py-0.5 shadow-sm backdrop-blur-xs">
                              {item.colorName}
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
            <span className="text-xs uppercase font-mono font-semibold text-theme-text-secondary-light dark:text-theme-text-secondary-dark tracking-wider block">
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
                    className="p-3.5 border border-theme-border-light dark:border-theme-border-dark bg-theme-bg-light/60 dark:bg-theme-bg-dark/40 space-y-2.5 shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                          {val}
                        </span>
                      </div>
                      <span className="text-[10px] text-theme-text-muted-light font-mono">
                        {imgs.length} Photos
                      </span>
                    </div>

                    {hasMedia ? (
                      <div className="flex flex-wrap gap-2">
                        {/* Images */}
                        {imgs.map((cImg, iIdx) => (
                          <div
                            key={`img-${iIdx}`}
                            className="w-14 h-14 border border-theme-border-light dark:border-theme-border-dark overflow-hidden bg-black/5"
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
                            className="relative group w-14 h-14 border border-theme-border-light dark:border-theme-border-dark overflow-hidden bg-black/10"
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
                              <Play className="text-white w-3 h-3 fill-current" />
                            </div>
                            <span className="absolute top-0.5 left-0.5 bg-neutral-900 text-white text-[7px] uppercase font-mono font-bold px-1">
                              Video
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[11px] text-theme-text-muted-light italic font-mono">
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
      <div className="bg-theme-surface-light dark:bg-theme-surface-dark border border-theme-border-light dark:border-theme-border-dark p-4 sm:p-6 space-y-4 shadow-xs">
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

      {/* Technical Specifications & Craftsmanship Attributes */}
      {specEntries.length > 0 && (
        <div className="bg-theme-surface-light dark:bg-theme-surface-dark border border-theme-border-light dark:border-theme-border-dark p-4 sm:p-6 space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-theme-border-light/80 dark:border-theme-border-dark/80 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-3.5 h-3.5 text-theme-hover-light dark:text-theme-hover-dark" />
                <h3 className="text-base font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                  Technical Specifications & Attributes ({specEntries.length})
                </h3>
              </div>
              <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark mt-0.5">
                Technical parameters displayed in the customer storefront specifications table.
              </p>
            </div>
            <Link
              href={`/admin/products/${productId}/edit`}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-neutral-900 dark:bg-neutral-100 hover:bg-neutral-800 dark:hover:bg-neutral-200 text-white dark:text-neutral-900 text-xs font-semibold uppercase tracking-wider transition-colors self-start sm:self-auto shadow-xs"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Specifications</span>
            </Link>
          </div>

          <div className="overflow-hidden border border-theme-border-light dark:border-theme-border-dark">
            <table className="w-full text-left text-xs border-collapse">
              <tbody>
                {specEntries.map(([key, val]: any, idx: number) => {
                  const label = String(key)
                    .replace(/__([^_]+)_/g, " ($1)")
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, (c: string) => c.toUpperCase())
                    .trim();

                  return (
                    <tr
                      key={key}
                      className={`border-b border-theme-border-light/60 dark:border-theme-border-dark/60 last:border-b-0 ${
                        idx % 2 === 0
                          ? "bg-theme-card-light/40 dark:bg-theme-card-dark/20"
                          : "bg-theme-surface-light dark:bg-theme-surface-dark"
                      }`}
                    >
                      <td className="py-2.5 px-4 font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark w-1/3 sm:w-1/4">
                        {label}
                      </td>
                      <td className="py-2.5 px-4 text-theme-text-secondary-light dark:text-theme-text-secondary-dark font-mono">
                        {String(val)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Full Variant Combination Matrix */}
      {isVariableProduct && (
        <div className="bg-theme-surface-light dark:bg-theme-surface-dark border border-theme-border-light dark:border-theme-border-dark p-4 sm:p-6 space-y-4 shadow-xs">
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
              className="inline-flex items-center gap-2 px-3.5 py-2 border border-theme-border-light dark:border-theme-border-dark bg-theme-bg-light dark:bg-theme-bg-dark hover:border-theme-hover-light text-theme-text-primary-light dark:text-theme-text-primary-dark text-xs uppercase tracking-wider font-semibold transition-colors shadow-2xs"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-theme-hover-light dark:text-theme-hover-dark" />
              <span>Configure Matrix</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-theme-card-light/60 dark:bg-theme-card-dark/40 text-[10px] uppercase font-mono tracking-wider text-theme-text-secondary-light dark:text-theme-text-secondary-dark font-semibold border-b border-theme-border-light dark:border-theme-border-dark">
                  <th className="py-2.5 px-3 w-16">Photo</th>
                  <th className="py-2.5 px-3">Variant SKU</th>
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

                  return (
                    <tr
                      key={v._id || index}
                      className="hover:bg-theme-card-light/30 dark:hover:bg-theme-card-dark/20 transition-colors"
                    >
                      <td className="py-2 px-3">
                        <div className="w-10 h-10 border border-theme-border-light dark:border-theme-border-dark overflow-hidden bg-black/5">
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
                        <span className="font-mono text-xs font-semibold text-[#A8752B] dark:text-[#E5B568]">
                          {v.sku || "—"}
                        </span>
                      </td>
                      <td className="py-2 px-3">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {v.attributes?.map((attr: any, aIdx: number) => (
                            <span
                              key={aIdx}
                              className="inline-flex items-center gap-1 px-2 py-0.5 border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark text-[11px] font-mono"
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
                      <td className="py-2 px-3 font-semibold font-mono">
                        {formatPrice(v.price)}
                        {v.compareAtPrice && v.compareAtPrice > v.price && (
                          <span className="block text-[10px] text-theme-text-muted-light line-through font-normal">
                            {formatPrice(v.compareAtPrice)}
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-3 font-mono">
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
                          className={`inline-flex px-2 py-0.5 text-[10px] font-mono uppercase font-semibold border ${
                            v.isAvailable !== false && v.stockQuantity > 0
                              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300"
                              : "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300"
                          }`}
                        >
                          {v.isAvailable !== false && v.stockQuantity > 0 ? "Active" : "Unavailable"}
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
