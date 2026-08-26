// app/components/product-detail/ProductTabs.tsx
"use client";

import { useState } from "react";
import { Plus, Minus, Truck, Sparkles, ShieldCheck, CheckCircle2 } from "lucide-react";
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
  description,
  specifications,
}: ProductTabsProps) {
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({
    description: true,
    specifications: false,
    shipping: false,
    care: false,
    returns: false,
  });

  const toggleSection = (id: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const hasSpecifications = specifications && Object.keys(specifications).length > 0;

  const sections = [
    { id: "description", label: "Editorial Description" },
    ...(hasSpecifications ? [{ id: "specifications", label: "Technical Specifications" }] : []),
    { id: "shipping", label: "Shipping & Delivery" },
    { id: "care", label: "Wood Care & Maintenance Guide" },
    { id: "returns", label: "7-Day Replacement Guarantee" },
  ];

  return (
    <div className="mt-4 pt-2 border-t border-theme-border-light dark:border-theme-border-dark space-y-1">
      {/* Accordion List */}
      <div className="divide-y divide-theme-border-light dark:divide-theme-border-dark border-b border-theme-border-light dark:border-theme-border-dark">
        {sections.map((section) => {
          const isOpen = openSections[section.id];

          return (
            <div key={section.id} className="py-2.5">
              <button
                type="button"
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center justify-between text-left py-1 font-serif text-sm sm:text-base text-theme-text-primary-light dark:text-theme-text-primary-dark hover:text-theme-hover-light dark:hover:text-theme-hover-dark transition-colors group"
                aria-expanded={isOpen}
              >
                <span className="font-medium tracking-wide">{section.label}</span>
                {isOpen ? (
                  <Minus className="w-4 h-4 text-theme-hover-light dark:text-theme-hover-dark transition-transform" />
                ) : (
                  <Plus className="w-4 h-4 text-theme-hover-light dark:text-theme-hover-dark transition-transform" />
                )}
              </button>

              {isOpen && (
                <div className="pt-2 pb-2 text-xs sm:text-sm text-theme-text-secondary-light dark:text-theme-text-secondary-dark leading-relaxed">
                  {section.id === "description" && (
                    <div className="prose dark:prose-invert max-w-none">
                      <JoditHtmlContent content={description} />
                    </div>
                  )}

                  {section.id === "specifications" && hasSpecifications && (
                    <ProductSpecs specifications={specifications} />
                  )}

                  {section.id === "shipping" && (
                    <div className="space-y-3.5 bg-theme-surface-light/60 dark:bg-theme-surface-dark/40 p-3.5 sm:p-4 rounded-lg border border-theme-border-light/60 dark:border-theme-border-dark/60">
                      <div className="flex items-start gap-2.5">
                        <Truck className="w-4 h-4 text-[#8A5E22] shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-xs sm:text-[13px] font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark uppercase tracking-wider">
                            Free Delivery on orders over Rs. 15,000
                          </h4>
                          <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark mt-0.5">
                            All orders with a subtotal of Rs. 15,000 or more qualify for complimentary express delivery. Standard flat shipping applies for smaller orders.
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-theme-border-light/40 dark:border-theme-border-dark/40 text-xs">
                        <div>
                          <span className="font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark block mb-0.5">
                            Dispatch & Delivery Timeline:
                          </span>
                          <p className="text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
                            • Major Cities (Lahore, Karachi, Islamabad): 2–3 business days<br />
                            • Nationwide & Other Cities: 3–5 business days
                          </p>
                        </div>
                        <div>
                          <span className="font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark block mb-0.5">
                            Fragile Packaging Standard:
                          </span>
                          <p className="text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
                            Individually encased in custom high-density corner foam and multi-ply corrugated boxes with live tracking updates.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {section.id === "care" && (
                    <div className="space-y-3 bg-theme-surface-light/60 dark:bg-theme-surface-dark/40 p-3.5 sm:p-4 rounded-lg border border-theme-border-light/60 dark:border-theme-border-dark/60">
                      <div className="flex items-start gap-2.5">
                        <Sparkles className="w-4 h-4 text-[#8A5E22] shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-xs sm:text-[13px] font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark uppercase tracking-wider">
                            Solid Wood Care & Maintenance
                          </h4>
                          <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark mt-0.5">
                            Each Talal Wooden Lamp is handcrafted from seasoned natural timber. Follow these simple tips to maintain its rich grain and luster for decades.
                          </p>
                        </div>
                      </div>

                      <ul className="space-y-1.5 text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark pt-2 border-t border-theme-border-light/40 dark:border-theme-border-dark/40">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#8A5E22] shrink-0 mt-0.5" />
                          <span><strong>Routine Dusting:</strong> Wipe gently with a dry, clean microfiber cloth. Never use harsh chemical solvents or abrasive pads.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#8A5E22] shrink-0 mt-0.5" />
                          <span><strong>Wood Nourishment:</strong> Apply natural teak oil or botanical beeswax once every 12 to 18 months to enhance the natural wood grain.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#8A5E22] shrink-0 mt-0.5" />
                          <span><strong>Bulb Compatibility:</strong> Use energy-efficient Warm White LED bulbs (E27 / E14 max 12W) to prevent heat buildup and protect the wood.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#8A5E22] shrink-0 mt-0.5" />
                          <span><strong>Environment:</strong> Keep in a dry indoor space away from direct moisture, wet walls, or direct extreme heat radiators.</span>
                        </li>
                      </ul>
                    </div>
                  )}

                  {section.id === "returns" && (
                    <div className="space-y-3 bg-theme-surface-light/60 dark:bg-theme-surface-dark/40 p-3.5 sm:p-4 rounded-lg border border-theme-border-light/60 dark:border-theme-border-dark/60">
                      <div className="flex items-start gap-2.5">
                        <ShieldCheck className="w-4 h-4 text-[#8A5E22] shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-xs sm:text-[13px] font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark uppercase tracking-wider">
                            100% Transit Damage & Replacement Guarantee
                          </h4>
                          <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark mt-0.5">
                            We take complete responsibility for your fixture until it safely illuminates your home.
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2 pt-2 border-t border-theme-border-light/40 dark:border-theme-border-dark/40 text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
                        <p>
                          • <strong>7-Day Inspection Window:</strong> If your lamp arrives with any damage or defect during courier transit, contact us within 7 days for an immediate replacement at zero additional shipping cost.
                        </p>
                        <p>
                          • <strong>Simple Claim Process:</strong> Simply send a photo/video of the parcel to our customer support via WhatsApp or email, and our team will dispatch a fresh unit right away.
                        </p>
                      </div>
                    </div>
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
