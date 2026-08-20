// app/verify-email/page.tsx
"use client"

import { useRouter } from "next/navigation"

export default function VerifyEmailPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
        <div className="rounded-full bg-green-100 dark:bg-green-900 p-3 mx-auto mb-4 w-16 h-16 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-green-600 dark:text-green-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Account Ready</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Your account is ready to use. No email verification is required.
        </p>
        <button
          onClick={() => router.push("/")}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Go to Homepage
        </button>
      </div>
    </div>
  )
}
