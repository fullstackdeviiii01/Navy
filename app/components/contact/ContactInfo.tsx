// app/components/contact/ContactInfo.tsx
"use client";

import { Mail, Phone, MapPin, Clock } from "lucide-react";

interface ContactInfoProps {
  settings: any;
}

export default function ContactInfo({ settings }: ContactInfoProps) {
  if (!settings) return null;

  const getTodayHours = () => {
    if (!settings.working_hours) return null;
    const days = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];
    const today = days[new Date().getDay()];
    const todayHours = settings.working_hours[today];
    if (!todayHours) return null;
    return todayHours.is_open
      ? `${todayHours.open} - ${todayHours.close}`
      : "Closed";
  };

  const todayHours = getTodayHours();

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
              </div>
            </div>
          )}

          {todayHours && (
            <div className="flex items-start gap-3">
              <Clock className="w-4 h-4 text-theme-hover-light dark:text-theme-hover-dark mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[10px] uppercase tracking-wider text-theme-text-muted-light dark:text-theme-text-muted-dark font-medium">
                  Operating Hours Today
                </p>
                <p className="text-xs sm:text-sm text-theme-text-primary-light dark:text-theme-text-primary-dark">
                  {todayHours}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
