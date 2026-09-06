// app/(public)/pages/ProductDetailPage.tsx
"use client";

import { useState, useEffect } from "react";
import { productsApi } from "../../../lib/api/products";
import ProductInfo from "../../components/product-detail/ProductInfo";
import ProductQuantity from "../../components/product-detail/ProductQuantity";
import AddToCartButton from "../../components/product-detail/AddToCartButton";
import BuyItNowButton from "../../components/product-detail/BuyItNowButton";
import ProductTabs from "../../components/product-detail/ProductTabs";
import ProductReviewSection from "../../components/product-detail/ProductReviewSection";
import RelatedProducts from "../../components/product-detail/RelatedProducts";
import ProductBreadcrumb from "../../components/product-detail/ProductBreadcrumb";
import Loader from "../../components/shared/Loader";
import ProductMediaCarousel from "../../components/product/ProductMediaCarousel";
import ProductVariantSelector from "../../components/product-detail/ProductVariantSelector";
import { formatPrice, formatDetailPrice } from "../../../lib/utils/formatPrice";
import { trackViewContent } from "../../../lib/meta/pixel";
import { Eye, Truck, RotateCcw, ChevronDown, Mail, Link2, Check } from "lucide-react";

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
  const [copiedLink, setCopiedLink] = useState(false);
  const [shippingOpen, setShippingOpen] = useState(false);
  const [returnsOpen, setReturnsOpen] = useState(false);
  const [viewingCount, setViewingCount] = useState(14);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // Realistic dynamic live viewer count (fluctuates naturally between 8 and 21)
  useEffect(() => {
    if (productId) {
      let hash = 0;
      for (let i = 0; i < productId.length; i++) {
        hash = (hash << 5) - hash + productId.charCodeAt(i);
        hash |= 0;
      }
      const initial = 11 + Math.abs(hash % 7); // between 11 and 17
      setViewingCount(initial);
    }

    const timer = setInterval(() => {
      setViewingCount((prev) => {
        const delta = Math.random() > 0.5 ? 1 : -1;
        const next = prev + delta;
        return Math.min(21, Math.max(8, next));
      });
    }, 6000);

    return () => clearInterval(timer);
  }, [productId]);

  useEffect(() => {
    if (productId) {
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      }
      fetchProduct();
    }
  }, [productId]);

  useEffect(() => {
    if (product) {
      fetchRelatedProducts();
      trackViewContent({
        content_ids: [product._id],
        content_name: product.name,
        content_category: product.category_id?.name || "Wooden Lamps",
        value: product.pricing?.price || product.variantPricing?.minPrice || 0,
        currency: "PKR",
      });
    }
  }, [product]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const data = await productsApi.getById(productId);
      const prod = data.product;
      setProduct(prod);

      // Do NOT auto-select a variant on load — the UI starts with nothing selected.
      // The first variant will only be auto-resolved when the user clicks
      // "Add to Cart" or "Buy It Now" without having manually chosen an option.
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

  /** Resolve the effective variant and its attributes without mutating state.
   *  - If all attributes selected: returns selectedVariant.
   *  - If partial attributes selected: finds first compatible variant.
   *  - If nothing selected: returns the first available variant. */
  const getResolvedVariantAndAttributes = () => {
    if (!product?.hasVariants || !product?.variants?.length) return { variant: null, attrs: {} };
    if (selectedVariant) {
      const attrs =
        Object.keys(selectedAttributes).length > 0
          ? selectedAttributes
          : Object.fromEntries((selectedVariant.attributes || []).map((a: any) => [a.name, a.value]));
      return { variant: selectedVariant, attrs };
    }

    const selectedKeys = Object.keys(selectedAttributes);
    if (selectedKeys.length > 0) {
      const matched =
        (product.variants as ProductVariant[]).find(
          (v: any) =>
            v.isAvailable !== false &&
            selectedKeys.every((key) =>
              v.attributes?.some(
                (a: any) =>
                  a.name.toLowerCase() === key.toLowerCase() &&
                  a.value.toLowerCase() === selectedAttributes[key].toLowerCase()
              )
            )
        ) ||
        (product.variants as ProductVariant[]).find((v: any) =>
          selectedKeys.every((key) =>
            v.attributes?.some(
              (a: any) =>
                a.name.toLowerCase() === key.toLowerCase() &&
                a.value.toLowerCase() === selectedAttributes[key].toLowerCase()
            )
          )
        );

      if (matched) {
        const attrs: Record<string, string> = {};
        (matched.attributes || []).forEach((a: any) => { attrs[a.name] = a.value; });
        Object.assign(attrs, selectedAttributes);
        return { variant: matched as ProductVariant, attrs };
      }
    }

    const firstVar = product.variants.find((v: any) => v.isAvailable !== false) || product.variants[0];
    if (!firstVar) return { variant: null, attrs: {} };
    const attrs: Record<string, string> = {};
    (firstVar.attributes || []).forEach((a: any) => { attrs[a.name] = a.value; });
    return { variant: firstVar as ProductVariant, attrs };
  };

  /** Called by Add-to-Cart / Buy-It-Now buttons right before their API call.
   *  If the user hasn't manually selected options, this auto-selects the first
   *  available variant so the correct data is sent to the cart and the UI shows it. */
  const handleAutoSelectFirstVariant = () => {
    if (!product?.hasVariants || !product?.variants?.length) return;
    if (selectedVariant) return;
    const { variant, attrs } = getResolvedVariantAndAttributes();
    if (variant) {
      setSelectedVariant(variant);
      setSelectedAttributes(attrs);
      if (variant.imageUrl) setPreviewImageUrl(variant.imageUrl);
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

  const resolvedVariantData = isVariableProduct ? getResolvedVariantAndAttributes() : { variant: null, attrs: {} };
  const effectiveVariant = selectedVariant || resolvedVariantData.variant;
  const effectiveAttributes =
    Object.keys(selectedAttributes).length > 0
      ? selectedAttributes
      : resolvedVariantData.attrs;
  const effectiveProductImage =
    selectedVariant?.imageUrl ||
    previewImageUrl ||
    resolvedVariantData.variant?.imageUrl ||
    product.images?.find((img: any) => img.is_primary)?.url ||
    product.images?.[0]?.url;

  const currentPrice = selectedVariant?.price
    || effectiveVariant?.price
    || product.pricing?.price || 0;

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

            {/* Desktop tabs (Description, Specifications, Shipping, Care, Returns) */}
            <section
              className="hidden lg:block"
              aria-label="Product details"
            >
              <ProductTabs
                productId={product._id}
                description={product.description}
                attributes={product.attributes}
                specifications={product.specifications}
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
                    selectedAttributes={selectedAttributes}
                  />
                </div>
              )}

              {/* Main action block: Subtotal + Quantity + Add To Cart + Buy It Now + Share + Accordions */}
              <div className="space-y-3 pt-2">
                {/* Dynamic Subtotal line */}
                <div className="text-sm sm:text-base font-sans text-neutral-700 dark:text-neutral-300">
                  Subtotal:{" "}
                  <span className="font-bold text-[#4A2E18] dark:text-[#F3EBE1] font-sans tracking-tight">
                    {formatDetailPrice(totalPrice)}
                  </span>
                </div>

                {/* Quantity label + Stepper & Add To Cart button row */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-sans text-neutral-600 dark:text-neutral-400 select-none">
                    Quantity:
                  </label>
                  <div className="flex items-center gap-2.5 sm:gap-3 w-full">
                    <ProductQuantity
                      quantity={quantity}
                      onQuantityChange={setQuantity}
                    />
                    <div className="flex-1 min-w-0">
                      <AddToCartButton
                        productId={product._id}
                        quantity={quantity}
                        variantId={effectiveVariant?._id}
                        variantAttributes={effectiveAttributes}
                        productName={product.name}
                        productImage={effectiveProductImage}
                        onBeforeAdd={handleAutoSelectFirstVariant}
                        disabled={false}
                      />
                    </div>
                  </div>
                </div>

                {/* BUY IT NOW full-width button */}
                <div className="w-full">
                  <BuyItNowButton
                    productId={product._id}
                    quantity={quantity}
                    variantId={effectiveVariant?._id}
                    variantAttributes={effectiveAttributes}
                    productName={product.name}
                    productImage={effectiveProductImage}
                    onBeforeBuy={handleAutoSelectFirstVariant}
                    disabled={false}
                  />
                </div>

                {/* Professional Social Share Bar */}
                <div className="flex items-center gap-2 pt-2 text-xs font-sans text-neutral-500 dark:text-neutral-400 select-none">
                  <span className="text-[11px] font-sans font-bold uppercase tracking-[0.16em] text-neutral-500 dark:text-neutral-400 mr-1 select-none">
                    SHARE
                  </span>
                  
                  {/* Facebook */}
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-500 hover:text-[#1877F2] hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                    aria-label="Share on Facebook"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </a>

                  {/* X / Twitter */}
                  <a
                    href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}&text=${encodeURIComponent(product.name || "Wooden Lamp")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-500 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                    aria-label="Share on X"
                  >
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </a>

                  {/* Pinterest */}
                  <a
                    href={`https://pinterest.com/pin/create/button/?url=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}&description=${encodeURIComponent(product.name || "Wooden Lamp")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-500 hover:text-[#BD081C] hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                    aria-label="Pin on Pinterest"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345-.09.375-.291 1.199-.334 1.357-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.546.535 6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z"/>
                    </svg>
                  </a>

                  {/* Email */}
                  <a
                    href={`mailto:?subject=${encodeURIComponent(product.name || "Handcrafted Wooden Lamp")}&body=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                    aria-label="Share via Email"
                  >
                    <Mail className="w-4 h-4" />
                  </a>

                  {/* Copy Link */}
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors relative cursor-pointer"
                    aria-label="Copy link"
                  >
                    {copiedLink ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Link2 className="w-4 h-4" />
                    )}
                    {copiedLink && (
                      <span className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-neutral-900 text-white text-[10px] rounded-xs shadow-md whitespace-nowrap">
                        Copied!
                      </span>
                    )}
                  </button>
                </div>

                {/* Real-time Viewing Indicator (Dynamic & Realistic) */}
                <div className="flex items-center gap-2 pt-1 text-xs sm:text-sm font-sans text-neutral-600 dark:text-neutral-400 select-none">
                  <Eye className="w-4 h-4 text-neutral-400 dark:text-neutral-500 shrink-0" />
                  <span>
                    <span className="font-semibold text-neutral-800 dark:text-neutral-200 tabular-nums">
                      {viewingCount}
                    </span>{" "}
                    customers are viewing this product
                  </span>
                </div>

                {/* Collapsible Accordions: Free Shipping & Free Returns */}
                <div className="pt-2 border-t border-neutral-200 dark:border-neutral-700/80 divide-y divide-neutral-200 dark:divide-neutral-700/80">
                  {/* Free Shipping Accordion */}
                  <div>
                    <button
                      type="button"
                      onClick={() => setShippingOpen(!shippingOpen)}
                      className="w-full flex items-center justify-between py-3 text-left font-sans text-sm font-medium text-neutral-800 dark:text-neutral-200 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <Truck className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
                        <span>Free Shipping</span>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 text-neutral-500 transition-transform duration-200 ${
                          shippingOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {shippingOpen && (
                      <div className="pb-3 text-xs text-neutral-600 dark:text-neutral-400 space-y-1.5 animate-in fade-in duration-200 pl-6.5 font-sans">
                        <p>• Free standard delivery across Pakistan on orders above Rs. 15,000.</p>
                        <p>• Estimated delivery time is 3 to 5 business days nationwide.</p>
                        <p>• Cash on Delivery (COD) and secure online payment options available.</p>
                        <p>• Hand-packed in protective shock-absorbent packaging to ensure pristine condition upon arrival.</p>
                      </div>
                    )}
                  </div>

                  {/* Free Returns Accordion */}
                  <div>
                    <button
                      type="button"
                      onClick={() => setReturnsOpen(!returnsOpen)}
                      className="w-full flex items-center justify-between py-3 text-left font-sans text-sm font-medium text-neutral-800 dark:text-neutral-200 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <RotateCcw className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
                        <span>Free Returns</span>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 text-neutral-500 transition-transform duration-200 ${
                          returnsOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {returnsOpen && (
                      <div className="pb-3 text-xs text-neutral-600 dark:text-neutral-400 space-y-1.5 animate-in fade-in duration-200 pl-6.5 font-sans">
                        <p>• 14-day hassle-free exchange and return policy from date of delivery.</p>
                        <p>• Items must be undamaged and returned in their original packaging.</p>
                        <p>• In the rare event of transit damage, we provide an immediate 100% free replacement.</p>
                        <p>• For assistance, contact our dedicated customer support team directly.</p>
                      </div>
                    )}
                  </div>
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
            attributes={product.attributes}
            specifications={product.specifications}
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
