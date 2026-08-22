// app/(admin)/atelier-config/views/AtelierSettingsView.tsx
"use client";

import BrandIdentityStudio from "../components/BrandIdentityStudio";
import { Sliders } from "lucide-react";

export default function AtelierSettingsView() {
  return (
    <div className="space-y-6 pb-16">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-theme-border-light/80 dark:border-theme-border-dark/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-serif font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark tracking-tight">
              Website & Store Settings
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200">
              <Sliders className="w-3 h-3" />
              Store Settings
            </span>
          </div>
          <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark mt-0.5">
            Configure store name, upload brand logo, and manage contact details and social media links.
          </p>
        </div>
      </div>

      <BrandIdentityStudio />
    </div>
  );
}
