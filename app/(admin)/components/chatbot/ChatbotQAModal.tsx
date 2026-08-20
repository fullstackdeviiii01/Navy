// app/(admin)/components/chatbot/ChatbotQAModal.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { FaTimes } from "react-icons/fa";
import { chatbotApi } from "../../../../lib/api/chatbot";
import type { IChatbotQA, CreateQAPayload } from "../../../../types/chatbot.types";

const LazyJoditEditor = dynamic(() => import("jodit-react"), { ssr: false });

interface ChatbotQAModalProps {
  qa: IChatbotQA | null;
  onClose: () => void;
  onSave: () => void;
}

export default function ChatbotQAModal({ qa, onClose, onSave }: ChatbotQAModalProps) {
  const editorRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateQAPayload>({
    question: "",
    answer: "",
    category: "General",
    is_visible: true,
    sort_order: 0,
  });

  useEffect(() => {
    if (qa) {
      setFormData({
        question: qa.question,
        answer: qa.answer,
        category: qa.category,
        is_visible: qa.is_visible,
        sort_order: qa.sort_order,
      });
    } else {
      setFormData({ question: "", answer: "", category: "General", is_visible: true, sort_order: 0 });
    }
  }, [qa]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.question.trim() || !formData.answer.trim()) {
      alert("Question and answer are required.");
      return;
    }
    setLoading(true);
    try {
      if (qa) {
        await chatbotApi.updateQA(qa._id, formData);
      } else {
        await chatbotApi.createQA(formData);
      }
      onSave();
    } catch (error: any) {
      console.error("Failed to save Q&A:", error);
      alert(error.message || "Failed to save Q&A");
    } finally {
      setLoading(false);
    }
  };

  const editorConfig = {
    readonly: false,
    height: 280,
    toolbar: true,
    toolbarAdaptive: false,
    toolbarButtonSize: "middle" as const,
    buttons: [
      "bold", "italic", "underline", "|",
      "ul", "ol", "|",
      "fontsize", "|",
      "link", "|",
      "align", "|",
      "undo", "redo",
    ],
    uploader: { insertImageAsBase64URI: false },
    showPlaceholder: true,
    placeholder: "Write the answer here. You can add links, lists, and formatting...",
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="chatbot-qa-modal-title"
    >
      <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-xl w-full max-w-2xl lg:max-w-3xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center px-5 py-4 border-b border-theme-border-light dark:border-theme-border-dark flex-shrink-0">
          <h3
            id="chatbot-qa-modal-title"
            className="text-base sm:text-lg font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark"
          >
            {qa ? "Edit Question & Answer" : "Add New Question & Answer"}
          </h3>
          <button
            onClick={onClose}
            className="text-theme-text-muted-light hover:text-theme-text-primary-light dark:text-theme-text-muted-dark dark:hover:text-theme-text-primary-dark p-1 rounded-md transition-colors"
            aria-label="Close modal"
          >
            <FaTimes size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* Question */}
          <div>
            <label
              htmlFor="qa-question"
              className="block text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1.5"
            >
              Question <span className="text-red-500">*</span>
            </label>
            <input
              id="qa-question"
              type="text"
              value={formData.question}
              onChange={(e) => setFormData((p) => ({ ...p, question: e.target.value }))}
              required
              placeholder="e.g., What is your return policy?"
              className="w-full px-3 py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary"
            />
          </div>

          {/* Category + Sort Order */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="qa-category"
                className="block text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1.5"
              >
                Category <span className="text-red-500">*</span>
              </label>
              <input
                id="qa-category"
                type="text"
                value={formData.category}
                onChange={(e) => setFormData((p) => ({ ...p, category: e.target.value }))}
                required
                placeholder="e.g., Orders, Shipping, Returns"
                className="w-full px-3 py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary"
              />
            </div>
            <div>
              <label
                htmlFor="qa-sort"
                className="block text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1.5"
              >
                Sort Order
              </label>
              <input
                id="qa-sort"
                type="number"
                value={formData.sort_order}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, sort_order: parseInt(e.target.value) || 0 }))
                }
                min={0}
                placeholder="0"
                className="w-full px-3 py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary"
              />
            </div>
          </div>

          {/* Answer - Jodit */}
          <div>
            <label className="block text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1.5">
              Answer <span className="text-red-500">*</span>
              <span className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark ml-2 font-normal">
                (supports links, formatting, lists)
              </span>
            </label>
            <div className="border border-theme-border-light dark:border-theme-border-dark rounded-lg overflow-hidden">
              <LazyJoditEditor
                ref={editorRef}
                value={formData.answer}
                config={editorConfig}
                onBlur={(content) => setFormData((p) => ({ ...p, answer: content }))}
              />
            </div>
          </div>

          {/* Visibility */}
          <div className="flex items-center gap-2.5">
            <input
              type="checkbox"
              id="qa-visible"
              checked={formData.is_visible}
              onChange={(e) => setFormData((p) => ({ ...p, is_visible: e.target.checked }))}
              className="w-4 h-4 text-theme-primary border-gray-300 rounded focus:ring-theme-primary"
            />
            <label
              htmlFor="qa-visible"
              className="text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark cursor-pointer select-none"
            >
              Visible to users in chatbot
            </label>
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-2 border-t border-theme-border-light dark:border-theme-border-dark">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark bg-theme-bg-light dark:bg-theme-bg-dark hover:bg-theme-hover-bg-light dark:hover:bg-theme-hover-bg-dark border border-theme-border-light dark:border-theme-border-dark rounded-lg transition-colors w-full sm:w-auto"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-theme-primary hover:bg-theme-primary-hover rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors w-full sm:w-auto"
            >
              {loading ? "Saving..." : qa ? "Update Q&A" : "Add Q&A"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}