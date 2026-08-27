// app/components/product/ProductMediaCarousel.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Play, Pause, ChevronUp, ChevronDown, ZoomIn, X } from "lucide-react";

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
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
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

  // Keyboard navigation for Lightbox
  useEffect(() => {
    if (!isLightboxOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsLightboxOpen(false);
      } else if (e.key === "ArrowLeft") {
        setCurrentIndex((prev) => (prev === 0 ? media.length - 1 : prev - 1));
      } else if (e.key === "ArrowRight") {
        setCurrentIndex((prev) => (prev === media.length - 1 ? 0 : prev + 1));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLightboxOpen, media.length]);

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
        const isDesktop = window.innerWidth >= 640;
        if (isDesktop) {
          const containerHeight = container.offsetHeight;
          const thumbnailTop = thumbnail.offsetTop;
          const thumbnailHeight = thumbnail.offsetHeight;
          const scrollPosition = thumbnailTop - containerHeight / 2 + thumbnailHeight / 2;
          container.scrollTo({ top: scrollPosition, behavior: "smooth" });
        } else {
          const containerWidth = container.offsetWidth;
          const thumbnailLeft = thumbnail.offsetLeft;
          const thumbnailWidth = thumbnail.offsetWidth;
          const scrollPosition = thumbnailLeft - containerWidth / 2 + thumbnailWidth / 2;
          container.scrollTo({ left: scrollPosition, behavior: "smooth" });
        }
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

  const scrollThumbnailsVertical = (direction: "up" | "down") => {
    if (thumbnailScrollRef.current) {
      const scrollAmount = 140;
      thumbnailScrollRef.current.scrollBy({
        top: direction === "up" ? -scrollAmount : scrollAmount,
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

  const handleMainMediaClick = () => {
    if (isCard && productId) {
      router.push(`/product/${productId}`);
    } else if (!isCard) {
      setIsLightboxOpen(true);
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
      <div className="w-full aspect-[4/5] bg-theme-card-light dark:bg-theme-card-dark border border-theme-border-light dark:border-theme-border-dark flex items-center justify-center">
        <span className="text-theme-text-muted-light dark:text-theme-text-muted-dark text-xs uppercase tracking-widest">
          No media available
        </span>
      </div>
    );
  }

  // ── CARD VIEW (For Collection / Category Cards) ─────────────────────────────
  if (isCard) {
    return (
      <div
        ref={carouselRef}
        role="region"
        aria-roledescription="carousel"
        aria-label={`${productName} media gallery`}
        className="relative w-full aspect-[4/5] bg-theme-card-light dark:bg-theme-card-dark border border-theme-border-light dark:border-theme-border-dark overflow-hidden group cursor-pointer"
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
        onClick={handleMainMediaClick}
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
            muted
            playsInline
            preload="metadata"
          />
        )}

        {/* Navigation Arrows for Card */}
        {media.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/65 hover:bg-black/85 text-white transition-opacity z-10 opacity-0 group-hover:opacity-100"
              aria-label="Previous media"
            >
              <ChevronLeft className="w-4 h-4 text-white" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/65 hover:bg-black/85 text-white transition-opacity z-10 opacity-0 group-hover:opacity-100"
              aria-label="Next media"
            >
              <ChevronRight className="w-4 h-4 text-white" />
            </button>
          </>
        )}
      </div>
    );
  }

  // ── DETAIL VIEW (Vertical Thumbnails on Left + Portrait Main Image on Right + Lightbox Popup) ──
  return (
    <>
      <div className="flex flex-col-reverse sm:flex-row gap-2.5 sm:gap-3.5 items-start w-full">
        {/* Vertical Thumbnails (Desktop/Tablet) / Horizontal (Mobile) */}
        {showThumbnails && media.length > 1 && (
          <div className="relative flex-shrink-0 w-full sm:w-20 md:w-22 group">
            {/* Scroll Up button (Desktop) */}
            <button
              onClick={() => scrollThumbnailsVertical("up")}
              className="hidden sm:flex absolute -top-2 left-1/2 -translate-x-1/2 z-10 p-1 bg-black/70 hover:bg-black/90 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Scroll thumbnails up"
            >
              <ChevronUp className="w-3.5 h-3.5 text-white" />
            </button>

            <div
              ref={thumbnailScrollRef}
              className="flex sm:flex-col gap-2 overflow-x-auto sm:overflow-y-auto max-h-[560px] w-full scrollbar-hide py-0.5"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {media.map((item, index) => (
                <button
                  key={index}
                  aria-label={`Go to slide ${index + 1}`}
                  onClick={() => goToSlide(index)}
                  className={`relative flex-shrink-0 w-16 h-20 sm:w-full sm:h-24 bg-theme-card-light dark:bg-theme-card-dark border transition-all ${
                    index === currentIndex
                      ? "border-theme-hover-light dark:border-theme-hover-dark ring-2 ring-theme-hover-light"
                      : "border-theme-border-light/70 dark:border-theme-border-dark/70 opacity-70 hover:opacity-100"
                  }`}
                >
                  {item.type === "image" ? (
                    <Image
                      src={item.url}
                      alt={`Thumbnail ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="88px"
                    />
                  ) : (
                    <div className="relative w-full h-full bg-black/10 overflow-hidden">
                      {item.thumbnail ? (
                        <Image
                          src={item.thumbnail}
                          alt={`Video thumbnail ${index + 1}`}
                          fill
                          className="object-cover"
                          sizes="88px"
                        />
                      ) : (
                        <video
                          src={item.url}
                          className="w-full h-full object-cover"
                          muted
                          preload="metadata"
                        />
                      )}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 pointer-events-none">
                        <Play className="text-white w-3.5 h-3.5" />
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Scroll Down button (Desktop) */}
            <button
              onClick={() => scrollThumbnailsVertical("down")}
              className="hidden sm:flex absolute -bottom-2 left-1/2 -translate-x-1/2 z-10 p-1 bg-black/70 hover:bg-black/90 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Scroll thumbnails down"
            >
              <ChevronDown className="w-3.5 h-3.5 text-white" />
            </button>
          </div>
        )}

        {/* Main Image Display */}
        <div
          ref={carouselRef}
          role="region"
          aria-roledescription="carousel"
          aria-label={`${productName} media gallery`}
          className="relative flex-1 aspect-[4/5] max-h-[560px] w-full bg-theme-card-light dark:bg-theme-card-dark border border-theme-border-light dark:border-theme-border-dark overflow-hidden group cursor-zoom-in"
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
          onClick={handleMainMediaClick}
        >
          {currentMedia.type === "image" ? (
            <Image
              src={currentMedia.url}
              alt={currentMedia.alt_text || productName}
              fill
              className="object-cover object-center transition-transform duration-500 group-hover:scale-102"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 45vw"
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
              playsInline
              preload="metadata"
            />
          )}

          {/* Zoom Indicator Icon on Hover */}
          <div className="absolute top-3 right-3 p-2 bg-black/60 hover:bg-black/80 text-white opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none rounded-sm">
            <ZoomIn className="w-4 h-4 text-white" />
          </div>

          {/* Counter Badge */}
          {media.length > 1 && (
            <div className="absolute bottom-3 right-3 bg-black/80 text-white text-[11px] font-mono tracking-widest px-2.5 py-1 z-10 pointer-events-none">
              {currentIndex + 1} / {media.length}
            </div>
          )}

          {/* Navigation Arrows */}
          {media.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/65 hover:bg-black/85 text-white transition-opacity z-10 opacity-100"
                aria-label="Previous media"
              >
                <ChevronLeft className="w-4 h-4 text-white" />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/65 hover:bg-black/85 text-white transition-opacity z-10 opacity-100"
                aria-label="Next media"
              >
                <ChevronRight className="w-4 h-4 text-white" />
              </button>
            </>
          )}

          {/* Video Controls */}
          {currentMedia.type === "video" && (
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
      </div>

      {/* ── FULLSCREEN LIGHTBOX POPUP MODAL (Matching Review Lightbox) ── */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setIsLightboxOpen(false)}
        >
          {/* Close button */}
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 text-white/80 hover:text-white p-2.5 z-20 bg-white/10 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
            aria-label="Close fullscreen preview"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Counter Badge */}
          <div className="absolute top-4 left-4 sm:top-6 sm:left-6 text-white text-xs font-mono tracking-widest px-3.5 py-1.5 bg-white/10 backdrop-blur-xs rounded-full z-20">
            {currentIndex + 1} / {media.length}
          </div>

          {/* Previous / Next buttons */}
          {media.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToPrevious(e);
                }}
                className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 p-3 sm:p-4 bg-black/60 hover:bg-black/85 text-white border border-white/20 rounded-full z-20 transition-all cursor-pointer"
                aria-label="Previous media"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToNext(e);
                }}
                className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 p-3 sm:p-4 bg-black/60 hover:bg-black/85 text-white border border-white/20 rounded-full z-20 transition-all cursor-pointer"
                aria-label="Next media"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Enlarged Media Container */}
          <div
            className="relative max-w-5xl max-h-[85vh] w-full h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {currentMedia.type === "image" ? (
              <img
                src={currentMedia.url}
                alt={currentMedia.alt_text || productName}
                className="max-h-[85vh] max-w-full object-contain rounded-xs select-none shadow-2xl"
              />
            ) : (
              <video
                src={currentMedia.url}
                controls
                autoPlay
                className="max-h-[85vh] max-w-full rounded-xs shadow-2xl"
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}
