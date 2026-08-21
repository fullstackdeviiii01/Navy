// app/components/cart/SaveCartEmail.tsx
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

      sessionStorage.setItem("guest_cart_email", email);

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
        className="text-xs text-theme-hover-light dark:text-theme-hover-dark hover:underline"
        aria-label="Edit saved email"
      >
        ✓ Cart saved • Edit email
      </button>
    );
  }

  if (saved) {
    return (
      <div className="p-3 bg-green-500/10 border border-green-500/30 text-green-700 dark:text-green-300 text-xs">
        <div className="flex items-center gap-2">
          <Check className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
          <p className="font-medium">
            Cart saved! We will email your cart details.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="text-[11px] uppercase tracking-[0.2em] font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark flex items-center gap-1.5">
        <Bookmark className="w-3.5 h-3.5" aria-hidden="true" />
        Save Your Cart
      </label>

      <form onSubmit={handleSave} className="space-y-2">
        <div className="relative">
          <Mail
            className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-theme-text-muted-light dark:text-theme-text-muted-dark w-4 h-4"
          />
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
            }}
            placeholder="your.email@example.com"
            className="w-full pl-9 pr-3 py-2.5 text-xs bg-theme-bg-light dark:bg-theme-bg-dark border border-theme-border-light dark:border-theme-border-dark text-theme-text-primary-light dark:text-theme-text-primary-dark placeholder:text-theme-text-muted-light dark:placeholder:text-theme-text-muted-dark focus:outline-none focus:border-theme-hover-light dark:focus:border-theme-hover-dark transition-colors"
            disabled={loading}
          />
        </div>

        {error && (
          <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading || !email}
          className="w-full py-2.5 px-4 bg-theme-primary hover:bg-theme-hover-light dark:hover:bg-theme-hover-dark text-theme-btn-text text-xs uppercase tracking-[0.15em] font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Saving..." : "Save Cart"}
        </button>

        <p className="text-[10px] text-theme-text-muted-light dark:text-theme-text-muted-dark">
          ✓ No spam, cart reminders only
        </p>
      </form>
    </div>
  );
}
