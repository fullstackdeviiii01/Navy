// app/components/shared/Loader.tsx
"use client";

interface LoaderProps {
  size?: "sm" | "md" | "lg" | "xl";
  text?: string;
}

export default function Loader({ size = "lg", text }: LoaderProps) {
  const sizeClasses = {
    sm: "w-8 h-8 border-2",
    md: "w-12 h-12 border-3",
    lg: "w-12 h-12 border-4",
    xl: "w-24 h-24 border-4",
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
    xl: "text-xl",
  };

  return (
    <div className="absolute min-h-screen inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/90 backdrop-blur-sm z-50">
      <div className="flex flex-col items-center gap-4">
        <div
          className={`${sizeClasses[size]} border-gray-200 dark:border-gray-600 border-t-theme-primary dark:border-t-theme-primary rounded-full animate-spin`}
        />
        {text && (
          <p
            className={`${textSizeClasses[size]} font-medium text-gray-700 dark:text-gray-200`}
          >
            {text}
          </p>
        )}
      </div>
    </div>
  );
}