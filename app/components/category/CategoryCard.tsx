// app/components/category/CategoryCard.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { FaTag } from "react-icons/fa";

interface CategoryCardProps {
  category: {
    _id: string;
    name: string;
    description?: string;
    slug: string;
    image_url?: string;
    product_count: number;
  };
}

export default function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link
      href={`/products?category=${category.slug}`}
      aria-label={`Shop ${category.name} - ${category.product_count} items available`}
    >
      <div className="group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 h-full flex flex-col">
        {/* Image Container with Overlay Effect */}
        <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
          {category.image_url ? (
            <>
              <Image
                src={category.image_url}
                alt={`${category.name} category`}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
              {/* Gradient Overlay on Hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <FaTag className="text-5xl text-gray-300 dark:text-gray-600 mx-auto mb-3" aria-hidden="true"/>
                <p className="text-sm text-gray-400 dark:text-gray-500 font-medium">
                  No Image
                </p>
              </div>
            </div>
          )}

          {/* Product Count Badge */}
          <div className="absolute top-3 right-3 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg">
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              {category.product_count}{" "}
              {category.product_count === 1 ? "item" : "items"}
            </span>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-4 flex-1 flex flex-col">
          <h3 className="text-gray-900 dark:text-white font-semibold text-base mb-2 group-hover:text-theme-primary transition-colors line-clamp-2 leading-tight">
            {category.name}
          </h3>

          {category.description && (
            <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2 mb-3 flex-1">
              {category.description}
            </p>
          )}

          {/* Shop Now Link */}
          <div className="flex items-center text-theme-primary font-medium text-sm mt-auto">
            <span className="group-hover:mr-2 transition-all">Shop Now</span>
            <svg
              className="w-4 h-4 opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}
