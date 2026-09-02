// app/(admin)/dispatch/components/DispatchSmtpConsole.tsx
"use client";

import { Server, Lock, Key, ShieldCheck } from "lucide-react";

interface SMTPSettings {
  host: string;
  port: number;
  secure: boolean;
  auth_user: string;
  auth_pass: string;
}

interface DispatchSmtpConsoleProps {
  smtpSettings: SMTPSettings;
  onSMTPChange: (field: string, value: any) => void;
}

export default function DispatchSmtpConsole({
  smtpSettings,
  onSMTPChange,
}: DispatchSmtpConsoleProps) {
  return (
    <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-xl p-5 sm:p-6 border border-theme-border-light dark:border-theme-border-dark shadow-xs space-y-4">
      <div className="flex items-center gap-2.5 pb-3 border-b border-theme-border-light dark:border-theme-border-dark">
        <div className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200">
          <Server className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
            SMTP Server Credentials
          </h3>
          <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
            Outbound mail gateway configuration for automated notifications.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-theme-text-secondary-light mb-1.5">
            SMTP Host Server *
          </label>
          <input
            type="text"
            placeholder="smtp.gmail.com or mail.talalwoodenlamp.com"
            value={smtpSettings.host}
            onChange={(e) => onSMTPChange("host", e.target.value)}
            required
            className="w-full px-3.5 py-2 text-xs sm:text-sm border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-neutral-500/40"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-theme-text-secondary-light mb-1.5">
            Port Number *
          </label>
          <input
            type="number"
            placeholder="587"
            value={smtpSettings.port}
            onChange={(e) => onSMTPChange("port", parseInt(e.target.value) || 587)}
            required
            className="w-full px-3.5 py-2 text-xs sm:text-sm border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-neutral-500/40"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-theme-text-secondary-light mb-1.5">
            Gateway Username / Email *
          </label>
          <input
            type="text"
            placeholder="dispatch@talalwoodenlamp.com"
            value={smtpSettings.auth_user}
            onChange={(e) => onSMTPChange("auth_user", e.target.value)}
            required
            className="w-full px-3.5 py-2 text-xs sm:text-sm border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-neutral-500/40"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-theme-text-secondary-light mb-1.5">
            Authentication Secret / App Password *
          </label>
          <input
            type="password"
            placeholder="••••••••••••••••"
            value={smtpSettings.auth_pass}
            onChange={(e) => onSMTPChange("auth_pass", e.target.value)}
            required
            className="w-full px-3.5 py-2 text-xs sm:text-sm border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-neutral-500/40"
          />
        </div>
      </div>

      <div className="pt-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={smtpSettings.secure}
            onChange={(e) => onSMTPChange("secure", e.target.checked)}
            className="rounded text-neutral-900 focus:ring-neutral-500"
          />
          <span className="font-semibold text-xs text-theme-text-primary-light dark:text-theme-text-primary-dark">
            Enforce SSL / TLS Secure Socket Connection (Port 465)
          </span>
        </label>
      </div>
    </div>
  );
}
