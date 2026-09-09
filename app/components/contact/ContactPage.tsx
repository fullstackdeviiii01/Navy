// app/components/contact/ContactPage.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronRight, MapPin, ExternalLink } from "lucide-react";
import { siteSettingsApi } from "../../../lib/api/siteSettings";
import { getGoogleMapsEmbedUrl } from "../../../lib/utils/googleMaps";
import ContactForm from "./ContactForm";
import ContactInfo from "./ContactInfo";
import Loader from "../shared/Loader";

export default function ContactPage() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await siteSettingsApi.getCompanyInfo();
      setSettings(data.company_info || null);
    } catch (error) {
      console.error("Failed to fetch company info:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-theme-bg-light dark:bg-theme-bg-dark flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  const mapEmbedUrl = settings ? getGoogleMapsEmbedUrl(settings.company_location_link, settings.company_address) : "";

  return (
    <div className="min-h-screen bg-theme-bg-light dark:bg-theme-bg-dark py-12 sm:py-16 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] mb-8" aria-label="Breadcrumb">
          <Link
            href="/"
            aria-label="Home"
            className="text-theme-text-muted-light dark:text-theme-text-muted-dark hover:text-theme-text-primary-light dark:hover:text-theme-text-primary-dark transition-colors"
          >
            HOME
          </Link>
          <ChevronRight className="w-3 h-3 text-theme-text-muted-light dark:text-theme-text-muted-dark" />
          <span aria-current="page" className="text-theme-text-primary-light dark:text-theme-text-primary-dark font-medium">
            CONTACT
          </span>
        </nav>

        {/* Header */}
        <div className="mb-12 border-b border-theme-border-light dark:border-theme-border-dark pb-8">
          <p className="text-xs font-medium tracking-[0.25em] uppercase text-theme-hover-light dark:text-theme-hover-dark mb-2">
            CLIENT CONCIERGE
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark tracking-tight mb-3">
            Get in Touch
          </h1>
          <p className="text-xs sm:text-sm text-theme-text-secondary-light dark:text-theme-text-secondary-dark max-w-2xl leading-relaxed">
            Whether you have an inquiry about an existing order, customized dimensions, or material finishes, our team is at your disposal.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Contact Information */}
          <div className="lg:col-span-1">
            <ContactInfo settings={settings} />
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <ContactForm />
          </div>
        </div>

        {/* Atelier Location & Interactive Google Map */}
        {(settings?.company_location_link || settings?.company_address) && mapEmbedUrl && (
          <div className="mt-12 sm:mt-16 pt-8 sm:pt-12 border-t border-theme-border-light dark:border-theme-border-dark">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
              <div>
                <p className="text-xs font-medium tracking-[0.2em] uppercase text-theme-hover-light dark:text-theme-hover-dark mb-1">
                  FIND OUR WORKSHOP
                </p>
                <h2 className="text-2xl sm:text-3xl font-serif font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark tracking-tight">
                  Atelier &amp; Studio Location
                </h2>
                {settings.company_address && (
                  <p className="text-xs sm:text-sm text-theme-text-secondary-light dark:text-theme-text-secondary-dark mt-1.5 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-theme-hover-light dark:text-theme-hover-dark shrink-0" />
                    <span>{settings.company_address}</span>
                  </p>
                )}
              </div>
              {settings.company_location_link && (
                <a
                  href={settings.company_location_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="no-theme-hover inline-flex items-center gap-2 px-4 py-2.5 rounded-sm text-xs font-semibold uppercase tracking-wider shadow-xs shrink-0 self-start sm:self-auto transition-opacity hover:opacity-90"
                  style={{ backgroundColor: "#A8752B", color: "#FFFFFF" }}
                >
                  <MapPin className="w-3.5 h-3.5" style={{ color: "#FFFFFF" }} />
                  <span style={{ color: "#FFFFFF" }}>Open in Google Maps</span>
                  <ExternalLink className="w-3 h-3" style={{ color: "#FFFFFF" }} />
                </a>
              )}
            </div>

            {/* Responsive Map Container */}
            <div className="relative w-full h-[320px] sm:h-[400px] md:h-[460px] rounded-lg overflow-hidden border border-theme-border-light dark:border-theme-border-dark shadow-sm bg-neutral-100 dark:bg-neutral-900">
              <iframe
                title="Atelier Workshop Location Map"
                src={mapEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
