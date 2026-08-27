// app/(admin)/audit-ledger/components/AuditIdentityModal.tsx
"use client";

import { X, ShieldAlert, User, Mail, Clock, Globe } from "lucide-react";

interface AuditIdentityModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
}

export default function AuditIdentityModal({
  isOpen,
  onClose,
  user,
}: AuditIdentityModalProps) {
  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-theme-surface-light dark:bg-theme-surface-dark w-full max-w-md rounded-2xl border border-theme-border-light dark:border-theme-border-dark shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-theme-border-light dark:border-theme-border-dark">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-purple-600" />
            <h3 className="text-base font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
              Authentication Audit Dossier
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-theme-text-muted-light hover:text-theme-text-primary-light rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-3.5 text-xs">
          <div className="p-3 rounded-xl border border-theme-border-light dark:border-theme-border-dark bg-theme-bg-light/60 dark:bg-theme-bg-dark/40 space-y-1">
            <span className="text-[10px] uppercase font-semibold text-theme-text-muted-light">
              Account Subject
            </span>
            <p className="font-bold text-sm text-theme-text-primary-light dark:text-theme-text-primary-dark">
              {user.name || "Unnamed User"}
            </p>
            <p className="text-[11px] text-theme-text-secondary-light">
              {user.email}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between py-1 border-b border-theme-border-light/60 dark:border-theme-border-dark/60">
              <span className="text-theme-text-muted-light">Auth Method:</span>
              <span className="font-semibold uppercase">{user.method || "Password"}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-theme-border-light/60 dark:border-theme-border-dark/60">
              <span className="text-theme-text-muted-light">IP Address:</span>
              <span className="font-semibold">{user.ip || "127.0.0.1"}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-theme-border-light/60 dark:border-theme-border-dark/60">
              <span className="text-theme-text-muted-light">Event Timestamp:</span>
              <span>{user.login_at ? new Date(user.login_at).toLocaleString() : "N/A"}</span>
            </div>
          </div>

          {user.user_agent && (
            <div className="p-3 bg-neutral-100 dark:bg-neutral-800 rounded-xl space-y-1">
              <span className="text-[10px] uppercase font-semibold text-neutral-500">
                Client Device Identifier
              </span>
              <p className="text-[11px] text-neutral-700 dark:text-neutral-300 break-words">
                {user.user_agent}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-theme-border-light dark:border-theme-border-dark flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900 rounded-lg text-xs font-semibold shadow-xs transition-all"
          >
            Dismiss Dossier
          </button>
        </div>
      </div>
    </div>
  );
}
