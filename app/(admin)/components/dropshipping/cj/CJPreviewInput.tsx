"use client";

/**
 * app/(admin)/dropshipping/cj/components/CJPreviewInput.tsx
 *
 * Manual PID/SKU input for previewing a CJ product.
 */

import { useState } from "react";
import { FaSearch, FaSpinner } from "react-icons/fa";

interface Props {
  onPreview: (id: string) => void;
  previewing: boolean;
}

export default function CJPreviewInput({ onPreview, previewing }: Props) {
  const [productInput, setProductInput] = useState("");

  const handlePreview = () => {
    const id = productInput.trim();
    if (!id) return;
    onPreview(id);
  };

  return (
    <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg p-4 sm:p-6 space-y-4">
      <h3 className="text-sm font-semibold text-theme-text-secondary-light dark:text-theme-text-secondary-dark uppercase tracking-wide">
        Preview by PID or SKU
      </h3>

      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={productInput}
          onChange={(e) => setProductInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handlePreview()}
          placeholder="Paste CJ product URL or UUID pid"
          className="flex-1 px-4 py-3 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-theme-primary text-sm"
        />
        <button
          onClick={handlePreview}
          disabled={previewing || !productInput.trim()}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-theme-primary text-white rounded-lg hover:bg-theme-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm whitespace-nowrap"
        >
          {previewing ? <FaSpinner className="animate-spin" /> : <FaSearch />}
          {previewing ? "Fetching..." : "Preview"}
        </button>
      </div>
    </div>
  );
}
