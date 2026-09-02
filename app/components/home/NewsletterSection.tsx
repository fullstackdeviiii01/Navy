// app/components/home/NewsletterSection.tsx
"use client";

import React, { useState } from "react";
import Image from "next/image";
import { BsInstagram, BsFacebook, BsPinterest, BsWhatsapp } from "react-icons/bs";
import { Check, Loader2 } from "lucide-react";
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
      <div className="flex flex-col lg:flex-row items-center min-h-[160px] sm:min-h-[180px] md:min-h-[190px]">
        
        {/* 1. LEFT: Image touching top, bottom and left borders completely */}
        <div className="relative w-full lg:w-[220px] xl:w-[260px] h-[160px] sm:h-[180px] md:h-[190px] lg:h-auto lg:self-stretch shrink-0">
          <Image
            src="/images/newsletter-lantern.jpg"
            alt="Handcrafted Atmospheric Wooden Lantern"
            fill
            sizes="(max-width: 1024px) 100vw, 260px"
            className="object-cover object-center lg:object-left"
          />
          {/* Subtle dark gradient overlay blending into right content */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#120D09] hidden lg:block" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#120D09] via-transparent to-transparent lg:hidden" />
        </div>

        {/* 2. CENTER & RIGHT: Grouped closely together with compact spacing */}
        <div className="flex-1 w-full flex flex-col lg:flex-row items-center lg:items-center justify-start gap-6 lg:gap-12 px-6 sm:px-8 md:px-12 py-6 lg:py-4">
          
          {/* Headline & Description */}
          <div className="flex flex-col justify-center space-y-1 text-center lg:text-left max-w-xs shrink-0">
            <h2 className="text-xl sm:text-2xl md:text-[26px] font-serif font-bold text-white tracking-tight leading-snug">
              Stay Updated
            </h2>
            <p className="text-xs sm:text-[13px] text-[#A89B8C] leading-relaxed font-sans">
              Subscribe to receive updates, new collections and exclusive offers.
            </p>
          </div>

          {/* Form + Social Icons Group (Close to text, with taller input field) */}
          <div className="flex flex-col items-center lg:items-start space-y-2.5 w-full max-w-md shrink-0">
            
            {/* Feedback Message */}
            {feedbackMsg && (
              <div
                className={`text-xs px-3 py-1.5 rounded-[2px] border w-full transition-all ${
                  subscribed
                    ? "bg-emerald-950/80 border-emerald-500/50 text-emerald-200"
                    : "bg-rose-950/80 border-rose-500/50 text-rose-200"
                }`}
              >
                {feedbackMsg}
              </div>
            )}

            {/* Input + SUBSCRIBE Button (Slightly taller height ~46-50px) */}
            <form onSubmit={handleSubmit} className="w-full flex items-stretch h-[46px] sm:h-[50px]">
              <input
                type="email"
                required
                value={email}
                disabled={submitting}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="flex-1 bg-[#F5EFE6] text-[#241910] placeholder-[#8C7E72] text-xs sm:text-sm px-4 rounded-l-[4px] focus:outline-none font-sans disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={submitting}
                className="px-6 sm:px-8 bg-[#C58A2B] hover:bg-[#D99B35] text-white text-xs sm:text-[13px] font-bold uppercase tracking-[0.12em] rounded-r-[4px] transition-all duration-200 active:scale-98 shrink-0 flex items-center justify-center cursor-pointer disabled:opacity-75"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : subscribed ? (
                  <span className="inline-flex items-center gap-1 text-white font-bold">
                    <Check className="w-4 h-4" />
                    SUBSCRIBED
                  </span>
                ) : (
                  <span>SUBSCRIBE</span>
                )}
              </button>
            </form>

            {/* 4 Circular Social Media Icons (Aligned right beneath input) */}
            <div className="flex items-center gap-2.5 pt-0.5 text-white/90">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-white/20 hover:border-[#C58A2B] bg-[#1C140E] flex items-center justify-center hover:text-[#C58A2B] transition-all duration-200 cursor-pointer"
                aria-label="Instagram"
              >
                <BsInstagram className="w-3.5 h-3.5" />
              </a>

              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-white/20 hover:border-[#C58A2B] bg-[#1C140E] flex items-center justify-center hover:text-[#C58A2B] transition-all duration-200 cursor-pointer"
                aria-label="Facebook"
              >
                <BsFacebook className="w-3.5 h-3.5" />
              </a>

              <a
                href="https://pinterest.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-white/20 hover:border-[#C58A2B] bg-[#1C140E] flex items-center justify-center hover:text-[#C58A2B] transition-all duration-200 cursor-pointer"
                aria-label="Pinterest"
              >
                <BsPinterest className="w-3.5 h-3.5" />
              </a>

              <a
                href="https://wa.me/923130538686"
                target="_blank"
                rel="noopener noreferrer"
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-white/20 hover:border-[#C58A2B] bg-[#1C140E] flex items-center justify-center hover:text-[#C58A2B] transition-all duration-200 cursor-pointer"
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
