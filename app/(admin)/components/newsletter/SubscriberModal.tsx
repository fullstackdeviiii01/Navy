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
      const { adminNewsletterApi } = await import("../../../../lib/api/newsletter");

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-3 md:p-4">
      <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg w-full max-w-md mx-2 sm:mx-3 md:mx-4">
        <div className="flex justify-between items-center p-3 sm:p-4 md:p-6 border-b border-theme-border-light dark:border-theme-border-dark">
          <h3 className="text-base sm:text-lg md:text-xl font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark truncate">
            {subscriber ? "Edit Subscriber" : "Add Subscriber"}
          </h3>
          <button
            onClick={onClose}
            className="text-theme-text-muted-light hover:text-theme-text-primary-light dark:text-theme-text-muted-dark dark:hover:text-theme-text-primary-dark ml-2 flex-shrink-0 relative after:absolute after:inset-[-4px] after:content-['']"
            aria-label="Close"
            title="Close"
          >
            <FaTimes className="text-lg sm:text-xl" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-3 sm:p-4 md:p-6">
          <div className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1.5 sm:mb-2">
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                required
                disabled={!!subscriber}
                className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-theme-primary disabled:opacity-50"
                placeholder="subscriber@example.com"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1.5 sm:mb-2">
                Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-theme-primary"
                placeholder="John Doe"
              />
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 mt-4 sm:mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark bg-theme-bg-light dark:bg-theme-bg-dark hover:bg-theme-hover-bg-light dark:hover:bg-theme-hover-bg-dark border border-theme-border-light dark:border-theme-border-dark rounded-lg relative after:absolute after:inset-[-4px] after:content-['']"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed relative after:absolute after:inset-[-4px] after:content-['']"
            >
              {loading ? "Saving..." : subscriber ? "Update" : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}