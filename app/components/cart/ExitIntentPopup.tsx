// app/components/cart/ExitIntentPopup.tsx
"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
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
    if (!isGuestUser || !hasItems) return;

    const alreadyShown = sessionStorage.getItem('exit_intent_shown');
    if (alreadyShown) return;

    const emailSaved = sessionStorage.getItem('guest_cart_email');
    if (emailSaved) return;

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !hasShown) {
        setShowPopup(true);
        setHasShown(true);
        sessionStorage.setItem('exit_intent_shown', 'true');
      }
    };

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
    setTimeout(() => {
      setShowPopup(false);
    }, 2000);
  };

  if (!showPopup) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 animate-fade-in"
        onClick={handleClose}
      />

      {/* Popup */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-[90%] max-w-md animate-slide-up">
        <div className="bg-theme-surface-light dark:bg-theme-surface-dark border border-theme-border-light dark:border-theme-border-dark p-6 sm:p-8 shadow-2xl relative">
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-1 text-theme-text-muted-light dark:text-theme-text-muted-dark hover:text-theme-text-primary-light dark:hover:text-theme-text-primary-dark transition-colors"
            aria-label="Close popup"
          >
            <X className="w-5 h-5"/>
          </button>

          {/* Content */}
          <div className="text-center mb-6">
            <p className="text-[10px] uppercase tracking-[0.25em] font-medium text-theme-hover-light dark:text-theme-hover-dark mb-2">
              SAVE YOUR ORDER
            </p>
            <h3 className="text-2xl font-serif font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark mb-2">
              Save Your Basket
            </h3>
            <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
              Keep your selected handcrafted pieces safe and receive reminders.
            </p>
          </div>

          {/* Email Form */}
          <SaveCartEmail 
            onEmailSaved={handleEmailSaved}
            source="exit_intent"
          />

          {/* Dismiss button */}
          <button
            onClick={handleClose}
            className="w-full mt-4 text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark hover:text-theme-text-primary-light dark:hover:text-theme-text-primary-dark transition-colors text-center"
          >
            No thanks, continue without saving
          </button>
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