// app/components/newsletter/NewsletterSubscribeForm.tsx
"use client";

import { useState } from "react";
import { newsletterApi } from "../../../lib/api/newsletter";

export default function NewsletterSubscribeForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) return;

    try {
      setLoading(true);
      setMessage(null);

      await newsletterApi.subscribe(email);

      setMessage({
        type: "success",
        text: "Successfully subscribed to newsletter!",
      });
      setEmail("");
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error.message || "Failed to subscribe",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-3"
        aria-label="Newsletter subscription form"
      >
        <input
          type="email"
          aria-label="Email address for newsletter subscription"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email address"
          required
          disabled={loading}
          className="px-4 py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark placeholder:text-theme-text-muted-light dark:placeholder:text-theme-text-muted-dark focus:outline-none focus:ring-2 focus:ring-theme-primary disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-theme-primary hover:opacity-90 text-white px-5 py-2 rounded-lg transition-opacity disabled:opacity-50 font-medium"
        >
          {loading ? "Subscribing..." : "Subscribe"}
        </button>
      </form>

      {message && (
        <div
          role="alert"
          aria-live="polite"
          aria-atomic="true"
          className={`mt-3 p-3 rounded-lg text-sm ${
            message.type === "success"
              ? "bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800"
              : "bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800"
          }`}
        >
          {message.text}
        </div>
      )}
    </div>
  );
}