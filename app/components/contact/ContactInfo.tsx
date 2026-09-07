// app/components/contact/ContactInfo.tsx
"use client";

import { Mail, Phone, MapPin, ExternalLink } from "lucide-react";
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

interface ContactInfoProps {
  settings: any;
}

export default function ContactInfo({ settings }: ContactInfoProps) {
  if (!settings) return null;

  const rawWa = settings.social_media?.whatsapp || "";
  const waLink = rawWa.startsWith("http")
    ? rawWa
    : rawWa.trim()
    ? `https://wa.me/${rawWa.replace(/\D/g, "")}`
    : "";

  const socialPlatforms = [
    { key: "facebook", label: "Facebook", icon: BsFacebook, href: settings.social_media?.facebook },
    { key: "instagram", label: "Instagram", icon: BsInstagram, href: settings.social_media?.instagram },
    { key: "tiktok", label: "TikTok", icon: BsTiktok, href: settings.social_media?.tiktok },
    { key: "whatsapp", label: "WhatsApp", icon: BsWhatsapp, href: waLink || undefined },
    { key: "pinterest", label: "Pinterest", icon: BsPinterest, href: settings.social_media?.pinterest },
    { key: "youtube", label: "YouTube", icon: BsYoutube, href: settings.social_media?.youtube },
    { key: "twitter", label: "X (Twitter)", icon: BsTwitterX, href: settings.social_media?.twitter },
    { key: "linkedin", label: "LinkedIn", icon: BsLinkedin, href: settings.social_media?.linkedin },
  ];

  const activeSocials = socialPlatforms.filter(
    (p) => p.href && typeof p.href === "string" && p.href.trim().length > 0
  );

  return (
    <div className="space-y-6">
      <div className="border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark p-6 sm:p-8 space-y-6">
        <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark pb-3 border-b border-theme-border-light dark:border-theme-border-dark">
          Workshop & Studio
        </h3>

        <div className="space-y-5">
          {settings.company_email && (
            <div className="flex items-start gap-3">
              <Mail className="w-4 h-4 text-theme-hover-light dark:text-theme-hover-dark mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[10px] uppercase tracking-wider text-theme-text-muted-light dark:text-theme-text-muted-dark font-medium">
                  Direct Email
                </p>
                <a
                  href={`mailto:${settings.company_email}`}
                  className="text-xs sm:text-sm text-theme-text-primary-light dark:text-theme-text-primary-dark hover:text-theme-hover-light transition-colors"
                >
                  {settings.company_email}
                </a>
              </div>
            </div>
          )}

          {settings.company_phone && (
            <div className="flex items-start gap-3">
              <Phone className="w-4 h-4 text-theme-hover-light dark:text-theme-hover-dark mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[10px] uppercase tracking-wider text-theme-text-muted-light dark:text-theme-text-muted-dark font-medium">
                  Telephone
                </p>
                <a
                  href={`tel:${settings.company_phone}`}
                  className="text-xs sm:text-sm text-theme-text-primary-light dark:text-theme-text-primary-dark hover:text-theme-hover-light transition-colors"
                >
                  {settings.company_phone}
                </a>
              </div>
            </div>
          )}

          {settings.company_address && (
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-theme-hover-light dark:text-theme-hover-dark mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[10px] uppercase tracking-wider text-theme-text-muted-light dark:text-theme-text-muted-dark font-medium">
                  Address
                </p>
                <p className="text-xs sm:text-sm text-theme-text-primary-light dark:text-theme-text-primary-dark leading-relaxed">
                  {settings.company_address}
                </p>
                {settings.company_location_link && (
                  <a
                    href={settings.company_location_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-theme-hover-light/10 dark:bg-theme-hover-dark/15 border border-theme-hover-light/30 dark:border-theme-hover-dark/30 text-theme-hover-light dark:text-theme-hover-dark hover:bg-theme-hover-light hover:text-white dark:hover:bg-theme-hover-dark dark:hover:text-white transition-all text-xs font-medium mt-2"
                  >
                    <span>View on Google Maps</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          )}

          {activeSocials.length > 0 && (
            <div className="pt-4 border-t border-theme-border-light dark:border-theme-border-dark space-y-2.5">
              <p className="text-[10px] uppercase tracking-wider text-theme-text-muted-light dark:text-theme-text-muted-dark font-medium">
                Connect With Us
              </p>
              <div className="flex items-center flex-wrap gap-2 pt-1">
                {activeSocials.map((platform) => {
                  const Icon = platform.icon;
                  return (
                    <a
                      key={platform.key}
                      href={platform.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-7 h-7 rounded-full border border-theme-border-light dark:border-theme-border-dark hover:border-theme-hover-light dark:hover:border-theme-hover-dark flex items-center justify-center text-theme-text-secondary-light dark:text-theme-text-secondary-dark hover:text-theme-hover-light dark:hover:text-theme-hover-dark transition-all shadow-2xs"
                      aria-label={platform.label}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

