// // FAQEditorModal.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { FaTimes } from "react-icons/fa";
import { faqsApi } from "../../../../lib/api/faqs";

const LazyJoditEditor = dynamic(() => import("jodit-react"), { ssr: false });

interface FAQEditorModalProps {
  faq: any | null;
  onClose: () => void;
  onSave: () => void;
}

export default function FAQEditorModal({
  faq,
  onClose,
  onSave,
}: FAQEditorModalProps) {
  const editor = useRef(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    category: "General",
    is_active: true,
    sort_order: 0,
  });

  useEffect(() => {
    if (faq) {
      setFormData({
        question: faq.question || "",
        answer: faq.answer || "",
        category: faq.category || "General",
        is_active: faq.is_active ?? true,
        sort_order: faq.sort_order || 0,
      });
    }
  }, [faq]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (faq) {
        await faqsApi.update(faq._id, formData);
      } else {
        await faqsApi.create(formData);
      }
      onSave();
    } catch (error: any) {
      console.error("Failed to save FAQ:", error);
      alert(error.message || "Failed to save FAQ");
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
    toolbarAdaptive: false,
    buttons: [
      "bold",
      "italic",
      "underline",
      "|",
      "ul",
      "ol",
      "|",
      "font",
      "fontsize",
      "|",
      "link",
      "|",
      "align",
      "undo",
      "redo",
    ],
    uploader: {
      insertImageAsBase64URI: true,
    },
    removeButtons: ["brush", "file", "video"],
    showPlaceholder: false,
    placeholder: "Enter the answer...",
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="faq-editor-modal-title"
    >
      <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg w-full max-w-2xl lg:max-w-3xl max-h-[90vh] overflow-hidden flex flex-col mx-3 sm:mx-4">
        <div className="flex justify-between items-center p-4 sm:p-5 lg:p-6 border-b border-theme-border-light dark:border-theme-border-dark">
          <h3
            id="faq-editor-modal-title"
            className="text-base sm:text-lg lg:text-xl font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark"
          >
            {faq ? "Edit FAQ" : "Add New FAQ"}
          </h3>
          <button
            onClick={onClose}
            className="text-theme-text-muted-light hover:text-theme-text-primary-light dark:text-theme-text-muted-dark dark:hover:text-theme-text-primary-dark p-1 sm:p-1.5"
            aria-label="Close"
          >
            <FaTimes className="text-lg sm:text-xl lg:text-2xl" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-5 lg:p-6">
          <div className="space-y-4 sm:space-y-5 lg:space-y-6">
            <div>
              <label className="block text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1.5 sm:mb-2">
                Question *
              </label>
              <input
                type="text"
                value={formData.question}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, question: e.target.value }))
                }
                required
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary"
                placeholder="Enter the question"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1.5 sm:mb-2">
                  Category *
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, category: e.target.value }))
                  }
                  required
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary"
                  placeholder="e.g., General, Shipping, Returns"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1.5 sm:mb-2">
                  Sort Order
                </label>
                <input
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      sort_order: parseInt(e.target.value) || 0,
                    }))
                  }
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary"
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1.5 sm:mb-2">
                Answer *
              </label>
              <div className="border border-theme-border-light dark:border-theme-border-dark rounded-lg overflow-hidden">
                <div className="h-48 sm:h-56 lg:h-64">
                  <LazyJoditEditor
                    ref={editor}
                    value={formData.answer}
                    config={{
                      ...editorConfig,
                      height: typeof window !== 'undefined' && window.innerWidth < 640 ? 200 : 300,
                    }}
                    onBlur={(newContent) =>
                      setFormData((prev) => ({ ...prev, answer: newContent }))
                    }
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, is_active: e.target.checked }))
                }
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <label
                htmlFor="is_active"
                className="text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark"
              >
                Active (visible to users)
              </label>
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 mt-4 sm:mt-5 lg:mt-6 pt-4 sm:pt-5 lg:pt-6 border-t border-theme-border-light dark:border-theme-border-dark">
            <button
              type="button"
              onClick={onClose}
              aria-label="cancel FAQ modal"
              className="px-4 sm:px-5 py-2 sm:py-2.5 text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark bg-theme-bg-light dark:bg-theme-bg-dark hover:bg-theme-hover-bg-light dark:hover:bg-theme-hover-bg-dark border border-theme-border-light dark:border-theme-border-dark rounded-lg w-full sm:w-auto"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              aria-label="Submit the FAQ"
              className="px-4 sm:px-5 py-2 sm:py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
            >
              {loading ? "Saving..." : faq ? "Update FAQ" : "Add FAQ"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}