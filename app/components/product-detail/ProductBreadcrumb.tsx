// app/components/product-detail/ProductBreadcrumb.tsx
"use client";

import Link from "next/link";
import { FaChevronRight, FaHome } from "react-icons/fa";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface ProductBreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function ProductBreadcrumb({ items }: ProductBreadcrumbProps) {
  return (
    <nav className="flex items-center gap-1 sm:gap-1.5 md:gap-2 text-xs sm:text-sm mb-1 overflow-x-auto scrollbar-hide pb-1" aria-label="Breadcrumb">
      <Link 
        href="/" 
        className="text-theme-text-muted-light dark:text-theme-text-muted-dark hover:text-theme-text-secondary-light dark:hover:text-theme-text-secondary-dark transition-colors flex-shrink-0"
        aria-label="Go to home page"
        style={{ minWidth: '44px', minHeight: '44px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <FaHome className="text-xs sm:text-sm" />
      </Link>

      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-1 sm:gap-1.5 md:gap-2 flex-shrink-0">
          <FaChevronRight className="text-theme-text-muted-light dark:text-theme-text-muted-dark text-[8px] sm:text-[10px]" />
          {item.href ? (
            <Link 
              href={item.href} 
              className="text-theme-text-muted-light dark:text-theme-text-muted-dark hover:text-theme-text-secondary-light dark:hover:text-theme-text-secondary-dark transition-colors whitespace-nowrap"
              aria-label={`Go to ${item.label}`}
              style={{ minHeight: '44px', display: 'inline-flex', alignItems: 'center' }}
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-theme-text-primary-light dark:text-theme-text-primary-dark font-medium whitespace-nowrap" aria-current="page">
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
}