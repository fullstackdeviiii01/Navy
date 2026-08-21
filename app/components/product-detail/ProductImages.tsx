// app/components/product-detail/ProductImages.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { Search, ChevronLeft, ChevronRight, X } from "lucide-react";

interface ProductImagesProps {
  images: { url: string; alt_text?: string }[];
  productName: string;
}

export default function ProductImages({ images, productName }: ProductImagesProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  if (!images || images.length === 0) {
    return (
      <div className="aspect-[4/3] bg-theme-card-light dark:bg-theme-card-dark border border-theme-border-light dark:border-theme-border-dark flex items-center justify-center">
        <span className="text-theme-text-muted-light dark:text-theme-text-muted-dark text-xs uppercase tracking-widest">No images available</span>
      </div>
    );
  }

  const prevImage = () => {
    setSelectedImage((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const nextImage = () => {
    setSelectedImage((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className="space-y-4">
      {/* Main Image Container */}
      <div className="relative aspect-[4/3] sm:aspect-[4/3] lg:aspect-[16/11] w-full bg-theme-card-light dark:bg-theme-card-dark border border-theme-border-light dark:border-theme-border-dark overflow-hidden group">
        <Image
          src={images[selectedImage].url}
          alt={images[selectedImage].alt_text || productName}
          fill
          className="object-cover transition-transform duration-500 ease-out"
          priority
          sizes="(max-width: 1024px) 100vw, 55vw"
        />

        {/* Counter Badge */}
        <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-xs text-white text-[11px] font-mono uppercase tracking-widest px-2.5 py-1">
          {selectedImage + 1} / {images.length}
        </div>

        {/* Zoom trigger */}
        <button
          onClick={() => setIsZoomed(true)}
          className="absolute top-3 right-3 p-2 bg-black/60 hover:bg-black/80 text-white opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Zoom image"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Quick Nav Arrows on Hover */}
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); prevImage(); }}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-black/60 hover:bg-black/80 text-white opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); nextImage(); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-black/60 hover:bg-black/80 text-white opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Next image"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails Row */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
          {images.map((img, index) => (
            <button
              key={index}
              onClick={() => setSelectedImage(index)}
              className={`relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 bg-theme-card-light dark:bg-theme-card-dark border transition-all ${
                selectedImage === index
                  ? "border-theme-hover-light dark:border-theme-hover-dark ring-1 ring-theme-hover-light"
                  : "border-theme-border-light/70 dark:border-theme-border-dark/70 opacity-70 hover:opacity-100 hover:border-theme-hover-light/50"
              }`}
              aria-label={`View image ${index + 1}`}
            >
              <Image
                src={img.url}
                alt={img.alt_text || `${productName} thumbnail ${index + 1}`}
                fill
                className="object-cover"
                sizes="96px"
              />
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen Zoom Modal */}
      {isZoomed && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
          onClick={() => setIsZoomed(false)}
        >
          <button
            onClick={() => setIsZoomed(false)}
            className="absolute top-6 right-6 text-white/80 hover:text-white p-2"
            aria-label="Close fullscreen image"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="relative max-w-5xl max-h-[85vh] w-full h-full">
            <Image
              src={images[selectedImage].url}
              alt={images[selectedImage].alt_text || productName}
              fill
              className="object-contain"
              sizes="90vw"
            />
          </div>
        </div>
      )}
    </div>
  );
}