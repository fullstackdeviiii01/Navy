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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full shadow-2xl p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
              Enable Email Notifications?
            </h3>
          </div>
          <button
            onClick={onSkip}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          You currently have email notifications disabled. Enable them to receive:
        </p>

        <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1.5 mb-6">
          <li>• Order confirmation</li>
          <li>• Shipping & delivery updates</li>
          <li>• Return & refund status</li>
        </ul>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onEnable}
            className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            Enable & Continue
          </button>
          <button
            onClick={onSkip}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            Continue Without
          </button>
        </div>
      </div>
    </div>
  );
}