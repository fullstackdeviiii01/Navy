// // EmailConfigurationPage.tsx
"use client";

import { useState, useEffect } from "react";
import { FaSave, FaServer, FaEnvelope, FaCog } from "react-icons/fa";
import { getAuthToken, handleResponse } from "../../../../lib/api/helpers";
import EmailConfigurationHeader from "../../components/email/EmailConfigurationHeader";
import EmailConfigurationTabs from "../../components/email/EmailConfigurationTabs";
import SMTPConfigurationForm from "../../components/email/SMTPConfigurationForm";
import SenderInfoForm from "../../components/email/SenderInfoForm";
import NotificationsForm from "../../components/email/NotificationsForm";

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
    abandoned_cart: {
      enabled: boolean;
      delay_hours: number;
      subject: string;
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

export default function EmailConfigurationPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("smtp");
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
        subject_prefix: "Contact Form:",
      },
      order_confirmation: {
        enabled: true,
        send_to_customer: true,
        send_to_admin: true,
        admin_email: "",
        subject: "Order Confirmation - {{order_number}}",
      },
      order_status_update: {
        enabled: true,
        notify_on_confirmed: true,
        notify_on_shipped: true,
        notify_on_delivered: true,
        notify_on_cancelled: true,
      },
      abandoned_cart: {
        enabled: true,
        delay_hours: 24,
        subject: "You left items in your cart!",
      },
      return_notifications: {
        enabled: false,
        notify_on_request: false,
        notify_on_approved: false,
        notify_on_received: false,
        notify_on_processed: false,
        notify_on_completed: false,
        notify_on_rejected: false,
        admin_email: "",
      },
    },
    sender_info: {
      from_name: "",
      from_email: "",
      reply_to: "",
    },
  });

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/email-configuration", {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });
      const data = await handleResponse(response);
      if (data.config) {
        setFormData(data.config);
      }
    } catch (error) {
      console.error("Failed to fetch email configuration:", error);
    } finally {
      setLoading(false);
    }
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
      alert("Email configuration updated successfully!");
    } catch (error: any) {
      console.error("Failed to update email configuration:", error);
      alert(error.message || "Failed to update email configuration");
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
    value: any,
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
    { id: "smtp", label: "SMTP Settings", icon: FaServer },
    { id: "sender", label: "Sender Info", icon: FaEnvelope },
    { id: "notifications", label: "Notifications", icon: FaCog },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32 sm:h-48 lg:h-64">
        <div 
          className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-600"
          role="status"
          aria-label="Loading email configuration"
        ></div>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4 lg:space-y-6">
      <EmailConfigurationHeader
        title="Email Configuration"
        description="Configure email settings and notifications"
      />

      <EmailConfigurationTabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <form
        onSubmit={handleSubmit}
        className="space-y-4 sm:space-y-5 lg:space-y-6"
      >
        {/* SMTP Settings Tab */}
        {activeTab === "smtp" && (
          <SMTPConfigurationForm
            smtpSettings={formData.smtp_settings}
            onSMTPChange={handleSMTPChange}
          />
        )}

        {/* Sender Info Tab */}
        {activeTab === "sender" && (
          <SenderInfoForm
            senderInfo={formData.sender_info}
            onSenderInfoChange={handleSenderInfoChange}
          />
        )}

        {/* Notifications Tab */}
        {activeTab === "notifications" && (
          <NotificationsForm
            emailNotifications={formData.email_notifications}
            onNotificationsChange={handleNotificationsChange}
          />
        )}

        <div className="flex justify-end pt-3 sm:pt-4 border-t border-theme-border-light dark:border-theme-border-dark">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 lg:px-6 py-1.5 sm:py-2 lg:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-xs sm:text-sm lg:text-base w-full sm:w-auto justify-center"
          >
            <FaSave className="text-xs sm:text-sm flex-shrink-0"/>
            <span>{saving ? "Saving..." : "Save Configuration"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}