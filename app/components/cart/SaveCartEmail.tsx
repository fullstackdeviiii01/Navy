// app/components/cart/SaveCartEmail.tsx - NEW FILE

"use client";

import { useState } from "react";
import { Mail, Check, Bookmark } from "lucide-react";
import { cartApi } from "../../../lib/api/cart";

interface SaveCartEmailProps {
  onEmailSaved?: (email: string) => void;
  source?: "cart_sidebar" | "exit_intent";
}

export default function SaveCartEmail({
  onEmailSaved,
  source = "cart_sidebar",
}: SaveCartEmailProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [dismissed, setDismissed] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes("@")) {
      setError("Please enter a valid email");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await cartApi.updateGuestEmail(email, source);
      setSaved(true);
      setError("");

      if (onEmailSaved) {
        onEmailSaved(email);
      }

      // Store in sessionStorage to persist across pages
      sessionStorage.setItem("guest_cart_email", email);

      // Auto-dismiss after 3 seconds
      setTimeout(() => {
        setDismissed(true);
      }, 3000);
    } catch (err: any) {
      setError(err.message || "Failed to save email");
      setSaved(false);
    } finally {
      setLoading(false);
    }
  };

  if (dismissed) {
    return (
      <button
        onClick={() => setDismissed(false)}
        className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
        aria-label="Edit saved email"
      >
        ✓ Cart saved • Edit email
      </button>
    );
  }

  if (saved) {
    return (
      <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
        <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
          <Check className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
          <p className="text-xs sm:text-sm font-medium">
            Cart saved! We'll email you for your cart reminders.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
        <Bookmark className="w-4 h-4" aria-hidden="true" />
        Save Your Cart
      </label>

      <form onSubmit={handleSave} className="space-y-2">
        <div className="relative">
          <Mail
            className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4"
          />
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
            }}
            placeholder="your.email@example.com"
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
        </div>

        {error && (
          <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading || !email}
          className="w-full px-3 py-2 text-xs sm:text-sm bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Saving..." : "Save Cart"}
        </button>

        <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
          ✓ No spam, cart reminders only
        </p>
      </form>
    </div>
  );
}
