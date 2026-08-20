// app/components/product-detail/ProductImages.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { FaSearchPlus, FaChevronUp, FaChevronDown } from "react-icons/fa";

interface ProductImagesProps {
  images: { url: string; alt_text?: string }[];
  productName: string;
}

export default function ProductImages({ images, productName }: ProductImagesProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  if (!images || images.length === 0) {
    return (
      <div className="aspect-square bg-gray-200 dark:bg-gray-800 rounded-lg flex items-center justify-center">
        <span className="text-theme-text-muted-light dark:text-theme-text-muted-dark">No images available</span>
      </div>
    );
  }

  const scrollThumbnails = (direction: "up" | "down") => {
    if (direction === "up" && selectedImage > 0) {
      setSelectedImage(selectedImage - 1);
    } else if (direction === "down" && selectedImage < images.length - 1) {
      setSelectedImage(selectedImage + 1);
    }
  };

  return (
    <div className="flex gap-3">
      {/* Vertical Thumbnails */}
      {images.length > 1 && (
        <div className="flex flex-col gap-2 w-20">
          {images.length > 4 && (
            <button
              onClick={() => scrollThumbnails("up")}
              disabled={selectedImage === 0}
              className="p-1 border border-theme-border-light dark:border-theme-border-dark rounded hover:bg-theme-hover-bg-light dark:hover:bg-theme-hover-bg-dark disabled:opacity-30 transition-colors"
            >
              <FaChevronUp className="text-theme-text-secondary-light dark:text-theme-text-secondary-dark mx-auto" />
            </button>
          )}
          <div className="flex flex-col gap-2 flex-1 overflow-y-auto scrollbar-hide">
            {images.map((img, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`relative aspect-square rounded border-2 transition-all flex-shrink-0 ${
                  selectedImage === index
                    ? "border-theme-primary"
                    : "border-theme-border-light dark:border-theme-border-dark hover:border-theme-secondary"
                }`}
              >
                <Image src={img.url} alt={img.alt_text || `${productName} ${index + 1}`} fill className="object-cover rounded" />
              </button>
            ))}
          </div>
          {images.length > 4 && (
            <button
              onClick={() => scrollThumbnails("down")}
              disabled={selectedImage === images.length - 1}
              className="p-1 border border-theme-border-light dark:border-theme-border-dark rounded hover:bg-theme-hover-bg-light dark:hover:bg-theme-hover-bg-dark disabled:opacity-30 transition-colors"
            >
              <FaChevronDown className="text-theme-text-secondary-light dark:text-theme-text-secondary-dark mx-auto" />
            </button>
          )}
        </div>
      )}

      {/* Main Image */}
      <div className="flex-1">
        <div className="relative w-full h-[450px] bg-theme-surface-light dark:bg-theme-surface-dark border border-theme-border-light dark:border-theme-border-dark rounded-lg overflow-hidden group">
          <Image
            src={images[selectedImage].url}
            alt={images[selectedImage].alt_text || productName}
            fill
            className="object-contain"
            priority
          />
          <button
            onClick={() => setIsZoomed(true)}
            className="absolute top-3 right-3 p-2 bg-white/90 dark:bg-gray-800/90 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <FaSearchPlus className="text-theme-text-secondary-light dark:text-theme-text-secondary-dark" />
          </button>
        </div>
      </div>

      {/* Zoom Modal */}
      {isZoomed && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setIsZoomed(false)}
        >
          <div className="relative max-w-6xl max-h-[90vh] w-full h-full">
            <Image
              src={images[selectedImage].url}
              alt={images[selectedImage].alt_text || productName}
              fill
              className="object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}