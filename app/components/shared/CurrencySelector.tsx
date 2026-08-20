// app/components/shared/CurrencySelector.tsx
"use client";

import { useState } from "react";
import { useCurrency } from "../../context/CurrencyContext";
import { FaGlobe, FaCheck } from "react-icons/fa";

export default function CurrencySelector() {
  const {
    selectedCurrency,
    activeCurrencies,
    setSelectedCurrency,
    lastUpdated,
    loading,
  } = useCurrency();

  const [isOpen, setIsOpen] = useState(false);
  const [changingCurrency, setChangingCurrency] = useState(false);

  const handleCurrencyChange = async (currency: string) => {
    if (currency === selectedCurrency || changingCurrency) return;

    try {
      setChangingCurrency(true);
      await setSelectedCurrency(currency);
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to change currency:", error);
    } finally {
      setChangingCurrency(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2">
        <FaGlobe size={16} className="text-gray-400 animate-pulse" />
        <span className="text-sm text-gray-400">...</span>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-theme-hover-bg-light dark:hover:bg-theme-hover-bg-dark transition-colors"
        disabled={changingCurrency}
      >
        <FaGlobe size={16} />
        <span className="text-sm font-medium">
          {changingCurrency ? "..." : selectedCurrency}
        </span>
      </button>

      {isOpen && (
        <>
          {/* Backdrop to close dropdown */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-48 bg-theme-surface-light dark:bg-theme-surface-dark border border-theme-border-light dark:border-theme-border-dark rounded-lg shadow-lg z-50">
            <div className="py-1">
              {activeCurrencies.length === 0 ? (
                <div className="px-4 py-2 text-sm text-theme-text-muted-light dark:text-theme-text-muted-dark">
                  No currencies available
                </div>
              ) : (
                activeCurrencies.map((currency) => (
                  <button
                    key={currency}
                    onClick={() => handleCurrencyChange(currency)}
                    disabled={changingCurrency}
                    className={`w-full px-4 py-2 text-left hover:bg-theme-hover-bg-light dark:hover:bg-theme-hover-bg-dark transition-colors flex items-center justify-between ${
                      currency === selectedCurrency
                        ? "bg-blue-50 dark:bg-blue-900/20"
                        : ""
                    } ${changingCurrency ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <span className="text-sm font-medium">{currency}</span>
                    {currency === selectedCurrency && (
                      <FaCheck size={14} className="text-green-600 dark:text-green-400" />
                    )}
                  </button>
                ))
              )}
            </div>

            {lastUpdated && (
              <div className="px-4 py-2 text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark border-t border-theme-border-light dark:border-theme-border-dark">
                Updated: {lastUpdated.toLocaleDateString()}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}