// app/components/Footerr.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  BsFacebook,
  BsInstagram,
  BsLinkedin,
  BsTiktok,
  BsSnapchat,
  BsWhatsapp,
  BsTwitterX,
  BsGithub,
  BsYoutube,
  BsPinterest,
} from "react-icons/bs";
import { siteSettingsApi } from "../../lib/api/siteSettings";

interface CompanyInfo {
  company_name?: string;
  company_email?: string;
  company_phone?: string;
  company_address?: string;
  social_media?: {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    tiktok?: string;
    snapchat?: string;
    whatsapp?: string;
    twitter?: string;
    github?: string;
    youtube?: string;
    pinterest?: string;
  };
  copyright_text?: string;
}

export default function Footerr() {
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({});

  useEffect(() => {
    fetchCompanyInfo();
  }, []);

  const fetchCompanyInfo = async () => {
    try {
      const data = await siteSettingsApi.getCompanyInfo();
      setCompanyInfo(data.company_info || {});
    } catch (error) {
      console.error("Failed to fetch company info:", error);
    }
  };

  const socialIcons = [
    {
      key: "facebook",
      icon: BsFacebook,
      url: companyInfo.social_media?.facebook,
      label: "Facebook",
    },
    {
      key: "instagram",
      icon: BsInstagram,
      url: companyInfo.social_media?.instagram,
      label: "Instagram",
    },
    {
      key: "linkedin",
      icon: BsLinkedin,
      url: companyInfo.social_media?.linkedin,
      label: "LinkedIn",
    },
    {
      key: "tiktok",
      icon: BsTiktok,
      url: companyInfo.social_media?.tiktok,
      label: "TikTok",
    },
    {
      key: "snapchat",
      icon: BsSnapchat,
      url: companyInfo.social_media?.snapchat,
      label: "Snapchat",
    },
    {
      key: "whatsapp",
      icon: BsWhatsapp,
      url: companyInfo.social_media?.whatsapp,
      label: "WhatsApp",
    },
    {
      key: "twitter",
      icon: BsTwitterX,
      url: companyInfo.social_media?.twitter,
      label: "Twitter/X",
    },
    {
      key: "github",
      icon: BsGithub,
      url: companyInfo.social_media?.github,
      label: "GitHub",
    },
    {
      key: "youtube",
      icon: BsYoutube,
      url: companyInfo.social_media?.youtube,
      label: "YouTube",
    },
    {
      key: "pinterest",
      icon: BsPinterest,
      url: companyInfo.social_media?.pinterest,
      label: "Pinterest",
    },
  ].filter((social) => social.url && social.url.trim() !== "");

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-theme-card-light dark:bg-theme-card-dark border-t border-theme-border-light dark:border-theme-border-dark mt-16 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand & About Column */}
          <div className="space-y-4 md:col-span-1">
            <h3 className="text-xl font-serif tracking-wide text-theme-text-primary-light dark:text-theme-text-primary-dark">
              {companyInfo.company_name || "LAMP & GLOW"}
            </h3>
            {companyInfo.company_address && (
              <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark leading-relaxed">
                {companyInfo.company_address}
              </p>
            )}
            {companyInfo.company_phone && (
              <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
                <span className="font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">Phone: </span>
                <a
                  href={`tel:${companyInfo.company_phone}`}
                  className="hover:text-theme-hover-light dark:hover:text-theme-hover-dark transition-colors"
                >
                  {companyInfo.company_phone}
                </a>
              </p>
            )}
            {companyInfo.company_email && (
              <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
                <span className="font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">Email: </span>
                <a
                  href={`mailto:${companyInfo.company_email}`}
                  className="hover:text-theme-hover-light dark:hover:text-theme-hover-dark transition-colors"
                >
                  {companyInfo.company_email}
                </a>
              </p>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark uppercase tracking-[0.2em] mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link
                  href="/"
                  className="text-theme-text-secondary-light dark:text-theme-text-secondary-dark hover:text-theme-hover-light dark:hover:text-theme-hover-dark transition-colors"
                >
                  Home
                </Link>
              </li>
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
                  href="/track-order"
                  className="text-theme-text-secondary-light dark:text-theme-text-secondary-dark hover:text-theme-hover-light dark:hover:text-theme-hover-dark transition-colors"
                >
                  Track Order
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="text-xs font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark uppercase tracking-[0.2em] mb-4">
              Customer Support
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link
                  href="/contact"
                  className="text-theme-text-secondary-light dark:text-theme-text-secondary-dark hover:text-theme-hover-light dark:hover:text-theme-hover-dark transition-colors"
                >
                  Contact Us
                </Link>
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
                  href="/wishlist"
                  className="text-theme-text-secondary-light dark:text-theme-text-secondary-dark hover:text-theme-hover-light dark:hover:text-theme-hover-dark transition-colors"
                >
                  Wishlist
                </Link>
              </li>
              <li>
                <Link
                  href="/cart"
                  className="text-theme-text-secondary-light dark:text-theme-text-secondary-dark hover:text-theme-hover-light dark:hover:text-theme-hover-dark transition-colors"
                >
                  Shopping Basket
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal / Policy Links */}
          <div>
            <h4 className="text-xs font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark uppercase tracking-[0.2em] mb-4">
              Policy & Legal
            </h4>
            <ul className="space-y-2.5 text-xs">
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
                  Return & Refund Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-theme-border-light dark:border-theme-border-dark mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark">
            {companyInfo.copyright_text ||
              `© ${currentYear} ${companyInfo.company_name || "Store"}. All Rights Reserved.`}
          </p>

          {/* Social Icons */}
          {socialIcons.length > 0 && (
            <div className="flex items-center gap-4">
              {socialIcons.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.key}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="text-theme-text-muted-light dark:text-theme-text-muted-dark hover:text-theme-hover-light dark:hover:text-theme-hover-dark transition-colors"
                  >
                    <Icon className="w-4 h-4" />
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
