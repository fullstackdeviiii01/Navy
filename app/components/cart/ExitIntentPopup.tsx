// app/components/cart/ExitIntentPopup.tsx - NEW FILE

"use client";

import { useState, useEffect } from "react";
import { X, ShoppingCart } from "lucide-react";
import SaveCartEmail from "./SaveCartEmail";

interface ExitIntentPopupProps {
  isGuestUser: boolean;
  hasItems: boolean;
}

export default function ExitIntentPopup({ 
  isGuestUser, 
  hasItems 
}: ExitIntentPopupProps) {
  const [showPopup, setShowPopup] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    // Don't show if not guest user or no items
    if (!isGuestUser || !hasItems) return;

    // Check if already shown this session
    const alreadyShown = sessionStorage.getItem('exit_intent_shown');
    if (alreadyShown) return;

    // Check if email already saved
    const emailSaved = sessionStorage.getItem('guest_cart_email');
    if (emailSaved) return;

    const handleMouseLeave = (e: MouseEvent) => {
      // Only trigger if mouse leaves from top
      if (e.clientY <= 0 && !hasShown) {
        setShowPopup(true);
        setHasShown(true);
        sessionStorage.setItem('exit_intent_shown', 'true');
      }
    };

    // Add listener after 2 seconds to avoid immediate triggers
    const timer = setTimeout(() => {
      document.addEventListener('mouseleave', handleMouseLeave);
    }, 2000);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isGuestUser, hasItems, hasShown]);

  const handleClose = () => {
    setShowPopup(false);
  };

  const handleEmailSaved = () => {
    // Auto-close after email saved
    setTimeout(() => {
      setShowPopup(false);
    }, 2000);
  };

  if (!showPopup) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-50 animate-fade-in"
        onClick={handleClose}
      />

      {/* Popup */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-[90%] max-w-md animate-slide-up">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            aria-label="Close popup"
          >
            <X className="w-5 h-5"/>
          </button>

          {/* Content */}
         <div className="text-center mb-4">
  <div className="flex justify-center mb-3">
    <ShoppingCart className="w-10 h-10 text-gray-400 dark:text-gray-500" aria-hidden="true" />
  </div>
  <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
    Don't lose your items!
  </h3>
  <p className="text-sm text-gray-600 dark:text-gray-400">
    Save your cart and get reminders
  </p>
</div>

          {/* Email Form */}
          <SaveCartEmail 
            onEmailSaved={handleEmailSaved}
            source="exit_intent"
          />

          {/* No Thanks */}
          <button
            onClick={handleClose}
            className="w-full mt-3 text-xs sm:text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          >
            No thanks, I'll risk it
          </button>

          {/* Benefits */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
              <p>✓ Free reminders if you leave items</p>
              <p>✓ No account needed</p>
              <p>✓ Unsubscribe anytime</p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translate(-50%, -40%);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%);
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slide-up {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </>
  );
}