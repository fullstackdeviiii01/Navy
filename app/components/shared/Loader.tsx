// app/components/shared/Loader.tsx
"use client";

interface LoaderProps {
  size?: "sm" | "md" | "lg" | "xl";
  text?: string;
  fullScreen?: boolean;
}

export default function Loader({
  size = "md",
  text,
  fullScreen = false,
}: LoaderProps) {
  const containerSizeClass = {
    sm: "w-6 h-6",
    md: "w-10 h-10",
    lg: "w-14 h-14",
    xl: "w-20 h-20",
  }[size];

  const content = (
    <div className="flex flex-col items-center justify-center gap-4 py-8">
      {/* Luxury Geometric Diamond Spinner */}
      <div className={`relative ${containerSizeClass} flex items-center justify-center`}>
        {/* Outer square rotating */}
        <div className="absolute inset-0 border border-theme-hover-light/70 dark:border-theme-hover-dark/70 animate-[spin_4s_linear_infinite]" />
        
        {/* Inner square counter-rotating */}
        <div className="absolute inset-1.5 sm:inset-2 border border-theme-border-light dark:border-theme-border-dark animate-[spin_3s_linear_infinite_reverse]" />
        
        {/* Center glowing focal dot */}
        <div className="w-1.5 h-1.5 bg-theme-hover-light dark:bg-theme-hover-dark animate-pulse" />
      </div>

      {/* Editorial Text */}
      <div className="text-center space-y-1">
        <p className="text-[11px] uppercase tracking-[0.28em] font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark">
          {text || "LOADING"}
        </p>
        <div className="w-8 h-[1px] bg-theme-hover-light/50 dark:bg-theme-hover-dark/50 mx-auto animate-pulse" />
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-theme-bg-light/90 dark:bg-theme-bg-dark/90 backdrop-blur-xs z-50 transition-colors">
        {content}
      </div>
    );
  }

  return (
    <div className="w-full flex items-center justify-center p-8 transition-colors">
      {content}
    </div>
  );
}