// app/(admin)/access-control/components/StaffProfileModal.tsx
"use client";

import { X, Mail, Shield, Calendar, MapPin, ShoppingBag, Clock } from "lucide-react";

interface User {
  _id: string;
  uid: string;
  email: string;
  name: string;
  role: string;
  is_active: boolean;
  is_banned: boolean;
  order_count: number;
  total_spent: number;
  customer_since: string;
  last_login_at: string;
  cart: any[];
  wishlist: any[];
  addresses: any[];
  login_history: any[];
}

interface StaffProfileModalProps {
  isOpen: boolean;
  user: User | null;
  onClose: () => void;
}

export default function StaffProfileModal({
  isOpen,
  user,
  onClose,
}: StaffProfileModalProps) {
  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-theme-surface-light dark:bg-theme-surface-dark w-full max-w-2xl rounded-2xl border border-theme-border-light dark:border-theme-border-dark shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-theme-border-light dark:border-theme-border-dark">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-800 dark:text-neutral-200 font-bold">
              {user.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                  {user.name || "Unnamed User"}
                </h3>
                <span
                  className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                    user.role === "admin"
                      ? "bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300"
                      : "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
                  }`}
                >
                  {user.role}
                </span>
              </div>
              <p className="text-xs text-theme-text-muted-light mt-0.5">
                {user.email}
              </p>
            </div>
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
        <div className="p-5 space-y-4 text-xs overflow-y-auto max-h-[70vh]">
          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl border border-theme-border-light dark:border-theme-border-dark bg-theme-bg-light/60 dark:bg-theme-bg-dark/40 space-y-1">
              <span className="text-[10px] uppercase text-theme-text-muted-light font-semibold">
                Spend
              </span>
              <p className="text-sm font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                Rs. {user.total_spent?.toLocaleString() || "0"}
              </p>
            </div>
            <div className="p-3 rounded-xl border border-theme-border-light dark:border-theme-border-dark bg-theme-bg-light/60 dark:bg-theme-bg-dark/40 space-y-1">
              <span className="text-[10px] uppercase text-theme-text-muted-light font-semibold">
                Orders
              </span>
              <p className="text-sm font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                {user.order_count || 0}
              </p>
            </div>
            <div className="p-3 rounded-xl border border-theme-border-light dark:border-theme-border-dark bg-theme-bg-light/60 dark:bg-theme-bg-dark/40 space-y-1">
              <span className="text-[10px] uppercase text-theme-text-muted-light font-semibold">
                Member Since
              </span>
              <p className="text-xs font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark truncate">
                {user.customer_since
                  ? new Date(user.customer_since).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>
            <div className="p-3 rounded-xl border border-theme-border-light dark:border-theme-border-dark bg-theme-bg-light/60 dark:bg-theme-bg-dark/40 space-y-1">
              <span className="text-[10px] uppercase text-theme-text-muted-light font-semibold">
                Last Login
              </span>
              <p className="text-xs font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark truncate">
                {user.last_login_at
                  ? new Date(user.last_login_at).toLocaleDateString()
                  : "Recent"}
              </p>
            </div>
          </div>

          {/* Login History or Addresses */}
          {user.addresses && user.addresses.length > 0 && (
            <div className="p-3.5 rounded-xl border border-theme-border-light dark:border-theme-border-dark bg-theme-bg-light/40 dark:bg-theme-bg-dark/20 space-y-2">
              <span className="font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark block">
                Saved Locations
              </span>
              <div className="space-y-1.5 text-theme-text-secondary-light dark:text-theme-text-secondary-dark text-[11px]">
                {user.addresses.map((a: any, i: number) => (
                  <p key={i}>
                    {a.street_address}, {a.city}, {a.country}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-theme-border-light dark:border-theme-border-dark flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900 text-xs font-semibold rounded-lg shadow-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
