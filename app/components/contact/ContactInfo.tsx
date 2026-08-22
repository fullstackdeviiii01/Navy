// app/components/contact/ContactInfo.tsx
"use client";

import { Mail, Phone, MapPin, ExternalLink } from "lucide-react";

interface ContactInfoProps {
  settings: any;
}

export default function ContactInfo({ settings }: ContactInfoProps) {
  if (!settings) return null;

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
                    className="inline-flex items-center gap-1 text-[11px] text-theme-hover-light dark:text-theme-hover-dark hover:underline mt-1 font-medium"
                  >
                    <span>View on Google Maps</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

