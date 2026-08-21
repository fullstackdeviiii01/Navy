// app/components/contact/ContactForm.tsx
"use client";

import { useState } from "react";
import { Send, Loader2 } from "lucide-react";
import { contactApi } from "../../../lib/api/contact";

interface ContactFormProps {
  onSuccess?: () => void;
}

export default function ContactForm({ onSuccess }: ContactFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitStatus({ type: null, message: "" });

    try {
      await contactApi.submitForm(formData);
      setSubmitStatus({
        type: "success",
        message: "Thank you for reaching out. We will respond within one business day.",
      });
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
      if (onSuccess) onSuccess();
    } catch (error: any) {
      setSubmitStatus({
        type: "error",
        message: error.message || "Failed to send message. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark p-6 sm:p-8">
      <h3 className="text-xl font-serif italic text-theme-text-primary-light dark:text-theme-text-primary-dark mb-6">
        Send Us a Message
      </h3>

      {submitStatus.type && (
        <div
          role="alert"
          aria-live="polite"
          className={`mb-6 p-4 text-xs font-medium ${
            submitStatus.type === "success"
              ? "bg-green-500/10 text-green-700 dark:text-green-300 border border-green-500/30"
              : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/30"
          }`}
        >
          {submitStatus.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs uppercase tracking-[0.15em] font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1.5">
              Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              required
              className="w-full px-4 py-3 border border-theme-border-light dark:border-theme-border-dark bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark text-xs sm:text-sm focus:outline-none focus:border-theme-hover-light"
              placeholder="Your full name"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-[0.15em] font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1.5">
              Email *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
              required
              className="w-full px-4 py-3 border border-theme-border-light dark:border-theme-border-dark bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark text-xs sm:text-sm focus:outline-none focus:border-theme-hover-light"
              placeholder="your@email.com"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs uppercase tracking-[0.15em] font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1.5">
              Phone (Optional)
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, phone: e.target.value }))
              }
              className="w-full px-4 py-3 border border-theme-border-light dark:border-theme-border-dark bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark text-xs sm:text-sm focus:outline-none focus:border-theme-hover-light"
              placeholder="+92 300 1234567"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-[0.15em] font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1.5">
              Subject
            </label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, subject: e.target.value }))
              }
              className="w-full px-4 py-3 border border-theme-border-light dark:border-theme-border-dark bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark text-xs sm:text-sm focus:outline-none focus:border-theme-hover-light"
              placeholder="Custom dimensions, order question, etc."
            />
          </div>
        </div>

        <div>
          <label className="block text-xs uppercase tracking-[0.15em] font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1.5">
            Message *
          </label>
          <textarea
            value={formData.message}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, message: e.target.value }))
            }
            required
            rows={5}
            className="w-full p-4 border border-theme-border-light dark:border-theme-border-dark bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark text-xs sm:text-sm focus:outline-none focus:border-theme-hover-light resize-none"
            placeholder="Please detail your question or request..."
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          aria-label={submitting ? "Sending your message" : "Send message"}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-theme-primary hover:bg-theme-hover-light dark:hover:bg-theme-hover-dark text-theme-btn-text text-xs uppercase tracking-[0.2em] font-medium transition-colors disabled:opacity-50"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>SENDING...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>SEND MESSAGE</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
