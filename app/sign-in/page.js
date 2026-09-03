// app/sign-in/page.js
"use client";

import { useState } from "react";
import Link from "next/link";
import { useUser } from "../context/UserContext";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useUser();

  const handleEmailSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to sign in");
        setLoading(false);
        return;
      }

      // Store token and update context
      const profile = await login(data.token, data.user);
      const role = data.user?.role || profile?.role;

      const searchParams = new URLSearchParams(window.location.search);
      const redirectUrl = searchParams.get("redirect");

      if (redirectUrl) {
        window.location.href = redirectUrl;
      } else if (role === "admin") {
        window.location.href = "/admin/dashboard";
      } else {
        window.location.href = "/";
      }
    } catch (error) {
      setError(error.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-theme-bg-light dark:bg-theme-bg-dark flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white dark:bg-[#48381A] rounded-2xl shadow-xl p-8 border border-[#E0D4C3] dark:border-theme-border-dark">
        <div className="text-center mb-8">
          <p className="text-xs font-semibold tracking-[0.25em] uppercase text-[#C59345] mb-2">
            WELCOME BACK
          </p>
          <h1 className="text-3xl font-serif font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark">
            Sign In
          </h1>
          <p className="text-theme-text-secondary-light dark:text-theme-text-secondary-dark text-sm mt-2">
            Access your orders, saved pieces, and profile
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
          onSubmit={handleEmailSignIn}
          className="space-y-5"
          aria-label="Sign in form"
        >
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
              className="w-full px-4 py-3 rounded-xl border border-[#D5C6B0] dark:border-[#5E4A28] bg-white dark:bg-[#342611] text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-[#C59345] transition-all text-sm"
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
              className="w-full px-4 py-3 rounded-xl border border-[#D5C6B0] dark:border-[#5E4A28] bg-white dark:bg-[#342611] text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-[#C59345] transition-all text-sm"
              required
              aria-required="true"
              autoComplete="current-password"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-6 rounded-xl bg-[#C59345] hover:bg-[#A8752B] text-white text-xs font-bold tracking-[0.2em] uppercase transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 active:scale-[0.99] cursor-pointer"
            aria-label={
              loading ? "Signing in, please wait" : "Sign in to your account"
            }
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark tracking-wide">
          Don't have an account?{" "}
          <Link
            href="/sign-up"
            className="font-semibold text-[#A8752B] hover:underline"
          >
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
}
