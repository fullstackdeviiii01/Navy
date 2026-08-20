// components/hero-slider/HeroSliderHeader.tsx
"use client";

import { FaPlus } from "react-icons/fa";

interface HeroSliderHeaderProps {
  onAddSlide: () => void;
}

export default function HeroSliderHeader({ onAddSlide }: HeroSliderHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
      <h2 className="text-lg sm:text-xl font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
        Hero Slider Management
      </h2>
      <button
        onClick={onAddSlide}
        aria-label="Adding a hero slide"
        className="flex items-center justify-center sm:justify-start px-3 sm:px-4 py-1.5 sm:py-2 bg-theme-primary text-white rounded-lg hover:bg-theme-primary-hover transition-colors text-xs sm:text-sm relative after:absolute after:inset-[-4px] after:content-['']"
      >
        <FaPlus className="mr-1 sm:mr-2 text-xs sm:text-sm" />
        Add Slide
      </button>
    </div>
  );
}