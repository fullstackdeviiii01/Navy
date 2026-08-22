// app/(admin)/dispatch/components/DispatchNotificationMatrix.tsx
"use client";

import { Bell, ShoppingBag, RotateCcw, MessageSquare } from "lucide-react";

interface EmailNotifications {
  contact_form: {
    enabled: boolean;
    recipient_email: string;
    subject_prefix: string;
  };
  order_confirmation: {
    enabled: boolean;
    send_to_customer: boolean;
    send_to_admin: boolean;
    admin_email: string;
    subject: string;
  };
  order_status_update: {
    enabled: boolean;
    notify_on_confirmed: boolean;
    notify_on_shipped: boolean;
    notify_on_delivered: boolean;
    notify_on_cancelled: boolean;
  };
  return_notifications: {
    enabled: boolean;
    notify_on_request: boolean;
    notify_on_approved: boolean;
    notify_on_received: boolean;
    notify_on_processed: boolean;
    notify_on_completed: boolean;
    notify_on_rejected: boolean;
    admin_email: string;
  };
}

interface DispatchNotificationMatrixProps {
  emailNotifications: EmailNotifications;
  onNotificationsChange: (section: string, field: string, value: any) => void;
}

export default function DispatchNotificationMatrix({
  emailNotifications,
  onNotificationsChange,
}: DispatchNotificationMatrixProps) {
  return (
    <div className="space-y-4 text-xs">
      {/* Order Invoices & Confirmations */}
      <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-xl p-5 sm:p-6 border border-theme-border-light dark:border-theme-border-dark shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-theme-border-light dark:border-theme-border-dark">
          <div className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200">
            <ShoppingBag className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
              Order Acquisition & Status Notifications
            </h3>
            <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
              Automated triggers when orders are placed, dispatched, or delivered.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-theme-text-secondary-light mb-1.5">
              Atelier Administrator Alert Email
            </label>
            <input
              type="email"
              placeholder="orders@rehanlamps.com"
              value={emailNotifications.order_confirmation.admin_email}
              onChange={(e) =>
                onNotificationsChange(
                  "order_confirmation",
                  "admin_email",
                  e.target.value
                )
              }
              className="w-full px-3.5 py-2 text-xs sm:text-sm border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-neutral-500/40"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-theme-text-secondary-light mb-1.5">
              Order Confirmation Subject
            </label>
            <input
              type="text"
              value={emailNotifications.order_confirmation.subject}
              onChange={(e) =>
                onNotificationsChange(
                  "order_confirmation",
                  "subject",
                  e.target.value
                )
              }
              className="w-full px-3.5 py-2 text-xs sm:text-sm border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-neutral-500/40"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6 pt-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={emailNotifications.order_confirmation.send_to_customer}
              onChange={(e) =>
                onNotificationsChange(
                  "order_confirmation",
                  "send_to_customer",
                  e.target.checked
                )
              }
              className="rounded text-neutral-900 focus:ring-neutral-500"
            />
            <span className="font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
              Send Confirmation to Patron
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={emailNotifications.order_status_update.notify_on_shipped}
              onChange={(e) =>
                onNotificationsChange(
                  "order_status_update",
                  "notify_on_shipped",
                  e.target.checked
                )
              }
              className="rounded text-neutral-900 focus:ring-neutral-500"
            />
            <span className="font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
              Notify on Courier Shipment
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={emailNotifications.order_status_update.notify_on_delivered}
              onChange={(e) =>
                onNotificationsChange(
                  "order_status_update",
                  "notify_on_delivered",
                  e.target.checked
                )
              }
              className="rounded text-neutral-900 focus:ring-neutral-500"
            />
            <span className="font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
              Notify on Order Delivery
            </span>
          </label>
        </div>
      </div>

      {/* Return Notifications */}
      <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-xl p-5 sm:p-6 border border-theme-border-light dark:border-theme-border-dark shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-theme-border-light dark:border-theme-border-dark">
          <div className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200">
            <RotateCcw className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
              Concierge Returns & Claim Alerts
            </h3>
            <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
              Automatic status notifications for return inspections and disbursements.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={emailNotifications.return_notifications.enabled}
              onChange={(e) =>
                onNotificationsChange(
                  "return_notifications",
                  "enabled",
                  e.target.checked
                )
              }
              className="rounded text-neutral-900 focus:ring-neutral-500"
            />
            <span className="font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
              Enable Concierge Return Email Alerts
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}
