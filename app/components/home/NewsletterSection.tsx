// app/components/home/NewsletterSection.tsx
"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { 
  BsInstagram, 
  BsTiktok,
  BsFacebook, 
  BsPinterest, 
  BsWhatsapp, 
  BsYoutube, 
  BsTwitterX, 
  BsLinkedin 
} from "react-icons/bs";
import { Check, Loader2 } from "lucide-react";
import { newsletterApi } from "../../../lib/api/newsletter";
import { siteSettingsApi } from "../../../lib/api/siteSettings";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [socialMedia, setSocialMedia] = useState<{
    instagram?: string;
    tiktok?: string;
    facebook?: string;
    whatsapp?: string;
    pinterest?: string;
    youtube?: string;
    twitter?: string;
    linkedin?: string;
  }>({});

  useEffect(() => {
    siteSettingsApi
      .getCompanyInfo()
      .then((data) => {
        const sm = data?.company_info?.social_media || data?.social_media;
        if (sm) {
          setSocialMedia({
            instagram: sm.instagram || "",
            tiktok: sm.tiktok || "",
            facebook: sm.facebook || "",
            whatsapp: sm.whatsapp || "",
            pinterest: sm.pinterest || "",
            youtube: sm.youtube || "",
            twitter: sm.twitter || "",
            linkedin: sm.linkedin || "",
          });
        }
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || submitting) return;

    setSubmitting(true);
    setFeedbackMsg(null);

    try {
      const res = await newsletterApi.subscribe(email.trim(), undefined);
      setSubscribed(true);
      setFeedbackMsg(res.message || "Thank you for subscribing!");
      setEmail("");
      setTimeout(() => {
        setSubscribed(false);
        setFeedbackMsg(null);
      }, 5000);
    } catch (error: any) {
      setFeedbackMsg(error.message || "Failed to subscribe. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const rawWa = socialMedia.whatsapp || "";
  const whatsappHref = rawWa.startsWith("http")
    ? rawWa
    : rawWa.trim()
    ? `https://wa.me/${rawWa.replace(/\D/g, "")}`
    : "";

  const socialPlatforms = [
    {
      key: "facebook",
      label: "Facebook",
      icon: BsFacebook,
      href: socialMedia.facebook,
      hoverClass: "hover:border-[#C58A2B] hover:text-[#C58A2B] hover:!text-[#C58A2B]",
    },
    {
      key: "instagram",
      label: "Instagram",
      icon: BsInstagram,
      href: socialMedia.instagram,
      hoverClass: "hover:border-[#C58A2B] hover:text-[#C58A2B] hover:!text-[#C58A2B]",
    },
    {
      key: "tiktok",
      label: "TikTok",
      icon: BsTiktok,
      href: socialMedia.tiktok,
      hoverClass: "hover:border-black dark:hover:border-white hover:text-black dark:hover:text-white",
    },
    {
      key: "whatsapp",
      label: "WhatsApp",
      icon: BsWhatsapp,
      href: whatsappHref || undefined,
      hoverClass: "hover:border-[#25D366] hover:text-[#25D366] hover:!text-[#25D366]",
    },
    {
      key: "pinterest",
      label: "Pinterest",
      icon: BsPinterest,
      href: socialMedia.pinterest,
      hoverClass: "hover:border-[#BD081C] hover:text-[#BD081C] hover:!text-[#BD081C]",
    },
    {
      key: "youtube",
      label: "YouTube",
      icon: BsYoutube,
      href: socialMedia.youtube,
      hoverClass: "hover:border-[#FF0000] hover:text-[#FF0000] hover:!text-[#FF0000]",
    },
    {
      key: "twitter",
      label: "X (Twitter)",
      icon: BsTwitterX,
      href: socialMedia.twitter,
      hoverClass: "hover:border-black dark:hover:border-white hover:text-black dark:hover:text-white",
    },
    {
      key: "linkedin",
      label: "LinkedIn",
      icon: BsLinkedin,
      href: socialMedia.linkedin,
      hoverClass: "hover:border-[#0A66C2] hover:text-[#0A66C2] hover:!text-[#0A66C2]",
    },
  ];

  const activeSocials = socialPlatforms.filter(
    (p) => p.href && typeof p.href === "string" && p.href.trim().length > 0
  );

  return (
    <section className="relative w-full bg-[#E5E5E5] dark:bg-[#120D09] text-[#1C140E] dark:text-[#F3E8D6] border-b border-[#B8A894] dark:border-[#3A2A1D] overflow-hidden select-none transition-colors">
      <div className="flex flex-col lg:flex-row items-center min-h-[160px] sm:min-h-[180px] md:min-h-[190px]">
        
        {/* 1. LEFT (LAPTOP): Handcrafted Lantern Image touching borders */}
        <div className="hidden lg:block relative w-[180px] xl:w-[250px] lg:self-stretch shrink-0 overflow-hidden">
          <Image
            src="/images/newsletter-lantern.jpg"
            alt="Handcrafted Atmospheric Wooden Lantern"
            fill
            sizes="(max-width: 1280px) 180px, 250px"
            className="object-cover object-left"
          />
          {/* Subtle light gradient overlay blending into right content */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#E5E5E5] dark:to-[#120D09]" />
        </div>

        {/* 2. RESPONSIVE CONTENT AREA */}
        <div className="flex-1 min-w-0 w-full flex flex-col lg:flex-row items-center lg:items-center justify-start gap-4 lg:gap-8 xl:gap-12 px-4 sm:px-6 lg:px-6 xl:px-10 py-5 lg:py-4">
          
          {/* Headline & Description: Paragraph visible only on laptop/desktop */}
          <div className="flex flex-col justify-center space-y-1 text-left w-full lg:w-auto max-w-sm lg:max-w-[240px] xl:max-w-xs shrink-0">
            <h2 className="text-[18px] xs:text-[20px] sm:text-2xl md:text-[26px] font-serif font-bold text-[#1C140E] dark:text-white tracking-tight leading-snug">
              Stay Updated!
            </h2>
            <p className="hidden lg:block text-xs sm:text-[13px] text-[#5A4638] dark:text-[#A89B8C] leading-relaxed font-sans">
              Subscribe to get special offers, new collections and updates directly in your inbox.
            </p>
          </div>

          {/* Form + Social Icons Group (Fluid, responsive, never overflows) */}
          <div className="flex flex-col items-center lg:items-start space-y-2.5 w-full max-w-sm sm:max-w-md lg:max-w-md flex-1 min-w-0">
            
            {/* Feedback Message */}
            {feedbackMsg && (
              <div
                className={`text-xs px-3 py-1.5 rounded-[2px] border w-full text-center transition-all ${
                  subscribed
                    ? "bg-emerald-100 border-emerald-500 text-emerald-800"
                    : "bg-rose-100 border-rose-500 text-rose-800"
                }`}
              >
                {feedbackMsg}
              </div>
            )}

            {/* Input + SUBSCRIBE Button Bar */}
            <form onSubmit={handleSubmit} className="w-full flex items-stretch h-10 xs:h-11 sm:h-[46px] lg:h-[48px] shadow-sm">
              <input
                type="email"
                required
                value={email}
                disabled={submitting}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="flex-1 min-w-0 bg-white dark:bg-[#1C140E] text-[#241910] dark:text-white placeholder-[#8C7E72] text-xs xs:text-[12.5px] sm:text-sm px-3.5 sm:px-4 rounded-l-[4px] border-y border-l border-[#D5D0C6] dark:border-transparent focus:outline-none font-sans disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={submitting}
                className="no-theme-hover px-4 xs:px-5 sm:px-6 lg:px-6 xl:px-8 bg-[#C58A2B] hover:bg-[#B37F33] text-white hover:text-white text-[11px] xs:text-xs sm:text-[13px] font-bold uppercase tracking-[0.08em] sm:tracking-[0.1em] rounded-r-[4px] transition-all duration-200 active:scale-98 shrink-0 flex items-center justify-center cursor-pointer disabled:opacity-75 whitespace-nowrap"
              >
                {submitting ? (
                  <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin text-white" />
                ) : subscribed ? (
                  <span className="inline-flex items-center gap-1 text-white font-bold">
                    <Check className="w-3.5 h-3.5" />
                    SUBSCRIBED
                  </span>
                ) : (
                  <span>SUBSCRIBE</span>
                )}
              </button>
            </form>

            {/* Circular Social Media Icons (Centered on mobile, left-aligned under input on laptop) */}
            {activeSocials.length > 0 && (
              <div className="flex items-center justify-center lg:justify-start flex-wrap gap-2.5 pt-0.5 text-white/90 w-full">
                {activeSocials.map((platform) => {
                  const Icon = platform.icon;
                  return (
                    <a
                      key={platform.key}
                      href={platform.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`no-theme-hover w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-[#D5D0C6] dark:border-white/20 bg-white dark:bg-[#1C140E] flex items-center justify-center text-[#241910] dark:text-white/80 transition-all duration-200 cursor-pointer shadow-2xs ${platform.hoverClass}`}
                      aria-label={platform.label}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </a>
                  );
                })}
              </div>
            )}

          </div>

        </div>

      </div>
    </section>
  );
}
