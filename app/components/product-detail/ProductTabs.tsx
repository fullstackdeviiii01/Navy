import { useState } from "react";
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
  const [activeTab, setActiveTab] = useState<string>("description");

  const hasSpecifications = specifications && Object.keys(specifications).length > 0;

  const tabs = [
    { id: "description", label: "Description" },
    ...(hasSpecifications ? [{ id: "specifications", label: "Specifications" }] : []),
    ...(careGuide ? [{ id: "care-guide", label: "Care Guide" }] : []),
    ...(shippingInfo ? [{ id: "shipping", label: "Shipping" }] : []),
    ...(returnInfo ? [{ id: "returns", label: "Returns" }] : []),
    { id: "reviews", label: "Reviews" },
  ];

  return (
    <div className="mt-6 sm:mt-8 md:mt-10 lg:mt-12">
      {tabs.length > 1 && (
        <>
          <div className="border-b border-theme-border-light dark:border-theme-border-dark">
            <div className="flex gap-4 sm:gap-6 md:gap-8 overflow-x-auto scrollbar-hide" role="tablist" aria-label="Product information tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  aria-controls={`${tab.id}-panel`}
                  id={`${tab.id}-tab`}
                  className={`pb-2.5 sm:pb-3 md:pb-4 font-medium transition-colors relative whitespace-nowrap text-xs sm:text-sm md:text-base ${
                    activeTab === tab.id
                      ? "text-theme-text-primary-light dark:text-theme-text-primary-dark"
                      : "text-theme-text-muted-light dark:text-theme-text-muted-dark hover:text-theme-text-secondary-light dark:hover:text-theme-text-secondary-dark"
                  }`}
                  style={{ minHeight: "44px", display: "inline-flex", alignItems: "center" }}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-theme-primary"></span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="py-5">
            {activeTab === "description" && (
              <div role="tabpanel" id="description-panel" aria-labelledby="description-tab">
                <JoditHtmlContent content={description} />
              </div>
            )}

            {activeTab === "specifications" && hasSpecifications && (
              <div role="tabpanel" id="specifications-panel" aria-labelledby="specifications-tab">
                <ProductSpecs specifications={specifications} />
              </div>
            )}

            {activeTab === "care-guide" && careGuide && (
              <div role="tabpanel" id="care-guide-panel" aria-labelledby="care-guide-tab">
                <div className="prose prose-sm max-w-none text-theme-text-primary-light dark:text-theme-text-primary-dark">
                  <p className="whitespace-pre-wrap">{careGuide}</p>
                </div>
              </div>
            )}

            {activeTab === "shipping" && shippingInfo && (
              <div role="tabpanel" id="shipping-panel" aria-labelledby="shipping-tab">
                <div className="prose prose-sm max-w-none text-theme-text-primary-light dark:text-theme-text-primary-dark">
                  <p className="whitespace-pre-wrap">{shippingInfo}</p>
                </div>
              </div>
            )}

            {activeTab === "returns" && returnInfo && (
              <div role="tabpanel" id="returns-panel" aria-labelledby="returns-tab">
                <div className="prose prose-sm max-w-none text-theme-text-primary-light dark:text-theme-text-primary-dark">
                  <p className="whitespace-pre-wrap">{returnInfo}</p>
                </div>
              </div>
            )}

            {activeTab === "reviews" && (
              <div role="tabpanel" id="reviews-panel" aria-labelledby="reviews-tab">
                <ProductReviewSection productId={productId} />
              </div>
            )}
          </div>
        </>
      )}

      {tabs.length === 1 && (
        <div className="py-5">
          <JoditHtmlContent content={description} />
          <div className="mt-6 sm:mt-8 md:mt-10 lg:mt-12">
            <ProductReviewSection productId={productId} />
          </div>
        </div>
      )}
    </div>
  );
}
