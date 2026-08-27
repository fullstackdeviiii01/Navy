// app/(admin)/dispatch/views/DispatchConfigurationView.tsx
"use client";

import { useState, useEffect } from "react";
import { Server, Mail, Bell, Check, AlertCircle } from "lucide-react";
import { getAuthToken, handleResponse } from "../../../../lib/api/helpers";
import DispatchSmtpConsole from "../components/DispatchSmtpConsole";
import DispatchSenderConsole from "../components/DispatchSenderConsole";
import DispatchNotificationMatrix from "../components/DispatchNotificationMatrix";
import Loader from "../../../components/shared/Loader";

interface EmailConfig {
  smtp_settings: {
    host: string;
    port: number;
    secure: boolean;
    auth_user: string;
    auth_pass: string;
  };
  email_notifications: {
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
  sender_info: {
    from_name: string;
    from_email: string;
    reply_to: string;
  };
}

export default function DispatchConfigurationView() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [activeTab, setActiveTab] = useState<"smtp" | "sender" | "notifications">(
    "smtp"
  );

  const [formData, setFormData] = useState<EmailConfig>({
    smtp_settings: {
      host: "",
      port: 587,
      secure: false,
      auth_user: "",
      auth_pass: "",
    },
    email_notifications: {
      contact_form: {
        enabled: true,
        recipient_email: "",
        subject_prefix: "[Contact Form]",
      },
      order_confirmation: {
        enabled: true,
        send_to_customer: true,
        send_to_admin: true,
        admin_email: "",
        subject: "Order Confirmation",
      },
      order_status_update: {
        enabled: true,
        notify_on_confirmed: true,
        notify_on_shipped: true,
        notify_on_delivered: true,
        notify_on_cancelled: true,
      },
      return_notifications: {
        enabled: true,
        notify_on_request: true,
        notify_on_approved: true,
        notify_on_received: true,
        notify_on_processed: true,
        notify_on_completed: true,
        notify_on_rejected: true,
        admin_email: "",
      },
    },
    sender_info: {
      from_name: "Talal Wooden Lamps",
      from_email: "noreply@talalwoodenlamps.com",
      reply_to: "support@talalwoodenlamps.com",
    },
  });

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await fetch("/api/email-configuration", {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });
      const data = await handleResponse(response);
      if (data.config) {
        setFormData(data.config);
      }
    } catch (error: any) {
      showMessage("error", error.message || "Failed to load email settings.");
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch("/api/email-configuration", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify(formData),
      });
      await handleResponse(response);
      showMessage("success", "Email settings updated successfully.");
    } catch (error: any) {
      showMessage("error", error.message || "Failed to update email settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleSMTPChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      smtp_settings: {
        ...prev.smtp_settings,
        [field]: value,
      },
    }));
  };

  const handleSenderInfoChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      sender_info: {
        ...prev.sender_info,
        [field]: value,
      },
    }));
  };

  const handleNotificationsChange = (
    section: string,
    field: string,
    value: any
  ) => {
    setFormData((prev) => ({
      ...prev,
      email_notifications: {
        ...prev.email_notifications,
        [section]: {
          ...prev.email_notifications[
            section as keyof typeof prev.email_notifications
          ],
          [field]: value,
        },
      },
    }));
  };

  const tabs = [
    { id: "smtp", label: "SMTP Server", icon: Server },
    { id: "sender", label: "Sender Info", icon: Mail },
    { id: "notifications", label: "Email Notifications", icon: Bell },
  ];

  if (loading) {
    return (
      <div className="min-h-[300px] flex items-center justify-center bg-theme-surface-light dark:bg-theme-surface-dark rounded-xl border border-theme-border-light dark:border-theme-border-dark p-12">
        <Loader />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-theme-border-light/80 dark:border-theme-border-dark/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark tracking-tight">
              Email Settings
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200">
              <Mail className="w-3 h-3" />
              Email Service
            </span>
          </div>
          <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark mt-0.5">
            Configure SMTP server details, sender email address, and order notification emails.
          </p>
        </div>
      </div>

      {/* Floating Status Feedback */}
      {message && (
        <div className="fixed top-5 right-5 z-50 max-w-sm animate-in slide-in-from-top-3">
          {message.type === "error" ? (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 rounded-xl shadow-lg flex items-center gap-2 text-xs text-rose-800 dark:text-rose-200">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{message.text}</span>
            </div>
          ) : (
            <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 rounded-xl shadow-lg flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-200">
              <Check className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{message.text}</span>
            </div>
          )}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-semibold transition-all text-left ${
                isActive
                  ? "border-neutral-900 bg-neutral-900 text-white dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-900 shadow-xs"
                  : "border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-secondary-light dark:text-theme-text-secondary-dark hover:border-theme-hover-light"
              }`}
            >
              <div
                className={`p-1.5 rounded-lg ${
                  isActive
                    ? "bg-white/10 dark:bg-black/10 text-white dark:text-neutral-900"
                    : "bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
              </div>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Form Body */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {activeTab === "smtp" && (
          <DispatchSmtpConsole
            smtpSettings={formData.smtp_settings}
            onSMTPChange={handleSMTPChange}
          />
        )}

        {activeTab === "sender" && (
          <DispatchSenderConsole
            senderInfo={formData.sender_info}
            onSenderInfoChange={handleSenderInfoChange}
          />
        )}

        {activeTab === "notifications" && (
          <DispatchNotificationMatrix
            emailNotifications={formData.email_notifications}
            onNotificationsChange={handleNotificationsChange}
          />
        )}

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900 text-xs font-semibold tracking-wide shadow-xs hover:shadow active:scale-[0.99] transition-all disabled:opacity-50"
          >
            <Check className="w-3.5 h-3.5" />
            <span>{saving ? "Saving Changes..." : "Save Email Settings"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
