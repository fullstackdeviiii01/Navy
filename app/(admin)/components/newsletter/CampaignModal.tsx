"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { FaTimes } from "react-icons/fa";

const LazyJoditEditor = dynamic(() => import("jodit-react"), { ssr: false });

interface CampaignModalProps {
  campaign: any | null;
  onClose: () => void;
  onSave: () => void;
}

export default function CampaignModal({
  campaign,
  onClose,
  onSave,
}: CampaignModalProps) {
  const editor = useRef(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    subject: "",
    content: "",
    status: "draft",
  });

  useEffect(() => {
    if (campaign) {
      setFormData({
        title: campaign.title || "",
        subject: campaign.subject || "",
        content: campaign.content || "",
        status: campaign.status || "draft",
      });
    }
  }, [campaign]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { adminNewsletterApi } = await import("../../../../lib/api/newsletter");

      if (campaign) {
        await adminNewsletterApi.updateCampaign(campaign._id, formData);
      } else {
        await adminNewsletterApi.createCampaign(formData);
      }

      onSave();
    } catch (error: any) {
      alert(error.message || "Failed to save campaign");
    } finally {
      setLoading(false);
    }
  };

  const editorConfig = {
    readonly: false,
    height: 300,
    toolbar: true,
    spellcheck: true,
    language: "en",
    toolbarButtonSize: "middle" as const,
    toolbarAdaptive: true,
    buttons: [
      "source",
      "|",
      "bold",
      "italic",
      "underline",
      "|",
      "ul",
      "ol",
      "|",
      "font",
      "fontsize",
      "brush",
      "|",
      "image",
      "table",
      "link",
      "|",
      "align",
      "undo",
      "redo",
    ],
    uploader: {
      insertImageAsBase64URI: true,
    },
    removeButtons: ["file"],
    showPlaceholder: false,
    placeholder: "Enter email content...",
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-3 md:p-4">
      <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col mx-2 sm:mx-3 md:mx-4">
        <div className="flex justify-between items-center p-3 sm:p-4 md:p-6 border-b border-theme-border-light dark:border-theme-border-dark">
          <h3 className="text-base sm:text-lg md:text-xl font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark truncate">
            {campaign ? "Edit Campaign" : "Create Campaign"}
          </h3>
          <button
            onClick={onClose}
            className="text-theme-text-muted-light hover:text-theme-text-primary-light dark:text-theme-text-muted-dark dark:hover:text-theme-text-primary-dark flex-shrink-0 ml-2 relative after:absolute after:inset-[-4px] after:content-['']"
            aria-label="Close"
            title="Close"
          >
            <FaTimes className="text-lg sm:text-xl" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6">
          <div className="space-y-4 sm:space-y-6">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1.5 sm:mb-2">
                Campaign Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                required
                className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-theme-primary"
                placeholder="e.g., Weekly Newsletter - January 2026"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1.5 sm:mb-2">
                Email Subject *
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, subject: e.target.value }))
                }
                required
                className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-theme-primary"
                placeholder="e.g., Exclusive Deals Just For You!"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1.5 sm:mb-2">
                Email Content *
              </label>
              <div className="border border-theme-border-light dark:border-theme-border-dark rounded-lg overflow-hidden">
                <LazyJoditEditor
                  ref={editor}
                  value={formData.content}
                  config={editorConfig}
                  onBlur={(newContent) =>
                    setFormData((prev) => ({ ...prev, content: newContent }))
                  }
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-theme-border-light dark:border-theme-border-dark">
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
              {loading ? "Saving..." : campaign ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}