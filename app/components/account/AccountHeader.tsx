// app/components/account/AccountHeader.tsx
"use client";

import Image from "next/image";
import { LogOut, BadgeCheck, AlertCircle } from "lucide-react";

interface AccountHeaderProps {
  firebaseUser: any;
  dbUser: any;
  onLogout: () => void;
}

export default function AccountHeader({
  firebaseUser,
  dbUser,
  onLogout,
}: AccountHeaderProps) {
  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* User Info */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="relative w-12 h-12 sm:w-16 sm:h-16 flex-shrink-0">
              <Image
                src={
                  firebaseUser.photoURL ||
                  dbUser?.avatar_url ||
                  "https://www.shutterstock.com/image-vector/default-avatar-profile-icon-social-600nw-1906669723.jpg"
                }
                alt={
                  dbUser?.name
                    ? `${dbUser.name}'s profile picture`
                    : "User profile picture"
                }
                fill
                className="rounded-full object-cover ring-2 ring-gray-100 dark:ring-gray-700"
              />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white truncate">
                {dbUser?.name || firebaseUser?.displayName || "User Account"}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                  {firebaseUser?.email}
                </p>
                {firebaseUser?.emailVerified ? (
                  <BadgeCheck className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
                )}
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={onLogout}
            aria-label="Logout from account"
            className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors w-full sm:w-auto"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
}
