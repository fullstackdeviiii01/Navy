// app/components/invoice/DownloadInvoiceButton.tsx
"use client";

import { useState } from "react";
import { FileText, Loader2, Download } from "lucide-react";
import { getAuthToken } from "../../../lib/api/helpers";

interface DownloadInvoiceButtonProps {
  orderId: string;
  orderNumber: string;
  paymentStatus: string;
  isAdmin?: boolean;
  /** Pass variant="compact" for inline/table usage */
  variant?: "default" | "compact";
}

export default function DownloadInvoiceButton({
  orderId,
  orderNumber,
  paymentStatus,
  isAdmin = false,
  variant = "default",
}: DownloadInvoiceButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Users can only download after payment is confirmed
  const isAvailable = isAdmin || paymentStatus === "paid";

  const handleDownload = async () => {
    if (!isAvailable) return;

    setLoading(true);
    setError("");

    try {
      const url = `/api/orders/${orderId}/invoice${isAdmin ? "?admin=true" : ""}`;

      const token = getAuthToken();
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(url, {
        method: "GET",
        headers,
        credentials: "include",
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Failed to download invoice");
      }

      // Trigger browser download
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `Invoice-${orderNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err: any) {
      setError(err.message || "Download failed");
    } finally {
      setLoading(false);
    }
  };

  // ── Compact variant (for table rows / order list) ─────────────────────────
  if (variant === "compact") {
    if (!isAvailable) return null;

    return (
      <button
        onClick={handleDownload}
        disabled={loading}
        title="Download Invoice"
        aria-label={`Download invoice for order ${orderNumber}`}
        className="text-theme-text-muted-light dark:text-theme-text-muted-dark hover:text-theme-primary dark:hover:text-theme-primary transition-colors disabled:opacity-50"
      >
        {loading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <FileText size={16} />
        )}
      </button>
    );
  }

  // ── Default variant (for order detail views) ─────────────────────────────
  return (
    <div className="flex flex-col items-start gap-1">
      {isAvailable ? (
        <button
          onClick={handleDownload}
          disabled={loading}
          aria-label={`Download invoice for order ${orderNumber}`}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-theme-surface-light dark:bg-theme-surface-dark border border-theme-border-light dark:border-theme-border-dark text-theme-text-primary-light dark:text-theme-text-primary-dark rounded-lg hover:bg-theme-hover-bg-light dark:hover:bg-theme-hover-bg-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <Download size={15} />
          )}
          {loading ? "Generating..." : "Download Invoice"}
        </button>
      ) : (
        <div className="flex items-center gap-2 px-4 py-2 text-sm text-theme-text-muted-light dark:text-theme-text-muted-dark border border-dashed border-theme-border-light dark:border-theme-border-dark rounded-lg cursor-not-allowed select-none">
          <FileText size={15} />
          Invoice available after payment
        </div>
      )}

      {error && (
        <p className="text-xs text-red-600 dark:text-red-400 mt-1" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}