// app/components/checkout/EmailNotificationModal.tsx
"use client";

import { Bell, X } from "lucide-react";

interface EmailNotificationModalProps {
  onEnable: () => void;
  onSkip: () => void;
}

export default function EmailNotificationModal({
  onEnable,
  onSkip,
}: EmailNotificationModalProps) {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-theme-surface-light dark:bg-theme-surface-dark border border-theme-border-light dark:border-theme-border-dark max-w-md w-full p-6 sm:p-8 shadow-2xl">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-theme-hover-light dark:text-theme-hover-dark" />
            <h3 className="text-base font-serif font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark">
              Enable Order Notifications?
            </h3>
          </div>
          <button
            onClick={onSkip}
            className="p-1 hover:text-theme-hover-light text-theme-text-muted-light dark:text-theme-text-muted-dark transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs sm:text-sm text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-4 leading-relaxed">
          Enable email notifications to receive prompt dispatch updates:
        </p>

        <ul className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark space-y-2 mb-6">
          <li>• Order confirmation receipt</li>
          <li>• Courier dispatch & tracking link</li>
          <li>• Delivery confirmation</li>
        </ul>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onEnable}
            className="flex-1 py-3 px-4 text-xs uppercase tracking-[0.15em] font-medium text-theme-btn-text bg-theme-primary hover:bg-theme-hover-light dark:hover:bg-theme-hover-dark transition-colors"
          >
            Enable & Continue
          </button>
          <button
            onClick={onSkip}
            className="flex-1 py-3 px-4 text-xs uppercase tracking-[0.15em] font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark border border-theme-border-light dark:border-theme-border-dark hover:bg-theme-card-light dark:hover:bg-theme-card-dark transition-colors"
          >
            Continue Without
          </button>
        </div>
      </div>
    </div>
  );
}