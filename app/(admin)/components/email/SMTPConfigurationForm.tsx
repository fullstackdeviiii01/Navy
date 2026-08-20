// SMTPConfigurationForm.tsx
"use client";

import { FaServer } from "react-icons/fa";

interface SMTPConfigurationFormProps {
  smtpSettings: {
    host: string;
    port: number;
    secure: boolean;
    auth_user: string;
    auth_pass: string;
  };
  onSMTPChange: (field: string, value: any) => void;
}

export default function SMTPConfigurationForm({ smtpSettings, onSMTPChange }: SMTPConfigurationFormProps) {
  return (
    <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg shadow border border-theme-border-light dark:border-theme-border-dark p-3 sm:p-4 lg:p-6">
      <h3 className="text-base sm:text-lg font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark mb-3 sm:mb-4 flex items-center gap-2">
        <FaServer className="text-blue-600 text-sm sm:text-base" aria-hidden="true" />
        SMTP Configuration
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3 lg:gap-4">
        <div>
          <label className="block text-xs sm:text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1 sm:mb-2">
            SMTP Host *
          </label>
          <input
            type="text"
            value={smtpSettings.host}
            onChange={(e) => onSMTPChange("host", e.target.value)}
            required
            placeholder="smtp.gmail.com"
            className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary"
          />
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1 sm:mb-2">
            SMTP Port *
          </label>
          <input
            type="number"
            value={smtpSettings.port}
            onChange={(e) => onSMTPChange("port", parseInt(e.target.value) || 587)}
            required
            placeholder="587"
            className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary"
          />
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1 sm:mb-2">
            SMTP Username *
          </label>
          <input
            type="text"
            value={smtpSettings.auth_user}
            onChange={(e) => onSMTPChange("auth_user", e.target.value)}
            required
            placeholder="your-email@gmail.com"
            className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary"
          />
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1 sm:mb-2">
            SMTP Password *
          </label>
          <input
            type="password"
            value={smtpSettings.auth_pass}
            onChange={(e) => onSMTPChange("auth_pass", e.target.value)}
            required
            placeholder="App password or SMTP password"
            className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary"
          />
        </div>

        <div className="md:col-span-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={smtpSettings.secure}
              onChange={(e) => onSMTPChange("secure", e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 flex-shrink-0"
            />
            <span className="text-xs sm:text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
              Use TLS/SSL (recommended for port 465)
            </span>
          </label>
        </div>
      </div>

      <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-200">
          <strong>Gmail Users:</strong> Use an App Password instead of
          your regular password. Generate one at:{" "}
          <a
            href="https://myaccount.google.com/apppasswords"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:no-underline break-words"
          >
            Google App Passwords
            <span className="sr-only"> (opens in new tab)</span>
          </a>
        </p>
      </div>
    </div>
  );
}