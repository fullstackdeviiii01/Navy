// app/components/product-detail/ProductTabs.tsx
"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import ProductSpecs from "./ProductSpecs";
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
    ...(careGuide ? [{ id: "care", label: "Care Guide", content: "care" }] : []),
  ];

  return (
    <div className="mt-2 pt-1.5 border-t border-theme-border-light dark:border-theme-border-dark space-y-1">
      {/* Accordion List */}
      <div className="divide-y divide-theme-border-light dark:divide-theme-border-dark border-b border-theme-border-light dark:border-theme-border-dark">
        {sections.map((section) => {
          const isOpen = openSections[section.id];

          return (
            <div key={section.id} className="py-2">
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center justify-between text-left py-1 font-serif text-sm sm:text-base text-theme-text-primary-light dark:text-theme-text-primary-dark hover:text-theme-hover-light dark:hover:text-theme-hover-dark transition-colors group"
                aria-expanded={isOpen}
              >
                <span>{section.label}</span>
                {isOpen ? (
                  <Minus className="w-3.5 h-3.5 text-theme-hover-light dark:text-theme-hover-dark transition-transform" />
                ) : (
                  <Plus className="w-3.5 h-3.5 text-theme-hover-light dark:text-theme-hover-dark transition-transform" />
                )}
              </button>

              {isOpen && (
                <div className="pt-2 pb-1 text-sm sm:text-base text-theme-text-secondary-light dark:text-theme-text-secondary-dark leading-relaxed">
                  {section.content === "description" && (
                    <JoditHtmlContent content={description} />
                  )}

                  {section.content === "specifications" && hasSpecifications && (
                    <ProductSpecs specifications={specifications} />
                  )}

                  {section.content === "shipping" && (
                    <div className="space-y-3">
                      {shippingInfo && (
                        <div>
                          <h4 className="text-xs sm:text-sm uppercase tracking-wider font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark mb-1">
                            Shipping Information
                          </h4>
                          <p className="whitespace-pre-wrap text-sm sm:text-base leading-relaxed text-theme-text-secondary-light dark:text-theme-text-secondary-dark">{shippingInfo}</p>
                        </div>
                      )}
                      {returnInfo && (
                        <div>
                          <h4 className="text-xs sm:text-sm uppercase tracking-wider font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark mb-1">
                            Returns & Exchanges
                          </h4>
                          <p className="whitespace-pre-wrap text-sm sm:text-base leading-relaxed text-theme-text-secondary-light dark:text-theme-text-secondary-dark">{returnInfo}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {section.content === "care" && careGuide && (
                    <p className="whitespace-pre-wrap text-sm sm:text-base leading-relaxed text-theme-text-secondary-light dark:text-theme-text-secondary-dark">{careGuide}</p>
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
