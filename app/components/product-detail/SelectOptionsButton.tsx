// app/components/product-detail/SelectOptionsButton.tsx
"use client";

import { FaChevronRight } from "react-icons/fa";

interface SelectOptionsButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export default function SelectOptionsButton({
  onClick,
  disabled = false,
}: SelectOptionsButtonProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClick();
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className="w-full flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 bg-theme-primary hover:bg-theme-primary-hover text-white font-semibold text-xs sm:text-sm md:text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
      aria-label="Select product options to continue"
      style={{ minHeight: '44px' }}
    >
      <span className="whitespace-nowrap">Select Product Options</span>
      <FaChevronRight className="text-[10px] sm:text-xs md:text-sm flex-shrink-0" />
    </button>
  );
}