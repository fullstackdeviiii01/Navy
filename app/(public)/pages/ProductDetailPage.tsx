// app/(public)/pages/ProductDetailPage.tsx
"use client";

import { useState, useEffect } from "react";
import { productsApi } from "../../../lib/api/products";
import ProductInfo from "../../components/product-detail/ProductInfo";
import ProductQuantity from "../../components/product-detail/ProductQuantity";
import AddToCartButton from "../../components/product-detail/AddToCartButton";
import ProductTabs from "../../components/product-detail/ProductTabs";
import ProductReviewSection from "../../components/product-detail/ProductReviewSection";
import RelatedProducts from "../../components/product-detail/RelatedProducts";
import ProductBreadcrumb from "../../components/product-detail/ProductBreadcrumb";
import Loader from "../../components/shared/Loader";
import ProductMediaCarousel from "../../components/product/ProductMediaCarousel";
import ProductVariantSelector from "../../components/product-detail/ProductVariantSelector";
import { formatPrice } from "../../../lib/utils/formatPrice";

interface Props {
  productId: string;
}

interface ProductVariant {
  _id?: string;
  sku?: string;
  attributes: Array<{ name: string; value: string }>;
  price: number;
  compareAtPrice?: number;
  costPerItem?: number;
  stockQuantity: number;
  lowStockThreshold?: number;
  weight?: number;
  weightUnit?: "kg" | "lb" | "g" | "oz";
  barcode?: string;
  imageUrl?: string;
  isAvailable: boolean;
  position: number;
}

