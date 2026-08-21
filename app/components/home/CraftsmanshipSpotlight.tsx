// app/components/home/CraftsmanshipSpotlight.tsx
"use client";

import Link from "next/link";
import { ChevronsRight, Sparkles } from "lucide-react";
import { formatPrice } from "../../../lib/utils/formatPrice";

interface FeaturedProduct {
  _id: string;
  name: string;
  slug?: string;
  categoryName?: string;
  price: number;
  comparePrice?: number;
  imageUrl?: string;
  purchaseCount?: number;
  badge?: string;
  subtitle?: string;
}

interface CraftsmanshipSpotlightProps {
  products?: any[];
}

export default function CraftsmanshipSpotlight({ products }: CraftsmanshipSpotlightProps) {
  // Select top 2 most sold pieces or fallback to established signature masterworks
  const defaultTopProducts: FeaturedProduct[] = [
    {
      _id: products?.[0]?._id || "aethelgard-table-lamp",
      name: products?.[0]?.name || "Aethelgard Hand-Carved Oak Table Lamp",
      slug: products?.[0]?.seo?.slug || "aethelgard-hand-carved-oak-table-lamp",
      categoryName: products?.[0]?.category_id?.name || "Table Lamp",
      price: products?.[0]?.pricing?.price || 8500,
      comparePrice: products?.[0]?.pricing?.compare_at_price || 10500,
      imageUrl: products?.[0]?.images?.[0]?.url,
      purchaseCount: products?.[0]?.purchase_count || 184,
      badge: "MOST POPULAR",
      subtitle: "Hand-turned from solid sustainably harvested oak with natural Belgian linen shade.",
    },
    {
      _id: products?.[1]?._id || "kallisto-floor-lamp",
      name: products?.[1]?.name || "Kallisto Minimalist Brass Reading Floor Lamp",
      slug: products?.[1]?.seo?.slug || "kallisto-minimalist-brass-reading-floor-lamp",
      categoryName: products?.[1]?.category_id?.name || "Floor Lamp",
      price: products?.[1]?.pricing?.price || 16800,
      comparePrice: products?.[1]?.pricing?.compare_at_price || 19500,
      imageUrl: products?.[1]?.images?.[0]?.url,
      purchaseCount: products?.[1]?.purchase_count || 162,
      badge: "ARCHITECTURAL CHOICE",
      subtitle: "Solid unlacquered satin brass with a 360-degree pivoting conical luminaire head.",
    },
  ];

  const topPieces = products && products.length >= 2
    ? [
        {
          _id: products[0]._id,
          name: products[0].name,
          slug: products[0].seo?.slug,
          categoryName: products[0].category_id?.name || "Lighting",
          price: products[0].pricing?.price || 8500,
          comparePrice: products[0].pricing?.compare_at_price,
          imageUrl: products[0].images?.[0]?.url,
          purchaseCount: products[0].purchase_count || 184,
          badge: "N° 1 BESTSELLER",
          subtitle: products[0].description?.slice(0, 90) + "...",
        },
        {
          _id: products[1]._id,
          name: products[1].name,
          slug: products[1].seo?.slug,
          categoryName: products[1].category_id?.name || "Lighting",
          price: products[1].pricing?.price || 16800,
          comparePrice: products[1].pricing?.compare_at_price,
          imageUrl: products[1].images?.[0]?.url,
          purchaseCount: products[1].purchase_count || 162,
          badge: "N° 2 BESTSELLER",
          subtitle: products[1].description?.slice(0, 90) + "...",
        },
      ]
    : defaultTopProducts;

  const craftPillars = [
    {
      title: "Solid Natural Timbers & Metals",
      desc: "Zero hollow plastic or synthetic veneers.",
    },
    {
      title: "Natural Botanical Finishes",
      desc: "Hand-rubbed organic beeswax and botanical oils.",
    },
    {
      title: "Electrical Testing",
      desc: "Individually wired and certified for enduring safety.",
    },
    // {
    //   title: "Artisanal Turning & Joinery",
    //   desc: "Lathe-turned solid blocks with traditional interlocking mortise joints.",
    // },
    // {
    //   title: "Living Metal Patina",
    //   desc: "Solid unlacquered architectural brass that gains rich character over decades.",
    // },
    // {
    //   title: "Multi-Point Quality Inspection",
    //   desc: "Every luminaire is individually checked for balance, finish, and light dispersion.",
    // },
  ];

  return (
    <section className="bg-theme-card-light/50 dark:bg-theme-card-dark/40 border-y border-theme-border-light dark:border-theme-border-dark py-8 sm:py-10 md:py-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          {/* Left Editorial Narrative Column (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium tracking-[0.25em] uppercase text-theme-hover-light dark:text-theme-hover-dark">
                  CRAFT & INTEGRITY
                </span>
              </div>

              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-theme-text-primary-light dark:text-theme-text-primary-dark leading-tight">
                The purity of <span className="italic font-normal font-serif text-theme-hover-light dark:text-theme-hover-dark">handmade light.</span>
              </h2>

              <p className="text-xs sm:text-sm text-theme-text-secondary-light dark:text-theme-text-secondary-dark leading-relaxed">
                Every luminaire is shaped by master artisans using solid natural hardwoods, architectural unlacquered brass, and hand-cut stained glass. We build enduring heirloom pieces designed to illuminate living spaces for generations.
              </p>

              {/* 6 Craft Pillars with Geometric Diamond Bullets */}
              <div className="grid grid-cols-1 gap-3.5 pt-2">
                {craftPillars.map((pillar, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-theme-text-primary-light dark:text-theme-text-primary-dark">
                    <div className="w-2 h-2 rotate-45 border border-theme-hover-light dark:border-theme-hover-dark bg-theme-hover-light/40 dark:bg-theme-hover-dark/40 shrink-0 mt-1.5" />
                    <span>
                      <strong className="font-semibold">{pillar.title}:</strong>{" "}
                      <span className="text-theme-text-secondary-light dark:text-theme-text-secondary-dark">{pillar.desc}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-theme-border-light/60 dark:border-theme-border-dark/60">
              <Link
                href="/products?sort=popular"
                className="inline-flex items-center gap-2 text-xs font-medium tracking-[0.2em] uppercase text-theme-hover-light dark:text-theme-hover-dark hover:text-theme-text-primary-light dark:hover:text-theme-text-primary-dark transition-colors group"
              >
                <span>EXPLORE ALL BESTSELLERS</span>
                <ChevronsRight className="w-4 h-4 transition-transform group-hover:translate-x-1 duration-300" />
              </Link>
            </div>
          </div>

          {/* Right Column: 2 Top Sold Product Cards (7 Cols) */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {topPieces.map((piece, index) => (
              <Link
                key={piece._id || index}
                href={`/product/${piece._id}`}
                className="group flex flex-col justify-between border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark hover:border-theme-hover-light dark:hover:border-theme-hover-dark transition-all duration-300 overflow-hidden"
              >
                {/* Product Image Showcase - Balanced Editorial Height (aspect 4/3) */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-theme-card-light dark:bg-theme-card-dark border-b border-theme-border-light dark:border-theme-border-dark flex items-center justify-center">
                  {piece.imageUrl ? (
                    <img
                      src={piece.imageUrl}
                      alt={piece.name}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-theme-card-light/40 dark:bg-theme-card-dark/40 text-theme-text-muted-light dark:text-theme-text-muted-dark text-xs font-mono uppercase tracking-wider">
                      No Image
                    </div>
                  )}

                  {/* Top Badges */}
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10">
                    <span className="px-2 py-0.5 bg-black/75 backdrop-blur-xs text-white font-mono text-[9px] uppercase tracking-[0.12em]">
                      {piece.badge}
                    </span>
                    {Boolean(piece.purchaseCount && piece.purchaseCount > 0) && (
                      <span className="px-2 py-0.5 bg-theme-primary text-theme-btn-text font-mono text-[9px] uppercase tracking-wider font-semibold">
                        {piece.purchaseCount} SOLD
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Details */}
                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-[10px] font-medium tracking-[0.2em] uppercase text-theme-hover-light dark:text-theme-hover-dark block mb-1">
                      {piece.categoryName}
                    </span>
                    <h3 className="text-base sm:text-lg font-serif text-theme-text-primary-light dark:text-theme-text-primary-dark group-hover:text-theme-hover-light transition-colors leading-snug">
                      {piece.name}
                    </h3>
                  </div>

                  <div className="pt-3 border-t border-theme-border-light/60 dark:border-theme-border-dark/60 flex items-center justify-between">
                    <div>
                      <span className="text-sm font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                        {formatPrice(piece.price)}
                      </span>
                      {piece.comparePrice && piece.comparePrice > piece.price && (
                        <span className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark line-through ml-2">
                          {formatPrice(piece.comparePrice)}
                        </span>
                      )}
                    </div>

                    <span className="text-[11px] uppercase tracking-[0.18em] font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark group-hover:text-theme-hover-light inline-flex items-center gap-1">
                      VIEW PIECE
                      <ChevronsRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
