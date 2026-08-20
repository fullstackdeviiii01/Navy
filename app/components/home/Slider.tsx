"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

interface SlideData {
  _id: string;
  title: string;
  subtitle: string;
  description?: string;
  button_text: string;
  button_url: string;
  image_url: string;
  background_gradient: string;
}

interface SliderProps {
  slides: SlideData[];
}

const Slider = ({ slides }: SliderProps) => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (slides.length === 0) return;

    const interval = setInterval(() => {
      setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000);

    return () => clearInterval(interval);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  if (!slides || slides.length === 0) {
    return (
      <div className="h-[50vh] sm:h-[60vh] md:h-[70vh] lg:h-[calc(100vh-80px)] overflow-hidden bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400">
            No slides available
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured promotions"
      className="h-[50vh] sm:h-[60vh] md:h-[70vh] lg:h-[calc(100vh-80px)] overflow-hidden relative"
    >
      <div
        className="w-max h-full flex transition-all ease-in-out duration-1000"
        style={{ transform: `translateX(-${current * 100}vw)` }}
        aria-live="polite"
        aria-atomic="false"
      >
        {slides.map((slide) => (
          <div
            className={`${slide.background_gradient} dark:text-gray-300 w-screen h-full flex flex-col lg:flex-row relative`}
            key={slide._id}
            aria-hidden={current !== slides.indexOf(slide)}
            aria-label={`Slide ${slides.indexOf(slide) + 1} of ${slides.length}: ${slide.title}`}
          >
            {/* MOBILE LAYOUT: Image background with overlay content */}
            <div className="lg:hidden absolute inset-0">
              <Image
                src={slide.image_url}
                alt={slide.title}
                fill
                sizes="100vw"
                className="object-cover"
                priority={slides.indexOf(slide) === 0}
                fetchPriority="high"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30" />
            </div>

            {/* MOBILE: Content overlay */}
            <div className="lg:hidden relative z-10 h-full flex flex-col justify-end pb-8 px-4">
              <div className="space-y-3">
                <p className="text-sm sm:text-base text-white/90 font-medium">
                  {slide.subtitle}
                </p>
                <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
                  {slide.title}
                </h1>
                {slide.description && (
                  <p className="text-sm text-white/80 line-clamp-2 max-w-md">
                    {slide.description}
                  </p>
                )}
                <Link href={slide.button_url} aria-label="slider button">
                  <button
                    aria-label="slider button"
                    className="mt-3 rounded-lg bg-white text-black py-2.5 px-5 hover:bg-gray-100 transition-colors font-semibold text-sm shadow-lg active:scale-95"
                  >
                    {slide.button_text}
                  </button>
                </Link>
              </div>
            </div>

            {/* DESKTOP LAYOUT: Side by side */}
            <div className="hidden lg:flex lg:w-1/2 lg:h-full flex-col items-center justify-center gap-6 xl:gap-8 2xl:gap-12 text-center px-6 xl:px-12">
              <h2 className="text-2xl xl:text-3xl 2xl:text-5xl">
                {slide.subtitle}
              </h2>
              <h1 className="text-4xl xl:text-6xl 2xl:text-8xl font-semibold leading-tight">
                {slide.title}
              </h1>
              {slide.description && (
                <p className="text-lg xl:text-xl 2xl:text-2xl max-w-2xl">
                  {slide.description}
                </p>
              )}
              <Link href={slide.button_url} aria-label="slide button">
                <button
                  aria-label="slide button"
                  className="rounded-md bg-black text-white py-3 px-6 hover:bg-gray-800 transition-colors dark:bg-white dark:text-black dark:hover:bg-gray-200 font-medium active:scale-95"
                >
                  {slide.button_text}
                </button>
              </Link>
            </div>
            <div className="hidden lg:block lg:w-1/2 lg:h-full relative">
              <Image
                src={slide.image_url}
                alt={slide.title}
                fill
                sizes="50vw"
                className="object-cover"
                priority={slides.indexOf(slide) === 0}
                fetchPriority="high"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-2 sm:left-3 md:left-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200 p-2 sm:p-2.5 md:p-3 lg:p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 active:scale-95"
            aria-label="Previous slide"
          >
            <FaChevronLeft
              className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5"
              
            />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-2 sm:right-3 md:right-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200 p-2 sm:p-2.5 md:p-3 lg:p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 active:scale-95"
            aria-label="Next slide"
          >
            <FaChevronRight
              className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5"
              
            />
          </button>
        </>
      )}

      {/* Dot Indicators - Mobile only */}
      {slides.length > 1 && (
        <div className="lg:hidden absolute bottom-4 left-0 right-0 z-10 flex justify-center gap-1.5">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrent(index)}
              className={`h-1.5 rounded-full transition-all p-2 ${
                current === index ? "w-6 bg-white" : "w-1.5 bg-white/50"
              }`}
              aria-label={`Go to slide ${index + 1} of ${slides.length}`}
              aria-current={current === index ? "true" : "false"}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Slider;
