// app/components/product-detail/ProductShareModal.tsx
"use client";

import { useState } from "react";
import { FaWhatsapp, FaFacebook,FaSnapchatGhost, FaEnvelope, FaCopy, FaCheck } from "react-icons/fa";
import { FaInstagram, FaSnapchat, FaXTwitter } from "react-icons/fa6";

interface ProductShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    _id: string;
    name: string;
    short_description?: string;
    images?: Array<{ url: string }>;
    pricing: {
      price: number;
      currency: string;
    };
  };
}

export default function ProductShareModal({ isOpen, onClose, product }: ProductShareModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const getProductUrl = () => {
    if (typeof window !== "undefined") {
      return window.location.href;
    }
    return "";
  };

  const getShareText = () => {
    const price = `${product.pricing.currency} ${product.pricing.price.toFixed(2)}`;
    return `Check out ${product.name} - ${price}`;
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(getProductUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy link:", error);
    }
  };

  const shareOptions = [
    {
      name: "WhatsApp",
      icon: FaWhatsapp,
      color: "bg-green-500 hover:bg-green-600",
      action: () => {
        const text = encodeURIComponent(getShareText());
        const url = encodeURIComponent(getProductUrl());
        window.open(`https://wa.me/?text=${text}%20${url}`, "_blank");
      },
    },
    {
      name: "Facebook",
      icon: FaFacebook,
      color: "bg-blue-600 hover:bg-blue-700",
      action: () => {
        const url = encodeURIComponent(getProductUrl());
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, "_blank");
      },
    },
    {
      name: "X",
      icon: FaXTwitter,
      color: "bg-black hover:bg-gray-800",
      action: () => {
        const text = encodeURIComponent(getShareText());
        const url = encodeURIComponent(getProductUrl());
        window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, "_blank");
      },
    },
    {
      name: "Instagram",
      icon: FaInstagram,
      color: "bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 hover:from-purple-700 hover:via-pink-700 hover:to-orange-600",
      action: () => {
        alert("Instagram doesn't support direct link sharing. Please copy the link and share it in your Instagram story or bio.");
      },
    },
    {
      name: "Snapchat",
      icon: FaSnapchatGhost,
      color: "bg-yellow-300 hover:bg-yellow-400 text-black",
      action: () => {
        const url = encodeURIComponent(getProductUrl());
        window.open(`https://www.snapchat.com/share?url=${url}`, "_blank");
      },
    },
    {
      name: "Email",
      icon: FaEnvelope,
      color: "bg-gray-600 hover:bg-gray-700",
      action: () => {
        const subject = encodeURIComponent(`Check out ${product.name}`);
        const body = encodeURIComponent(
          `I found this product and thought you might be interested:\n\n${product.name}\n${product.short_description || ""}\n\nPrice: ${product.pricing.currency} ${product.pricing.price.toFixed(2)}\n\nView it here: ${getProductUrl()}`
        );
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
      },
    },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4" role="dialog" aria-modal="true" aria-labelledby="share-modal-title">
      <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-theme-border-light dark:border-theme-border-dark">
          <h3 id="share-modal-title" className="text-base sm:text-lg font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark">
            Share Product
          </h3>
        </div>

        {/* Content */}
        <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
          {/* Copy Link Section */}
          <div>
            <label htmlFor="product-url" className="block text-xs font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1.5">
              Product Link
            </label>
            <div className="flex gap-2">
              <input
                id="product-url"
                type="text"
                value={getProductUrl()}
                readOnly
                className="flex-1 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-theme-bg-light dark:bg-theme-bg-dark border border-theme-border-light dark:border-theme-border-dark rounded-lg text-theme-text-primary-light dark:text-theme-text-primary-dark text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary"
                aria-label="Product URL"
              />
              <button
                onClick={handleCopyLink}
                className={`px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg font-medium transition-all flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm whitespace-nowrap ${
                  copied
                    ? "bg-green-500 text-white"
                    : "bg-theme-primary hover:bg-theme-primary-hover text-white"
                }`}
                aria-label={copied ? "Link copied to clipboard" : "Copy link to clipboard"}
                style={{ minWidth: '44px', minHeight: '44px' }}
              >
                {copied ? (
                  <>
                    <FaCheck className="text-xs sm:text-sm" />
                    <span className="hidden sm:inline">Copied</span>
                  </>
                ) : (
                  <>
                    <FaCopy className="text-xs sm:text-sm" />
                    <span className="hidden sm:inline">Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Share Options */}
          <div>
            <div className="flex flex-wrap gap-2 sm:gap-2.5 md:gap-3 justify-center" role="group" aria-label="Share on social media">
              {shareOptions.map((option) => (
                <button
                  key={option.name}
                  onClick={option.action}
                  className={`flex flex-col items-center justify-center w-10 h-10 sm:w-12 sm:h-12 ${option.color} text-white rounded-full transition-all shadow-sm hover:shadow-md transform hover:scale-105`}
                  title={`Share on ${option.name}`}
                  aria-label={`Share on ${option.name}`}
                  style={{ minWidth: '44px', minHeight: '44px' }}
                >
                  <option.icon className="text-lg sm:text-xl md:text-2xl"/>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-3 sm:px-4 pb-3 sm:pb-4">
          <button
            onClick={onClose}
            className="w-full px-3 sm:px-4 py-1.5 sm:py-2 border border-theme-border-light dark:border-theme-border-dark text-theme-text-secondary-light dark:text-theme-text-secondary-dark hover:bg-theme-hover-bg-light dark:hover:bg-theme-hover-bg-dark rounded-lg font-medium transition-colors text-xs sm:text-sm"
            aria-label="Close share dialog"
            style={{ minWidth: '44px', minHeight: '44px' }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}