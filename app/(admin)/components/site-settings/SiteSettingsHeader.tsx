// app/(admin)/components/site-settings/SiteSettingsHeader.tsx
"use client";

interface SiteSettingsHeaderProps {
  title?: string;
  description?: string;
}

export default function SiteSettingsHeader({ 
  title = "Site Settings",
  description = "Configure your website pages, components, and metadata"
}: SiteSettingsHeaderProps) {
  return (
    <div>
      <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark">
        {title}
      </h2>
      <p className="text-xs sm:text-sm text-theme-text-muted-light dark:text-theme-text-muted-dark mt-1">
        {description}
      </p>
    </div>
  );
}