// app/(admin)/knowledge-base/components/KnowledgeBaseDataTable.tsx
"use client";

import { Edit, Trash2, HelpCircle, CheckCircle2, XCircle } from "lucide-react";

interface FAQ {
  _id: string;
  question: string;
  answer: string;
  category: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

interface KnowledgeBaseDataTableProps {
  faqs: FAQ[];
  onEditFaq: (faq: FAQ) => void;
  onDeleteFaq: (id: string) => void;
  onToggleStatus: (faq: FAQ) => void;
}

export default function KnowledgeBaseDataTable({
  faqs,
  onEditFaq,
  onDeleteFaq,
  onToggleStatus,
}: KnowledgeBaseDataTableProps) {
  if (faqs.length === 0) {
    return (
      <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-xl border border-theme-border-light dark:border-theme-border-dark p-12 text-center text-xs text-theme-text-muted-light">
        No FAQs match your search.
      </div>
    );
  }

  return (
    <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-xl border border-theme-border-light dark:border-theme-border-dark overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-theme-card-light/70 dark:bg-theme-card-dark/50 border-b border-theme-border-light dark:border-theme-border-dark text-[11px] uppercase tracking-wider text-theme-text-secondary-light dark:text-theme-text-secondary-dark font-semibold">
              <th className="py-3 px-4">Question & Answer</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Sort Order</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-theme-border-light/60 dark:divide-theme-border-dark/60">
            {faqs.map((faq) => (
              <tr
                key={faq._id}
                className="hover:bg-theme-card-light/40 dark:hover:bg-theme-card-dark/30 transition-colors"
              >
                {/* Question & Preview */}
                <td className="py-3.5 px-4 max-w-[320px]">
                  <div className="flex items-start gap-2.5">
                    <div className="p-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 shrink-0 mt-0.5">
                      <HelpCircle className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                        {faq.question}
                      </p>
                      <p className="text-[11px] text-theme-text-muted-light line-clamp-1 mt-0.5">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Category */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <span className="inline-flex px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                    {faq.category || "General"}
                  </span>
                </td>

                {/* Sort Order */}
                <td className="py-3.5 px-4 whitespace-nowrap font-mono text-[11px] text-theme-text-muted-light">
                  #{faq.sort_order || 0}
                </td>

                {/* Status Toggle */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => onToggleStatus(faq)}
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold cursor-pointer transition-colors ${
                      faq.is_active
                        ? "bg-green-100 dark:bg-green-950/60 text-green-800 dark:text-green-300 hover:bg-green-200"
                        : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 hover:bg-neutral-200"
                    }`}
                  >
                    {faq.is_active ? (
                      <CheckCircle2 className="w-3 h-3" />
                    ) : (
                      <XCircle className="w-3 h-3" />
                    )}
                    <span>{faq.is_active ? "Active" : "Inactive"}</span>
                  </button>
                </td>

                {/* Actions */}
                <td className="py-3.5 px-4 text-right whitespace-nowrap">
                  <div className="inline-flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onEditFaq(faq)}
                      className="p-1.5 text-theme-text-muted-light hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                      title="Edit FAQ"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteFaq(faq._id)}
                      className="p-1.5 text-theme-text-muted-light hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                      title="Delete FAQ"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
