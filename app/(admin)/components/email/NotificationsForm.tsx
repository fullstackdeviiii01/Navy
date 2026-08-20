// // NotificationsForm.tsx
"use client";

interface NotificationsFormProps {
  emailNotifications: {
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
  };
  onNotificationsChange: (section: string, field: string, value: any) => void;
}

export default function NotificationsForm({ emailNotifications, onNotificationsChange }: NotificationsFormProps) {
  return (
    <div className="space-y-3 sm:space-y-4 lg:space-y-6">
      {/* Contact Form Notifications */}
      <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg shadow border border-theme-border-light dark:border-theme-border-dark p-3 sm:p-4 lg:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 sm:mb-4">
          <h3 className="text-base sm:text-lg font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
            Contact Form Notifications
          </h3>
          <label className="flex items-center gap-2 order-first sm:order-last">
            <input
              type="checkbox"
              checked={emailNotifications.contact_form.enabled}
              onChange={(e) => onNotificationsChange("contact_form", "enabled", e.target.checked)}
              className="w-4 h-4 text-blue-600 flex-shrink-0"
            />
            <span className="text-xs sm:text-sm font-medium">Enabled</span>
          </label>
        </div>

        <div className="space-y-3 sm:space-y-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1 sm:mb-2">
              Recipient Email *
            </label>
            <input
              type="email"
              value={emailNotifications.contact_form.recipient_email}
              onChange={(e) => onNotificationsChange("contact_form", "recipient_email", e.target.value)}
              required
              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1 sm:mb-2">
              Subject Prefix
            </label>
            <input
              type="text"
              value={emailNotifications.contact_form.subject_prefix}
              onChange={(e) => onNotificationsChange("contact_form", "subject_prefix", e.target.value)}
              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary"
            />
          </div>
        </div>
      </div>

      {/* Order Confirmation Notifications */}
      <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg shadow border border-theme-border-light dark:border-theme-border-dark p-3 sm:p-4 lg:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 sm:mb-4">
          <h3 className="text-base sm:text-lg font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
            Order Confirmation
          </h3>
          <label className="flex items-center gap-2 order-first sm:order-last">
            <input
              type="checkbox"
              checked={emailNotifications.order_confirmation.enabled}
              onChange={(e) => onNotificationsChange("order_confirmation", "enabled", e.target.checked)}
              className="w-4 h-4 text-blue-600 flex-shrink-0"
            />
            <span className="text-xs sm:text-sm font-medium">Enabled</span>
          </label>
        </div>

        <div className="space-y-3 sm:space-y-4">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={emailNotifications.order_confirmation.send_to_customer}
                onChange={(e) => onNotificationsChange("order_confirmation", "send_to_customer", e.target.checked)}
                className="w-4 h-4 text-blue-600 flex-shrink-0"
              />
              <span className="text-xs sm:text-sm">Send to Customer</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={emailNotifications.order_confirmation.send_to_admin}
                onChange={(e) => onNotificationsChange("order_confirmation", "send_to_admin", e.target.checked)}
                className="w-4 h-4 text-blue-600 flex-shrink-0"
              />
              <span className="text-xs sm:text-sm">Send to Admin</span>
            </label>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1 sm:mb-2">
              Admin Email
            </label>
            <input
              type="email"
              value={emailNotifications.order_confirmation.admin_email}
              onChange={(e) => onNotificationsChange("order_confirmation", "admin_email", e.target.value)}
              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary"
            />
          </div>
        </div>
      </div>

      {/* Order Status Updates */}
      <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg shadow border border-theme-border-light dark:border-theme-border-dark p-3 sm:p-4 lg:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 sm:mb-4">
          <h3 className="text-base sm:text-lg font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
            Order Status Updates
          </h3>
          <label className="flex items-center gap-2 order-first sm:order-last">
            <input
              type="checkbox"
              checked={emailNotifications.order_status_update.enabled}
              onChange={(e) => onNotificationsChange("order_status_update", "enabled", e.target.checked)}
              className="w-4 h-4 text-blue-600 flex-shrink-0"
            />
            <span className="text-xs sm:text-sm font-medium">Enabled</span>
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={emailNotifications.order_status_update.notify_on_confirmed}
              onChange={(e) => onNotificationsChange("order_status_update", "notify_on_confirmed", e.target.checked)}
              className="w-4 h-4 text-blue-600 flex-shrink-0"
            />
            <span className="text-xs sm:text-sm">Notify on Confirmed</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={emailNotifications.order_status_update.notify_on_shipped}
              onChange={(e) => onNotificationsChange("order_status_update", "notify_on_shipped", e.target.checked)}
              className="w-4 h-4 text-blue-600 flex-shrink-0"
            />
            <span className="text-xs sm:text-sm">Notify on Shipped</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={emailNotifications.order_status_update.notify_on_delivered}
              onChange={(e) => onNotificationsChange("order_status_update", "notify_on_delivered", e.target.checked)}
              className="w-4 h-4 text-blue-600 flex-shrink-0"
            />
            <span className="text-xs sm:text-sm">Notify on Delivered</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={emailNotifications.order_status_update.notify_on_cancelled}
              onChange={(e) => onNotificationsChange("order_status_update", "notify_on_cancelled", e.target.checked)}
              className="w-4 h-4 text-blue-600 flex-shrink-0"
            />
            <span className="text-xs sm:text-sm">Notify on Cancelled</span>
          </label>
        </div>
      </div>

      {/* Return Notifications Section */}
      <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg shadow border border-theme-border-light dark:border-theme-border-dark p-3 sm:p-4 lg:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 sm:mb-4">
          <h3 className="text-base sm:text-lg font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
            Return & Refund Notifications
          </h3>
          <label className="flex items-center gap-2 order-first sm:order-last">
            <input
              type="checkbox"
              checked={emailNotifications.return_notifications.enabled}
              onChange={(e) => onNotificationsChange("return_notifications", "enabled", e.target.checked)}
              className="w-4 h-4 text-blue-600 flex-shrink-0"
            />
            <span className="text-xs sm:text-sm font-medium">Enabled</span>
          </label>
        </div>

        <div className="space-y-3 sm:space-y-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1 sm:mb-2">
              Admin Email for Returns
            </label>
            <input
              type="email"
              value={emailNotifications.return_notifications.admin_email}
              onChange={(e) => onNotificationsChange("return_notifications", "admin_email", e.target.value)}
              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={emailNotifications.return_notifications.notify_on_request}
                onChange={(e) => onNotificationsChange("return_notifications", "notify_on_request", e.target.checked)}
                className="w-4 h-4 text-blue-600 flex-shrink-0"
              />
              <span className="text-xs sm:text-sm">Notify on New Request</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={emailNotifications.return_notifications.notify_on_approved}
                onChange={(e) => onNotificationsChange("return_notifications", "notify_on_approved", e.target.checked)}
                className="w-4 h-4 text-blue-600 flex-shrink-0"
              />
              <span className="text-xs sm:text-sm">Notify on Approved</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={emailNotifications.return_notifications.notify_on_received}
                onChange={(e) => onNotificationsChange("return_notifications", "notify_on_received", e.target.checked)}
                className="w-4 h-4 text-blue-600 flex-shrink-0"
              />
              <span className="text-xs sm:text-sm">Notify on Received</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={emailNotifications.return_notifications.notify_on_processed}
                onChange={(e) => onNotificationsChange("return_notifications", "notify_on_processed", e.target.checked)}
                className="w-4 h-4 text-blue-600 flex-shrink-0"
              />
              <span className="text-xs sm:text-sm">Notify on Processed</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={emailNotifications.return_notifications.notify_on_completed}
                onChange={(e) => onNotificationsChange("return_notifications", "notify_on_completed", e.target.checked)}
                className="w-4 h-4 text-blue-600 flex-shrink-0"
              />
              <span className="text-xs sm:text-sm">Notify on Completed</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={emailNotifications.return_notifications.notify_on_rejected}
                onChange={(e) => onNotificationsChange("return_notifications", "notify_on_rejected", e.target.checked)}
                className="w-4 h-4 text-blue-600 flex-shrink-0"
              />
              <span className="text-xs sm:text-sm">Notify on Rejected</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}