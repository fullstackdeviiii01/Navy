// SenderInfoForm.tsx
"use client";

import { FaEnvelope } from "react-icons/fa";

interface SenderInfoFormProps {
  senderInfo: {
    from_name: string;
    from_email: string;
    reply_to: string;
  };
  onSenderInfoChange: (field: string, value: string) => void;
}

export default function SenderInfoForm({ senderInfo, onSenderInfoChange }: SenderInfoFormProps) {
  return (
    <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg shadow border border-theme-border-light dark:border-theme-border-dark p-3 sm:p-4 lg:p-6">
      <h3 className="text-base sm:text-lg font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark mb-3 sm:mb-4 flex items-center gap-2">
        <FaEnvelope className="text-blue-600 text-sm sm:text-base" aria-hidden="true" />
        Sender Information
      </h3>

      <div className="space-y-3 sm:space-y-4">
        <div>
          <label className="block text-xs sm:text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1 sm:mb-2">
            From Name *
          </label>
          <input
            type="text"
            value={senderInfo.from_name}
            onChange={(e) => onSenderInfoChange("from_name", e.target.value)}
            required
            placeholder="Your Store Name"
            className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary"
          />
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1 sm:mb-2">
            From Email *
          </label>
          <input
            type="email"
            value={senderInfo.from_email}
            onChange={(e) => onSenderInfoChange("from_email", e.target.value)}
            required
            placeholder="noreply@yourstore.com"
            className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary"
          />
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1 sm:mb-2">
            Reply-To Email (Optional)
          </label>
          <input
            type="email"
            value={senderInfo.reply_to}
            onChange={(e) => onSenderInfoChange("reply_to", e.target.value)}
            placeholder="support@yourstore.com"
            className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary"
          />
        </div>
        <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-200 font-medium">
            Best Practices:
          </p>
          <ul className="text-xs sm:text-sm text-blue-800 dark:text-blue-200 mt-1 sm:mt-2 space-y-0.5 sm:space-y-1 list-disc list-inside">
            <li>
              <strong>From Email:</strong> Should match your SMTP username
              to prevent emails from going to spam
            </li>
            <li>
              <strong>Reply-To Email:</strong> Optional field where
              customer replies will be directed (e.g.,
              support@yourstore.com)
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}