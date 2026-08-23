// app/components/returns/RequestReturnModal.tsx
"use client";

import { useState } from "react";
import {
  X,
  Package,
  Upload,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Trash2,
  Image as ImageIcon,
  Video,
} from "lucide-react";
import { returnsApi } from "../../../lib/api/returns";
import { formatPrice } from "../../../lib/utils/formatPrice";

interface RequestReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
  onSuccess: () => void;
}

export default function RequestReturnModal({
  isOpen,
  onClose,
  order,
  onSuccess,
}: RequestReturnModalProps) {
  // Selection state for ordered items
  const [selectedItems, setSelectedItems] = useState<
    Record<
      string,
      {
        selected: boolean;
        quantity: number;
      }
    >
  >(() => {
    const initial: Record<string, { selected: boolean; quantity: number }> = {};
    order.items?.forEach((item: any, idx: number) => {
      const key = `${item.product_id?._id || item.product_id || idx}`;
      initial[key] = { selected: false, quantity: item.quantity || 1 };
    });
    return initial;
  });

  const [reason, setReason] = useState("defective");
  const [reasonDetails, setReasonDetails] = useState("");
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const toggleItemSelection = (key: string) => {
    setSelectedItems((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        selected: !prev[key]?.selected,
      },
    }));
  };

  const updateItemQuantity = (key: string, qty: number, max: number) => {
    const validQty = Math.max(1, Math.min(qty, max));
    setSelectedItems((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        quantity: validQty,
      },
    }));
  };

  // Calculate estimated refund sum in real-time
  const calculateTotalRefund = () => {
    let sum = 0;
    order.items?.forEach((item: any, idx: number) => {
      const key = `${item.product_id?._id || item.product_id || idx}`;
      const state = selectedItems[key];
      if (state?.selected) {
        sum += (item.price || 0) * (state.quantity || 1);
      }
    });
    return sum;
  };

  // Media file upload handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError("");

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          throw new Error("Failed to upload image or video proof");
        }

        const data = await res.json();
        if (data.url) {
          setMediaUrls((prev) => [...prev, data.url]);
        }
      }
    } catch (err: any) {
      setError(err.message || "Failed to upload media");
    } finally {
      setUploading(false);
    }
  };

  const removeMedia = (index: number) => {
    setMediaUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Gather selected items
    const itemsToReturn: any[] = [];
    order.items?.forEach((item: any, idx: number) => {
      const key = `${item.product_id?._id || item.product_id || idx}`;
      const state = selectedItems[key];
      if (state?.selected) {
        itemsToReturn.push({
          product_id: item.product_id?._id || item.product_id,
          product_name: item.product_name || item.name || "Product",
          product_image:
            item.product_image || item.product_id?.images?.[0]?.url || item.image,
          variant_attributes: item.variant_attributes,
          quantity: state.quantity,
          price: item.price,
        });
      }
    });

    if (itemsToReturn.length === 0) {
      setError("Please select at least one item from your order to return.");
      return;
    }

    setSubmitting(true);

    try {
      await returnsApi.submitReturn({
        order_id: order._id,
        items: itemsToReturn,
        return_reason: reason,
        return_reason_details: reasonDetails,
        media_urls: mediaUrls,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to submit return request");
    } finally {
      setSubmitting(false);
    }
  };

  const totalRefund = calculateTotalRefund();

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-theme-surface-light dark:bg-theme-surface-dark border border-theme-border-light dark:border-theme-border-dark max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl rounded-lg overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-theme-border-light dark:border-theme-border-dark flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-theme-hover-light dark:text-theme-hover-dark font-semibold">
              RETURNS & REFUNDS
            </span>
            <h2 className="text-xl font-serif font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark">
              Request Return for Order #{order.order_number}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-theme-text-muted-light dark:text-theme-text-muted-dark hover:text-theme-text-primary-light transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {error && (
            <div className="p-3.5 rounded bg-red-100 dark:bg-red-950/50 border border-red-300 dark:border-red-800 text-red-800 dark:text-red-200 flex items-center gap-2">
              <AlertCircle size={16} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Step 1: Select Items from this order */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[11px] uppercase font-bold tracking-wider text-theme-text-primary-light dark:text-theme-text-primary-dark">
                1. Select Items to Return
              </label>
              <span className="text-[10px] text-theme-text-muted-light">
                Ordered items only
              </span>
            </div>

            <div className="divide-y divide-theme-border-light/60 dark:divide-theme-border-dark/60 border border-theme-border-light dark:border-theme-border-dark rounded-md bg-theme-bg-light/50 dark:bg-theme-bg-dark/30">
              {order.items?.map((item: any, idx: number) => {
                const key = `${item.product_id?._id || item.product_id || idx}`;
                const state = selectedItems[key] || { selected: false, quantity: item.quantity || 1 };
                const itemImg =
                  item.product_image ||
                  item.product_id?.images?.[0]?.url ||
                  item.image ||
                  "";
                const itemName = item.product_name || item.name || "Handcrafted Piece";

                return (
                  <div
                    key={key}
                    onClick={() => toggleItemSelection(key)}
                    className={`p-3 sm:p-4 flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                      state.selected
                        ? "bg-theme-card-light/70 dark:bg-theme-card-dark/60"
                        : "hover:bg-theme-card-light/30"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <input
                        type="checkbox"
                        checked={state.selected}
                        onChange={() => {}} // Handled by container onClick
                        className="w-4 h-4 rounded text-theme-primary accent-theme-primary cursor-pointer"
                      />
                      <div className="w-12 h-12 rounded border border-theme-border-light dark:border-theme-border-dark overflow-hidden bg-theme-surface-light dark:bg-theme-surface-dark flex-shrink-0 flex items-center justify-center">
                        {itemImg ? (
                          <img
                            src={itemImg}
                            alt={itemName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Package size={16} className="text-theme-text-muted-light" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-serif font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark truncate">
                          {itemName}
                        </p>
                        <p className="text-[10px] text-theme-text-muted-light uppercase tracking-wider">
                          Ordered: {item.quantity} · {formatPrice(item.price)} each
                        </p>
                      </div>
                    </div>

                    {/* Quantity Selector if selected */}
                    {state.selected && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1.5 flex-shrink-0"
                      >
                        <span className="text-[10px] uppercase font-semibold text-theme-text-muted-light mr-1">
                          Return Qty:
                        </span>
                        <select
                          value={state.quantity}
                          onChange={(e) =>
                            updateItemQuantity(
                              key,
                              parseInt(e.target.value, 10),
                              item.quantity || 1
                            )
                          }
                          className="px-2 py-1 bg-theme-surface-light dark:bg-theme-surface-dark border border-theme-border-light dark:border-theme-border-dark text-xs rounded font-semibold focus:outline-none"
                        >
                          {Array.from(
                            { length: item.quantity || 1 },
                            (_, i) => i + 1
                          ).map((q) => (
                            <option key={q} value={q}>
                              {q}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 2: Reason for Return */}
          <div className="space-y-2">
            <label className="block text-[11px] uppercase font-bold tracking-wider text-theme-text-primary-light dark:text-theme-text-primary-dark">
              2. Reason for Return
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-theme-bg-light dark:bg-theme-bg-dark border border-theme-border-light dark:border-theme-border-dark text-xs rounded focus:outline-none focus:border-theme-hover-light"
            >
              <option value="defective">Defective / Not Working Properly</option>
              <option value="damaged">Damaged in Transit</option>
              <option value="wrong_item">Wrong Item Received</option>
              <option value="quality_issue">Quality Does Not Match Expectation</option>
              <option value="not_as_described">Not as Described on Site</option>
              <option value="changed_mind">Changed Mind</option>
              <option value="other">Other Reason</option>
            </select>
          </div>

          {/* Step 3: Explanation */}
          <div className="space-y-2">
            <label className="block text-[11px] uppercase font-bold tracking-wider text-theme-text-primary-light dark:text-theme-text-primary-dark">
              3. Explanation / Notes (Optional)
            </label>
            <textarea
              rows={3}
              value={reasonDetails}
              onChange={(e) => setReasonDetails(e.target.value)}
              placeholder="Describe the issue with the item(s)..."
              className="w-full px-3.5 py-2.5 bg-theme-bg-light dark:bg-theme-bg-dark border border-theme-border-light dark:border-theme-border-dark text-xs rounded focus:outline-none focus:border-theme-hover-light"
            />
          </div>

          {/* Step 4: Photo / Video Evidence */}
          <div className="space-y-2">
            <label className="block text-[11px] uppercase font-bold tracking-wider text-theme-text-primary-light dark:text-theme-text-primary-dark">
              4. Photo / Video Evidence (Recommended)
            </label>
            <div className="border border-dashed border-theme-border-light dark:border-theme-border-dark rounded-md p-4 bg-theme-bg-light/40 dark:bg-theme-bg-dark/20 flex flex-col items-center justify-center text-center space-y-2">
              <Upload size={20} className="text-theme-text-muted-light" />
              <p className="text-[11px] text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
                Upload photos or short video clip showing the issue or defect.
              </p>
              <label className="cursor-pointer px-4 py-1.5 bg-theme-surface-light dark:bg-theme-surface-dark border border-theme-border-light dark:border-theme-border-dark hover:border-theme-hover-light rounded text-[11px] font-semibold transition-colors">
                <span>{uploading ? "Uploading..." : "Browse Media Files"}</span>
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            </div>

            {/* Uploaded media previews */}
            {mediaUrls.length > 0 && (
              <div className="grid grid-cols-4 gap-2 pt-2">
                {mediaUrls.map((url, idx) => (
                  <div
                    key={idx}
                    className="relative group rounded border border-theme-border-light dark:border-theme-border-dark overflow-hidden h-16 bg-black/20"
                  >
                    {url.endsWith(".mp4") || url.endsWith(".webm") ? (
                      <div className="w-full h-full flex items-center justify-center">
                        <Video size={20} className="text-white" />
                      </div>
                    ) : (
                      <img src={url} alt="Proof" className="w-full h-full object-cover" />
                    )}
                    <button
                      type="button"
                      onClick={() => removeMedia(idx)}
                      className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Bar / Submit */}
          <div className="pt-4 border-t border-theme-border-light dark:border-theme-border-dark flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] uppercase font-mono tracking-wider text-theme-text-muted-light block">
                Estimated Refund Amount
              </span>
              <p className="text-base font-serif font-bold text-theme-hover-light dark:text-theme-hover-dark">
                {formatPrice(totalRefund)}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 border border-theme-border-light dark:border-theme-border-dark rounded text-xs font-semibold hover:bg-theme-card-light transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || totalRefund === 0}
                className="px-6 py-2.5 bg-theme-primary hover:bg-theme-hover-light dark:hover:bg-theme-hover-dark text-theme-btn-text rounded text-xs font-semibold uppercase tracking-wider transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Submitting Claim...</span>
                  </>
                ) : (
                  <span>Submit Return Claim</span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
