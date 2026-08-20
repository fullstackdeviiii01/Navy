// app/components/reviews/AISummaryDisplay.tsx
"use client";

import { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";

interface AISummaryDisplayProps {
  productId: string;
}

export default function AISummaryDisplay({ productId }: AISummaryDisplayProps) {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hasSummary, setHasSummary] = useState(false);

  useEffect(() => {
    fetchSummary();
  }, [productId]);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/reviews/summary/${productId}`);
      
      if (response.ok) {
        const data = await response.json();
        setHasSummary(data.hasSummary);
        if (data.hasSummary) {
          setSummary(data.summary);
        }
      }
    } catch (error) {
      console.error("Failed to fetch summary:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return null;
  }

  if (!hasSummary || !summary) {
    return null;
  }

  return (
    <div className="mb-6 sm:mb-8">
      <div 
        className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/10 dark:to-blue-900/10 border-2 border-purple-200 dark:border-purple-800 rounded-xl p-5 sm:p-6 shadow-md"
        role="region"
        aria-labelledby="ai-summary-heading"
      >
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg flex-shrink-0" aria-hidden="true">
            <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 id="ai-summary-heading" className="text-base sm:text-lg font-bold text-purple-900 dark:text-purple-100 mb-1">
              AI Summary of Customer Reviews
            </h3>
            <p className="text-xs sm:text-sm text-purple-700 dark:text-purple-300">
              Based on {summary.total_reviews} verified {summary.total_reviews === 1 ? "review" : "reviews"} • 
              Average rating: {summary.average_rating.toFixed(1)}★
            </p>
          </div>
        </div>

        {/* Summary Text */}
        <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4 border border-purple-100 dark:border-purple-900">
          <p className="text-sm sm:text-base leading-relaxed text-gray-800 dark:text-gray-200">
            {summary.text}
          </p>
        </div>

        {/* Footer */}
        <div className="mt-3 flex items-center justify-between">
          <p className="text-xs text-purple-600 dark:text-purple-400">
            AI-generated • Updated {new Date(summary.generated_at).toLocaleDateString()}
          </p>
          <span className="text-xs text-purple-500 dark:text-purple-400 flex items-center gap-1" aria-label="Powered by AI">
            <Sparkles className="h-3 w-3" aria-hidden="true" />
            <span aria-hidden="true">Powered by AI</span>
          </span>
        </div>
      </div>
    </div>
  );
}