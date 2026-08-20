// app/(admin)/components/chatbot/ChatbotStatsCards.tsx
"use client";

import { FaQuestion, FaEye, FaFire } from "react-icons/fa";
import type { IChatbotStats } from "../../../../types/chatbot.types";

interface ChatbotStatsCardsProps {
  stats: IChatbotStats;
}

export default function ChatbotStatsCards({ stats }: ChatbotStatsCardsProps) {
  const cards = [
    {
      label: "Total Questions",
      value: stats.total_questions,
      icon: FaQuestion,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-950/30",
      border: "border-blue-200 dark:border-blue-800",
    },
    {
      label: "Visible to Users",
      value: stats.visible_questions,
      icon: FaEye,
      color: "text-green-600 dark:text-green-400",
      bg: "bg-green-50 dark:bg-green-950/30",
      border: "border-green-200 dark:border-green-800",
    },
    {
      label: "Hidden Questions",
      value: stats.total_questions - stats.visible_questions,
      icon: FaEye,
      color: "text-gray-500 dark:text-gray-400",
      bg: "bg-gray-50 dark:bg-gray-900/30",
      border: "border-gray-200 dark:border-gray-700",
    },
    {
      label: "Top Clicked",
      value: stats.top_questions[0]?.click_count ?? 0,
      icon: FaFire,
      color: "text-orange-600 dark:text-orange-400",
      bg: "bg-orange-50 dark:bg-orange-950/30",
      border: "border-orange-200 dark:border-orange-800",
      suffix: "clicks",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className={`rounded-xl border ${card.border} bg-theme-surface-light dark:bg-theme-surface-dark shadow-sm p-4`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-lg ${card.bg}`}>
                  <Icon className={`h-4 w-4 ${card.color}`} />
                </div>
                <p className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark font-medium leading-tight">
                  {card.label}
                </p>
              </div>
              <p className={`text-2xl font-bold ${card.color}`}>
                {card.value}
                {card.suffix && (
                  <span className="text-sm font-normal ml-1">{card.suffix}</span>
                )}
              </p>
            </div>
          );
        })}
      </div>

      {/* Top Questions */}
      {stats.top_questions.length > 0 && (
        <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-xl border border-theme-border-light dark:border-theme-border-dark p-4">
          <h4 className="text-sm font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark mb-3 flex items-center gap-2">
            <FaFire className="text-orange-500" size={14} />
            Most Clicked Questions
          </h4>
          <div className="space-y-2">
            {stats.top_questions.map((q, i) => (
              <div key={i} className="flex items-center justify-between gap-3">
                <span className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark truncate flex-1">
                  <span className="text-theme-text-muted-light dark:text-theme-text-muted-dark mr-2">
                    #{i + 1}
                  </span>
                  {q.question}
                </span>
                <span className="text-xs font-semibold text-orange-600 dark:text-orange-400 whitespace-nowrap">
                  {q.click_count} clicks
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}