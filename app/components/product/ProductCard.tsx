"use client";

import { useState } from "react";
import Link from "next/link";
import { FaTag } from "react-icons/fa";
import Rating from "../shared/Rating";
import AddToWishlistButton from "../product-detail/AddToWishlistButton";
import AddToCartButton from "../product-detail/AddToCartButton";
import BuyNowButton from "../product-detail/BuyNowButton";
import SelectOptionsButton from "../product-detail/SelectOptionsButton";
import VariantSelectionModal from "../product-detail/VariantSelectionModal";
import ProductMediaCarousel from "./ProductMediaCarousel";
import { useCurrency } from "../../context/CurrencyContext";

interface ProductVariant {
  _id?: string;
  sku: string;
  aliexpressSkuId?: string;
  aliexpressSkuAttr?: string;
  attributes: { name: string; value: string }[];
  price: number;
  compareAtPrice?: number;
  stockQuantity: number;
  isAvailable: boolean;
  position: number;
  imageUrl?: string; // Per-variant swatch image (AliExpress colour photo)
}

interface ProductCardProps {
  product: {
    _id: string;
    name: string;
    description?: string;
    short_description?: string;
    category_id?: { _id: string; name: string };
    pricing: {
      price: number;
      compare_at_price?: number;
      currency: string;
    };
    images: { url: string; alt_text?: string }[];
    videos?: { url: string; thumbnail?: string }[];
    rating_average: number;
    rating_count: number;
    inventory: {
      stock_status: string;
      stock_quantity: number;
    };
    badges?: {
      is_featured?: boolean;
      is_bestseller?: boolean;
      is_on_sale?: boolean;
      is_trending?: boolean;
    };
    unit_of_measure?: string;
    attributes?: { [key: string]: any };
    hasVariants?: boolean;
    variants?: ProductVariant[];
    variantOptions?: any[];
    variantPricing?: {
      minPrice: number;
      maxPrice: number;
      priceVaries: boolean;
    };
    variantInventory?: {
      totalStock: number;
      availableVariantCount: number;
    };
  };
  activeCoupons?: any[];
}

