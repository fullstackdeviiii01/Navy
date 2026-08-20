"use client";

interface BadgeProps {
  type: "featured" | "sale" | "out_of_stock" | "new" | "discount";
  text?: string;
  discount?: number;
}

export default function Badge({ type, text, discount }: BadgeProps) {
  const baseClasses = "absolute top-2 right-2 px-2 py-1 text-xs font-semibold rounded z-10";

  const typeStyles = {
    featured: "bg-purple-600 text-white",
    sale: "bg-red-600 text-white",
    out_of_stock: "bg-gray-600 text-white",
    new: "bg-green-600 text-white",
    discount: "bg-red-600 text-white",
  };

  const displayText = text || (discount ? `-${discount}%` : type.replace("_", " ").toUpperCase());

  return <span className={`${baseClasses} ${typeStyles[type]}`}>{displayText}</span>;
}