// app/components/home/NewsletterSection.tsx
"use client";

import React, { useState } from "react";
import Image from "next/image";
import { BsInstagram, BsFacebook, BsWhatsapp } from "react-icons/bs";
import { Check, Loader2, Send } from "lucide-react";
import { newsletterApi } from "../../../lib/api/newsletter";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

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

  return (
    <section className="relative w-full bg-[#120D09] text-[#F3E8D6] border-y border-[#3A2A1D] overflow-hidden select-none transition-colors">
      
      {/* Ambient background glow on mobile/tablet */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#C58A2B]/10 via-transparent to-transparent pointer-events-none lg:hidden" />

      <div className="flex flex-col lg:flex-row items-center min-h-[160px] sm:min-h-[180px] md:min-h-[190px]">
        
        {/* 1. DESKTOP ONLY: Handcrafted Lantern Image on Left */}
        <div className="hidden lg:block relative w-[220px] xl:w-[260px] lg:self-stretch shrink-0 overflow-hidden">
          <Image
            src="/images/newsletter-lantern.jpg"
            alt="Handcrafted Atmospheric Wooden Lantern"
            fill
            sizes="260px"
            className="object-cover object-left"
          />
          {/* Dark gradient overlay blending into content */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#120D09]" />
        </div>

        {/* 2. RESPONSIVE CONTENT AREA (MOBILE, TABLET & DESKTOP) */}
        <div className="w-full flex-1 flex flex-col lg:flex-row items-center justify-between gap-5 sm:gap-6 lg:gap-10 px-4 sm:px-8 md:px-12 py-8 sm:py-10 lg:py-6 relative z-10">
          
          {/* Headline & Description */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left max-w-sm sm:max-w-md shrink-0 space-y-1 sm:space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="h-[1px] w-4 bg-[#C58A2B]/60 lg:hidden" />
              <h2 className="text-xl sm:text-2xl md:text-[26px] font-serif font-bold text-white tracking-tight leading-snug">
                Stay Updated
              </h2>
              <span className="h-[1px] w-4 bg-[#C58A2B]/60 lg:hidden" />
            </div>
            <p className="text-xs sm:text-[13px] text-[#A89B8C] leading-relaxed font-sans max-w-xs sm:max-w-sm">
              Subscribe to receive updates, new collections and exclusive offers.
            </p>
          </div>

          {/* Form + Social Icons Container */}
          <div className="w-full max-w-md sm:max-w-lg lg:max-w-md flex flex-col items-center lg:items-start space-y-3">
            
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

            {/* Responsive Input + Submit Button Bar */}
            <form onSubmit={handleSubmit} className="w-full flex items-stretch h-11 sm:h-12 shadow-md">
              <input
                type="email"
                required
                value={email}
                disabled={submitting}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="flex-1 min-w-0 bg-[#F5EFE6] text-[#241910] placeholder-[#8C7E72] text-xs sm:text-sm px-3.5 sm:px-4 rounded-l-[4px] focus:outline-none font-sans disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={submitting}
                className="no-theme-hover px-5 sm:px-7 bg-[#C58A2B] hover:bg-[#D99B35] text-white hover:text-white text-xs sm:text-[13px] font-bold uppercase tracking-[0.1em] sm:tracking-[0.12em] rounded-r-[4px] transition-all duration-200 active:scale-98 shrink-0 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-75 whitespace-nowrap"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : subscribed ? (
                  <span className="inline-flex items-center gap-1 text-white font-bold">
                    <Check className="w-3.5 h-3.5" />
                    SUBSCRIBED
                  </span>
                ) : (
                  <>
                    <span>SUBSCRIBE</span>
                    <Send className="w-3.5 h-3.5 hidden sm:inline-block text-white" />
                  </>
                )}
              </button>
            </form>

            {/* Social Media Links Row (Instagram, Facebook, WhatsApp) */}
            <div className="flex items-center justify-center lg:justify-start gap-3 pt-0.5 text-white/90 w-full">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="no-theme-hover w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-white/20 hover:border-[#C58A2B] bg-[#1C140E] flex items-center justify-center text-white/80 hover:text-[#C58A2B] hover:!text-[#C58A2B] transition-all duration-200 cursor-pointer"
                aria-label="Instagram"
              >
                <BsInstagram className="w-3.5 h-3.5" />
              </a>

              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="no-theme-hover w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-white/20 hover:border-[#C58A2B] bg-[#1C140E] flex items-center justify-center text-white/80 hover:text-[#C58A2B] hover:!text-[#C58A2B] transition-all duration-200 cursor-pointer"
                aria-label="Facebook"
              >
                <BsFacebook className="w-3.5 h-3.5" />
              </a>

              <a
                href="https://wa.me/923130538686"
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
