// GenerateSummaryButton.tsx
"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";

interface GenerateSummaryButtonProps {
  productId: string;
  productName: string;
  onSuccess?: (summary: any) => void;
}

export default function GenerateSummaryButton({
  productId,
  productName,
  onSuccess,
}: GenerateSummaryButtonProps) {
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  const handleGenerate = async () => {
    setError("");
    setGenerating(true);

    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("__session="))
        ?.split("=")[1];

      const response = await fetch("/api/reviews/generate-summary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ product_id: productId }),
      });

      if (response.ok) {
        const data = await response.json();
        setSummary(data.summary);
        setShowModal(true);
        if (onSuccess) {
          onSuccess(data.summary);
        }
      } else {
        const data = await response.json();
        setError(data.error || "Failed to generate summary");
      }
    } catch (error) {
      setError("Failed to generate summary");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <>
      <button
        onClick={handleGenerate}
        disabled={generating}
        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-md hover:shadow-lg text-sm"
      >
        {generating ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            Generating...
          </>
        ) : (
          <>
            <Sparkles size={18} />
            Generate AI Summary
          </>
        )}
      </button>

      {error && (
        <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-xs text-red-800 dark:text-red-200" role="alert">
          {error}
        </div>
      )}

      {/* Summary Modal */}
      {showModal && summary && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="summary-modal-title"
        >
          <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-xl max-w-2xl w-full shadow-2xl">
            {/* Header */}
            <div className="p-6 border-b border-theme-border-light dark:border-theme-border-dark bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                    <Sparkles className="h-6 w-6 text-purple-600 dark:text-purple-400" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 id="summary-modal-title" className="text-lg font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                      AI-Generated Summary
                    </h3>
                    <p className="text-sm text-theme-text-muted-light dark:text-theme-text-muted-dark">
                      {productName}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-theme-text-muted-light dark:text-theme-text-muted-dark hover:text-theme-text-primary-light dark:hover:text-theme-text-primary-dark"
                  aria-label="Close summary"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <div className="text-center">
                  <p className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark">
                    Reviews Analyzed
                  </p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {summary.total_reviews}
                  </p>
                </div>
                <div className="text-center border-x border-theme-border-light dark:border-theme-border-dark">
                  <p className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark">
                    Average Rating
                  </p>
                  <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                    {summary.average_rating.toFixed(1)}★
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark">
                    Model Used
                  </p>
                  <p className="text-xs font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark mt-1">
                    {summary.model_used.split("/")[1]?.split(":")[0] || "AI"}
                  </p>
                </div>
              </div>

              {/* Summary Text */}
              <div className="p-5 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/10 dark:to-blue-900/10 rounded-lg border border-purple-200 dark:border-purple-800">
                <p className="text-sm leading-relaxed text-theme-text-primary-light dark:text-theme-text-primary-dark">
                  {summary.text}
                </p>
              </div>

              {/* Generated At */}
              <p className="text-xs text-center text-theme-text-muted-light dark:text-theme-text-muted-dark">
                Generated on {new Date(summary.generated_at).toLocaleString()}
              </p>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-theme-border-light dark:border-theme-border-dark">
              <button
                onClick={() => setShowModal(false)}
                className="w-full px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}