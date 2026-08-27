// app/(admin)/access-control/components/RoleElevationModal.tsx
"use client";

import { X, ShieldCheck, AlertTriangle } from "lucide-react";

interface RoleUser {
  _id: string;
  uid: string;
  email: string;
  name: string;
  role: string;
}

interface RoleElevationModalProps {
  isOpen: boolean;
  user: RoleUser | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function RoleElevationModal({
  isOpen,
  user,
  onConfirm,
  onCancel,
}: RoleElevationModalProps) {
  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-theme-surface-light dark:bg-theme-surface-dark w-full max-w-md rounded-2xl border border-theme-border-light dark:border-theme-border-dark shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-theme-border-light dark:border-theme-border-dark">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-purple-600" />
            <h3 className="text-base font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
              Authorize Administrator Elevation
            </h3>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="p-1.5 text-theme-text-muted-light hover:text-theme-text-primary-light rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-3 text-xs">
          <div className="p-3.5 rounded-xl border border-purple-200 dark:border-purple-900/60 bg-purple-50/50 dark:bg-purple-950/30 text-purple-900 dark:text-purple-200 space-y-1">
            <p className="font-semibold text-sm">Target Member Account:</p>
            <p className="font-bold">{user.name || "Unnamed User"}</p>
            <p className="text-[11px] text-purple-700 dark:text-purple-300">
              {user.email}
            </p>
          </div>

          <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl text-amber-800 dark:text-amber-300">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              Promoting this user will grant full administrative privileges,
              including modifying catalog listings, dispatching shipments, and
              viewing financial records.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-theme-border-light dark:border-theme-border-dark flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg text-xs font-semibold text-theme-text-secondary-light hover:bg-theme-card-light transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900 text-xs font-semibold rounded-lg shadow-xs hover:shadow active:scale-[0.99] transition-all"
          >
            Confirm & Promote
          </button>
        </div>
      </div>
    </div>
  );
}
