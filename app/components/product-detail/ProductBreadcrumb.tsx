// app/components/product-detail/ProductBreadcrumb.tsx
"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface ProductBreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function ProductBreadcrumb({ items }: ProductBreadcrumbProps) {
  return (
    <nav className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] overflow-x-auto scrollbar-hide py-2" aria-label="Breadcrumb">
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2 flex-shrink-0">
          {index > 0 && (
            <ChevronRight className="w-3 h-3 text-theme-text-muted-light dark:text-theme-text-muted-dark" />
          )}
          {item.href ? (
            <Link 
              href={item.href} 
              className="text-theme-text-muted-light dark:text-theme-text-muted-dark hover:text-theme-text-primary-light dark:hover:text-theme-text-primary-dark transition-colors whitespace-nowrap"
              aria-label={`Go to ${item.label}`}
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