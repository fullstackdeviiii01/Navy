// app/components/account/NotificationBanner.tsx
"use client";

import { CheckCircle, XCircle } from "lucide-react";

interface NotificationBannerProps {
  error: string;
  success: string;
}

export default function NotificationBanner({
  error,
  success,
}: NotificationBannerProps) {
  if (!error && !success) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm w-full px-4">
      {error && (
        <div className="flex items-start gap-3 p-4 mb-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg shadow-lg animate-slide-down">
          <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800 dark:text-red-200 flex-1">{error}</p>
        </div>
      )}
      {success && (
        <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg shadow-lg animate-slide-down">
          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-800 dark:text-green-200 flex-1">{success}</p>
        </div>
      )}
    </div>
  );
}