// app/components/Footerr.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  BsInstagram,
  BsFacebook,
  BsPinterest,
  BsWhatsapp,
} from "react-icons/bs";
import { ChevronsRight } from "lucide-react";
import { siteSettingsApi } from "../../lib/api/siteSettings";
import { categoriesApi } from "../../lib/api/categories";

interface CompanyInfo {
  company_name?: string;
  company_logo?: string;
  company_email?: string;
  company_phone?: string;
  company_address?: string;
  social_media?: {
    instagram?: string;
    facebook?: string;
    pinterest?: string;
    whatsapp?: string;
  };
  copyright_text?: string;
}

interface CategoryItem {
  _id: string;
  name: string;
  slug?: string;
}

export default function Footerr() {
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({});
  const [categories, setCategories] = useState<CategoryItem[]>([]);

  useEffect(() => {
    fetchCompanyInfo();
    fetchCategories();
  }, []);

  const fetchCompanyInfo = async () => {
    try {
      const data = await siteSettingsApi.getCompanyInfo();
      setCompanyInfo(data.company_info || {});
    } catch (error) {
      console.error("Failed to fetch company info:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await categoriesApi.getAll(false);
      if (data && data.categories && data.categories.length > 0) {
        setCategories(data.categories.slice(0, 6));
      } else {
        setCategories([
          { _id: "1", name: "Table Lamps", slug: "table-lamp" },
          { _id: "2", name: "Floor Lamps", slug: "floor-lamp" },
          { _id: "3", name: "Desk Lamps", slug: "desk-lamp" },
          { _id: "4", name: "Pendant Lamps", slug: "pendant-lamp" },
          { _id: "5", name: "Tiffany Lamps", slug: "tiffany-lamp" },
          { _id: "6", name: "Accent Lights", slug: "arc-lamp" },
        ]);
      }
    } catch (error) {
      console.error("Failed to fetch footer categories:", error);
      setCategories([
        { _id: "1", name: "Table Lamps", slug: "table-lamp" },
        { _id: "2", name: "Floor Lamps", slug: "floor-lamp" },
        { _id: "3", name: "Desk Lamps", slug: "desk-lamp" },
        { _id: "4", name: "Pendant Lamps", slug: "pendant-lamp" },
        { _id: "5", name: "Tiffany Lamps", slug: "tiffany-lamp" },
        { _id: "6", name: "Accent Lights", slug: "arc-lamp" },
      ]);
    }
  };

  const socialIcons = [
    {
      key: "instagram",
      icon: BsInstagram,
      url: companyInfo.social_media?.instagram,
      label: "Instagram",
    },
    {
      key: "facebook",
      icon: BsFacebook,
      url: companyInfo.social_media?.facebook,
      label: "Facebook",
    },
    {
      key: "pinterest",
      icon: BsPinterest,
      url: companyInfo.social_media?.pinterest,
      label: "Pinterest",
    },
    {
      key: "whatsapp",
      icon: BsWhatsapp,
      url: companyInfo.social_media?.whatsapp,
      label: "WhatsApp",
    },
  ].filter((social) => social.url && social.url.trim() !== "");

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-theme-card-light dark:bg-theme-card-dark border-t border-theme-border-light dark:border-theme-border-dark text-theme-text-primary-light dark:text-theme-text-primary-dark transition-colors mt-0">
      
      {/* 1. TOP BRAND LOGO STRIP */}
      <div className="border-b border-theme-border-light/60 dark:border-theme-border-dark/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4">
          <div className="flex items-center gap-2.5">
            {companyInfo.company_logo ? (
              <div className="relative h-12 w-12 sm:h-16 sm:w-16 shrink-0">
                <Image
                  src={companyInfo.company_logo}
                  alt={companyInfo.company_name || "Brand Logo"}
                  fill
                  className="object-contain mix-blend-multiply dark:mix-blend-normal"
                  sizes="(max-width: 640px) 48px, 64px"
                />
              </div>
            ) : (
              /* Monogram Box (R | L) */
              <div className="flex items-center border border-theme-hover-light/70 dark:border-theme-hover-dark/70 bg-theme-surface-light dark:bg-theme-surface-dark px-2.5 py-1 shadow-sm shrink-0">
                <span className="font-serif text-lg sm:text-xl text-theme-text-primary-light dark:text-theme-text-primary-dark tracking-tight font-normal">
                  R
                </span>
                <span className="h-4 w-[1px] bg-theme-hover-light dark:bg-theme-hover-dark mx-1.5 inline-block" />
                <span className="font-serif text-lg sm:text-xl text-theme-hover-light dark:text-theme-hover-dark tracking-tight font-normal">
                  L
                </span>
              </div>
            )}

            <div className="flex flex-col leading-none">
              <span className="font-serif text-base sm:text-lg tracking-wider text-theme-text-primary-light dark:text-theme-text-primary-dark font-medium">
                {companyInfo.company_name || "REHAN WOODEN LAMPS"}
              </span>
              <span className="text-[9px] font-mono uppercase tracking-[0.22em] text-theme-hover-light dark:text-theme-hover-dark mt-0.5">
                HANDCRAFTED • 2026
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN 4 COLUMNS (COMPACT SPACING) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
          
          {/* COLUMN 1: Categories */}
          <div className="space-y-2">
            <h4 className="font-mono text-[11px] uppercase tracking-[0.2em] text-theme-hover-light dark:text-theme-hover-dark font-semibold border-b border-theme-border-light/60 dark:border-theme-border-dark/60 pb-1.5">
              Categories
            </h4>
            <ul className="space-y-1.5 text-xs">
              {categories.map((cat) => (
                <li key={cat._id}>
                  <Link
                    href={`/products?category=${cat.slug || cat._id}`}
                    className="text-theme-text-secondary-light dark:text-theme-text-secondary-dark hover:text-theme-hover-light dark:hover:text-theme-hover-dark transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
              <li className="pt-0.5">
                <Link
                  href="/categories"
                  className="font-mono text-[10px] uppercase tracking-wider text-theme-hover-light dark:text-theme-hover-dark hover:underline inline-flex items-center gap-1"
                >
                  <span>View All</span>
                  <ChevronsRight className="w-3 h-3" />
                </Link>
              </li>
            </ul>
          </div>

          {/* COLUMN 2: Customer Support */}
          <div className="space-y-2">
            <h4 className="font-mono text-[11px] uppercase tracking-[0.2em] text-theme-hover-light dark:text-theme-hover-dark font-semibold border-b border-theme-border-light/60 dark:border-theme-border-dark/60 pb-1.5">
              Customer Support
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <Link
                  href="/contact"
                  className="text-theme-text-secondary-light dark:text-theme-text-secondary-dark hover:text-theme-hover-light dark:hover:text-theme-hover-dark transition-colors"
                >
                  Contact
                </Link>
              </li>
              <li>
                <a
                  href="https://wa.me/923130538686"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-theme-text-secondary-light dark:text-theme-text-secondary-dark hover:text-theme-hover-light dark:hover:text-theme-hover-dark transition-colors"
                >
                  WhatsApp Chat
                </a>
              </li>
              <li>
                <Link
                  href="/faqs"
                  className="text-theme-text-secondary-light dark:text-theme-text-secondary-dark hover:text-theme-hover-light dark:hover:text-theme-hover-dark transition-colors"
                >
                  FAQs
                </Link>
              </li>
              <li>
                <Link
                  href="/track-order"
                  className="text-theme-text-secondary-light dark:text-theme-text-secondary-dark hover:text-theme-hover-light dark:hover:text-theme-hover-dark transition-colors"
                >
                  Track Order
                </Link>
              </li>
              <li>
                <Link
                  href="/care-guide"
                  className="text-theme-text-secondary-light dark:text-theme-text-secondary-dark hover:text-theme-hover-light dark:hover:text-theme-hover-dark transition-colors"
                >
                  Care Guide
                </Link>
              </li>
              <li>
                <Link
                  href="/shipping-policy"
                  className="text-theme-text-secondary-light dark:text-theme-text-secondary-dark hover:text-theme-hover-light dark:hover:text-theme-hover-dark transition-colors"
                >
                  Shipping
                </Link>
              </li>
              <li>
                <Link
                  href="/refund-policy"
                  className="text-theme-text-secondary-light dark:text-theme-text-secondary-dark hover:text-theme-hover-light dark:hover:text-theme-hover-dark transition-colors"
                >
                  Warranty
                </Link>
              </li>
            </ul>
          </div>

          {/* COLUMN 3: Explore */}
          <div className="space-y-2">
            <h4 className="font-mono text-[11px] uppercase tracking-[0.2em] text-theme-hover-light dark:text-theme-hover-dark font-semibold border-b border-theme-border-light/60 dark:border-theme-border-dark/60 pb-1.5">
              Explore
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <Link
                  href="/products"
                  className="text-theme-text-secondary-light dark:text-theme-text-secondary-dark hover:text-theme-hover-light dark:hover:text-theme-hover-dark transition-colors"
                >
                  All Products
                </Link>
              </li>
              <li>
                <Link
                  href="/categories"
                  className="text-theme-text-secondary-light dark:text-theme-text-secondary-dark hover:text-theme-hover-light dark:hover:text-theme-hover-dark transition-colors"
                >
                  Categories
                </Link>
              </li>
              <li>
                <Link
                  href="/products?sort=newest"
                  className="text-theme-text-secondary-light dark:text-theme-text-secondary-dark hover:text-theme-hover-light dark:hover:text-theme-hover-dark transition-colors"
                >
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link
                  href="/products?sort=popular"
                  className="text-theme-text-secondary-light dark:text-theme-text-secondary-dark hover:text-theme-hover-light dark:hover:text-theme-hover-dark transition-colors"
                >
                  Best Sellers
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-theme-text-secondary-light dark:text-theme-text-secondary-dark hover:text-theme-hover-light dark:hover:text-theme-hover-dark transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-theme-text-secondary-light dark:text-theme-text-secondary-dark hover:text-theme-hover-light dark:hover:text-theme-hover-dark transition-colors"
                >
                  Custom Orders
                </Link>
              </li>
              <li>
                <Link
                  href="/wishlist"
                  className="text-theme-text-secondary-light dark:text-theme-text-secondary-dark hover:text-theme-hover-light dark:hover:text-theme-hover-dark transition-colors"
                >
                  Wishlist
                </Link>
              </li>
            </ul>
          </div>

          {/* COLUMN 4: Legal & Policies */}
          <div className="space-y-2">
            <h4 className="font-mono text-[11px] uppercase tracking-[0.2em] text-theme-hover-light dark:text-theme-hover-dark font-semibold border-b border-theme-border-light/60 dark:border-theme-border-dark/60 pb-1.5">
              Legal & Policies
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <Link
                  href="/privacy-policy"
                  className="text-theme-text-secondary-light dark:text-theme-text-secondary-dark hover:text-theme-hover-light dark:hover:text-theme-hover-dark transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms-and-conditions"
                  className="text-theme-text-secondary-light dark:text-theme-text-secondary-dark hover:text-theme-hover-light dark:hover:text-theme-hover-dark transition-colors"
                >
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link
                  href="/shipping-policy"
                  className="text-theme-text-secondary-light dark:text-theme-text-secondary-dark hover:text-theme-hover-light dark:hover:text-theme-hover-dark transition-colors"
                >
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/refund-policy"
                  className="text-theme-text-secondary-light dark:text-theme-text-secondary-dark hover:text-theme-hover-light dark:hover:text-theme-hover-dark transition-colors"
                >
                  Return Policy
                </Link>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* 3. BOTTOM LEGAL & SOCIAL STRIP */}
      <div className="border-t border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark py-3.5 sm:py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-center sm:text-left">
          
          {/* Copyright */}
          <p className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark font-mono">
            {companyInfo.copyright_text || `© ${currentYear} ${companyInfo.company_name || "Rehan Wooden Lamps"}. All rights reserved.`}
          </p>

          {/* Social Media Links */}
          {socialIcons.length > 0 && (
            <div className="flex items-center gap-2.5">
              {socialIcons.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.key}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="w-7 h-7 border border-theme-border-light dark:border-theme-border-dark flex items-center justify-center text-theme-text-secondary-light dark:text-theme-text-secondary-dark hover:text-theme-hover-light dark:hover:text-theme-hover-dark hover:border-theme-hover-light dark:hover:border-theme-hover-dark transition-colors bg-theme-card-light dark:bg-theme-card-dark"
                  >
                    <Icon className="w-3 h-3" />
                  </a>
                );
              })}
            </div>
          )}

        </div>
      </div>

    </footer>
  );
}
