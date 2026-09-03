// app/components/home/NewsletterSection.tsx
"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { BsInstagram, BsFacebook, BsWhatsapp } from "react-icons/bs";
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
    facebook?: string;
    whatsapp?: string;
  }>({});

  useEffect(() => {
    siteSettingsApi
      .getCompanyInfo()
      .then((info) => {
        if (info?.social_media) {
          setSocialMedia(info.social_media);
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

  const whatsappHref = socialMedia.whatsapp
    ? `https://wa.me/${socialMedia.whatsapp.replace(/\D/g, "")}`
    : "https://wa.me/923009692765";

  return (
    <section className="relative w-full bg-[#120D09] text-[#F3E8D6] border-y border-[#3A2A1D] overflow-hidden select-none transition-colors">
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
          {/* Subtle dark gradient overlay blending into right content */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#120D09]" />
        </div>

        {/* 2. RESPONSIVE CONTENT AREA */}
        <div className="flex-1 min-w-0 w-full flex flex-col lg:flex-row items-center lg:items-center justify-start gap-4 lg:gap-8 xl:gap-12 px-4 sm:px-6 lg:px-6 xl:px-10 py-5 lg:py-4">
          
          {/* Headline & Description: Paragraph visible only on laptop/desktop */}
          <div className="flex flex-col justify-center space-y-1 text-left w-full lg:w-auto max-w-sm lg:max-w-[240px] xl:max-w-xs shrink-0">
            <h2 className="text-[18px] xs:text-[20px] sm:text-2xl md:text-[26px] font-serif font-bold text-white tracking-tight leading-snug">
              Stay Updated!
            </h2>
            <p className="hidden lg:block text-xs sm:text-[13px] text-[#A89B8C] leading-relaxed font-sans">
              Subscribe to receive updates, new collections and exclusive offers.
            </p>
          </div>

          {/* Form + Social Icons Group (Fluid, responsive, never overflows) */}
          <div className="flex flex-col items-center lg:items-start space-y-2.5 w-full max-w-sm sm:max-w-md lg:max-w-md flex-1 min-w-0">
            
            {/* Feedback Message */}
            {feedbackMsg && (
              <div
                className={`text-xs px-3 py-1.5 rounded-[2px] border w-full text-center transition-all ${
                  subscribed
                    ? "bg-emerald-950/80 border-emerald-500/50 text-emerald-200"
                    : "bg-rose-950/80 border-rose-500/50 text-rose-200"
                }`}
              >
                {feedbackMsg}
              </div>
            )}

            {/* Input + SUBSCRIBE Button Bar */}
            <form onSubmit={handleSubmit} className="w-full flex items-stretch h-10 xs:h-11 sm:h-[46px] lg:h-[48px] shadow-md">
              <input
                type="email"
                required
                value={email}
                disabled={submitting}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="flex-1 min-w-0 bg-[#F5EFE6] text-[#241910] placeholder-[#8C7E72] text-xs xs:text-[12.5px] sm:text-sm px-3.5 sm:px-4 rounded-l-[4px] focus:outline-none font-sans disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={submitting}
                className="no-theme-hover px-4 xs:px-5 sm:px-6 lg:px-6 xl:px-8 bg-[#C58A2B] hover:bg-[#D99B35] text-white hover:text-white text-[11px] xs:text-xs sm:text-[13px] font-bold uppercase tracking-[0.08em] sm:tracking-[0.1em] rounded-r-[4px] transition-all duration-200 active:scale-98 shrink-0 flex items-center justify-center cursor-pointer disabled:opacity-75 whitespace-nowrap"
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
            <div className="flex items-center justify-center lg:justify-start gap-2.5 pt-0.5 text-white/90 w-full">
              <a
                href={socialMedia.facebook || "https://facebook.com"}
                target="_blank"
                rel="noopener noreferrer"
                className="no-theme-hover w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-white/20 hover:border-[#C58A2B] bg-[#1C140E] flex items-center justify-center text-white/80 hover:text-[#C58A2B] hover:!text-[#C58A2B] transition-all duration-200 cursor-pointer"
                aria-label="Facebook"
              >
                <BsFacebook className="w-3.5 h-3.5" />
              </a>

              <a
                href={socialMedia.instagram || "https://instagram.com"}
                target="_blank"
                rel="noopener noreferrer"
                className="no-theme-hover w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-white/20 hover:border-[#C58A2B] bg-[#1C140E] flex items-center justify-center text-white/80 hover:text-[#C58A2B] hover:!text-[#C58A2B] transition-all duration-200 cursor-pointer"
                aria-label="Instagram"
              >
                <BsInstagram className="w-3.5 h-3.5" />
              </a>

              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="no-theme-hover w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-white/20 hover:border-[#25D366] bg-[#1C140E] flex items-center justify-center text-white/80 hover:text-[#25D366] hover:!text-[#25D366] transition-all duration-200 cursor-pointer"
                aria-label="WhatsApp"
              >
                <BsWhatsapp className="w-3.5 h-3.5" />
              </a>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
