// // app/sign-up/page.js
"use client";

import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  sendEmailVerification,
} from "firebase/auth";
import { auth, googleProvider } from "../../lib/firebase/firebaseClient.js";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);
  const router = useRouter();

  const checkBanStatus = async (emailToCheck) => {
    try {
      const response = await fetch("/api/users/check-ban", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailToCheck }),
      });

      if (!response.ok) {
        console.error("Ban check endpoint failed with status:", response.status);
        return true;
      }

      const data = await response.json();
      return data.is_banned === true;
    } catch (err) {
      console.error("Ban check fetch failed:", err);
      return true;
    }
  };

  const handleEmailSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const formName = name;
    const formPhone = phone;

    try {
      // Step 1: Check if user is banned
      const isBanned = await checkBanStatus(email);
      if (isBanned) {
        setError(
          "This email address is not eligible for registration. Please contact support."
        );
        setLoading(false);
        return;
      }

      // Step 2: Tell UserContext to skip its auto-sync on the upcoming
      // onAuthStateChanged trigger — we will handle sync manually here
      sessionStorage.setItem("skipAutoSync", "true");

      // Step 3: Create the Firebase user
      const result = await createUserWithEmailAndPassword(auth, email, password);

      // Step 4: Update Firebase display name
      await updateProfile(result.user, { displayName: formName });
      await result.user.reload();

      // Step 5: Get a fresh token and set the session cookie
      const token = await result.user.getIdToken(true);
      document.cookie = `__session=${token}; path=/; max-age=3600; secure; samesite=strict`;

      // Step 6: Sync the user to MongoDB — retry up to 3 times
      let syncSuccess = false;
      for (let i = 0; i < 3; i++) {
        const syncResponse = await fetch("/api/users/sync", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: formName,
            phone: formPhone,
            isExplicitLogin: true,
          }),
        });

        if (syncResponse.ok || syncResponse.status === 409) {
          syncSuccess = true;
          break;
        }
        await new Promise((resolve) => setTimeout(resolve, 300));
      }

      if (!syncSuccess) {
        throw new Error("Failed to sync user data");
      }

      // ✅ FIX: Remove skipAutoSync ONLY after MongoDB sync is confirmed
      // complete. This is the critical step — by removing the flag here
      // (before navigation), the UserContext on the next page will find
      // no flag and will properly fetch the profile that now exists in DB.
      sessionStorage.removeItem("skipAutoSync");

      // Step 7: Send email verification
      const actionCodeSettings = {
        url: `${window.location.origin}/verify-email`,
        handleCodeInApp: true,
      };
      await sendEmailVerification(result.user, actionCodeSettings);

      // Step 8: Navigate — full page reload so onAuthStateChanged fires
      // fresh on the homepage with a clean sessionStorage state
      window.location.href = "/";
    } catch (error) {
      // Clean up all flags on any error
      sessionStorage.removeItem("isExplicitLogin");
      sessionStorage.removeItem("skipAutoSync");
      console.error("Sign up error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setLoading(true);
    setError("");

    try {
      sessionStorage.setItem("isExplicitLogin", "true");
      const result = await signInWithPopup(auth, googleProvider);
      const userEmail = result.user.email;

      if (userEmail) {
        const isBanned = await checkBanStatus(userEmail);
        if (isBanned) {
          await signOut(auth);
          sessionStorage.removeItem("isExplicitLogin");
          document.cookie =
            "__session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
          setError(
            "This email address is not eligible for registration. Please contact support."
          );
          setLoading(false);
          return;
        }
      }

      router.push("/");
    } catch (error) {
      sessionStorage.removeItem("isExplicitLogin");
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (showVerificationMessage) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
          <div
            className="rounded-full bg-green-100 dark:bg-green-900 p-3 mx-auto mb-4 w-16 h-16 flex items-center justify-center"
            role="img"
            aria-label="Email sent successfully"
          >
            <svg
              className="w-8 h-8 text-green-600 dark:text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              ></path>
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Check Your Email
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            We've sent a verification link to <strong>{email}</strong>. Please
            check your inbox and click the link to verify your account.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => router.push("/")}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Continue to homepage"
              style={{ minHeight: "44px" }}
            >
              Continue to Homepage
            </button>
            <button
              onClick={() => setShowVerificationMessage(false)}
              className="w-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
              aria-label="Back to sign up form"
              style={{ minHeight: "44px" }}
            >
              Back to Sign Up
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Create Account
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Join us and start shopping
          </p>
        </div>

        {error && (
          <div
            className="mb-4 p-4 text-sm text-red-800 dark:text-red-200 rounded-lg bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700"
            role="alert"
            aria-live="polite"
          >
            {error}
          </div>
        )}

        <form
          onSubmit={handleEmailSignUp}
          className="space-y-4"
          aria-label="Sign up form"
        >
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Full Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
              aria-required="true"
              autoComplete="name"
              style={{ minHeight: "44px" }}
            />
          </div>

          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              autoComplete="tel"
              style={{ minHeight: "44px" }}
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
              aria-required="true"
              autoComplete="email"
              style={{ minHeight: "44px" }}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
              aria-required="true"
              minLength="6"
              autoComplete="new-password"
              aria-describedby="password-hint"
              style={{ minHeight: "44px" }}
            />
            <p
              id="password-hint"
              className="mt-1 text-xs text-gray-500 dark:text-gray-400"
            >
              Minimum 6 characters
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            aria-label={
              loading ? "Creating account, please wait" : "Create your account"
            }
            style={{ minHeight: "44px" }}
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <div className="mt-4">
          <div className="relative">
            <div
              className="absolute inset-0 flex items-center"
              aria-hidden="true"
            >
              <div className="w-full border-t border-gray-300 dark:border-gray-600" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                Or
              </span>
            </div>
          </div>

          <button
            onClick={handleGoogleSignUp}
            disabled={loading}
            className="mt-4 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 flex items-center justify-center gap-2"
            aria-label="Continue with Google"
            style={{ minHeight: "44px" }}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{" "}
          <a
            href="/sign-in"
            aria-label="Sign in to your account"
            className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 font-medium"
            style={{
              minHeight: "44px",
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}