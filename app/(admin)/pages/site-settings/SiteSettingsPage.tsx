"use client";

import CompanyInfoSettings from "../../components/site-settings/CompanyInfoSettings";

export default function SiteSettingsPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
        Site Settings
      </h2>
      <div className="p-6 bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg shadow border border-theme-border-light dark:border-theme-border-dark">
        <CompanyInfoSettings />
      </div>
    </div>
  );
}
