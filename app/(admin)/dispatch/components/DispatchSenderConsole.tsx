// app/(admin)/dispatch/components/DispatchSenderConsole.tsx
"use client";

import { Mail } from "lucide-react";

interface SenderInfo {
  from_name: string;
  from_email: string;
  reply_to: string;
}

interface DispatchSenderConsoleProps {
  senderInfo: SenderInfo;
  onSenderInfoChange: (field: string, value: string) => void;
}

export default function DispatchSenderConsole({
  senderInfo,
  onSenderInfoChange,
}: DispatchSenderConsoleProps) {
  return (
    <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-xl p-5 sm:p-6 border border-theme-border-light dark:border-theme-border-dark shadow-xs space-y-4">
      <div className="flex items-center gap-2.5 pb-3 border-b border-theme-border-light dark:border-theme-border-dark">
        <div className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200">
          <Mail className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
            Sender Information & Reply-To
          </h3>
          <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
            The name and email address your customers see when they receive an email.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-theme-text-secondary-light mb-1.5">
            Sender Name *
          </label>
          <input
            type="text"
            placeholder="Rehan Wooden Lamps"
            value={senderInfo.from_name}
            onChange={(e) => onSenderInfoChange("from_name", e.target.value)}
            required
            className="w-full px-3.5 py-2 text-xs sm:text-sm border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-neutral-500/40"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-theme-text-secondary-light mb-1.5">
            Sender Email Address *
          </label>
          <input
            type="email"
            placeholder="orders@talalwoodenlamps.com"
            value={senderInfo.from_email}
            onChange={(e) => onSenderInfoChange("from_email", e.target.value)}
            required
            className="w-full px-3.5 py-2 text-xs sm:text-sm border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-neutral-500/40"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-theme-text-secondary-light mb-1.5">
            Reply-To Email Address
          </label>
          <input
            type="email"
            placeholder="support@talalwoodenlamps.com"
            value={senderInfo.reply_to}
            onChange={(e) => onSenderInfoChange("reply_to", e.target.value)}
            className="w-full px-3.5 py-2 text-xs sm:text-sm border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-neutral-500/40"
          />
        </div>
      </div>
    </div>
  );
}
