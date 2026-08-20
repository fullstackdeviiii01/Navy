// components/hero-slider/HeroSliderGradientOptions.tsx
"use client";

interface GradientOption {
  value: string;
  label: string;
  preview: string;
}

interface HeroSliderGradientOptionsProps {
  gradientOptions: GradientOption[];
  selectedGradient: string;
  onSelectGradient: (value: string) => void;
}

export default function HeroSliderGradientOptions({
  gradientOptions,
  selectedGradient,
  onSelectGradient,
}: HeroSliderGradientOptionsProps) {
  return (
    <div>
      <label className="block text-xs sm:text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-2 sm:mb-3">
        Background Gradient *
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
        {gradientOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onSelectGradient(option.value)}
            className={`relative h-16 sm:h-20 rounded-lg border-2 transition-all after:absolute after:inset-[-4px] after:content-[''] ${
              selectedGradient === option.value
                ? "border-theme-primary shadow-lg scale-105"
                : "border-theme-border-light dark:border-theme-border-dark hover:border-theme-primary"
            }`}
            style={{ background: option.preview }}
            aria-label={`Select ${option.label} background gradient`}
            aria-pressed={selectedGradient === option.value}
          >
            <span className="absolute bottom-1 left-1 right-1 text-[9px] sm:text-[10px] bg-white dark:bg-gray-800 rounded px-0.5 sm:px-1 py-0.5 text-center">
              {option.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}