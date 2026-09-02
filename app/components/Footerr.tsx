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
import { Phone, Mail, MapPin } from "lucide-react";
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
        setCategories(data.categories.slice(0, 5));
      } else {
        setCategories([
          { _id: "1", name: "Table Lamps", slug: "table-lamp" },
          { _id: "2", name: "Floor Lamps", slug: "floor-lamp" },
          { _id: "3", name: "Hanging Lamps", slug: "pendant-lamp" },
          { _id: "4", name: "Wall Lamps", slug: "wall-lamp" },
          { _id: "5", name: "Candle Lamps", slug: "candle-lamp" },
        ]);
      }
    } catch (error) {
      console.error("Failed to fetch footer categories:", error);
      setCategories([
        { _id: "1", name: "Table Lamps", slug: "table-lamp" },
        { _id: "2", name: "Floor Lamps", slug: "floor-lamp" },
        { _id: "3", name: "Hanging Lamps", slug: "pendant-lamp" },
        { _id: "4", name: "Wall Lamps", slug: "wall-lamp" },
        { _id: "5", name: "Candle Lamps", slug: "candle-lamp" },
      ]);
    }
  };

  const currentYear = 2025;

  return (
    <footer className="relative w-full bg-[#120D09] text-[#F3E8D6] border-t border-[#8A5E22]/40 select-none transition-colors mt-0">
      
      {/* Top 5-Column Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 md:py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-8">
          
          {/* COLUMN 1: Brand Logo, Mission & Social Media Icons */}
          <div className="flex flex-col space-y-3.5 sm:col-span-2 md:col-span-1 lg:col-span-1">
            
            {/* Dynamic Brand Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              {companyInfo.company_logo ? (
                <div className="relative h-12 w-12 sm:h-14 sm:w-14 shrink-0">
                  <Image
                    src={companyInfo.company_logo}
                    alt={companyInfo.company_name || "Talal Wooden Lamps"}
                    fill
                    className="object-contain"
                    sizes="64px"
                  />
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-sm border border-[#C59345] bg-[#1A120B] flex items-center justify-center text-[#C59345] font-serif font-bold text-base shadow-sm">
                    T
                  </div>
                  <div className="flex flex-col">
                    <span className="font-serif font-bold tracking-[0.14em] text-white text-xs uppercase">
                      TALAL
                    </span>
                    <span className="text-[8.5px] font-sans tracking-[0.18em] text-[#C59345] uppercase">
                      WOODEN LAMP
                    </span>
                  </div>
                </div>
              )}
            </Link>

            {/* Mission Statement */}
            <p className="text-xs sm:text-[12.5px] text-[#A89B8C] leading-relaxed max-w-xs font-sans">
              We create more than lamps, we craft warmth, elegance and timeless beauty for your home.
            </p>

            {/* Circular Social Media Icons (Instagram, Facebook, WhatsApp) */}
            <div className="flex items-center gap-2.5 pt-1 text-white/90">
              <a
                href={companyInfo.social_media?.instagram || "https://instagram.com"}
                target="_blank"
                rel="noopener noreferrer"
                className="w-7 h-7 rounded-full border border-white/20 hover:border-[#C59345] bg-[#1C140E] flex items-center justify-center hover:text-[#C59345] transition-all duration-200 cursor-pointer"
                aria-label="Instagram"
              >
                <BsInstagram className="w-3.5 h-3.5" />
              </a>

              <a
                href={companyInfo.social_media?.facebook || "https://facebook.com"}
                target="_blank"
                rel="noopener noreferrer"
                className="w-7 h-7 rounded-full border border-white/20 hover:border-[#C59345] bg-[#1C140E] flex items-center justify-center hover:text-[#C59345] transition-all duration-200 cursor-pointer"
                aria-label="Facebook"
              >
                <BsFacebook className="w-3.5 h-3.5" />
              </a>

              <a
                href={companyInfo.social_media?.whatsapp ? `https://wa.me/${companyInfo.social_media.whatsapp.replace(/\D/g, "")}` : "https://wa.me/923130538686"}
                target="_blank"
                rel="noopener noreferrer"
                className="w-7 h-7 rounded-full border border-white/20 hover:border-[#C59345] bg-[#1C140E] flex items-center justify-center hover:text-[#C59345] transition-all duration-200 cursor-pointer"
                aria-label="WhatsApp"
              >
                <BsWhatsapp className="w-3.5 h-3.5" />
              </a>
            </div>

          </div>

          {/* COLUMN 2: QUICK LINKS */}
          <div className="flex flex-col space-y-2.5">
            <h4 className="text-xs sm:text-[13px] font-serif font-bold uppercase tracking-[0.14em] text-white">
              QUICK LINKS
            </h4>
            <ul className="space-y-1.5 text-xs text-[#A89B8C]">
              <li>
                <Link href="/" className="hover:text-[#C59345] transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-[#C59345] transition-colors">
                  Shop
                </Link>
              </li>
              <li>
                <Link href="/categories" className="hover:text-[#C59345] transition-colors">
                  Categories
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[#C59345] transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#C59345] transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* COLUMN 3: CUSTOMER SERVICE */}
          <div className="flex flex-col space-y-2.5">
            <h4 className="text-xs sm:text-[13px] font-serif font-bold uppercase tracking-[0.14em] text-white">
              CUSTOMER SERVICE
            </h4>
            <ul className="space-y-1.5 text-xs text-[#A89B8C]">
              <li>
                <Link href="/account" className="hover:text-[#C59345] transition-colors">
                  My Account
                </Link>
              </li>
              <li>
                <Link href="/track-order" className="hover:text-[#C59345] transition-colors">
                  Track Order
                </Link>
              </li>
              <li>
                <Link href="/wishlist" className="hover:text-[#C59345] transition-colors">
                  Wishlist
                </Link>
              </li>
              <li>
                <Link href="/refund-policy" className="hover:text-[#C59345] transition-colors">
                  Refund & Returns
                </Link>
              </li>
              <li>
                <Link href="/terms-and-conditions" className="hover:text-[#C59345] transition-colors">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* COLUMN 4: CATEGORIES */}
          <div className="flex flex-col space-y-2.5">
            <h4 className="text-xs sm:text-[13px] font-serif font-bold uppercase tracking-[0.14em] text-white">
              CATEGORIES
            </h4>
            <ul className="space-y-1.5 text-xs text-[#A89B8C]">
              {categories.map((cat) => (
                <li key={cat._id || cat.slug}>
                  <Link
                    href={`/products?category=${cat.slug || encodeURIComponent(cat.name)}`}
                    className="hover:text-[#C59345] transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* COLUMN 5: CONTACT US */}
          <div className="flex flex-col space-y-2.5">
            <h4 className="text-xs sm:text-[13px] font-serif font-bold uppercase tracking-[0.14em] text-white">
              CONTACT US
            </h4>
            <ul className="space-y-2 text-xs text-[#A89B8C]">
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#C59345] shrink-0" />
                <a
                  href={`tel:${(companyInfo.company_phone || "+92 312 1234567").replace(/\s+/g, "")}`}
                  className="hover:text-[#C59345] transition-colors"
                >
                  {companyInfo.company_phone || "+92 312 1234567"}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#C59345] shrink-0" />
                <a
                  href={`mailto:${companyInfo.company_email || "info@talalwoodenlamp.com"}`}
                  className="hover:text-[#C59345] transition-colors truncate"
                >
                  {companyInfo.company_email || "info@talalwoodenlamp.com"}
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#C59345] shrink-0 mt-0.5" />
                <span>{companyInfo.company_address || "Lahore, Pakistan"}</span>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Bottom Copyright Strip */}
      <div className="border-t border-[#2A1D13] py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[11px] sm:text-xs text-[#8A7A6C] font-sans">
            {companyInfo.copyright_text || `© ${currentYear} Talal Wooden Lamp. All Rights Reserved.`}
          </p>
        </div>
      </div>

    </footer>
  );
}
