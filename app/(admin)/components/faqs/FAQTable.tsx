// FAQTable.tsx
"use client";

import { FaEdit, FaTrash, FaEye, FaEyeSlash } from "react-icons/fa";

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

interface FAQTableProps {
  faqs: FAQ[];
  onEditFaq: (faq: FAQ) => void;
  onDeleteFaq: (faqId: string) => void;
  onToggleStatus: (faq: FAQ) => void;
}

export default function FAQTable({
  faqs,
  onEditFaq,
  onDeleteFaq,
  onToggleStatus,
}: FAQTableProps) {
  if (faqs.length === 0) {
    return (
      <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg shadow p-6 sm:p-8 lg:p-12 text-center border border-theme-border-light dark:border-theme-border-dark">
        <p className="text-theme-text-muted-light dark:text-theme-text-muted-dark text-sm sm:text-base">
          No FAQs found. Add your first FAQ to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg shadow overflow-hidden border border-theme-border-light dark:border-theme-border-dark">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-theme-border-light dark:divide-theme-border-dark">
          <thead className="bg-theme-bg-light dark:bg-theme-bg-dark">
            <tr>
              <th className="px-3 sm:px-4 lg:px-6 py-2.5 sm:py-3 text-left text-xs font-medium text-theme-text-muted-light dark:text-theme-text-secondary-dark uppercase tracking-wider">
                Question
              </th>
              <th className="px-3 sm:px-4 lg:px-6 py-2.5 sm:py-3 text-left text-xs font-medium text-theme-text-muted-light dark:text-theme-text-secondary-dark uppercase tracking-wider hidden sm:table-cell">
                Category
              </th>
              <th className="px-3 sm:px-4 lg:px-6 py-2.5 sm:py-3 text-left text-xs font-medium text-theme-text-muted-light dark:text-theme-text-secondary-dark uppercase tracking-wider">
                Status
              </th>
              <th className="px-3 sm:px-4 lg:px-6 py-2.5 sm:py-3 text-left text-xs font-medium text-theme-text-muted-light dark:text-theme-text-secondary-dark uppercase tracking-wider hidden md:table-cell">
                Order
              </th>
              <th className="px-3 sm:px-4 lg:px-6 py-2.5 sm:py-3 text-left text-xs font-medium text-theme-text-muted-light dark:text-theme-text-secondary-dark uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-theme-surface-light dark:bg-theme-surface-dark divide-y divide-theme-border-light dark:divide-theme-border-dark">
            {faqs.map((faq) => (
              <tr
                key={faq._id}
                className="hover:bg-theme-hover-bg-light dark:hover:bg-theme-hover-bg-dark"
              >
                <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
                  <div className="text-sm font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark min-w-0">
                    <div className="truncate">{faq.question}</div>
                    <div className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark mt-1 line-clamp-1 sm:line-clamp-2">
                      {faq.answer.replace(/<[^>]*>/g, "")}
                    </div>
                    <div className="sm:hidden mt-1.5">
                      <span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {faq.category}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap hidden sm:table-cell">
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    {faq.category}
                  </span>
                </td>
                <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap">
                  <button
                    onClick={() => onToggleStatus(faq)}
                    className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${
                      faq.is_active
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                    }`}
                    aria-label={faq.is_active ? "Deactivate FAQ" : "Activate FAQ"}
                    aria-pressed={faq.is_active}
                  >
                    {faq.is_active ? (
                      <FaEye />
                    ) : (
                      <FaEyeSlash />
                    )}
                    <span className="hidden sm:inline">
                      {faq.is_active ? "Active" : "Inactive"}
                    </span>
                  </button>
                </td>
                <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-theme-text-primary-light dark:text-theme-text-primary-dark hidden md:table-cell">
                  {faq.sort_order}
                </td>
                <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <button
                      onClick={() => onEditFaq(faq)}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1 sm:p-1.5 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20"
                      title="Edit"
                      aria-label="Edit FAQ"
                    >
                      <FaEdit className="text-sm sm:text-base" />
                    </button>
                    <button
                      onClick={() => onDeleteFaq(faq._id)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1 sm:p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                      title="Delete"
                      aria-label="Delete FAQ"
                    >
                      <FaTrash className="text-sm sm:text-base" />
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