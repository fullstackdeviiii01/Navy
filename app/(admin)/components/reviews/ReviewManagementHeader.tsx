// ReviewManagementHeader.tsx
"use client";

interface ReviewManagementHeaderProps {
  title?: string;
}

export default function ReviewManagementHeader({ 
  title = "Review Management" 
}: ReviewManagementHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
        {title}
      </h2>
    </div>
  );
}