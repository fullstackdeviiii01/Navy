// app/sign-up/page.jsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useUser } from "../context/UserContext";

export default function SignUpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useUser();

  const handleEmailSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to create account");
        setLoading(false);
        return;
      }

      // Store token and update context
      await login(data.token, data.user);
      window.location.href = "/";
    } catch (error) {
      setError(error.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-theme-bg-light dark:bg-theme-bg-dark flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-[#E9DFCE] dark:bg-[#48381A] rounded-2xl shadow-xl p-8 border border-theme-border-light dark:border-theme-border-dark">
        <div className="text-center mb-8">
          <p className="text-xs font-semibold tracking-[0.25em] uppercase text-[#A8752B] mb-2">
            JOIN US
          </p>
          <h1 className="text-3xl font-serif font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark">
            Create Account
          </h1>
          <p className="text-theme-text-secondary-light dark:text-theme-text-secondary-dark text-sm mt-2">
            Start your journey with handcrafted sculptural pieces
          </p>
        </div>

        {error && (
          <div
            className="mb-6 p-4 text-sm text-red-700 dark:text-red-300 rounded-xl bg-red-100/70 dark:bg-red-950/60 border border-red-300 dark:border-red-800"
            role="alert"
            aria-live="polite"
          >
            {error}
          </div>
        )}

        <form
          onSubmit={handleEmailSignUp}
          className="space-y-5"
          aria-label="Sign up form"
        >
          <div>
            <label
              htmlFor="name"
              className="block text-xs font-semibold tracking-wider uppercase text-theme-text-primary-light dark:text-theme-text-primary-dark mb-1.5"
            >
              Full Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-[#D5C6B0] dark:border-[#5E4A28] bg-[#F8F3EA] dark:bg-[#342611] text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-[#A8752B] transition-all text-sm"
              required
              aria-required="true"
              autoComplete="name"
              placeholder="Your full name"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-xs font-semibold tracking-wider uppercase text-theme-text-primary-light dark:text-theme-text-primary-dark mb-1.5"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-[#D5C6B0] dark:border-[#5E4A28] bg-[#F8F3EA] dark:bg-[#342611] text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-[#A8752B] transition-all text-sm"
              required
              aria-required="true"
              autoComplete="email"
              placeholder="name@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-xs font-semibold tracking-wider uppercase text-theme-text-primary-light dark:text-theme-text-primary-dark mb-1.5"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-[#D5C6B0] dark:border-[#5E4A28] bg-[#F8F3EA] dark:bg-[#342611] text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-[#A8752B] transition-all text-sm"
              required
              aria-required="true"
              minLength={6}
              autoComplete="new-password"
              placeholder="Minimum 6 characters"
            />
            <p className="mt-1 text-[11px] text-theme-text-muted-light dark:text-theme-text-muted-dark">
              Must be at least 6 characters
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-6 rounded-xl bg-[#241910] hover:bg-[#A8752B] text-white text-xs font-semibold tracking-[0.2em] uppercase transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 active:scale-[0.99]"
            aria-label={
              loading ? "Creating account, please wait" : "Create your account"
            }
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark tracking-wide">
          Already have an account?{" "}
          <Link
            href="/sign-in"
            className="font-semibold text-[#A8752B] hover:underline"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
