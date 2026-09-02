// app/components/newsletter/CampaignModal.tsx
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
      const { adminNewsletterApi } = await import("../../../lib/api/newsletter");

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
    height: 320,
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
    placeholder: "Draft your email message...",
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-xl w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col border border-theme-border-light dark:border-theme-border-dark shadow-2xl">
        <div className="flex justify-between items-center p-4 sm:p-5 border-b border-theme-border-light dark:border-theme-border-dark">
          <h3 className="text-base sm:text-lg font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark font-serif">
            {campaign ? "Edit Campaign" : "Create Newsletter Campaign"}
          </h3>
          <button
            onClick={onClose}
            className="text-theme-text-muted-light hover:text-theme-text-primary-light dark:text-theme-text-muted-dark dark:hover:text-theme-text-primary-dark cursor-pointer p-1"
            aria-label="Close"
          >
            <FaTimes className="text-base" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1">
              Internal Campaign Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              required
              className="w-full px-3.5 py-2 text-xs sm:text-sm border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-[#C59345]"
              placeholder="e.g., Autumn Lighting Collection Launch 2026"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1">
              Email Subject Line (Sent to customers) *
            </label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, subject: e.target.value }))
              }
              required
              className="w-full px-3.5 py-2 text-xs sm:text-sm border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-[#C59345]"
              placeholder="e.g., Discover our newest handcrafted wooden lamps + Free Shipping"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1">
              Email Content *
            </label>
            <div className="border border-theme-border-light dark:border-theme-border-dark rounded-lg overflow-hidden bg-white text-gray-900">
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

          <div className="flex justify-end gap-3 pt-4 border-t border-theme-border-light dark:border-theme-border-dark">
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
              {loading ? "Saving..." : campaign ? "Update Campaign" : "Save Campaign"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
