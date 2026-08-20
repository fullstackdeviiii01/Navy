// // app/components/checkout/GuestInfoForm.tsx
"use client";

import { useState, useEffect } from "react";
import { Mail, User as UserIcon, Phone } from "lucide-react";
import Link from "next/link";

interface GuestInfoFormProps {
  guestInfo: {
    email: string;
    name: string;
    phone: string;
  };
  onGuestInfoChange: (guestInfo: {
    email: string;
    name: string;
    phone: string;
  }) => void;
  onCheckExistingUser?: (email: string) => Promise<boolean>;
  onBannedEmail?: (isBanned: boolean) => void;
}

export default function GuestInfoForm({
  guestInfo,
  onGuestInfoChange,
  onCheckExistingUser,
  onBannedEmail,
}: GuestInfoFormProps) {
  const [emailChecking, setEmailChecking] = useState(false);
  const [existingUserMessage, setExistingUserMessage] = useState("");
  const [bannedMessage, setBannedMessage] = useState("");

  // Auto-fill email from sessionStorage
  useEffect(() => {
    const savedEmail = sessionStorage.getItem('guest_cart_email');
    if (savedEmail && !guestInfo.email) {
      onGuestInfoChange({
        ...guestInfo,
        email: savedEmail,
      });
    }
  }, []);

  const handleEmailBlur = async () => {
    if (!guestInfo.email) return;

    setEmailChecking(true);
    setExistingUserMessage("");
    setBannedMessage("");

    try {
      // 1. Check ban status first
      const banResponse = await fetch("/api/users/check-ban", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: guestInfo.email }),
      });

      if (banResponse.ok) {
        const banData = await banResponse.json();
        if (banData.is_banned) {
          setBannedMessage(
            "This email address cannot be used to place orders. Please contact support."
          );
          onBannedEmail?.(true);
          setEmailChecking(false);
          return;
        }
      }

      onBannedEmail?.(false);

      // 2. Check if existing account (only if not banned)
      if (onCheckExistingUser) {
        const exists = await onCheckExistingUser(guestInfo.email);
        if (exists) {
          setExistingUserMessage(
            "An account with this email already exists. Please sign in to use saved addresses and faster checkout.",
          );
        }
      }
    } catch (error) {
      console.error("Email check failed:", error);
      onBannedEmail?.(false);
    } finally {
      setEmailChecking(false);
    }
  };

  return (
    <div className="bg-theme-surface-light dark:bg-theme-surface-dark border border-theme-border-light dark:border-theme-border-dark rounded-xl p-3 sm:p-4 md:p-5 lg:p-6">
      <div className="flex items-center justify-between mb-3 sm:mb-4 gap-2">
        <h3 className="text-base sm:text-lg font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
          Your Information
        </h3>
        <span className="text-[10px] sm:text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark bg-blue-50 dark:bg-blue-900/20 px-2 sm:px-2.5 md:px-3 py-0.5 sm:py-1 rounded-full whitespace-nowrap">
          Guest Checkout
        </span>
      </div>

      <div className="space-y-3 sm:space-y-3.5 md:space-y-4">
        {/* Email */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1.5 sm:mb-2">
            Email Address *
          </label>
          <div className="relative">
            <Mail
              className="absolute left-2.5 sm:left-3 top-1/2 transform -translate-y-1/2 text-theme-text-muted-light dark:text-theme-text-muted-dark w-4 h-4 sm:w-[18px] sm:h-[18px]"
              aria-hidden="true"
            />
            <input
              type="email"
              value={guestInfo.email}
              onChange={(e) => {
                onGuestInfoChange({ ...guestInfo, email: e.target.value });
                setBannedMessage("");
                setExistingUserMessage("");
              }}
              onBlur={handleEmailBlur}
              required
              placeholder="your.email@example.com"
              className="w-full pl-8 sm:pl-9 md:pl-10 pr-10 sm:pr-11 md:pr-12 py-2 sm:py-2.5 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary"
            />
            {emailChecking && (
              <div className="absolute right-2.5 sm:right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-3.5 w-3.5 sm:h-4 sm:w-4 border-2 border-theme-primary border-t-transparent"></div>
              </div>
            )}
          </div>

          {/* Banned email message */}
          {bannedMessage && (
            <div className="mt-2 p-2.5 sm:p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-xs sm:text-sm text-red-800 dark:text-red-200 leading-relaxed">
                {bannedMessage}
              </p>
            </div>
          )}

          {/* Existing user message */}
          {existingUserMessage && !bannedMessage && (
            <div className="mt-2 p-2.5 sm:p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-xs sm:text-sm text-yellow-800 dark:text-yellow-200 leading-relaxed">
                {existingUserMessage}
              </p>
              <Link
                href="/sign-in"
                aria-label="Sign in to your existing account"
                className="text-xs sm:text-sm font-semibold text-theme-primary hover:underline mt-1 inline-block active:scale-95"
              >
                Sign In Now
              </Link>
            </div>
          )}

          <p className="text-[10px] sm:text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark mt-1">
            We'll send your order confirmation here
          </p>
        </div>

        {/* Name */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1.5 sm:mb-2">
            Full Name *
          </label>
          <div className="relative">
            <UserIcon
              className="absolute left-2.5 sm:left-3 top-1/2 transform -translate-y-1/2 text-theme-text-muted-light dark:text-theme-text-muted-dark w-4 h-4 sm:w-[18px] sm:h-[18px]"
              aria-hidden="true"
            />
            <input
              type="text"
              value={guestInfo.name}
              onChange={(e) =>
                onGuestInfoChange({ ...guestInfo, name: e.target.value })
              }
              required
              placeholder="John Doe"
              className="w-full pl-8 sm:pl-9 md:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary"
            />
          </div>
        </div>

        {/* Phone */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1.5 sm:mb-2">
            Phone Number *
          </label>
          <div className="relative">
            <Phone
              className="absolute left-2.5 sm:left-3 top-1/2 transform -translate-y-1/2 text-theme-text-muted-light dark:text-theme-text-muted-dark w-4 h-4 sm:w-[18px] sm:h-[18px]"
              aria-hidden="true"
            />
            <input
              type="tel"
              value={guestInfo.phone}
              onChange={(e) =>
                onGuestInfoChange({ ...guestInfo, phone: e.target.value })
              }
              required
              placeholder="+1 (555) 123-4567"
              className="w-full pl-8 sm:pl-9 md:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary"
            />
          </div>
          <p className="text-[10px] sm:text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark mt-1">
            For delivery updates and order notifications
          </p>
        </div>
      </div>

      {/* Benefits of Creating Account */}
      <div className="mt-4 sm:mt-5 md:mt-6 p-3 sm:p-3.5 md:p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <p className="text-xs sm:text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1.5 sm:mb-2">
          Why create an account?
        </p>
        <ul className="text-[10px] sm:text-xs text-blue-800 dark:text-blue-200 space-y-0.5 sm:space-y-1">
          <li>• Track your orders easily</li>
          <li>• Save addresses for faster checkout</li>
          <li>• View order history</li>
          <li>• Get exclusive member discounts</li>
        </ul>
        <a
          href="/sign-up"
          aria-label="Create an account after completing checkout"
          className="inline-block mt-2 sm:mt-2.5 md:mt-3 text-xs sm:text-sm font-semibold text-theme-primary hover:underline active:scale-95"
        >
          Create an account after checkout →
        </a>
      </div>
    </div>
  );
}