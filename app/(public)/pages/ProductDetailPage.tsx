"use client";

import { useState, useEffect, useRef } from "react";
import { productsApi } from "../../../lib/api/products";
import ProductInfo from "../../components/product-detail/ProductInfo";
import ProductQuantity from "../../components/product-detail/ProductQuantity";
import AddToCartButton from "../../components/product-detail/AddToCartButton";
import ProductTabs from "../../components/product-detail/ProductTabs";
import RelatedProducts from "../../components/product-detail/RelatedProducts";
import ProductBreadcrumb from "../../components/product-detail/ProductBreadcrumb";
import Loader from "../../components/shared/Loader";
import ProductMediaCarousel from "../../components/product/ProductMediaCarousel";
import ProductVariantSelector from "../../components/product-detail/ProductVariantSelector";
import StickyProductBar from "../../components/product-detail/StickyProductBar";
import { formatPrice } from "../../../lib/utils/formatPrice";

interface Props {
  productId: string;
}

interface ProductVariant {
  _id?: string;
  sku: string;
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
  const [isStickyVisible, setIsStickyVisible] = useState(false);

  const mainActionRef = useRef<HTMLDivElement>(null);
  const variantSelectorRef = useRef<HTMLDivElement>(null);

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

  // Observer to toggle sticky product bar when user scrolls past the main buy box
  useEffect(() => {
    const target = mainActionRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // When main action box is visible at top of viewport, sticky bar should be hidden
        setIsStickyVisible(!entry.isIntersecting);
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px",
      }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [product, loading]);

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

  const handleVariantSelection = (selection: any, variant: ProductVariant | null) => {
    setSelectedVariant(variant);
  };

