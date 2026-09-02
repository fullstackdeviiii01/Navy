// app/components/newsletter/SubscriberModal.tsx
"use client";

import { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";

interface SubscriberModalProps {
  subscriber: any | null;
  onClose: () => void;
  onSave: () => void;
}

export default function SubscriberModal({
  subscriber,
  onClose,
  onSave,
}: SubscriberModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    name: "",
  });

  useEffect(() => {
    if (subscriber) {
      setFormData({
        email: subscriber.email || "",
        name: subscriber.name || "",
      });
    }
  }, [subscriber]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { adminNewsletterApi } = await import("../../../lib/api/newsletter");

      if (subscriber) {
        await adminNewsletterApi.updateSubscriber(subscriber._id, formData);
      } else {
        await adminNewsletterApi.createSubscriber(formData);
      }

      onSave();
    } catch (error: any) {
      alert(error.message || "Failed to save subscriber");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-4">
      <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-xl w-full max-w-md border border-theme-border-light dark:border-theme-border-dark shadow-2xl overflow-hidden">
        <div className="flex justify-between items-center p-4 sm:p-5 border-b border-theme-border-light dark:border-theme-border-dark">
          <h3 className="text-base sm:text-lg font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark font-serif">
            {subscriber ? "Edit Subscriber" : "Add Subscriber"}
          </h3>
          <button
            onClick={onClose}
            className="text-theme-text-muted-light hover:text-theme-text-primary-light dark:text-theme-text-muted-dark dark:hover:text-theme-text-primary-dark cursor-pointer p-1"
            aria-label="Close"
          >
            <FaTimes className="text-base" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1">
              Email Address *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
              required
              disabled={!!subscriber}
              className="w-full px-3 py-2 text-xs sm:text-sm border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-[#C59345] disabled:opacity-60"
              placeholder="customer@example.com"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1">
              Subscriber Name (Optional)
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              className="w-full px-3 py-2 text-xs sm:text-sm border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-[#C59345]"
              placeholder="e.g. John Doe"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-theme-border-light dark:border-theme-border-dark">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark bg-theme-bg-light dark:bg-theme-bg-dark border border-theme-border-light dark:border-theme-border-dark rounded-lg hover:bg-theme-hover-bg-light dark:hover:bg-theme-hover-bg-dark"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-bold text-white bg-[#8A5E22] hover:bg-[#A8752B] rounded-lg disabled:opacity-50 transition-colors shadow-sm"
            >
              {loading ? "Saving..." : subscriber ? "Update" : "Add Subscriber"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
