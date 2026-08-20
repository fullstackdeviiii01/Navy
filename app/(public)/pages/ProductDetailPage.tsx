// // app/product/[productId]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { productsApi } from "../../../lib/api/products";
import ProductImages from "../../components/product-detail/ProductImages";
import ProductInfo from "../../components/product-detail/ProductInfo";
import ProductQuantity from "../../components/product-detail/ProductQuantity";
import AddToCartButton from "../../components/product-detail/AddToCartButton";
import ProductTabs from "../../components/product-detail/ProductTabs";
import RelatedProducts from "../../components/product-detail/RelatedProducts";
import ProductBreadcrumb from "../../components/product-detail/ProductBreadcrumb";
import AddToWishlistButton from "../../components/product-detail/AddToWishlistButton";
import BuyNowButton from "../../components/product-detail/BuyNowButton";
import VariantSelectionModal from "../../components/product-detail/VariantSelectionModal";
import SelectOptionsButton from "../../components/product-detail/SelectOptionsButton";
import ProductShareButton from "../../components/product-detail/ProductShareButton";
import Loader from "../../components/shared/Loader";
import ProductMediaCarousel from "../../components/product/ProductMediaCarousel";
import ProductVariantSelector from "../../components/product-detail/ProductVariantSelector";
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
  const [variantModalOpen, setVariantModalOpen] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    null,
  );
  const [pendingAction, setPendingAction] = useState<
    "add-to-cart" | "buy-now" | null
  >(null);

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

  const handleVariantSelection = (variant: ProductVariant) => {
  setSelectedVariant(variant);
  setVariantModalOpen(false);
  setPendingAction(null);
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
    ? false // Don't check stock before variant is selected
    : product.inventory?.stock_status === "out_of_stock";

  // Get current price based on variant or base product
  const currentPrice = selectedVariant?.price || product.pricing?.price || 0;
  const currentComparePrice =
    selectedVariant?.compareAtPrice || product.pricing?.compare_at_price;
  // const currentStock =
  //   selectedVariant?.stockQuantity || product.inventory?.stock_quantity || 0;

  const currentStock = isVariableProduct
    ? (product.variants as ProductVariant[]).reduce(
        (sum, v) => sum + (v.stockQuantity || 0),
        0,
      )
    : product.inventory?.stock_quantity || 0;

  const totalPrice = currentPrice * quantity;

  return (
    <div className="min-h-screen bg-white dark:bg-theme-bg-dark">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb navigation">
          <ProductBreadcrumb items={breadcrumbItems} />
        </nav>

        {/* MOBILE LAYOUT: Images → Info → Actions → Tabs (Vertical Stack) */}
        {/* DESKTOP LAYOUT: Images/Tabs (Left) | Info/Actions (Right Sticky) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8 lg:gap-12 mb-8 sm:mb-10 md:mb-12 lg:mb-16">
          {/* LEFT COLUMN (Desktop) / TOP SECTION (Mobile) - Product Images */}
          <div className="flex flex-col gap-4 sm:gap-6 md:gap-8">
            {/* Product Images/Media Carousel */}
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

            {/* Product Tabs - Hidden on Mobile, shown on Desktop below images */}
            <section
              className="hidden lg:block"
              aria-label="Product details and specifications"
            >
              <ProductTabs
                productId={product._id}
                description={product.description}
                specifications={product.specifications}
                attributes={product.attributes}
                categoryId={product.category_id?._id}
              />
            </section>
          </div>

          {/* RIGHT COLUMN (Desktop) / MIDDLE SECTION (Mobile) - Product Info & Actions */}
          <div className="lg:sticky lg:top-6 lg:self-start lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto lg:pr-2 scrollbar-hide [&::-webkit-scrollbar]:hidden">
            <div className="flex flex-col gap-3 sm:gap-4 md:gap-5 lg:gap-6">
              {/* Product Info */}
              <section aria-label={`${product.name} product information`}>
                <ProductInfo product={product} />
              </section>

              {/* Direct On-Page Variant Swatch Selector */}
              {isVariableProduct && (
                <div className="py-3 border-y border-theme-border-light dark:border-theme-border-dark">
                  <ProductVariantSelector
                    variants={product.variants || []}
                    variantAttributes={product.variantOptions || []}
                    onSelectionChange={(selection, variant) => {
                      setSelectedVariant(variant);
                    }}
                    selectedVariant={selectedVariant}
                  />
                </div>
              )}

              {/* Selected Variant Price Display */}
              {selectedVariant && (
                <div
                  className="p-2.5 sm:p-3 md:p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
                  role="region"
                  aria-label="Selected variant pricing"
                >
                  <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                    <span className="text-xs sm:text-sm font-medium text-green-800 dark:text-green-200">
                      Selected Variant Price:
                    </span>
                    <span
                      className="text-base sm:text-lg md:text-xl font-bold text-green-700 dark:text-green-300"
                      aria-label={`Price: ${formatPrice(currentPrice)}`}
                    >
                      {formatPrice(currentPrice)}
                    </span>
                  </div>
                  {currentComparePrice && (
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] sm:text-xs text-green-700 dark:text-green-300">
                        Original Price:
                      </span>
                      <span
                        className="text-xs sm:text-sm text-green-600 dark:text-green-400 line-through"
                        aria-label={`Original price: ${formatPrice(currentComparePrice)}`}
                      >
                        {formatPrice(currentComparePrice)}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Quantity Selector */}
              {!isOutOfStock && !isVariableProduct && (
                <div
                  className="space-y-1.5 sm:space-y-2"
                  role="region"
                  aria-label="Quantity and pricing"
                >
                  <ProductQuantity
                    quantity={quantity}
                    onQuantityChange={setQuantity}
                    max={currentStock}
                  />
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
                      Total Price:
                    </span>
                    <span
                      className="text-base sm:text-lg md:text-xl font-bold text-theme-primary"
                      aria-label={`Total price: ${formatPrice(totalPrice)}`}
                    >
                      {formatPrice(totalPrice)}
                    </span>
                  </div>
                </div>
              )}

              {/* Stock Warning */}
              {selectedVariant && selectedVariant.stockQuantity === 0 && (
                <div
                  className="p-2 sm:p-2.5 md:p-3 w-fit bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
                  role="alert"
                  aria-live="polite"
                >
                  <p className="text-xs sm:text-sm text-red-800 dark:text-red-200 font-medium">
                    This variant is currently out of stock
                  </p>
                </div>
              )}

              {/* Action Buttons Container - Sticky on Mobile */}
              <div
                className="sticky bottom-0 bg-theme-surface-light dark:bg-theme-bg-dark border-t border-theme-border-light dark:border-theme-border-dark pt-2.5 sm:pt-3 md:pt-4 pb-2.5 sm:pb-3 md:pb-4 -mx-3 px-3 sm:-mx-4 sm:px-4 md:-mx-6 md:px-6 lg:mx-0 lg:px-0 lg:border-0 lg:pb-0 lg:pt-4 z-10"
                role="region"
                aria-label="Product actions"
              >
                {isVariableProduct && !selectedVariant ? (
                  <SelectOptionsButton
                    onClick={() => setVariantModalOpen(true)}
                    disabled={isOutOfStock}
                  />
                ) : (
                  <div className="flex gap-2 sm:gap-2.5 md:gap-3">
                    <AddToCartButton
                      productId={product._id}
                      quantity={quantity}
                      variantId={selectedVariant?._id}
                      disabled={
                        isOutOfStock ||
                        (selectedVariant && selectedVariant.stockQuantity === 0)
                      }
                    />
                    <BuyNowButton
                      productId={product._id}
                      quantity={quantity}
                      variantId={selectedVariant?._id}
                      disabled={
                        isOutOfStock ||
                        (selectedVariant && selectedVariant.stockQuantity === 0)
                      }
                    />
                    <div className="hidden lg:block">
                      <AddToWishlistButton productId={product._id} />
                    </div>
                    <ProductShareButton product={product} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Product Tabs - Visible on Mobile Only (below actions) */}
        <section
          className="lg:hidden mb-8 sm:mb-10 md:mb-12"
          aria-label="Product details and specifications"
        >
          <ProductTabs
            productId={product._id}
            description={product.description}
            specifications={product.specifications}
            attributes={product.attributes}
            categoryId={product.category_id?._id}
          />
        </section>

        {/* Related Products - Full Width */}
        {relatedProducts.length > 0 && (
          <section aria-label="Related products you may like">
            <RelatedProducts products={relatedProducts} />
          </section>
        )}
      </div>

      {/* Variant Selection Modal */}
      {isVariableProduct && (
        <VariantSelectionModal
          isOpen={variantModalOpen}
          onClose={() => {
            setVariantModalOpen(false);
            setPendingAction(null);
          }}
          onConfirm={handleVariantSelection}
          product={product}
          pendingAction={pendingAction}
        />
      )}
    </div>
  );
}
