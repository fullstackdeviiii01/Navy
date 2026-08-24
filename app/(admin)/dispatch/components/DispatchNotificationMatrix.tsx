// app/(admin)/dispatch/components/DispatchNotificationMatrix.tsx
"use client";

import { ShoppingBag, RotateCcw, MessageSquare, Mail, CheckCircle2 } from "lucide-react";

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
    <div className="space-y-5 text-xs">
      {/* 1. Order Acquisition & Status Notifications */}
      <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-xl p-5 sm:p-6 border border-theme-border-light dark:border-theme-border-dark shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-theme-border-light dark:border-theme-border-dark">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400">
            <ShoppingBag className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
              Order Acquisition & Status Notifications
            </h3>
            <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
              Automated email triggers when orders are placed, confirmed, dispatched, or delivered.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-theme-text-secondary-light mb-1.5">
              Atelier Administrator Alert Email
            </label>
            <input
              type="email"
              placeholder="orders@talalwoodenlamps.com"
              value={emailNotifications.order_confirmation?.admin_email || ""}
              onChange={(e) =>
                onNotificationsChange(
                  "order_confirmation",
                  "admin_email",
                  e.target.value
                )
              }
              className="w-full px-3.5 py-2 text-xs sm:text-sm border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-amber-500/40"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-theme-text-secondary-light mb-1.5">
              Order Confirmation Subject Template
            </label>
            <input
              type="text"
              placeholder="Order Confirmation - {{order_number}}"
              value={emailNotifications.order_confirmation?.subject || ""}
              onChange={(e) =>
                onNotificationsChange(
                  "order_confirmation",
                  "subject",
                  e.target.value
                )
              }
              className="w-full px-3.5 py-2 text-xs sm:text-sm border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-amber-500/40"
            />
          </div>
        </div>

        {/* Order Toggles Grid */}
        <div className="pt-2 border-t border-theme-border-light dark:border-theme-border-dark">
          <span className="block text-[11px] font-bold uppercase tracking-wider text-theme-text-secondary-light mb-3">
            Active Order Triggers
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <label className="flex items-center gap-2.5 p-2.5 rounded-lg border border-theme-border-light dark:border-theme-border-dark bg-theme-bg-light/50 dark:bg-theme-bg-dark/50 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
              <input
                type="checkbox"
                checked={emailNotifications.order_confirmation?.send_to_customer ?? true}
                onChange={(e) =>
                  onNotificationsChange(
                    "order_confirmation",
                    "send_to_customer",
                    e.target.checked
                  )
                }
                className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
              />
              <span className="font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark">
                Send Confirmation to Patron
              </span>
            </label>

            <label className="flex items-center gap-2.5 p-2.5 rounded-lg border border-theme-border-light dark:border-theme-border-dark bg-theme-bg-light/50 dark:bg-theme-bg-dark/50 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
              <input
                type="checkbox"
                checked={emailNotifications.order_confirmation?.send_to_admin ?? true}
                onChange={(e) =>
                  onNotificationsChange(
                    "order_confirmation",
                    "send_to_admin",
                    e.target.checked
                  )
                }
                className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
              />
              <span className="font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark">
                Send Order Alert to Admin
              </span>
            </label>

            <label className="flex items-center gap-2.5 p-2.5 rounded-lg border border-theme-border-light dark:border-theme-border-dark bg-theme-bg-light/50 dark:bg-theme-bg-dark/50 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
              <input
                type="checkbox"
                checked={emailNotifications.order_status_update?.notify_on_confirmed ?? true}
                onChange={(e) =>
                  onNotificationsChange(
                    "order_status_update",
                    "notify_on_confirmed",
                    e.target.checked
                  )
                }
                className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
              />
              <span className="font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark">
                Notify on Order Confirmed
              </span>
            </label>

            <label className="flex items-center gap-2.5 p-2.5 rounded-lg border border-theme-border-light dark:border-theme-border-dark bg-theme-bg-light/50 dark:bg-theme-bg-dark/50 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
              <input
                type="checkbox"
                checked={emailNotifications.order_status_update?.notify_on_shipped ?? true}
                onChange={(e) =>
                  onNotificationsChange(
                    "order_status_update",
                    "notify_on_shipped",
                    e.target.checked
                  )
                }
                className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
              />
              <span className="font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark">
                Notify on Courier Shipment
              </span>
            </label>

            <label className="flex items-center gap-2.5 p-2.5 rounded-lg border border-theme-border-light dark:border-theme-border-dark bg-theme-bg-light/50 dark:bg-theme-bg-dark/50 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
              <input
                type="checkbox"
                checked={emailNotifications.order_status_update?.notify_on_delivered ?? true}
                onChange={(e) =>
                  onNotificationsChange(
                    "order_status_update",
                    "notify_on_delivered",
                    e.target.checked
                  )
                }
                className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
              />
              <span className="font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark">
                Notify on Order Delivery
              </span>
            </label>

            <label className="flex items-center gap-2.5 p-2.5 rounded-lg border border-theme-border-light dark:border-theme-border-dark bg-theme-bg-light/50 dark:bg-theme-bg-dark/50 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
              <input
                type="checkbox"
                checked={emailNotifications.order_status_update?.notify_on_cancelled ?? true}
                onChange={(e) =>
                  onNotificationsChange(
                    "order_status_update",
                    "notify_on_cancelled",
                    e.target.checked
                  )
                }
                className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
              />
              <span className="font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark">
                Notify on Order Cancelled
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* 2. Concierge Returns & Claim Alerts */}
      <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-xl p-5 sm:p-6 border border-theme-border-light dark:border-theme-border-dark shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-theme-border-light dark:border-theme-border-dark">
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-700 dark:text-blue-400">
            <RotateCcw className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
              Concierge Returns & Claim Alerts
            </h3>
            <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
              Automatic notifications across all return lifecycle states and refund disbursements.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-theme-text-secondary-light mb-1.5">
              Admin Return Notifications Email
            </label>
            <input
              type="email"
              placeholder="returns@talalwoodenlamps.com"
              value={emailNotifications.return_notifications?.admin_email || ""}
              onChange={(e) =>
                onNotificationsChange(
                  "return_notifications",
                  "admin_email",
                  e.target.value
                )
              }
              className="w-full px-3.5 py-2 text-xs sm:text-sm border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            />
          </div>

          <div className="flex items-end pb-1">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={emailNotifications.return_notifications?.enabled ?? true}
                onChange={(e) =>
                  onNotificationsChange(
                    "return_notifications",
                    "enabled",
                    e.target.checked
                  )
                }
                className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
              />
              <span className="font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                Master Return Alerts System Enabled
              </span>
            </label>
          </div>
        </div>

        {/* Return Toggles Grid */}
        <div className="pt-2 border-t border-theme-border-light dark:border-theme-border-dark">
          <span className="block text-[11px] font-bold uppercase tracking-wider text-theme-text-secondary-light mb-3">
            Return Lifecycle Triggers
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <label className="flex items-center gap-2.5 p-2.5 rounded-lg border border-theme-border-light dark:border-theme-border-dark bg-theme-bg-light/50 dark:bg-theme-bg-dark/50 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
              <input
                type="checkbox"
                checked={emailNotifications.return_notifications?.notify_on_request ?? true}
                onChange={(e) =>
                  onNotificationsChange(
                    "return_notifications",
                    "notify_on_request",
                    e.target.checked
                  )
                }
                className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
              />
              <span className="font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark">
                Notify on Claim Submission
              </span>
            </label>

            <label className="flex items-center gap-2.5 p-2.5 rounded-lg border border-theme-border-light dark:border-theme-border-dark bg-theme-bg-light/50 dark:bg-theme-bg-dark/50 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
              <input
                type="checkbox"
                checked={emailNotifications.return_notifications?.notify_on_approved ?? true}
                onChange={(e) =>
                  onNotificationsChange(
                    "return_notifications",
                    "notify_on_approved",
                    e.target.checked
                  )
                }
                className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
              />
              <span className="font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark">
                Notify on Claim Approved
              </span>
            </label>

            <label className="flex items-center gap-2.5 p-2.5 rounded-lg border border-theme-border-light dark:border-theme-border-dark bg-theme-bg-light/50 dark:bg-theme-bg-dark/50 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
              <input
                type="checkbox"
                checked={emailNotifications.return_notifications?.notify_on_received ?? true}
                onChange={(e) =>
                  onNotificationsChange(
                    "return_notifications",
                    "notify_on_received",
                    e.target.checked
                  )
                }
                className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
              />
              <span className="font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark">
                Notify on Package Received
              </span>
            </label>

            <label className="flex items-center gap-2.5 p-2.5 rounded-lg border border-theme-border-light dark:border-theme-border-dark bg-theme-bg-light/50 dark:bg-theme-bg-dark/50 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
              <input
                type="checkbox"
                checked={emailNotifications.return_notifications?.notify_on_processed ?? true}
                onChange={(e) =>
                  onNotificationsChange(
                    "return_notifications",
                    "notify_on_processed",
                    e.target.checked
                  )
                }
                className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
              />
              <span className="font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark">
                Notify on Inspection Complete
              </span>
            </label>

            <label className="flex items-center gap-2.5 p-2.5 rounded-lg border border-theme-border-light dark:border-theme-border-dark bg-theme-bg-light/50 dark:bg-theme-bg-dark/50 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
              <input
                type="checkbox"
                checked={emailNotifications.return_notifications?.notify_on_completed ?? true}
                onChange={(e) =>
                  onNotificationsChange(
                    "return_notifications",
                    "notify_on_completed",
                    e.target.checked
                  )
                }
                className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
              />
              <span className="font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark">
                Notify on Refund Disbursed
              </span>
            </label>

            <label className="flex items-center gap-2.5 p-2.5 rounded-lg border border-theme-border-light dark:border-theme-border-dark bg-theme-bg-light/50 dark:bg-theme-bg-dark/50 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
              <input
                type="checkbox"
                checked={emailNotifications.return_notifications?.notify_on_rejected ?? true}
                onChange={(e) =>
                  onNotificationsChange(
                    "return_notifications",
                    "notify_on_rejected",
                    e.target.checked
                  )
                }
                className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
              />
              <span className="font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark">
                Notify on Claim Rejected
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* 3. Client Inquiries & Bespoke Communications */}
      <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-xl p-5 sm:p-6 border border-theme-border-light dark:border-theme-border-dark shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-theme-border-light dark:border-theme-border-dark">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
              Client Inquiries & Bespoke Communications
            </h3>
            <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
              Forwards messages submitted from the public contact and bespoke inquiry forms.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-theme-text-secondary-light mb-1.5">
              Concierge Recipient Email
            </label>
            <input
              type="email"
              placeholder="support@talalwoodenlamps.com"
              value={emailNotifications.contact_form?.recipient_email || ""}
              onChange={(e) =>
                onNotificationsChange(
                  "contact_form",
                  "recipient_email",
                  e.target.value
                )
              }
              className="w-full px-3.5 py-2 text-xs sm:text-sm border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-theme-text-secondary-light mb-1.5">
              Subject Prefix
            </label>
            <input
              type="text"
              placeholder="Contact Form:"
              value={emailNotifications.contact_form?.subject_prefix || "Contact Form:"}
              onChange={(e) =>
                onNotificationsChange(
                  "contact_form",
                  "subject_prefix",
                  e.target.value
                )
              }
              className="w-full px-3.5 py-2 text-xs sm:text-sm border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            />
          </div>
        </div>

        <div className="pt-2 border-t border-theme-border-light dark:border-theme-border-dark">
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={emailNotifications.contact_form?.enabled ?? true}
              onChange={(e) =>
                onNotificationsChange(
                  "contact_form",
                  "enabled",
                  e.target.checked
                )
              }
              className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
            />
            <span className="font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
              Enable Contact & Bespoke Form Forwarding
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}
