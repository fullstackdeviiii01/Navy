// FAQManagementHeader.tsx
"use client";

import { FaPlus, FaQuestionCircle } from "react-icons/fa";

interface FAQManagementHeaderProps {
  totalFaqs: number;
  activeFaqs: number;
  onCreateFaq: () => void;
}

export default function FAQManagementHeader({ 
  totalFaqs, 
  activeFaqs, 
  onCreateFaq 
}: FAQManagementHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
      <div className="flex-1 min-w-0">
        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark">
          FAQ Management
        </h2>
        <p className="text-xs sm:text-sm text-theme-text-muted-light dark:text-theme-text-muted-dark mt-0.5">
          Manage frequently asked questions
        </p>
      </div>
      
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 shadow-lg w-full sm:w-auto">
          <div className="flex items-center gap-2 sm:gap-3 mb-1.5">
            <div className="p-1.5 rounded-lg bg-white/20">
              <FaQuestionCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" aria-hidden="true" />
            </div>
            <p className="text-purple-100 text-xs sm:text-sm font-medium">
              Active FAQs
            </p>
          </div>
          <p className="text-lg sm:text-xl lg:text-2xl text-center font-bold text-white">
            {activeFaqs}/{totalFaqs}
          </p>
        </div>
        
        <button
          onClick={onCreateFaq}
          className="flex items-center justify-center sm:justify-start gap-2 px-3 sm:px-4 py-2.5 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm w-full sm:w-auto"
        >
          <FaPlus className="text-xs sm:text-sm" />
          <span>Add FAQ</span>
        </button>
      </div>
    </div>
  );
}