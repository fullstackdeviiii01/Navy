"use client";

import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";

interface RatingProps {
  rating: number;
  count?: number;
  size?: "sm" | "md" | "lg";
  showCount?: boolean;
}

export default function Rating({ rating, count, size = "md", showCount = true }: RatingProps) {
  const sizeClasses = {
    sm: "text-[10px] sm:text-xs md:text-sm",
    md: "text-xs sm:text-sm md:text-base",
    lg: "text-sm sm:text-base md:text-lg",
  };

  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={`full-${i}`} className="text-yellow-400" />);
    }

    if (hasHalfStar) {
      stars.push(<FaStarHalfAlt key="half" className="text-yellow-400" />);
    }

    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<FaRegStar key={`empty-${i}`} className="user-text-muted" />);
    }

    return stars;
  };

  return (
    <div className="flex items-center gap-0.5 sm:gap-1">
      <div className={`flex gap-0.5 ${sizeClasses[size]}`}>{renderStars()}</div>
      {showCount && count !== undefined && (
        <span className="user-text-muted text-[10px] sm:text-xs md:text-sm ml-0.5 sm:ml-1">({count})</span>
      )}
    </div>
  );
}