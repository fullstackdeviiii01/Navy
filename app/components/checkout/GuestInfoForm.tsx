// app/components/checkout/GuestInfoForm.tsx
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
            "An account with this email already exists. Sign in to use your saved addresses.",
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
    <div className="border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark p-6 transition-colors">
      <div className="flex items-center justify-between pb-4 mb-5 border-b border-theme-border-light dark:border-theme-border-dark">
        <h3 className="text-lg font-serif italic text-theme-text-primary-light dark:text-theme-text-primary-dark">
          Contact Information
        </h3>
        <span className="text-[10px] uppercase tracking-[0.2em] font-medium text-theme-hover-light dark:text-theme-hover-dark">
          Guest Checkout
        </span>
      </div>

      <div className="space-y-4">
        {/* Email */}
        <div>
          <label className="block text-xs uppercase tracking-[0.15em] font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1.5">
            Email Address *
          </label>
          <div className="relative">
            <Mail
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-theme-text-muted-light dark:text-theme-text-muted-dark w-4 h-4"
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
              className="w-full pl-10 pr-10 py-3 border border-theme-border-light dark:border-theme-border-dark bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark text-xs sm:text-sm focus:outline-none focus:border-theme-hover-light"
            />
            {emailChecking && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin h-3.5 w-3.5 border-2 border-theme-primary border-t-transparent"></div>
              </div>
            )}
          </div>

          {/* Banned email message */}
          {bannedMessage && (
            <div className="mt-2 p-3 bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs">
              <p>{bannedMessage}</p>
            </div>
          )}

          {/* Existing user message */}
          {existingUserMessage && !bannedMessage && (
            <div className="mt-2 p-3 bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-200 text-xs">
              <p>{existingUserMessage}</p>
              <Link
                href="/sign-in"
                aria-label="Sign in to your existing account"
                className="text-xs uppercase tracking-wider font-semibold text-theme-hover-light dark:text-theme-hover-dark underline mt-1.5 inline-block"
              >
                Sign In Now →
              </Link>
            </div>
          )}
        </div>

        {/* Name */}
        <div>
          <label className="block text-xs uppercase tracking-[0.15em] font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1.5">
            Full Name *
          </label>
          <div className="relative">
            <UserIcon
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-theme-text-muted-light dark:text-theme-text-muted-dark w-4 h-4"
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
              className="w-full pl-10 pr-4 py-3 border border-theme-border-light dark:border-theme-border-dark bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark text-xs sm:text-sm focus:outline-none focus:border-theme-hover-light"
            />
          </div>
        </div>

        {/* Phone */}
        <div>
          <label className="block text-xs uppercase tracking-[0.15em] font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1.5">
            Phone Number *
          </label>
          <div className="relative">
            <Phone
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-theme-text-muted-light dark:text-theme-text-muted-dark w-4 h-4"
              aria-hidden="true"
            />
            <input
              type="tel"
              value={guestInfo.phone}
              onChange={(e) =>
                onGuestInfoChange({ ...guestInfo, phone: e.target.value })
              }
              required
              placeholder="+92 300 1234567"
              className="w-full pl-10 pr-4 py-3 border border-theme-border-light dark:border-theme-border-dark bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark text-xs sm:text-sm focus:outline-none focus:border-theme-hover-light"
            />
          </div>
          <p className="text-[10px] text-theme-text-muted-light dark:text-theme-text-muted-dark mt-1">
            Required for delivery coordination and courier updates
          </p>
        </div>
      </div>
    </div>
  );
}