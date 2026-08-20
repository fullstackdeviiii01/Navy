// app/(admin)/components/site-settings/CurrencySettings.tsx
"use client";

import { useState, useEffect } from "react";
import { FaSave, FaSync, FaKey, FaGlobe, FaClock } from "react-icons/fa";
import Loader from "../../../components/shared/Loader";

const SUPPORTED_CURRENCIES = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "PKR", name: "Pakistani Rupee", symbol: "₨" },
  { code: "AED", name: "UAE Dirham", symbol: "د.إ" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "INR", name: "Indian Rupee", symbol: "₹" },
  { code: "SAR", name: "Saudi Riyal", symbol: "﷼" },
  { code: "CAD", name: "Canadian Dollar", symbol: "$" },
  { code: "AUD", name: "Australian Dollar", symbol: "$" },
];

export default function CurrencySettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [config, setConfig] = useState({
    supportedCurrencies: ["PKR"],
    apiKey: "",
    apiEnabled: false,
    autoUpdate: false,
    updateFrequency: "daily" as "daily" | "weekly" | "manual",
    exchangeRates: {} as { [key: string]: number },
    lastUpdated: null as Date | null,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/currency-settings", {
        headers: {
          Authorization: `Bearer ${document.cookie.split("__session=")[1]?.split(";")[0]}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setConfig({
          supportedCurrencies: data.supportedCurrencies || ["PKR"],
          apiKey: data.apiKey || "",
          apiEnabled: data.apiEnabled || false,
          autoUpdate: data.autoUpdate || false,
          updateFrequency: data.updateFrequency || "daily",
          exchangeRates: data.exchangeRates || {},
          lastUpdated: data.lastUpdated ? new Date(data.lastUpdated) : null,
        });
      }
    } catch (error) {
      console.error("Failed to fetch currency settings:", error);
      showMessage("error", "Failed to load currency settings");
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const response = await fetch("/api/currency-settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${document.cookie.split("__session=")[1]?.split(";")[0]}`,
        },
        body: JSON.stringify({
          supportedCurrencies: config.supportedCurrencies,
          apiKey: config.apiKey,
          apiEnabled: config.apiEnabled,
          autoUpdate: config.autoUpdate,
          updateFrequency: config.updateFrequency,
        }),
      });

      if (response.ok) {
        showMessage("success", "Currency settings saved successfully");
        fetchSettings();
      } else {
        throw new Error("Failed to save");
      }
    } catch (error) {
      showMessage("error", "Failed to save currency settings");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateRates = async () => {
    if (!config.apiKey) {
      showMessage("error", "Please enter an API key first");
      return;
    }

    try {
      setUpdating(true);

      const response = await fetch("/api/currency-settings/update-rates", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${document.cookie.split("__session=")[1]?.split(";")[0]}`,
        },
      });

      if (response.ok) {
        showMessage("success", "Exchange rates updated successfully");
        fetchSettings();
      } else {
        const data = await response.json();
        throw new Error(data.error || "Failed to update rates");
      }
    } catch (error: any) {
      showMessage("error", error.message || "Failed to update exchange rates");
    } finally {
      setUpdating(false);
    }
  };

  const handleManualRateChange = (currency: string, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > 0) {
      setConfig((prev) => ({
        ...prev,
        exchangeRates: {
          ...prev.exchangeRates,
          [currency]: numValue,
        },
      }));
    }
  };

  const handleSaveManualRates = async () => {
    try {
      setSaving(true);

      const response = await fetch("/api/currency-settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${document.cookie.split("__session=")[1]?.split(";")[0]}`,
        },
        body: JSON.stringify({
          manualRates: config.exchangeRates,
        }),
      });

      if (response.ok) {
        showMessage("success", "Manual exchange rates saved successfully");
        fetchSettings();
      } else {
        throw new Error("Failed to save");
      }
    } catch (error) {
      showMessage("error", "Failed to save manual rates");
    } finally {
      setSaving(false);
    }
  };

  const toggleCurrency = (currencyCode: string) => {
    if (currencyCode === "PKR") return; // Base currency cannot be removed

    setConfig((prev) => ({
      ...prev,
      supportedCurrencies: prev.supportedCurrencies.includes(currencyCode)
        ? prev.supportedCurrencies.filter((c) => c !== currencyCode)
        : [...prev.supportedCurrencies, currencyCode],
    }));
  };

  if (loading) {
    return (
      <div className="relative h-48 sm:h-64">
        <Loader />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-2 sm:p-4">
      {/* Message Banner */}
      {message && (
        <div
          role="status"
          aria-live="polite"
          className={`p-3 sm:p-4 rounded-lg ${
            message.type === "success"
              ? "bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800"
              : "bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* API Configuration */}
      <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg sm:rounded-lg p-3 sm:p-4 md:p-6 border border-theme-border-light dark:border-theme-border-dark">
        <div className="flex items-center gap-2 mb-3 sm:mb-4">
          <FaKey className="text-theme-primary sm:w-5 sm:h-5" size={16}/>
          <h3 className="text-base sm:text-lg font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
            API Configuration
          </h3>
        </div>

        <div className="space-y-3 sm:space-y-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-2">
              ExchangeRate-API Key
            </label>
            <input
              type="text"
              value={config.apiKey}
              onChange={(e) =>
                setConfig((prev) => ({ ...prev, apiKey: e.target.value }))
              }
              placeholder="Enter your API key from exchangerate-api.com"
              className="w-full px-3 sm:px-4 py-1.5 sm:py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-theme-primary text-xs sm:text-sm font-mono"
            />
            <p className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark mt-1">
              Get your free API key from{" "}
              <a
                href="https://www.exchangerate-api.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
                aria-label="Get free API key from ExchangeRate-API (opens in new tab)"
              >
                exchangerate-api.com
              </a>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.apiEnabled}
                onChange={(e) =>
                  setConfig((prev) => ({ ...prev, apiEnabled: e.target.checked }))
                }
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-xs sm:text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
                Enable API
              </span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.autoUpdate}
                onChange={(e) =>
                  setConfig((prev) => ({ ...prev, autoUpdate: e.target.checked }))
                }
                disabled={!config.apiEnabled}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
              />
              <span className="text-xs sm:text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
                Auto Update
              </span>
            </label>

            {config.autoUpdate && (
              <select
                value={config.updateFrequency}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    updateFrequency: e.target.value as "daily" | "weekly" | "manual",
                  }))
                }
                className="px-2 sm:px-3 py-1 border border-theme-border-light dark:border-theme-border-dark rounded bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark text-xs sm:text-sm"
                aria-label="Select auto-update frequency"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <button
              onClick={handleUpdateRates}
              disabled={!config.apiEnabled || !config.apiKey || updating}
              className="flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs sm:text-sm w-full sm:w-auto"
            >
              <FaSync size={14} className={`sm:w-4 sm:h-4 ${updating ? "animate-spin" : ""}`} />
              {updating ? "Updating..." : "Update Rates Now"}
            </button>

            {config.lastUpdated && (
              <span className="text-xs sm:text-sm text-theme-text-muted-light dark:text-theme-text-muted-dark flex items-center gap-1">
                <FaClock size={12} className="sm:w-3.5 sm:h-3.5" />
                Last updated: {config.lastUpdated.toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Supported Currencies */}
      <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg sm:rounded-lg p-3 sm:p-4 md:p-6 border border-theme-border-light dark:border-theme-border-dark">
        <div className="flex items-center gap-2 mb-3 sm:mb-4">
          <FaGlobe className="text-theme-primary sm:w-5 sm:h-5" size={16} />
          <h3 className="text-base sm:text-lg font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
            Supported Currencies
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
          {SUPPORTED_CURRENCIES.map((currency) => (
            <label
              key={currency.code}
              className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-3 border rounded-lg cursor-pointer transition-colors ${
                currency.code === "PKR"
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 cursor-not-allowed"
                  : config.supportedCurrencies.includes(currency.code)
                  ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                  : "border-theme-border-light dark:border-theme-border-dark hover:bg-theme-hover-bg-light dark:hover:bg-theme-hover-bg-dark"
              }`}
            >
              <input
                type="checkbox"
                checked={config.supportedCurrencies.includes(currency.code)}
                onChange={() => toggleCurrency(currency.code)}
                disabled={currency.code === "PKR"}
                className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 sm:gap-2">
                  <span className="text-sm sm:text-base font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark truncate">
                    {currency.code}
                  </span>
                  <span className="text-base sm:text-lg">{currency.symbol}</span>
                </div>
                <p className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark truncate">
                  {currency.name}
                </p>
              </div>
              {currency.code === "PKR" && (
                <span className="text-xs bg-blue-600 text-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded whitespace-nowrap">
                  Base
                </span>
              )}
            </label>
          ))}
        </div>
      </div>

      {/* Exchange Rates */}
      <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg sm:rounded-lg p-3 sm:p-4 md:p-6 border border-theme-border-light dark:border-theme-border-dark">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4 gap-2 sm:gap-4">
          <h3 className="text-base sm:text-lg font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
            Current Exchange Rates
          </h3>
          <button
            onClick={handleSaveManualRates}
            disabled={saving}
            className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors w-full sm:w-auto"
          >
            Save Manual Rates
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {config.supportedCurrencies.map((currency) => (
            <div key={currency} className="space-y-1 sm:space-y-2">
              <label className="block text-xs sm:text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
                1 PKR = ? {currency}
              </label>
              <input
                type="number"
                step="0.01"
                value={config.exchangeRates[currency] || ""}
                onChange={(e) => handleManualRateChange(currency, e.target.value)}
                disabled={currency === "PKR"}
                placeholder={currency === "PKR" ? "1.00" : "Enter rate"}
                className="w-full px-3 sm:px-4 py-1.5 sm:py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-theme-primary text-xs sm:text-sm disabled:opacity-50"
              />
            </div>
          ))}
        </div>

        <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-xs sm:text-sm text-yellow-800 dark:text-yellow-200">
            <strong>Note:</strong> Manual rates will be overwritten when automatic API
            updates run. Disable auto-update if you want to maintain manual rates.
          </p>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-3 sm:pt-4 border-t border-theme-border-light dark:border-theme-border-dark">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors text-xs sm:text-sm w-full sm:w-auto"
        >
          <FaSave size={14} className="sm:w-4 sm:h-4" />
          {saving ? "Saving..." : "Save Configuration"}
        </button>
      </div>
    </div>
  );
}