export default function ProductDetailPageContent({ productId }: Props) {
  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  useEffect(() => {
    if (product) {
      fetchRelatedProducts();
    }
  }, [product]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const data = await productsApi.getById(productId);
      setProduct(data.product);
    } catch (error) {
      console.error("Failed to fetch product:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedProducts = async () => {
    try {
      if (product?.category_id?._id) {
        const data = await productsApi.getByCategory(product.category_id._id);
        const filtered = data.products
          .filter((p: any) => p._id !== product._id)
          .slice(0, 8);
        setRelatedProducts(filtered);
      }
    } catch (error) {
      console.error("Failed to fetch related products:", error);
    }
  };

  const handleVariantSelection = (
    selection: any,
    variant: ProductVariant | null,
    previewImg?: string
  ) => {
    setSelectedAttributes(selection || {});
    setSelectedVariant(variant);
    if (previewImg) {
      setPreviewImageUrl(previewImg);
    } else if (variant?.imageUrl) {
      setPreviewImageUrl(variant.imageUrl);
    }
  };

  if (loading) {
    return (
      <div
        className="relative h-36 sm:h-44"
        role="status"
        aria-live="polite"
        aria-label="Loading product details"
      >
        <Loader />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[50vh] bg-theme-bg-light dark:bg-theme-bg-dark flex items-center justify-center p-4">
        <div
          className="text-center max-w-md"
          role="alert"
          aria-live="assertive"
        >
          <h1 className="text-xl sm:text-2xl font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark mb-1">
            Product Not Found
          </h1>
          <p className="text-xs sm:text-sm text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
            The product you're looking for doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Products", href: "/products" },
    {
      label: product.category_id?.name || "Category",
      href: `/products?category=${product.category_id?._id}`,
    },
    { label: product.name },
  ];

  const isVariableProduct =
    product.hasVariants && product.variants && product.variants.length > 0;
  const isOutOfStock = isVariableProduct
    ? false
    : product.inventory?.stock_status === "out_of_stock";

  const currentPrice = selectedVariant?.price || product.pricing?.price || 0;

  const currentStock = isVariableProduct
    ? (product.variants as ProductVariant[]).reduce(
        (sum, v) => sum + (v.stockQuantity || 0),
        0
      )
    : product.inventory?.stock_quantity || 0;

  const totalPrice = currentPrice * quantity;
  const variantOutOfStock = selectedVariant ? selectedVariant.stockQuantity === 0 : false;

  return (
    <div className="min-h-screen bg-theme-bg-light dark:bg-theme-bg-dark pb-6 sm:pb-8 overflow-x-hidden w-full">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-1 w-full overflow-hidden">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb navigation" className="mb-1 w-full max-w-full overflow-hidden">
          <ProductBreadcrumb items={breadcrumbItems} />
        </nav>

        {/* 2-column grid: images left, info right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 w-full">
          {/* LEFT COLUMN: Product media + Desktop tabs */}
          <div className="flex flex-col gap-2 sm:gap-3 min-w-0 max-w-full overflow-hidden">
            <section aria-label={`${product.name} product media gallery`}>
              {(() => {
                const activePreviewUrl = selectedVariant?.imageUrl || previewImageUrl || undefined;

                // Collect all finish/variant images from all variant options
                const allColorImages: string[] = [];
                if (Array.isArray(product.variantOptions)) {
                  product.variantOptions.forEach((opt: any) => {
                    if (opt.colorImages) {
                      let colorMap = opt.colorImages;
                      if (colorMap instanceof Map) colorMap = Object.fromEntries(colorMap);
                      if (typeof colorMap === "object" && colorMap !== null) {
                        Object.values(colorMap).forEach((val: any) => {
                          if (Array.isArray(val)) {
                            val.forEach((url) => {
                              if (url && typeof url === "string" && !allColorImages.includes(url)) {
                                allColorImages.push(url);
                              }
                            });
                          } else if (val && typeof val === "string" && !allColorImages.includes(val)) {
                            allColorImages.push(val);
                          }
                        });
                      }
                    }
                  });
                }

                // Also check variants for images
                if (product.variants && Array.isArray(product.variants)) {
                  product.variants.forEach((v: any) => {
                    if (v.imageUrl && !allColorImages.includes(v.imageUrl)) {
                      allColorImages.push(v.imageUrl);
                    }
                  });
                }

                // Build complete deduplicated media list
                const mediaItems: Array<{ type: "image" | "video"; url: string; alt_text?: string; thumbnail?: string }> = [];
                const seenUrls = new Set<string>();

                // 1. If an active color/variant image is chosen, put it first
                if (activePreviewUrl) {
                  mediaItems.push({
                    type: "image",
                    url: activePreviewUrl,
                    alt_text: `${product.name} selected finish`,
                  });
                  seenUrls.add(activePreviewUrl);
                }

                // 2. Top-level product images (if user added them)
                (product.images || []).forEach((img: any) => {
                  if (img.url && !seenUrls.has(img.url)) {
                    mediaItems.push({
                      type: "image",
                      url: img.url,
                      alt_text: img.alt_text || `${product.name} product photo`,
                    });
                    seenUrls.add(img.url);
                  }
                });

                // 3. All color/variant finish photos
                allColorImages.forEach((cUrl) => {
                  if (cUrl && !seenUrls.has(cUrl)) {
                    mediaItems.push({
                      type: "image",
                      url: cUrl,
                      alt_text: `${product.name} finish photo`,
                    });
                    seenUrls.add(cUrl);
                  }
                });

                // Collect all finish videos from all variant options
                const allColorVideos: string[] = [];
                if (Array.isArray(product.variantOptions)) {
                  product.variantOptions.forEach((opt: any) => {
                    if (opt.colorVideos) {
                      let videoMap = opt.colorVideos;
                      if (videoMap instanceof Map) videoMap = Object.fromEntries(videoMap);
                      if (typeof videoMap === "object" && videoMap !== null) {
                        Object.values(videoMap).forEach((val: any) => {
                          if (Array.isArray(val)) {
                            val.forEach((url) => {
                              if (url && typeof url === "string" && !allColorVideos.includes(url)) {
                                allColorVideos.push(url);
                              }
                            });
                          } else if (val && typeof val === "string" && !allColorVideos.includes(val)) {
                            allColorVideos.push(val);
                          }
                        });
                      }
                    }
                  });
                }

                // 4. Product showreel videos
                (product.videos || []).forEach((video: any) => {
                  if (video.url && !seenUrls.has(video.url)) {
                    mediaItems.push({
                      type: "video",
                      url: video.url,
                      thumbnail: video.thumbnail,
                    });
                    seenUrls.add(video.url);
                  }
                });

                // 5. Color finish videos
                allColorVideos.forEach((cVid) => {
                  if (cVid && !seenUrls.has(cVid)) {
                    mediaItems.push({
                      type: "video",
                      url: cVid,
                    });
                    seenUrls.add(cVid);
                  }
                });

                return (
                  <ProductMediaCarousel
                    media={mediaItems}
                    productName={product.name}
                    autoPlay={false}
                    showThumbnails={true}
                    variant="detail"
                    activeVariantImageUrl={activePreviewUrl}
                  />
                );
              })()}
            </section>

            {/* Desktop tabs (Description, Shipping, Care, Returns) */}
            <section
              className="hidden lg:block"
              aria-label="Product details"
            >
              <ProductTabs
                productId={product._id}
                description={product.description}
                careGuide={product.care_guide}
                shippingInfo={product.shipping_info}
                returnInfo={product.return_info}
              />
            </section>
          </div>

          {/* RIGHT COLUMN: Info + actions (Natural Free Flow) */}
          <div className="min-w-0 max-w-full">
            <div className="flex flex-col gap-2 sm:gap-2.5">
              
              {/* Product Info (Title, Category, Main Price) */}
              <section aria-label={`${product.name} product information`}>
                <ProductInfo product={product} selectedVariant={selectedVariant} />
              </section>

              {/* Variant selector */}
              {isVariableProduct && (
                <div className="py-1.5 border-b border-theme-border-light dark:border-theme-border-dark">
                  <ProductVariantSelector
                    variants={product.variants || []}
                    variantAttributes={product.variantOptions || []}
                    onSelectionChange={handleVariantSelection}
                    selectedVariant={selectedVariant}
                  />
                </div>
              )}

              {/* Main action block: Quantity + Total Price + Add to Cart */}
              <div className="space-y-2 pt-0.5">
                {/* Quantity + total price */}
                {(!isVariableProduct || selectedVariant) && (
                  <div
                    className="space-y-1.5"
                    role="region"
                    aria-label="Quantity and pricing"
                  >
                    <ProductQuantity
                      quantity={quantity}
                      onQuantityChange={setQuantity}
                    />
                    <div className="flex items-baseline justify-between pt-1.5 border-t border-theme-border-light/60 dark:border-theme-border-dark/60 text-xs">
                      <span className="text-[11px] uppercase tracking-[0.18em] font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
                        Total Price:
                      </span>
                      <span
                        className="text-base sm:text-lg font-serif text-theme-text-primary-light dark:text-theme-text-primary-dark font-medium"
                        aria-label={`Total price: ${formatPrice(totalPrice)}`}
                      >
                        {formatPrice(totalPrice)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Add to Cart button */}
                <div
                  className="pt-0.5"
                  role="region"
                  aria-label="Product actions"
                >
                  {isVariableProduct && !selectedVariant ? (
                    <div className="text-center p-2.5 border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark">
                      <p className="text-[11px] uppercase tracking-[0.15em] font-medium text-theme-hover-light dark:text-theme-hover-dark">
                        Please select your options above
                      </p>
                    </div>
                  ) : (
                    <AddToCartButton
                      productId={product._id}
                      quantity={quantity}
                      variantId={selectedVariant?._id}
                      variantAttributes={selectedAttributes}
                      productName={product.name}
                      productImage={
                        selectedVariant?.imageUrl ||
                        previewImageUrl ||
                        product.images?.find((img: any) => img.is_primary)?.url ||
                        product.images?.[0]?.url
                      }
                      disabled={false}
                    />
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Mobile tabs */}
        <section
          className="lg:hidden mb-4 sm:mb-6"
          aria-label="Product details"
        >
          <ProductTabs
            productId={product._id}
            description={product.description}
            careGuide={product.care_guide}
            shippingInfo={product.shipping_info}
            returnInfo={product.return_info}
          />
        </section>

        {/* DEDICATED SEPARATE FULL-WIDTH REVIEW SECTION (COMPACT SPACING) */}
        <section 
          id="product-reviews" 
          aria-label="Customer Reviews and Ratings" 
          className="pt-4 sm:pt-5 border-t border-theme-border-light dark:border-theme-border-dark mb-2"
        >
          <div className="max-w-5xl">
            {/* <h3 className="font-serif text-lg sm:text-xl text-theme-text-primary-light dark:text-theme-text-primary-dark mb-3 tracking-tight">
              Customer Reviews & Ratings
            </h3> */}
            <ProductReviewSection productId={product._id} />
          </div>
        </section>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <RelatedProducts
            products={relatedProducts}
            viewAllLink={
              product.category_id?.slug
                ? `/products?category=${product.category_id.slug}`
                : "/products"
            }
          />
        )}
      </div>
    </div>
  );
}
