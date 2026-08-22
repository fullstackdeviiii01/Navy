// app/(admin)/knowledge-base/components/KnowledgeArticleModal.tsx
"use client";

import { useState, useEffect } from "react";
import { X, HelpCircle, Check } from "lucide-react";
import { faqsApi } from "../../../../lib/api/faqs";

interface FAQ {
  _id: string;
  question: string;
  answer: string;
  category: string;
  is_active: boolean;
  sort_order: number;
}

interface KnowledgeArticleModalProps {
  faq: FAQ | null;
  categories: string[];
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export default function KnowledgeArticleModal({
  faq,
  categories,
  isOpen,
  onClose,
  onSave,
}: KnowledgeArticleModalProps) {
  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    category: "General",
    customCategory: "",
    is_active: true,
    sort_order: 0,
  });
  const [useCustomCategory, setUseCustomCategory] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (faq) {
      setFormData({
        question: faq.question || "",
        answer: faq.answer || "",
        category: faq.category || "General",
        customCategory: "",
        is_active: faq.is_active ?? true,
        sort_order: faq.sort_order || 0,
      });
      setUseCustomCategory(false);
    } else {
      setFormData({
        question: "",
        answer: "",
        category: categories.length > 0 ? categories[0] : "General",
        customCategory: "",
        is_active: true,
        sort_order: 0,
      });
      setUseCustomCategory(false);
    }
  }, [faq, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const category = useCustomCategory
        ? formData.customCategory.trim()
        : formData.category;

      if (!category) {
        throw new Error("Category is required");
      }

      const payload = {
        question: formData.question.trim(),
        answer: formData.answer.trim(),
        category,
        is_active: formData.is_active,
        sort_order: formData.sort_order,
      };

      if (faq) {
        await faqsApi.update(faq._id, payload);
      } else {
        await faqsApi.create(payload);
      }

      onSave();
    } catch (err: any) {
      setError(err.message || "Failed to save article");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-theme-surface-light dark:bg-theme-surface-dark w-full max-w-lg rounded-2xl border border-theme-border-light dark:border-theme-border-dark shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-theme-border-light dark:border-theme-border-dark">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-serif font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                {faq ? "Edit Knowledge Article" : "Create Knowledge Article"}
              </h3>
              <p className="text-xs text-theme-text-muted-light mt-0.5">
                Provide comprehensive answers for patron self-service.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-theme-text-muted-light hover:text-theme-text-primary-light rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs overflow-y-auto max-h-[75vh]">
          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-lg text-rose-800 dark:text-rose-200 text-xs">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-theme-text-secondary-light mb-1.5">
              Inquiry / Question Title *
            </label>
            <input
              type="text"
              placeholder="e.g. How do I maintain and oil the natural walnut finish?"
              value={formData.question}
              onChange={(e) =>
                setFormData({ ...formData, question: e.target.value })
              }
              required
              className="w-full px-3.5 py-2 text-xs sm:text-sm border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-neutral-500/40"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-theme-text-secondary-light mb-1.5">
              Knowledge Base Response / Answer *
            </label>
            <textarea
              rows={4}
              placeholder="Detailed explanation, instructions, and care notes..."
              value={formData.answer}
              onChange={(e) =>
                setFormData({ ...formData, answer: e.target.value })
              }
              required
              className="w-full px-3.5 py-2 text-xs border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-neutral-500/40"
            />
          </div>

          {/* Category Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl border border-theme-border-light dark:border-theme-border-dark bg-theme-bg-light/40 dark:bg-theme-bg-dark/20">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-theme-text-secondary-light mb-1.5">
                Category
              </label>
              {!useCustomCategory ? (
                <select
                  value={formData.category}
                  onChange={(e) => {
                    if (e.target.value === "__NEW__") {
                      setUseCustomCategory(true);
                    } else {
                      setFormData({ ...formData, category: e.target.value });
                    }
                  }}
                  className="w-full px-3 py-1.5 text-xs border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                  <option value="__NEW__">+ New Custom Category</option>
                </select>
              ) : (
                <input
                  type="text"
                  placeholder="Enter new category..."
                  value={formData.customCategory}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      customCategory: e.target.value,
                    })
                  }
                  className="w-full px-3 py-1.5 text-xs border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark"
                />
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-theme-text-secondary-light mb-1.5">
                Display Order Rank
              </label>
              <input
                type="number"
                min="0"
                value={formData.sort_order}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    sort_order: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full px-3 py-1.5 text-xs font-mono border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark"
              />
            </div>
          </div>

          <div className="flex items-center gap-6 pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) =>
                  setFormData({ ...formData, is_active: e.target.checked })
                }
                className="rounded text-neutral-900 focus:ring-neutral-500"
              />
              <span className="font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                Live & Published in Storefront FAQ
              </span>
            </label>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-theme-border-light dark:border-theme-border-dark flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg text-xs font-semibold text-theme-text-secondary-light hover:bg-theme-card-light transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900 text-xs font-semibold tracking-wide shadow-xs hover:shadow active:scale-[0.99] transition-all disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{saving ? "Saving..." : "Publish Article"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
