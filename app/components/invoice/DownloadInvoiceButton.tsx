// app/components/invoice/DownloadInvoiceButton.tsx
"use client";

import { useState } from "react";
import { FileText, Loader2, Download, Receipt } from "lucide-react";
import { getAuthToken } from "../../../lib/api/helpers";

interface DownloadInvoiceButtonProps {
  orderId: string;
  orderNumber: string;
  paymentStatus?: string;
  isAdmin?: boolean;
  /** Pass variant="compact" for inline/table usage */
  variant?: "default" | "compact";
  className?: string;
}

export default function DownloadInvoiceButton({
  orderId,
  orderNumber,
  paymentStatus,
  isAdmin = false,
  variant = "default",
  className = "",
}: DownloadInvoiceButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const docTitle = isAdmin ? "Invoice" : "Order Receipt";
  const docFilename = isAdmin
    ? `Talal-Wooden-Lamps-Invoice-${orderNumber}.pdf`
    : `Talal-Wooden-Lamps-Receipt-${orderNumber}.pdf`;

  const handleDownload = async () => {
    setLoading(true);
    setError("");

    try {
      const url = `/api/orders/${orderId}/invoice${isAdmin ? "?admin=true&type=invoice" : "?type=receipt"}`;

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
        throw new Error(data.error || `Failed to download ${docTitle.toLowerCase()}`);
      }

      // Trigger browser download
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = docFilename;
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
    return (
      <button
        onClick={handleDownload}
        disabled={loading}
        title={`Download ${docTitle}`}
        aria-label={`Download ${docTitle.toLowerCase()} for order ${orderNumber}`}
        className={`text-theme-text-muted-light dark:text-theme-text-muted-dark hover:text-theme-primary dark:hover:text-theme-primary transition-colors disabled:opacity-50 ${className}`}
      >
        {loading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : isAdmin ? (
          <FileText size={16} />
        ) : (
          <Receipt size={16} />
        )}
      </button>
    );
  }

  // ── Default variant (for order detail views & confirmation) ───────────────
  return (
    <div className={`flex flex-col items-start gap-1 ${className}`}>
      <button
        onClick={handleDownload}
        disabled={loading}
        aria-label={`Download ${docTitle.toLowerCase()} for order ${orderNumber}`}
        className="inline-flex items-center justify-center gap-2 px-3.5 sm:px-4 py-2.5 sm:py-3 text-xs font-semibold uppercase tracking-[0.15em] bg-theme-surface-light dark:bg-theme-surface-dark border border-theme-border-light dark:border-theme-border-dark text-theme-text-primary-light dark:text-theme-text-primary-dark hover:border-theme-hover-light dark:hover:border-theme-hover-dark hover:text-theme-hover-light dark:hover:text-theme-hover-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap shrink-0 shadow-2xs cursor-pointer"
      >
        {loading ? (
          <Loader2 size={14} className="animate-spin text-theme-hover-light" />
        ) : isAdmin ? (
          <FileText size={14} className="text-theme-hover-light" />
        ) : (
          <Receipt size={14} className="text-theme-hover-light" />
        )}
        <span>{loading ? "Generating..." : `Download ${docTitle}`}</span>
      </button>

      {error && (
        <p className="text-xs text-red-600 dark:text-red-400 mt-1" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}