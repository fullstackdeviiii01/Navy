// app/components/account/ProfileTab.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Edit2,
  Save,
  X,
  User,
  Phone,
  Mail,
  ShoppingBag,
  DollarSign,
  Calendar,
  Clock,
  Bell,
  Check,
  AlertTriangle,
} from "lucide-react";
interface ProfileTabProps {
  dbUser: any;
  firebaseUser: any;
  updateUserProfile: (data: any) => Promise<any>;
  refreshUser: () => Promise<void>;
  setError: (error: string) => void;
  setSuccess: (success: string) => void;
  updating: boolean;
  setUpdating: (updating: boolean) => void;
}

export default function ProfileTab({
  dbUser,
  firebaseUser,
  updateUserProfile,
  refreshUser,
  setError,
  setSuccess,
  updating,
  setUpdating,
}: ProfileTabProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email_notifications: true,
    marketing_opt_in: false,
  });

  useEffect(() => {
    if (dbUser) {
      setFormData({
        name: dbUser.name || firebaseUser?.displayName || "",
        phone: dbUser.phone || "",
        email_notifications: dbUser.email_notifications ?? true,
        marketing_opt_in: dbUser.marketing_opt_in ?? false,
      });
    }
  }, [dbUser, firebaseUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setError("");
    setSuccess("");

    try {
      const result = await updateUserProfile(formData);
      if (result.success) {
        setIsEditing(false);
        setSuccess("Profile updated successfully");
        await refreshUser();
      } else {
        throw new Error(result.error || "Failed to update profile");
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleResendVerification = async () => {
    setSuccess("Email verification is not required for this account.");
  };

  const stats = [
    {
      icon: ShoppingBag,
      label: "Total Orders",
      value: dbUser?.order_count || 0,
      color: "blue",
    },
    {
      icon: DollarSign,
      label: "Total Spent",
      value: `${dbUser?.preferred_currency || "USD"} ${parseFloat(dbUser?.total_spent || 0).toFixed(2)}`,
      color: "green",
    },
    {
      icon: Calendar,
      label: "Member Since",
      value: dbUser?.created_at
        ? new Date(dbUser.created_at).toLocaleDateString()
        : "N/A",
      color: "purple",
    },
    {
      icon: Clock,
      label: "Last Login",
      value: dbUser?.last_login_at
        ? new Date(dbUser.last_login_at).toLocaleDateString()
        : "N/A",
      color: "orange",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Email Verification Alert */}
      {!firebaseUser?.emailVerified && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex flex-col sm:flex-row sm:items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                Email Not Verified
              </h4>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-3">
                Please verify your email address to access all features.
              </p>
              <button
                onClick={handleResendVerification}
                disabled={updating}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-500 dark:hover:bg-yellow-600 rounded-lg transition-colors disabled:opacity-50"
              >
                <Mail className="w-4 h-4" />
                {updating ? "Sending..." : "Resend Verification Email"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg bg-${stat.color}-50 dark:bg-${stat.color}-900/20`}
                >
                  <Icon
                    className={`w-5 h-5 text-${stat.color}-600 dark:text-${stat.color}-400`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-0.5">
                    {stat.label}
                  </p>
                  <p className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white truncate">
                    {stat.value}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Profile Information */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
            Personal Information
          </h2>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              isEditing
                ? "text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                : "text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
            }`}
          >
            {isEditing ? (
              <>
                <X className="w-4 h-4" />
                <span className="hidden sm:inline">Cancel</span>
              </>
            ) : (
              <>
                <Edit2 className="w-4 h-4" />
                <span className="hidden sm:inline">Edit</span>
              </>
            )}
          </button>
        </div>

        <div className="p-4 sm:p-6">
          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <User className="w-4 h-4" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Phone className="w-4 h-4" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <Bell className="w-4 h-4" />
                  Notification Preferences
                </h3>
                <label className="flex items-start gap-3 p-3 sm:p-4 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.email_notifications}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        email_notifications: e.target.checked,
                      })
                    }
                    className="w-4 h-4 mt-0.5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      Email Notifications
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                      Receive order updates and account information
                    </div>
                  </div>
                </label>
              </div>

              <button
                type="submit"
                disabled={updating}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                {updating ? "Saving..." : "Save Changes"}
              </button>
            </form>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                  <User className="w-4 h-4" />
                  Full Name
                </label>
                <p className="text-sm sm:text-base text-gray-900 dark:text-white">
                  {dbUser?.name || firebaseUser?.displayName || "Not provided"}
                </p>
              </div>
              <div>
                <label className="flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                  <Mail className="w-4 h-4" />
                  Email Address
                </label>
                <p className="text-sm sm:text-base text-gray-900 dark:text-white truncate">
                  {firebaseUser?.email}
                </p>
              </div>
              <div>
                <label className="flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                  <Phone className="w-4 h-4" />
                  Phone Number
                </label>
                <p className="text-sm sm:text-base text-gray-900 dark:text-white">
                  {dbUser?.phone || "Not provided"}
                </p>
              </div>
              <div>
                <label className="flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                  <Bell className="w-4 h-4" />
                  Email Notifications
                </label>
                <div className="flex items-center gap-1.5">
                  {dbUser?.email_notifications ? (
                    <>
                      <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                      <span className="text-sm sm:text-base text-green-600 dark:text-green-400">
                        Enabled
                      </span>
                    </>
                  ) : (
                    <>
                      <X className="w-4 h-4 text-red-600 dark:text-red-400" />
                      <span className="text-sm sm:text-base text-red-600 dark:text-red-400">
                        Disabled
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