  const handleScrollToOptions = () => {
    if (variantSelectorRef.current) {
      variantSelectorRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    } else if (mainActionRef.current) {
      mainActionRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  if (loading) {
    return (
      <div
        className="relative h-48 sm:h-56 md:h-64"
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
      <div className="min-h-screen bg-theme-bg-light dark:bg-theme-bg-dark flex items-center justify-center p-4">
        <div
          className="text-center max-w-md"
          role="alert"
          aria-live="assertive"
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark mb-2">
            Product Not Found
          </h1>
          <p className="text-sm sm:text-base text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
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
  const currentComparePrice =
    selectedVariant?.compareAtPrice || product.pricing?.compare_at_price;

  const currentStock = isVariableProduct
    ? (product.variants as ProductVariant[]).reduce(
        (sum, v) => sum + (v.stockQuantity || 0),
        0
      )
    : product.inventory?.stock_quantity || 0;

  const totalPrice = currentPrice * quantity;
  const variantOutOfStock = selectedVariant ? selectedVariant.stockQuantity === 0 : false;

  return (
    <div className="min-h-screen bg-theme-bg-light dark:bg-theme-bg-dark pb-20">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb navigation">
          <ProductBreadcrumb items={breadcrumbItems} />
        </nav>

        {/* 2-column grid: images left, info right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8 lg:gap-12 mb-8 sm:mb-10 md:mb-12 lg:mb-16">
          {/* LEFT COLUMN: Product media + Desktop tabs */}
          <div className="flex flex-col gap-4 sm:gap-6 md:gap-8">
            <section aria-label={`${product.name} product media gallery`}>
              <ProductMediaCarousel
                media={[
                  ...(selectedVariant?.imageUrl
                    ? [{ type: "image" as const, url: selectedVariant.imageUrl, alt_text: `${product.name} selected variant image` }]
                    : []),
                  ...(product.images || []).map((img: any) => ({
                    type: "image" as const,
                    url: img.url,
                    alt_text: img.alt_text || `${product.name} product image`,
                  })),
                  ...(product.videos || []).map((video: any) => ({
                    type: "video" as const,
                    url: video.url,
                    thumbnail: video.thumbnail,
                  })),
                ]}
                productName={product.name}
                autoPlay={false}
                showThumbnails={true}
                variant="detail"
                activeVariantImageUrl={selectedVariant?.imageUrl}
              />
            </section>

            {/* Desktop tabs */}
            <section
              className="hidden lg:block"
              aria-label="Product details and specifications"
            >
              <ProductTabs
                productId={product._id}
                description={product.description}
                specifications={product.specifications || product.attributes}
                careGuide={product.care_guide}
                shippingInfo={product.shipping_info}
                returnInfo={product.return_info}
              />
            </section>
          </div>

          {/* RIGHT COLUMN: Sticky info + actions */}
          <div className="lg:sticky lg:top-6 lg:self-start lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto lg:pr-2 scrollbar-hide [&::-webkit-scrollbar]:hidden">
            <div className="flex flex-col gap-3 sm:gap-4 md:gap-5 lg:gap-6">
              <section aria-label={`${product.name} product information`}>
                <ProductInfo product={product} />
              </section>

              {/* Variant selector */}
              {isVariableProduct && (
                <div
                  ref={variantSelectorRef}
                  className="py-3 border-y border-theme-border-light dark:border-theme-border-dark"
                >
                  <ProductVariantSelector
                    variants={product.variants || []}
                    variantAttributes={product.variantOptions || []}
                    onSelectionChange={handleVariantSelection}
                    selectedVariant={selectedVariant}
                  />
                </div>
              )}

              {/* Selected variant price */}
              {selectedVariant && (
                <div
                  className="p-3 bg-green-500/10 border border-green-500/30 text-xs"
                  role="region"
                  aria-label="Selected variant pricing"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium uppercase tracking-wider text-green-800 dark:text-green-200">
                      Variant Price:
                    </span>
                    <span
                      className="text-base sm:text-lg font-serif text-green-800 dark:text-green-200 font-semibold"
                      aria-label={`Price: ${formatPrice(currentPrice)}`}
                    >
                      {formatPrice(currentPrice)}
                    </span>
                  </div>
                  {currentComparePrice && (
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-green-700/80 dark:text-green-300/80">
                        Original:
                      </span>
                      <span
                        className="text-xs text-green-700/80 dark:text-green-300/80 line-through"
                        aria-label={`Original price: ${formatPrice(currentComparePrice)}`}
                      >
                        {formatPrice(currentComparePrice)}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Main action block: Quantity + Price + Add to Cart */}
              <div ref={mainActionRef} className="space-y-4">
                {/* Quantity + total (non-variable or variant selected) */}
                {!isOutOfStock && (!isVariableProduct || selectedVariant) && (
                  <div
                    className="space-y-3"
                    role="region"
                    aria-label="Quantity and pricing"
                  >
                    <ProductQuantity
                      quantity={quantity}
                      onQuantityChange={setQuantity}
                      max={currentStock}
                    />
                    <div className="flex items-baseline justify-between pt-2 border-t border-theme-border-light/60 dark:border-theme-border-dark/60 text-xs sm:text-sm">
                      <span className="text-xs uppercase tracking-[0.2em] font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
                        Total Price:
                      </span>
                      <span
                        className="text-lg sm:text-xl font-serif text-theme-text-primary-light dark:text-theme-text-primary-dark"
                        aria-label={`Total price: ${formatPrice(totalPrice)}`}
                      >
                        {formatPrice(totalPrice)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Stock warning for selected variant */}
                {variantOutOfStock && (
                  <div
                    className="p-3 bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs"
                    role="alert"
                    aria-live="polite"
                  >
                    <p className="font-medium">
                      This variant is currently out of stock.
                    </p>
                  </div>
                )}

                {/* Add to Cart or Select Options prompt */}
                <div
                  className="pt-2"
                  role="region"
                  aria-label="Product actions"
                >
                  {isVariableProduct && !selectedVariant ? (
                    <div className="text-center p-4 border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark">
                      <p className="text-xs uppercase tracking-[0.15em] font-medium text-theme-hover-light dark:text-theme-hover-dark">
                        Please select your options above
                      </p>
                    </div>
                  ) : (
                    <AddToCartButton
                      productId={product._id}
                      quantity={quantity}
                      variantId={selectedVariant?._id}
                      disabled={isOutOfStock || variantOutOfStock || false}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile tabs */}
        <section
          className="lg:hidden mb-8 sm:mb-10 md:mb-12"
          aria-label="Product details and specifications"
        >
          <ProductTabs
            productId={product._id}
            description={product.description}
            specifications={product.specifications || product.attributes}
            careGuide={product.care_guide}
            shippingInfo={product.shipping_info}
            returnInfo={product.return_info}
          />
        </section>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section aria-label="Related products you may like">
            <RelatedProducts products={relatedProducts} />
          </section>
        )}
      </div>

      {/* Full-width Sticky Product Bar */}
      <StickyProductBar
        product={product}
        selectedVariant={selectedVariant}
        quantity={quantity}
        onQuantityChange={setQuantity}
        isOutOfStock={isOutOfStock}
        variantOutOfStock={variantOutOfStock}
        isVariableProduct={isVariableProduct}
        currentStock={currentStock}
        totalPrice={totalPrice}
        isVisible={isStickyVisible}
        onScrollToOptions={handleScrollToOptions}
      />
    </div>
  );
}
