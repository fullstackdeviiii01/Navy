// components/activity/UserDetailsModal.tsx
"use client"

import { formatIp } from "../../../../lib/utils/formatIp"

interface LoginActivity {
  _id: string
  email: string
  name: string
  login_at: string
  ip: string
  method: string
  user_agent?: string
}

interface UserDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  user: LoginActivity | null
}

export default function UserDetailsModal({ isOpen, onClose, user }: UserDetailsModalProps) {
  if (!isOpen || !user) return null

  const headingId = "user-details-modal-heading"

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={headingId}
    >
      <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg p-4 sm:p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start sm:items-center gap-2 mb-4 sm:mb-6">
          <h3
            id={headingId}
            className="text-base sm:text-xl font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark"
          >
            User Activity Details
          </h3>
          <button
            onClick={onClose}
            className="text-theme-text-muted-light hover:text-theme-hover-light dark:text-theme-text-muted-dark dark:hover:text-theme-text-secondary-dark text-xl sm:text-2xl flex-shrink-0"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-sm sm:text-base text-theme-text-primary-light dark:text-theme-text-primary-dark mb-2 sm:mb-3">
              User Information
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
              <div className="break-words">
                <span className="font-medium">Name:</span> {user.name || "Not provided"}
              </div>
              <div className="break-words">
                <span className="font-medium">Email:</span> {user.email}
              </div>
              <div className="break-words">
                <span className="font-medium">Last Login:</span>{" "}
                {new Date(user.login_at).toLocaleString()}
              </div>
              <div className="break-words">
                <span className="font-medium">IP Address:</span> {formatIp(user.ip)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}