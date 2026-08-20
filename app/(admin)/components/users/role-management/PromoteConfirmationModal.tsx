// PromoteConfirmationModal.tsx
"use client";

import { FaExclamationTriangle } from "react-icons/fa";

interface RoleUser {
  _id: string;
  email: string;
  name: string;
}

interface PromoteConfirmationModalProps {
  isOpen: boolean;
  user: RoleUser | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function PromoteConfirmationModal({
  isOpen,
  user,
  onConfirm,
  onCancel,
}: PromoteConfirmationModalProps) {
  if (!isOpen || !user) return null;

  const headingId = "promote-confirmation-heading";

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-3 md:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={headingId}
    >
      <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg p-3 sm:p-4 md:p-6 max-w-md w-full mx-2 sm:mx-3 md:mx-4">
        <div className="flex items-center mb-3 sm:mb-4">
          <FaExclamationTriangle className="text-theme-warning mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0" aria-hidden="true" />
          <h3 id={headingId} className="text-base sm:text-lg font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark truncate">
            Confirm Role Change
          </h3>
        </div>

        <p className="text-xs sm:text-sm text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-3 sm:mb-4 md:mb-6 break-words">
          Are you sure you want to promote <strong className="font-semibold break-words">{user.name || user.email}</strong> to admin?
          This action will give them full administrative privileges.
        </p>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-2 sm:p-3 md:p-4 mb-3 sm:mb-4 md:mb-6">
          <div className="flex items-start">
            <FaExclamationTriangle className="text-yellow-400 mr-1.5 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5 mt-0.5 flex-shrink-0" aria-hidden="true" />
            <div className="text-xs sm:text-sm text-yellow-800 dark:text-yellow-200">
              <strong className="font-semibold">Warning:</strong> Admin users cannot be demoted back to regular users through this interface.
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
          <button
            onClick={onCancel}
            className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark bg-theme-bg-light dark:bg-theme-bg-dark hover:bg-theme-hover-bg-light dark:hover:bg-theme-hover-bg-dark rounded-md w-full sm:w-auto relative after:absolute after:inset-[-4px] after:content-['']"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-md w-full sm:w-auto relative after:absolute after:inset-[-4px] after:content-['']"
          >
            Promote to Admin
          </button>
        </div>
      </div>
    </div>
  );
}