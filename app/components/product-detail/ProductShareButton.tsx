// app/components/product-detail/ProductShareButton.tsx
"use client";

import { useState } from "react";
import { FaShare } from "react-icons/fa";
import ProductShareModal from "./ProductShareModal";

interface ProductShareButtonProps {
  product: {
    _id: string;
    name: string;
    short_description?: string;
    images?: Array<{ url: string }>;
    pricing: {
      price: number;
      currency: string;
    };
  };
}

export default function ProductShareButton({ product }: ProductShareButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-2.5 border border-theme-border-light dark:border-theme-border-dark text-theme-text-secondary-light dark:text-theme-text-secondary-dark hover:border-theme-primary hover:text-theme-primary transition-all"
        title="Share this product"
        aria-label={`Share ${product.name}`}
        style={{ minWidth: '44px', minHeight: '44px' }}
      >
        <FaShare className="text-xs sm:text-sm md:text-base"/>
        <span className="font-semibold text-xs sm:text-sm md:text-base whitespace-nowrap">Share</span>
      </button>

      <ProductShareModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={product}
      />
    </>
  );
}