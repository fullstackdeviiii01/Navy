// app/components/product-detail/ProductTabs.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { Plus, Minus, Truck, Sparkles, ShieldCheck, CheckCircle2, Clock, Loader2 } from "lucide-react";
import JoditHtmlContent from "../shared/JoditHtmlContent";
import { formatPrice } from "../../../lib/utils/formatPrice";

interface ShippingService {
  _id: string;
  name: string;
  display_name: string;
  description?: string;
  base_price: number;
  currency: string;
  estimated_days_min?: number;
  estimated_days_max?: number;
}

interface ProductTabsProps {
  productId?: string;
  description: string;
  careGuide?: string;
  shippingInfo?: string;
  returnInfo?: string;
  attributes?: Record<string, any>;
  specifications?: string;
}

const SPEC_LABEL_MAP: Record<string, string> = {
  material: "Material & Construction",
  main_material: "Primary Material",
  materials: "Materials",
  primary_material: "Primary Material",
  base_material: "Base Material",
  shade_material: "Shade Material",
  lampshade_material: "Lampshade Material",
  finish: "Finish & Polish",
  finish_type: "Finish Type",
  care: "Care & Maintenance",
  bulb_socket: "Bulb Socket",
  light_socket: "Light Socket",
  light_source_cap: "Socket / Cap Type",
  light_source: "Light Source",
  bulb_type: "Bulb Type",
  bulb_compatibility: "Bulb Compatibility",
  voltage: "Voltage Compatibility",
  wattage: "Maximum Wattage",
  wattage_voltage: "Wattage & Voltage",
  maximum_power: "Max Power Output",
  max_wattage: "Maximum Wattage",
  control: "Control & Switch",
  switch_type: "Switch Mechanism",
  switch: "Switch Mechanism",
  cord: "Power Cord",
  power_cord: "Power Cord",
  cord_length: "Cord Length",
  wire_length: "Wire Length",
  power_supply: "Power Supply",
  dimensions: "Dimensions",
  lamp_height: "Total Lamp Height",
  height: "Height",
  base_height: "Base Height",
  wood_base_height: "Wooden Base Height",
  base_diameter: "Base Diameter",
  shade_dimensions: "Shade Dimensions",
  shade_diameter: "Shade Diameter",
  width: "Width",
  depth: "Depth",
  weight: "Product Weight",
  item_weight: "Item Weight",
  candle_compatibility: "Candle Compatibility",
  construction: "Construction Type",
  light_color: "Light Color / Temperature",
  color_temperature: "Color Temperature",
};

