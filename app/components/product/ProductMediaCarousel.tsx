// app/components/product/ProductMediaCarousel.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FaChevronLeft, FaChevronRight, FaPlay, FaPause } from "react-icons/fa";

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

  const indicatorScrollRef = useRef<HTMLDivElement>(null);

  // Replace the useEffect with this:
  useEffect(() => {
    if (media.length > 1 && indicatorScrollRef.current) {
      const container = indicatorScrollRef.current;
      const activeIndicator = container.children[currentIndex] as HTMLElement;
      if (activeIndicator) {
        const containerWidth = container.offsetWidth;
        const indicatorLeft = activeIndicator.offsetLeft;
        const indicatorWidth = activeIndicator.offsetWidth;
        const scrollPosition =
          indicatorLeft - containerWidth / 2 + indicatorWidth / 2;

        container.scrollTo({
          left: scrollPosition,
          behavior: "smooth",
        });
      }
    }
  }, [currentIndex, media.length]);

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

  // Touch handlers for mobile swipe
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
      <div className="w-full aspect-square bg-gray-200 dark:bg-gray-800 rounded-lg flex items-center justify-center">
        <span className="text-theme-text-muted-light dark:text-theme-text-muted-dark text-xs sm:text-sm">
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
            ? "aspect-square max-h-[150px] sm:max-h-[180px] md:max-h-[200px]"
            : "aspect-square max-h-[450px]"
        } bg-gray-100 dark:bg-gray-900 overflow-hidden group cursor-pointer`}
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
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
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

        {/* Navigation Arrows */}
        {media.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className={`absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 p-1.5 sm:p-2 bg-white/90 dark:bg-gray-800/90 rounded-full shadow-lg transition-opacity z-10 hover:bg-white dark:hover:bg-gray-800 ${
                isCard ? "opacity-0 group-hover:opacity-100" : "opacity-100"
              }`}
              aria-label="Previous media"
            >
              <FaChevronLeft
                className="text-gray-800 dark:text-gray-200 text-xs sm:text-sm md:text-base"
              />
            </button>
            <button
              onClick={goToNext}
              className={`absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 p-1.5 sm:p-2 bg-white/90 dark:bg-gray-800/90 rounded-full shadow-lg transition-opacity z-10 hover:bg-white dark:hover:bg-gray-800 ${
                isCard ? "opacity-0 group-hover:opacity-100" : "opacity-100"
              }`}
              aria-label="Next media"
            >
              <FaChevronRight
                className="text-gray-800 dark:text-gray-200 text-xs sm:text-sm md:text-base"
                
              />
            </button>
          </>
        )}

        {/* Video Controls (Detail variant only) */}
        {currentMedia.type === "video" && !isCard && (
          <div
            className={`absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 sm:gap-3 bg-black/70 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full transition-opacity ${
              showControls ? "opacity-100" : "opacity-0"
            }`}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                togglePlayPause();
              }}
              className="text-white hover:text-gray-300 transition-colors"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <FaPause className="text-sm sm:text-base" />
              ) : (
                <FaPlay className="text-sm sm:text-base" />
              )}
            </button>
          </div>
        )}

        {/* Video Badge (Card variant) */}
        {isCard && currentMedia.type === "video" && (
          <div className="absolute top-1.5 sm:top-2 left-1.5 sm:left-2 px-1.5 sm:px-2 py-0.5 sm:py-1 bg-black/70 text-white text-[10px] sm:text-xs font-medium rounded flex items-center gap-0.5 sm:gap-1">
            <FaPlay className="text-[8px] sm:text-[10px]" aria-hidden="true" />
            <span>Video</span>
          </div>
        )}

        {/* Slide Indicators */}
        {media.length > 1 && (
          <div className="absolute bottom-2 sm:bottom-3 left-1/2 -translate-x-1/2 z-10 max-w-[80%]">
            <div
              ref={indicatorScrollRef}
              className="flex gap-1 sm:gap-1.5 px-3 py-1.5 bg-black/20 backdrop-blur-sm rounded-full overflow-x-auto scrollbar-hide scroll-smooth"
            >
              {media.map((_, index) => (
                <button
                aria-current={index === currentIndex ? "true" : "false"}
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    goToSlide(index);
                  }}
                  className={`h-1.5 sm:h-2 rounded-full transition-all flex-shrink-0 ${
                    index === currentIndex
                      ? "bg-white w-4 sm:w-6"
                      : "bg-white/50 hover:bg-white/75 w-1.5 sm:w-2"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Thumbnail Navigation (Detail variant only) */}
      {showThumbnails && media.length > 1 && !isCard && (
        <div className="relative mt-3 sm:mt-4 group">
          {/* Left Arrow */}
          <button
            onClick={() => scrollThumbnails("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-1.5 sm:p-2 bg-white/90 dark:bg-gray-800/90 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Scroll thumbnails left"
          >
            <FaChevronLeft
              className="text-gray-800 dark:text-gray-200 text-xs sm:text-sm"
              
            />
          </button>

          {/* Thumbnails Container */}
          <div
            ref={thumbnailScrollRef}
            className="flex gap-1.5 sm:gap-2 overflow-x-auto scrollbar-hide scroll-smooth"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {media.map((item, index) => (
              <button
                key={index}
                aria-label="Go to the slide"
                onClick={() => goToSlide(index)}
                className={`relative flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition-all ${
                  index === currentIndex
                    ? "border-theme-primary scale-105"
                    : "border-transparent hover:border-gray-300 dark:hover:border-gray-600"
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
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <FaPlay
                        className="text-white text-xs sm:text-sm"
                        
                      />
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Right Arrow */}
          <button
            onClick={() => scrollThumbnails("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-1.5 sm:p-2 bg-white/90 dark:bg-gray-800/90 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Scroll thumbnails right"
          >
            <FaChevronRight
              className="text-gray-800 dark:text-gray-200 text-xs sm:text-sm"
              
            />
          </button>
        </div>
      )}
    </div>
  );
}
