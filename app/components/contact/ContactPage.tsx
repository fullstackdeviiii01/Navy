"use client";

import { useState, useEffect } from "react";
import { FaHome, FaChevronRight } from "react-icons/fa";
import Link from "next/link";
import { siteSettingsApi } from "../../../lib/api/siteSettings";
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
      <div className="relative h-64">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-theme-bg-light dark:bg-theme-bg-dark py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm mb-6">
          <Link
            href="/"
            aria-label="Home"
            className="text-theme-text-muted-light dark:text-theme-text-muted-dark hover:text-theme-text-secondary-light dark:hover:text-theme-text-secondary-dark transition-colors"
          >
            <FaHome/>
          </Link>
          <FaChevronRight className="text-theme-text-muted-light dark:text-theme-text-muted-dark text-xs" aria-hidden="true" />
          <span aria-current="page" className="text-theme-text-primary-light dark:text-theme-text-primary-dark font-medium">
            Contact Us
          </span>
        </nav>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark mb-3">
            Get In Touch
          </h1>
          <p className="text-theme-text-muted-light dark:text-theme-text-muted-dark max-w-2xl mx-auto">
            Have a question or need assistance? We're here to help!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Information - Left Side */}
          <div className="lg:col-span-1">
            <ContactInfo settings={settings} />
          </div>

          {/* Contact Form - Right Side */}
          <div className="lg:col-span-2">
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  );
}
