// app/components/Footerr.tsx
"use client";

import {
  Footer,
  FooterCopyright,
  FooterIcon,
  FooterLink,
  FooterLinkGroup,
  FooterTitle,
  TextInput,
} from "flowbite-react";
import React, { useEffect, useState } from "react";
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
import NewsletterSubscribeForm from "./newsletter/NewsletterSubscribeForm";

interface Page {
  _id: string;
  title: string;
  slug: string;
  page_type: string;
}

interface CompanyInfo {
  company_name?: string;
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

const Footerr = () => {
  const [pages, setPages] = useState<Page[]>([]);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({});

  useEffect(() => {
    fetchPages();
    fetchCompanyInfo();
  }, []);

  const fetchPages = async () => {
    try {
      const data = await siteSettingsApi.getAllPages(false);
      setPages(data.pages || []);
    } catch (error) {
      console.error("Failed to fetch pages:", error);
    }
  };

  const fetchCompanyInfo = async () => {
    try {
      const data = await siteSettingsApi.getCompanyInfo();
      setCompanyInfo(data.company_info || {});
    } catch (error) {
      console.error("Failed to fetch company info:", error);
    }
  };

  const legalPages = pages.filter((page) =>
    ["terms", "privacy", "refund", "shipping"].includes(page.page_type),
  );

  const aboutPages = pages.filter((page) =>
    ["about", "licensing"].includes(page.page_type),
  );

  const customPages = pages.filter((page) => page.page_type === "custom");

  // Filter out empty social media links
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

  return (
    <Footer className="mt-10">
      <div className="w-full">
        <div className="grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 px-6 py-8">
          {/* Main Menu */}
          <nav aria-labelledby="footer-main-menu">
            <FooterTitle title="Main Menu" id="footer-main-menu" />
            <FooterLinkGroup col>
              <FooterLink href="/">Home</FooterLink>
              <FooterLink href="/products">Products</FooterLink>
              <FooterLink href="/categories">Categories</FooterLink>
              <FooterLink href="/cart">Cart</FooterLink>
            </FooterLinkGroup>
          </nav>

          {/* About & Custom Pages */}
          <nav aria-labelledby="footer-about">
            <FooterTitle title="About" id="footer-about" />
            <FooterLinkGroup col>
              <FooterLink href="/contact">Contact</FooterLink>
              <FooterLink href="/faqs">FAQs</FooterLink>
              {aboutPages.map((page) => (
                <FooterLink key={page._id} href={`/pages/${page.slug}`}>
                  {page.title}
                </FooterLink>
              ))}
              {customPages.slice(0, 3).map((page) => (
                <FooterLink key={page._id} href={`/pages/${page.slug}`}>
                  {page.title}
                </FooterLink>
              ))}
            </FooterLinkGroup>
          </nav>

          {/* Legal */}
          <nav aria-labelledby="footer-legal">
            <FooterTitle title="Legal" id="footer-legal" />
            <FooterLinkGroup col>
              {legalPages.map((page) => (
                <FooterLink key={page._id} href={`/pages/${page.slug}`}>
                  {page.title}
                </FooterLink>
              ))}
              {customPages.slice(3, 6).map((page) => (
                <FooterLink key={page._id} href={`/pages/${page.slug}`}>
                  {page.title}
                </FooterLink>
              ))}
            </FooterLinkGroup>
          </nav>

          {/* Newsletter */}
          <div>
            <FooterTitle title="Newsletter" />
            <div className="flex flex-col gap-3">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Subscribe to receive updates, access to exclusive deals, and
                more.
              </p>
              <NewsletterSubscribeForm />
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="w-full bg-gray-100 dark:bg-gray-700 px-4 py-6 sm:flex sm:items-center sm:justify-between">
          {companyInfo.copyright_text ? (
            <div className="text-sm text-gray-500 dark:text-gray-300">
              {companyInfo.copyright_text}
            </div>
          ) : (
            <FooterCopyright
              href="#"
              by="SYSFOC e-commerce app"
              year={new Date().getFullYear()}
            />
          )}
          <nav className="mt-4 flex space-x-6 sm:mt-0 sm:justify-center" aria-label="Social media links">
            {socialIcons.length > 0 ? (
              socialIcons.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.key}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-500 hover:text-gray-900 dark:hover:text-white"
                    aria-label={`Visit our ${social.label} page`}
                    style={{ minWidth: '44px', minHeight: '44px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Icon className="h-5 w-5"/>
                  </a>
                );
              })
            ) : (
              <>
                <FooterIcon href="#" icon={BsFacebook} aria-label="Facebook" />
                <FooterIcon href="#" icon={BsInstagram} aria-label="Instagram" />
                <FooterIcon href="#" icon={BsTwitterX} aria-label="Twitter/X" />
                <FooterIcon href="#" icon={BsGithub} aria-label="GitHub" />
              </>
            )}
          </nav>
        </div>
      </div>
    </Footer>
  );
};

export default Footerr;