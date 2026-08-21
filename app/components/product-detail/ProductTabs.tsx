// app/components/product-detail/ProductTabs.tsx
"use client";

import { useState } from "react";
import { Plus, Minus, Hammer, ShieldCheck, Truck, RotateCcw } from "lucide-react";
import ProductSpecs from "./ProductSpecs";
import ProductReviewSection from "./ProductReviewSection";
import JoditHtmlContent from "../shared/JoditHtmlContent";

interface ProductTabsProps {
  productId: string;
  description: string;
  specifications?: Map<string, string> | { [key: string]: string };
  careGuide?: string;
  shippingInfo?: string;
  returnInfo?: string;
}

export default function ProductTabs({
  productId,
  description,
  specifications,
  careGuide,
  shippingInfo,
  returnInfo,
}: ProductTabsProps) {
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({
    description: true,
  });

  const toggleSection = (id: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const hasSpecifications = specifications && Object.keys(specifications).length > 0;

  const sections = [
    { id: "description", label: "Description", content: "description" },
    ...(hasSpecifications ? [{ id: "specifications", label: "Specifications", content: "specifications" }] : []),
    ...(shippingInfo || returnInfo ? [{ id: "shipping", label: "Shipping & returns", content: "shipping" }] : []),
    ...(careGuide ? [{ id: "care", label: "Care", content: "care" }] : []),
    { id: "reviews", label: "Reviews & Ratings", content: "reviews" },
  ];

  return (
    <div className="mt-8 pt-6 border-t border-theme-border-light dark:border-theme-border-dark space-y-8">
      {/* Brand Value Pillars */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-y border-theme-border-light/60 dark:border-theme-border-dark/60">
        <div className="flex items-center gap-2.5">
          <Hammer className="w-4 h-4 text-theme-hover-light dark:text-theme-hover-dark shrink-0" />
          <span className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
            Handmade in solid wood
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-4 h-4 text-theme-hover-light dark:text-theme-hover-dark shrink-0" />
          <span className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
            Lifetime structural warranty
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          <Truck className="w-4 h-4 text-theme-hover-light dark:text-theme-hover-dark shrink-0" />
          <span className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
            Insured shipping
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          <RotateCcw className="w-4 h-4 text-theme-hover-light dark:text-theme-hover-dark shrink-0" />
          <span className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
            14-day returns
          </span>
        </div>
      </div>

      {/* Accordion List */}
      <div className="divide-y divide-theme-border-light dark:divide-theme-border-dark border-b border-theme-border-light dark:border-theme-border-dark">
        {sections.map((section) => {
          const isOpen = openSections[section.id];

          return (
            <div key={section.id} className="py-4">
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center justify-between text-left py-2 font-serif text-lg sm:text-xl text-theme-text-primary-light dark:text-theme-text-primary-dark hover:text-theme-hover-light dark:hover:text-theme-hover-dark transition-colors group"
                aria-expanded={isOpen}
              >
                <span>{section.label}</span>
                {isOpen ? (
                  <Minus className="w-4 h-4 text-theme-hover-light dark:text-theme-hover-dark transition-transform" />
                ) : (
                  <Plus className="w-4 h-4 text-theme-hover-light dark:text-theme-hover-dark transition-transform" />
                )}
              </button>

              {isOpen && (
                <div className="pt-4 pb-2 text-sm text-theme-text-secondary-light dark:text-theme-text-secondary-dark leading-relaxed">
                  {section.content === "description" && (
                    <JoditHtmlContent content={description} />
                  )}

                  {section.content === "specifications" && hasSpecifications && (
                    <ProductSpecs specifications={specifications} />
                  )}

                  {section.content === "shipping" && (
                    <div className="space-y-4">
                      {shippingInfo && (
                        <div>
                          <h4 className="text-xs uppercase tracking-wider font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark mb-1">
                            Shipping Information
                          </h4>
                          <p className="whitespace-pre-wrap">{shippingInfo}</p>
                        </div>
                      )}
                      {returnInfo && (
                        <div>
                          <h4 className="text-xs uppercase tracking-wider font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark mb-1">
                            Returns & Exchanges
                          </h4>
                          <p className="whitespace-pre-wrap">{returnInfo}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {section.content === "care" && careGuide && (
                    <p className="whitespace-pre-wrap">{careGuide}</p>
                  )}

                  {section.content === "reviews" && (
                    <ProductReviewSection productId={productId} />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
