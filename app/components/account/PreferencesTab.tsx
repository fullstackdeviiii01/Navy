// app/components/account/PreferencesTab.tsx
"use client";

import { useState, useEffect } from "react";
import { Globe, DollarSign, Clock, Save, Info } from "lucide-react";
import { useCurrency } from "../../context/CurrencyContext";

const LOCALES = [
  { code: "en-US", name: "English (US)" },
  { code: "en-GB", name: "English (UK)" },
  { code: "ur-PK", name: "Urdu (Pakistan)" },
  { code: "hi-IN", name: "Hindi (India)" },
  { code: "ar-AE", name: "Arabic (UAE)" },
];

const TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Asia/Karachi",
  "Asia/Dubai",
  "Asia/Kolkata",
];

interface PreferencesTabProps {
  dbUser: any;
  updateUserProfile: (data: any) => Promise<any>;
  refreshUser: () => Promise<void>;
  setError: (error: string) => void;
  setSuccess: (success: string) => void;
  updating: boolean;
  setUpdating: (updating: boolean) => void;
}

export default function PreferencesTab({
  dbUser,
  updateUserProfile,
  refreshUser,
  setError,
  setSuccess,
  updating,
  setUpdating,
}: PreferencesTabProps) {
  const { activeCurrencies, selectedCurrency, setSelectedCurrency, loading: currencyLoading } = useCurrency();
  
  const [preferences, setPreferences] = useState({
    preferred_currency: "PKR",
    preferred_locale: "en-US",
    timezone: "UTC",
  });

  useEffect(() => {
    if (dbUser) {
      setPreferences({
        preferred_currency: dbUser.preferred_currency || selectedCurrency || "PKR",
        preferred_locale: dbUser.preferred_locale || "en-US",
        timezone: dbUser.timezone || "UTC",
      });
    }
  }, [dbUser, selectedCurrency]);

  const handleUpdatePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setError("");
    setSuccess("");

    try {
      if (!activeCurrencies.includes(preferences.preferred_currency)) {
        throw new Error("Selected currency is not available");
      }

      if (preferences.preferred_currency !== selectedCurrency) {
        await setSelectedCurrency(preferences.preferred_currency);
      }

      const result = await updateUserProfile({
        preferred_locale: preferences.preferred_locale,
        timezone: preferences.timezone,
      });

      if (result.success) {
        setSuccess("Preferences updated successfully");
        await refreshUser();
      } else {
        throw new Error(result.error || "Failed to update preferences");
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleCurrencyChange = (newCurrency: string) => {
    setPreferences({
      ...preferences,
      preferred_currency: newCurrency,
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
          Account Settings
        </h2>
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
          Manage your preferences and settings
        </p>
      </div>

      <form onSubmit={handleUpdatePreferences} className="p-4 sm:p-6 space-y-6">
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <DollarSign className="w-4 h-4" />
            Preferred Currency
          </label>
          <select
            value={preferences.preferred_currency}
            onChange={(e) => handleCurrencyChange(e.target.value)}
            disabled={currencyLoading || activeCurrencies.length === 0}
            className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {currencyLoading ? (
              <option>Loading currencies...</option>
            ) : activeCurrencies.length === 0 ? (
              <option>No currencies available</option>
            ) : (
              activeCurrencies.map((currency) => (
                <option key={currency} value={currency}>
                  {currency}
                </option>
              ))
            )}
          </select>
          <p className="mt-1.5 text-xs text-gray-600 dark:text-gray-400">
            Prices will be displayed in this currency
          </p>
          {activeCurrencies.length > 0 && (
            <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
              Available: {activeCurrencies.join(", ")}
            </p>
          )}
        </div>

        {/* <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Globe className="w-4 h-4" />
            Language
          </label>
          <select
            value={preferences.preferred_locale}
            onChange={(e) =>
              setPreferences({ ...preferences, preferred_locale: e.target.value })
            }
            className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {LOCALES.map((locale) => (
              <option key={locale.code} value={locale.code}>
                {locale.name}
              </option>
            ))}
          </select>
          <p className="mt-1.5 text-xs text-gray-600 dark:text-gray-400">
            Choose your preferred language
          </p>
        </div> */}

        {/* <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Clock className="w-4 h-4" />
            Timezone
          </label>
          <select
            value={preferences.timezone}
            onChange={(e) =>
              setPreferences({ ...preferences, timezone: e.target.value })
            }
            className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {TIMEZONES.map((tz) => (
              <option key={tz} value={tz}>
                {tz}
              </option>
            ))}
          </select>
          <p className="mt-1.5 text-xs text-gray-600 dark:text-gray-400">
            All times will be displayed in this timezone
          </p>
        </div> */}

        <div className="flex items-start gap-2 p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Note:</strong> Currency changes will be reflected immediately across the site.
          </p>
        </div>

        <button
          type="submit"
          disabled={updating || currencyLoading}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" />
          {updating ? "Updating..." : "Save Preferences"}
        </button>
      </form>
    </div>
  );
}