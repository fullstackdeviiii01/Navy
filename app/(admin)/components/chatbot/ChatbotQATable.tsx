// app/(admin)/components/chatbot/ChatbotQATable.tsx
"use client";

import { FaEdit, FaTrash, FaEye, FaEyeSlash, FaSort } from "react-icons/fa";
import type { IChatbotQA } from "../../../../types/chatbot.types";

interface ChatbotQATableProps {
  qas: IChatbotQA[];
  onEdit: (qa: IChatbotQA) => void;
  onDelete: (id: string) => void;
  onToggleVisibility: (id: string, current: boolean) => void;
}

export default function ChatbotQATable({
  qas,
  onEdit,
  onDelete,
  onToggleVisibility,
}: ChatbotQATableProps) {
  if (qas.length === 0) {
    return (
      <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-xl border border-theme-border-light dark:border-theme-border-dark p-10 text-center">
        <div className="text-4xl mb-3">💬</div>
        <p className="text-sm text-theme-text-muted-light dark:text-theme-text-muted-dark">
          No Q&As found. Click "Add Question" to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-xl border border-theme-border-light dark:border-theme-border-dark overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-theme-border-light dark:divide-theme-border-dark">
          <thead className="bg-theme-bg-light dark:bg-theme-bg-dark">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-theme-text-muted-light dark:text-theme-text-secondary-dark uppercase tracking-wider w-8">
                <FaSort size={12} />
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-theme-text-muted-light dark:text-theme-text-secondary-dark uppercase tracking-wider">
                Question
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-theme-text-muted-light dark:text-theme-text-secondary-dark uppercase tracking-wider whitespace-nowrap">
                Category
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-theme-text-muted-light dark:text-theme-text-secondary-dark uppercase tracking-wider whitespace-nowrap">
                Clicks
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-theme-text-muted-light dark:text-theme-text-secondary-dark uppercase tracking-wider whitespace-nowrap">
                Visibility
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-theme-text-muted-light dark:text-theme-text-secondary-dark uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-theme-border-light dark:divide-theme-border-dark">
            {qas.map((qa) => (
              <tr
                key={qa._id}
                className={`hover:bg-theme-hover-bg-light dark:hover:bg-theme-hover-bg-dark transition-colors ${
                  !qa.is_visible ? "opacity-60" : ""
                }`}
              >
                {/* Sort order */}
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark font-mono">
                    {qa.sort_order}
                  </span>
                </td>

                {/* Question */}
                <td className="px-4 py-3">
                  <p className="text-sm font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark line-clamp-2 max-w-xs md:max-w-sm lg:max-w-md">
                    {qa.question}
                  </p>
                </td>

                {/* Category */}
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                    {qa.category}
                  </span>
                </td>

                {/* Click count */}
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="text-sm text-theme-text-primary-light dark:text-theme-text-primary-dark font-medium">
                    {qa.click_count.toLocaleString()}
                  </span>
                </td>

                {/* Visibility Toggle */}
                <td className="px-4 py-3 whitespace-nowrap">
                  <button
                    onClick={() => onToggleVisibility(qa._id, qa.is_visible)}
                    aria-label={qa.is_visible ? "Hide from chatbot" : "Show in chatbot"}
                    title={qa.is_visible ? "Hide from chatbot" : "Show in chatbot"}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full transition-colors ${
                      qa.is_visible
                        ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/60"
                        : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                    }`}
                  >
                    {qa.is_visible ? (
                      <>
                        <FaEye size={10} /> Visible
                      </>
                    ) : (
                      <>
                        <FaEyeSlash size={10} /> Hidden
                      </>
                    )}
                  </button>
                </td>

                {/* Actions */}
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => onEdit(qa)}
                      aria-label={`Edit: ${qa.question}`}
                      title="Edit"
                      className="text-theme-primary hover:text-theme-primary-hover transition-colors"
                    >
                      <FaEdit size={16} />
                    </button>
                    <button
                      onClick={() => onDelete(qa._id)}
                      aria-label={`Delete: ${qa.question}`}
                      title="Delete"
                      className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                    >
                      <FaTrash size={16} />
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