export default function ProductCard({
  product,
  activeCoupons = [],
}: ProductCardProps) {
  const { convertPrice, formatPrice, selectedCurrency } = useCurrency();
  const [variantModalOpen, setVariantModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<
    "add-to-cart" | "buy-now" | null
  >(null);

  const hasVariants =
    product.hasVariants &&
    ((product.variants && product.variants.length > 0) ||
      (product.variantOptions && product.variantOptions.length > 0));

  const isOutOfStock = hasVariants
    ? product.variants!.every((v) => v.stockQuantity === 0 || !v.isAvailable)
    : product.inventory.stock_status === "out_of_stock";

  // Prepare media array (images + videos)
  const media = [
    ...(product.images || []).map((img) => ({
      type: "image" as const,
      url: img.url,
      alt_text: img.alt_text,
    })),
    ...(product.videos || []).map((video) => ({
      type: "video" as const,
      url: video.url,
      thumbnail: video.thumbnail,
    })),
  ];

  // Base prices from product - handle variants
  const basePrice =
    hasVariants && product.variantPricing
      ? product.variantPricing.minPrice
      : product.pricing?.price || 0;
  const comparePrice = hasVariants
    ? undefined
    : product.pricing.compare_at_price;
  const baseCurrency = product.pricing.currency;
  const showPriceRange = hasVariants && product.variantPricing?.priceVaries;

  // Find applicable coupon
  const applicableCoupon = activeCoupons.find((coupon) => {
    if (coupon.applicable_to.type === "all") return true;
    if (coupon.applicable_to.type === "products") {
      if (
        !coupon.applicable_to.product_ids ||
        coupon.applicable_to.product_ids.length === 0
      )
        return false;
      return coupon.applicable_to.product_ids.includes(product._id);
    }
    if (coupon.applicable_to.type === "categories") {
      if (
        !coupon.applicable_to.category_ids ||
        coupon.applicable_to.category_ids.length === 0
      )
        return false;
      if (!product.category_id || !product.category_id._id) return false;
      return coupon.applicable_to.category_ids.includes(
        product.category_id._id,
      );
    }
    return false;
  });

  const calculateDiscountedPrice = () => {
    if (!applicableCoupon) return null;

    const convertedPrice = convertPrice(basePrice, baseCurrency);
    let discount = 0;
    let showMinimumMessage = false;

    if (applicableCoupon.discount_type === "percentage") {
      discount = (convertedPrice * applicableCoupon.discount_value) / 100;
      if (
        applicableCoupon.max_discount &&
        discount > applicableCoupon.max_discount
      ) {
        discount = applicableCoupon.max_discount;
      }
    } else if (applicableCoupon.discount_type === "fixed") {
      if (applicableCoupon.discount_value > convertedPrice) {
        showMinimumMessage = true;
      }
      discount = Math.min(applicableCoupon.discount_value, convertedPrice);
    }

    const discountedPrice = Math.max(0, convertedPrice - discount);

    return {
      originalPrice: convertedPrice,
      discountedPrice: discountedPrice,
      discount: discount,
      code: applicableCoupon.code,
      showMinimumMessage: showMinimumMessage,
      minimumRequired: applicableCoupon.discount_value,
    };
  };

  const discountInfo = calculateDiscountedPrice();

  const handleSelectOptions = (action: "add-to-cart" | "buy-now") => {
    setPendingAction(action);
    setVariantModalOpen(true);
  };

  const handleVariantConfirm = () => {
    setVariantModalOpen(false);
    setPendingAction(null);
  };

  // ─── Price Range Component ────────────────────────────────────────────────
  const PriceRange = ({ className = "" }: { className?: string }) => (
    <div
      className={`overflow-x-auto scrollbar-none min-w-0 ${className}`}
      style={{ scrollbarWidth: "none" }}
    >
      <span className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark leading-tight whitespace-nowrap">
        {formatPrice(product.variantPricing!.minPrice, baseCurrency)}
      </span>
      <span className="text-[10px] sm:text-xs md:text-sm text-theme-text-muted-light dark:text-theme-text-muted-dark leading-tight whitespace-nowrap ml-1">
        – {formatPrice(product.variantPricing!.maxPrice, baseCurrency)}
      </span>
    </div>
  );

  // ─── Single Price Component ───────────────────────────────────────────────
  const SinglePrice = ({
    price,
    compare,
    className = "",
  }: {
    price: number;
    compare?: number;
    className?: string;
  }) => (
    <div
      className={`overflow-x-auto scrollbar-none min-w-0 ${className}`}
      style={{ scrollbarWidth: "none" }}
    >
      <span className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark leading-tight whitespace-nowrap">
        {formatPrice(price, baseCurrency)}
      </span>
      {compare && (
        <span className="text-[10px] sm:text-xs md:text-sm text-theme-text-muted-light dark:text-theme-text-muted-dark line-through leading-tight ml-1.5 whitespace-nowrap">
          {formatPrice(compare, baseCurrency)}
        </span>
      )}
    </div>
  );

  return (
    <>
      <div className="group relative bg-theme-surface-light dark:bg-theme-surface-dark border border-theme-border-light dark:border-theme-border-dark overflow-hidden transition-all hover:shadow-lg duration-300 flex flex-col h-full">
        {/* ── Media Carousel ── Desktop */}
        <Link
          href={`/product/${product._id}`}
          aria-label={`View detail for ${product.name}`}
          className="hidden md:block"
        >
          <div className="relative">
            <ProductMediaCarousel
              media={media}
              productName={product.name}
              autoPlay={true}
              variant="card"
            />

            {/* Discount Badge */}
            {discountInfo && (
              <div className="absolute top-2 md:top-3 left-2 md:left-3 bg-red-500 text-white px-2 md:px-3 py-1 md:py-1.5 rounded-full text-[10px] md:text-xs font-bold shadow-lg flex items-center gap-1 md:gap-1.5 z-10 animate-pulse">
                <FaTag
                  className="w-2.5 h-2.5 md:w-3 md:h-3 flex-shrink-0"
                  aria-hidden="true"
                />
                <span className="whitespace-nowrap">
                  {applicableCoupon.discount_type === "percentage"
                    ? `${applicableCoupon.discount_value}% OFF`
                    : `${selectedCurrency} ${applicableCoupon.discount_value} OFF`}
                </span>
              </div>
            )}

            <div className="absolute top-2 md:top-3 right-2 md:right-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <AddToWishlistButton productId={product._id} variant="floating" />
            </div>
          </div>
        </Link>

        {/* ── Media Carousel ── Mobile */}
        <Link
          href={`/product/${product._id}`}
          aria-label={`View product details of ${product.name}`}
          className="md:hidden"
        >
          <div className="relative">
            <ProductMediaCarousel
              media={media}
              productName={product.name}
              autoPlay={true}
              variant="card"
            />

            {/* Discount Badge */}
            {discountInfo && (
              <div className="absolute top-1.5 sm:top-2 left-1.5 sm:left-2 bg-red-500 text-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-bold shadow-lg flex items-center gap-0.5 sm:gap-1 z-10 animate-pulse">
                <FaTag
                  className="w-2 h-2 sm:w-2.5 sm:h-2.5 flex-shrink-0"
                  aria-hidden="true"
                />
                <span className="whitespace-nowrap">
                  {applicableCoupon.discount_type === "percentage"
                    ? `${applicableCoupon.discount_value}% OFF`
                    : `${selectedCurrency} ${applicableCoupon.discount_value} OFF`}
                </span>
              </div>
            )}
          </div>
        </Link>

        {/* ── Content Section ── */}
        <div className="flex flex-col flex-grow p-1 md:p-2 min-w-0">
          {/* Product Name — Desktop */}
          <Link
            href={`/product/${product._id}`}
            aria-label={`View details for ${product.name}`}
            className="hidden md:block"
          >
            <h3 className="text-theme-text-primary-light dark:text-theme-text-primary-dark font-semibold text-sm md:text-base lg:text-lg line-clamp-1 hover:text-theme-primary transition-colors leading-tight">
              {product.name}
            </h3>
            <p
  className="text-theme-text-secondary-light dark:text-theme-text-secondary-dark text-xs md:text-sm leading-relaxed line-clamp-1 min-h-[1.25rem]"
              dangerouslySetInnerHTML={{
                __html: product.short_description || "",
              }}
            />
          </Link>

          {/* Product Name — Mobile */}
          <Link
            href={`/product/${product._id}`}
            aria-label={`View product details of ${product.name}`}
            className="md:hidden"
          >
            <h3 className="text-theme-text-primary-light dark:text-theme-text-primary-dark font-semibold text-xs sm:text-sm line-clamp-2 leading-tight">
              {product.name}
            </h3>
          </Link>

          {/* Rating + Stock/Unit */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2 mb-1">
            <Rating
              rating={product.rating_average}
              count={product.rating_count}
              size="sm"
            />

            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0 flex-wrap">
              {isOutOfStock ? (
                <span className="text-[8px] sm:text-[9px] md:text-[10px] lg:text-xs font-medium px-1.5 sm:px-2 py-0.5 sm:py-1 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 rounded whitespace-nowrap">
                  Out of Stock
                </span>
              ) : (
                (() => {
                  const stockQty = hasVariants
                    ? product.variantInventory?.totalStock || 0
                    : product.inventory.stock_quantity;

                  return (
                    stockQty < 10 &&
                    stockQty > 0 && (
                      <span className="text-[8px] sm:text-[9px] md:text-[10px] lg:text-xs font-medium px-1.5 sm:px-2 py-0.5 sm:py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 rounded whitespace-nowrap">
                        Only {stockQty} left
                      </span>
                    )
                  );
                })()
              )}

              {product.unit_of_measure && (
                <span className="text-theme-text-muted-light dark:text-theme-text-muted-dark text-xs font-medium px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded whitespace-nowrap">
                  {product.unit_of_measure}
                </span>
              )}
            </div>
          </div>

          {/* ── Price Section ── */}
          <div className="pt-1 md:pt-3 md:border-t md:border-theme-border-light md:dark:border-theme-border-dark min-w-0 overflow-hidden">
            {/* Coupon Banner — Desktop only */}
            {discountInfo && (
              <div className="hidden md:block mb-2 p-2 md:p-2.5 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                {discountInfo.showMinimumMessage ? (
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] md:text-xs font-semibold text-green-700 dark:text-green-300">
                      Code: {discountInfo.code}
                    </span>
                    <span className="text-[10px] md:text-xs text-green-600 dark:text-green-400 leading-tight">
                      Add more items to maximize {selectedCurrency}{" "}
                      {discountInfo.minimumRequired.toFixed(2)} discount at
                      checkout
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-0.5 sm:gap-2">
                    <span className="text-[10px] md:text-xs font-semibold text-green-700 dark:text-green-300 truncate">
                      Use code: {discountInfo.code}
                    </span>
                    <span className="text-[10px] md:text-xs font-bold text-green-700 dark:text-green-300 whitespace-nowrap">
                      Save {selectedCurrency} {discountInfo.discount.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Price Display */}
            <div className="flex flex-col gap-0.5 md:gap-1.5 mb-0 md:mb-2 min-w-0 overflow-hidden">
              <div className="min-w-0 overflow-hidden">
                {discountInfo ? (
                  <>
                    {!discountInfo.showMinimumMessage ? (
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <span className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-green-600 dark:text-green-400 leading-tight break-all">
                          {selectedCurrency}{" "}
                          {discountInfo.discountedPrice.toFixed(2)}
                        </span>
                        <span className="text-[10px] sm:text-xs md:text-sm text-theme-text-muted-light dark:text-theme-text-muted-dark line-through break-all leading-tight">
                          {selectedCurrency}{" "}
                          {discountInfo.originalPrice.toFixed(2)}
                        </span>
                        <span className="hidden md:block text-[9px] md:text-[10px] lg:text-xs text-green-600 dark:text-green-400 font-medium leading-tight">
                          After applying coupon at checkout
                        </span>
                      </div>
                    ) : showPriceRange ? (
                      <PriceRange />
                    ) : (
                      <SinglePrice price={basePrice} compare={comparePrice} />
                    )}
                  </>
                ) : showPriceRange ? (
                  <PriceRange />
                ) : (
                  <SinglePrice price={basePrice} compare={comparePrice} />
                )}
              </div>
            </div>

            {/* Action Buttons — Desktop only */}
            <div className="hidden md:flex flex-col sm:flex-row gap-2 mt-1">
              {hasVariants ? (
                isOutOfStock ? (
                  <button
                    disabled
                    aria-label="Product out of stock"
                    className="w-full px-3 md:px-4 py-2 md:py-2.5 bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-lg cursor-not-allowed font-medium text-xs md:text-sm"
                  >
                    Out of Stock
                  </button>
                ) : (
                  <SelectOptionsButton
                    onClick={() => handleSelectOptions("add-to-cart")}
                    disabled={isOutOfStock}
                  />
                )
              ) : (
                <>
                  <AddToCartButton
                    productId={product._id}
                    quantity={1}
                    disabled={isOutOfStock}
                  />
                  <BuyNowButton
                    productId={product._id}
                    quantity={1}
                    disabled={isOutOfStock}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Variant Selection Modal */}
      {hasVariants && (
        <VariantSelectionModal
          isOpen={variantModalOpen}
          onClose={() => {
            setVariantModalOpen(false);
            setPendingAction(null);
          }}
          onConfirm={handleVariantConfirm}
          product={product}
          pendingAction={pendingAction}
        />
      )}
    </>
  );
}