function formatSpecKey(key: string): string {
  const lower = key.toLowerCase().trim();
  if (SPEC_LABEL_MAP[lower]) {
    return SPEC_LABEL_MAP[lower];
  }
  return key
    .replace(/__([^_]+)_/g, " ($1)")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

export default function ProductTabs({
  description,
  shippingInfo,
  careGuide,
  returnInfo,
  attributes,
  specifications,
}: ProductTabsProps) {
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({
    description: true,
    specifications: true,
    shipping: false,
    care: false,
    returns: false,
  });

  const [shippingServices, setShippingServices] = useState<ShippingService[]>([]);
  const [shippingLoading, setShippingLoading] = useState(false);
  const [hasFetchedShipping, setHasFetchedShipping] = useState(false);

  // Fetch active shipping methods configured by admin from DB
  useEffect(() => {
    const fetchShippingServices = async () => {
      try {
        setShippingLoading(true);
        const res = await fetch("/api/shipping-services");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.services)) {
            setShippingServices(data.services);
          }
        }
      } catch (err) {
        console.error("Failed to load shipping methods:", err);
      } finally {
        setShippingLoading(false);
        setHasFetchedShipping(true);
      }
    };

    fetchShippingServices();
  }, []);

  const toggleSection = (id: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const getEstimatedDelivery = (service: ShippingService) => {
    if (service.estimated_days_min && service.estimated_days_max) {
      return `${service.estimated_days_min}–${service.estimated_days_max} business days`;
    } else if (service.estimated_days_min) {
      return `${service.estimated_days_min}+ business days`;
    } else if (service.estimated_days_max) {
      return `Within ${service.estimated_days_max} business days`;
    }
    return null;
  };

  // Convert attributes to array of key-value pairs
  const specEntries = useMemo(() => {
    if (!attributes || typeof attributes !== "object") return [];
    return Object.entries(attributes).filter(
      ([_, val]) => val !== null && val !== undefined && String(val).trim().length > 0
    );
  }, [attributes]);

  const hasSpecs = specEntries.length > 0 || (specifications && specifications.trim().length > 0);

  const sections = [
    { id: "description", label: "Editorial Description" },
    ...(hasSpecs ? [{ id: "specifications", label: "Technical Specifications" }] : []),
    { id: "shipping", label: "Shipping & Delivery" },
    { id: "care", label: "Wood Care & Maintenance Guide" },
    { id: "returns", label: "Product Replacement Guarantee" },
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

                  {section.id === "specifications" && (
                    <div className="space-y-3">
                      {specEntries.length > 0 ? (
                        <div className="overflow-hidden border border-theme-border-light dark:border-theme-border-dark rounded-md bg-theme-surface-light/40 dark:bg-theme-surface-dark/30">
                          <table className="w-full text-left border-collapse">
                            <tbody>
                              {specEntries.map(([key, val], idx) => (
                                <tr
                                  key={key}
                                  className={`border-b border-theme-border-light/60 dark:border-theme-border-dark/60 last:border-b-0 ${
                                    idx % 2 === 0
                                      ? "bg-transparent"
                                      : "bg-theme-surface-light/80 dark:bg-theme-surface-dark/60"
                                  }`}
                                >
                                  <td className="py-2.5 px-3 sm:px-4 text-[11px] sm:text-xs font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark w-2/5 sm:w-1/3 align-top">
                                    {formatSpecKey(key)}
                                  </td>
                                  <td className="py-2.5 px-3 sm:px-4 text-[11px] sm:text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark align-top">
                                    {String(val)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : specifications ? (
                        <div className="prose dark:prose-invert max-w-none">
                          <JoditHtmlContent content={specifications} />
                        </div>
                      ) : null}
                    </div>
                  )}

                  {section.id === "shipping" && (
                    <div className="space-y-3.5 bg-theme-surface-light/60 dark:bg-theme-surface-dark/40 p-3.5 sm:p-4 rounded-lg border border-theme-border-light/60 dark:border-theme-border-dark/60">
                      {/* Free Delivery Banner */}
                      <div className="flex items-start gap-2.5">
                        <Truck className="w-4 h-4 text-[#8A5E22] shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-xs sm:text-[13px] font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark uppercase tracking-wider">
                            Free Delivery on orders over Rs. 15,000
                          </h4>
                          <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark mt-0.5">
                            All orders with a subtotal of Rs. 15,000 or more qualify for complimentary express delivery nationwide. Standard rates apply for smaller orders.
                          </p>
                        </div>
                      </div>

                      {/* Dynamically Fetched Shipping Options from DB */}
                      <div className="pt-2.5 border-t border-theme-border-light/40 dark:border-theme-border-dark/40 space-y-2">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-theme-text-primary-light dark:text-theme-text-primary-dark block">
                          Available Shipping Methods & Timelines:
                        </span>

                        {shippingLoading && !hasFetchedShipping ? (
                          <div className="flex items-center gap-2 py-3 text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark">
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#8A5E22]" />
                            <span>Loading live shipping options...</span>
                          </div>
                        ) : shippingServices.length > 0 ? (
                          <div className="space-y-2">
                            {shippingServices.map((service) => {
                              const estimate = getEstimatedDelivery(service);
                              return (
                                <div
                                  key={service._id}
                                  className="p-2.5 sm:p-3 rounded-md border border-theme-border-light/70 dark:border-theme-border-dark/70 bg-theme-surface-light dark:bg-theme-surface-dark/60 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-3"
                                >
                                  <div className="space-y-0.5">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="text-xs font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                                        {service.display_name}
                                      </span>
                                      {estimate && (
                                        <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-theme-hover-light/10 text-theme-hover-light dark:text-theme-hover-dark font-medium">
                                          <Clock className="w-3 h-3" />
                                          {estimate}
                                        </span>
                                      )}
                                    </div>
                                    {service.description && (
                                      <p className="text-[11px] text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
                                        {service.description}
                                      </p>
                                    )}
                                  </div>

                                  <div className="text-left sm:text-right shrink-0">
                                    <span className="text-xs font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                                      {service.base_price > 0 ? formatPrice(service.base_price) : "Free Delivery"}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
                            Standard nationwide express courier shipping with live parcel tracking is available at checkout.
                          </p>
                        )}

                        {/* Product-Specific Shipping Info if present */}
                        {shippingInfo && (
                          <div className="mt-3 pt-2.5 border-t border-theme-border-light/40 dark:border-theme-border-dark/40 text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
                            <span className="font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark block mb-0.5">
                              Product Handling & Notes:
                            </span>
                            <p>{shippingInfo}</p>
                          </div>
                        )}
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
                            Each Wooden Lamp is handcrafted from seasoned natural timber. Follow these simple tips to maintain its rich grain and luster for decades.
                          </p>
                        </div>
                      </div>

                      {careGuide ? (
                        <div className="pt-2 border-t border-theme-border-light/40 dark:border-theme-border-dark/40 text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
                          <p>{careGuide}</p>
                        </div>
                      ) : (
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
                      )}
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

                      {returnInfo ? (
                        <div className="pt-2 border-t border-theme-border-light/40 dark:border-theme-border-dark/40 text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
                          <p>{returnInfo}</p>
                        </div>
                      ) : (
                        <div className="space-y-2 pt-2 border-t border-theme-border-light/40 dark:border-theme-border-dark/40 text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
                          <p>
                            • <strong>Inspection Window:</strong> If your lamp arrives with any damage or defect during courier transit, contact us within 14 days for an immediate replacement at zero additional shipping cost.
                          </p>
                          <p>
                            • <strong>Simple Claim Process:</strong> Simply send a photo/video of the parcel to our customer support via WhatsApp or email, and our team will dispatch a fresh unit right away.
                          </p>
                        </div>
                      )}
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
