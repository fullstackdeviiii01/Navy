// app/components/product/ProductMediaCarousel.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";

interface MediaItem {
  type: "image" | "video";
  url: string;
  alt_text?: string;
  thumbnail?: string;
}

interface ProductMediaCarouselProps {
  media: MediaItem[];
  productName: string;
  autoPlay?: boolean;
  showThumbnails?: boolean;
  variant?: "card" | "detail";
  productId?: string;
  activeVariantImageUrl?: string;
}

export default function ProductMediaCarousel({
  media,
  productName,
  autoPlay = false,
  showThumbnails = false,
  variant = "card",
  productId,
  activeVariantImageUrl,
}: ProductMediaCarouselProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isVideoHovered, setIsVideoHovered] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const thumbnailScrollRef = useRef<HTMLDivElement>(null);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  // Switch active slide when activeVariantImageUrl changes
  useEffect(() => {
    if (activeVariantImageUrl && media.length > 0) {
      const matchIndex = media.findIndex((m) => m.url === activeVariantImageUrl);
      if (matchIndex !== -1) {
        setCurrentIndex(matchIndex);
      }
    }
  }, [activeVariantImageUrl, media]);

  const currentMedia = media[currentIndex];
  const isCard = variant === "card";

  // Auto-play video on hover (card variant only)
  useEffect(() => {
    if (isCard && currentMedia?.type === "video" && videoRef.current) {
      if (isVideoHovered && autoPlay) {
        videoRef.current.play().catch(() => {});
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
        setIsPlaying(false);
      }
    }
  }, [isVideoHovered, currentMedia, isCard, autoPlay]);

  // Reset video when changing slides
  useEffect(() => {
    if (videoRef.current && currentMedia?.type === "video") {
      videoRef.current.currentTime = 0;
      if (!isCard) {
        setIsPlaying(false);
      }
    }
  }, [currentIndex, currentMedia, isCard]);

  // Auto-scroll thumbnails to keep current one visible
  useEffect(() => {
    if (showThumbnails && thumbnailScrollRef.current && !isCard) {
      const container = thumbnailScrollRef.current;
      const thumbnail = container.children[currentIndex] as HTMLElement;
      if (thumbnail) {
        const containerWidth = container.offsetWidth;
        const thumbnailLeft = thumbnail.offsetLeft;
        const thumbnailWidth = thumbnail.offsetWidth;
        const scrollPosition =
          thumbnailLeft - containerWidth / 2 + thumbnailWidth / 2;

        container.scrollTo({
          left: scrollPosition,
          behavior: "smooth",
        });
      }
    }
  }, [currentIndex, showThumbnails, isCard]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsPlaying(false);
  };

  const goToPrevious = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setCurrentIndex((prev) => (prev === 0 ? media.length - 1 : prev - 1));
  };

  const goToNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setCurrentIndex((prev) => (prev === media.length - 1 ? 0 : prev + 1));
  };

  const scrollThumbnails = (direction: "left" | "right") => {
    if (thumbnailScrollRef.current) {
      const scrollAmount = 200;
      thumbnailScrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleMediaClick = () => {
    if (isCard && productId) {
      router.push(`/product/${productId}`);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 50) {
      goToNext({} as React.MouseEvent);
    }
    if (touchStart - touchEnd < -50) {
      goToPrevious({} as React.MouseEvent);
    }
  };

  if (!media || media.length === 0) {
    return (
      <div className="w-full aspect-[4/3] bg-theme-card-light dark:bg-theme-card-dark border border-theme-border-light dark:border-theme-border-dark flex items-center justify-center">
        <span className="text-theme-text-muted-light dark:text-theme-text-muted-dark text-xs uppercase tracking-widest">
          No media available
        </span>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      {/* Main Media Display */}
      <div
        ref={carouselRef}
        role="region"
        aria-roledescription="carousel"
        aria-label={`${productName} media gallery`}
        className={`relative w-full ${
          isCard
            ? "aspect-[4/5]"
            : "aspect-[4/3] sm:aspect-[4/3] lg:aspect-[16/11]"
        } bg-theme-card-light dark:bg-theme-card-dark border border-theme-border-light dark:border-theme-border-dark overflow-hidden group cursor-pointer`}
        onMouseEnter={() => {
          setIsVideoHovered(true);
          setShowControls(true);
        }}
        onMouseLeave={() => {
          setIsVideoHovered(false);
          setShowControls(false);
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={handleMediaClick}
      >
        {currentMedia.type === "image" ? (
          <Image
            src={currentMedia.url}
            alt={currentMedia.alt_text || productName}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 55vw"
            priority={currentIndex === 0}
          />
        ) : (
          <video
            ref={videoRef}
            src={currentMedia.url}
            poster={currentMedia.thumbnail}
            className="w-full h-full object-cover"
            title={`${productName} product video`}
            loop
            muted={isCard}
            playsInline
            preload="metadata"
          />
        )}

        {/* Counter Badge */}
        {!isCard && media.length > 1 && (
          <div className="absolute bottom-3 right-3 bg-black/80 text-white text-[11px] font-mono tracking-widest px-2.5 py-1 z-10 pointer-events-none">
            {currentIndex + 1} / {media.length}
          </div>
        )}

        {/* Navigation Arrows */}
        {media.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className={`absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/65 hover:bg-black/85 text-white transition-opacity z-10 ${
                isCard ? "opacity-0 group-hover:opacity-100" : "opacity-100"
              }`}
              aria-label="Previous media"
            >
              <ChevronLeft className="w-4 h-4 text-white" />
            </button>
            <button
              onClick={goToNext}
              className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/65 hover:bg-black/85 text-white transition-opacity z-10 ${
                isCard ? "opacity-0 group-hover:opacity-100" : "opacity-100"
              }`}
              aria-label="Next media"
            >
              <ChevronRight className="w-4 h-4 text-white" />
            </button>
          </>
        )}

        {/* Video Controls (Detail variant) */}
        {currentMedia.type === "video" && !isCard && (
          <div
            className={`absolute bottom-3 left-3 flex items-center gap-2 bg-black/75 px-3 py-1.5 transition-opacity z-10 ${
              showControls ? "opacity-100" : "opacity-0"
            }`}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                togglePlayPause();
              }}
              className="text-white hover:text-theme-hover-light transition-colors"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </button>
          </div>
        )}
      </div>

      {/* Thumbnails Row (Detail variant) */}
      {showThumbnails && media.length > 1 && !isCard && (
        <div className="relative mt-3 group">
          <button
            onClick={() => scrollThumbnails("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-1.5 bg-black/70 hover:bg-black/90 text-white opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Scroll thumbnails left"
          >
            <ChevronLeft className="w-3.5 h-3.5 text-white" />
          </button>

          <div
            ref={thumbnailScrollRef}
            className="flex gap-2.5 overflow-x-auto scrollbar-hide pb-1"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {media.map((item, index) => (
              <button
                key={index}
                aria-label={`Go to slide ${index + 1}`}
                onClick={() => goToSlide(index)}
                className={`relative flex-shrink-0 w-20 h-20 bg-theme-card-light dark:bg-theme-card-dark border transition-all ${
                  index === currentIndex
                    ? "border-theme-hover-light dark:border-theme-hover-dark ring-1 ring-theme-hover-light"
                    : "border-theme-border-light/70 dark:border-theme-border-dark/70 opacity-70 hover:opacity-100"
                }`}
              >
                {item.type === "image" ? (
                  <Image
                    src={item.url}
                    alt={`Thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                ) : (
                  <div className="relative w-full h-full">
                    <Image
                      src={item.thumbnail || item.url}
                      alt={`Video thumbnail ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <Play className="text-white w-4 h-4" />
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>

          <button
            onClick={() => scrollThumbnails("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-1.5 bg-black/70 hover:bg-black/90 text-white opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Scroll thumbnails right"
          >
            <ChevronRight className="w-3.5 h-3.5 text-white" />
          </button>
        </div>
      )}
    </div>
  );
}
