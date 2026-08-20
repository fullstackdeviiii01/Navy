// app/context/CurrencyContext.tsx
"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { useUser } from "./UserContext";

interface CurrencyContextType {
  selectedCurrency: string;
  exchangeRates: { [key: string]: number };
  supportedCurrencies: string[];
  activeCurrencies: string[];
  lastUpdated: Date | null;
  loading: boolean;
  setSelectedCurrency: (currency: string) => Promise<void>;
  convertPrice: (price: number, from?: string) => number;
  formatPrice: (price: number, from?: string) => string;
  refreshRates: () => Promise<void>;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(
  undefined
);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const { firebaseUser, dbUser, updateUserProfile } = useUser();
  const [selectedCurrency, setSelectedCurrencyState] = useState<string>("PKR");
  const [exchangeRates, setExchangeRates] = useState<{ [key: string]: number }>(
    {}
  );
  const [supportedCurrencies, setSupportedCurrencies] = useState<string[]>([]);
  const [activeCurrencies, setActiveCurrencies] = useState<string[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Fetch currency settings from API
  const fetchRates = useCallback(async () => {
    try {
      const response = await fetch("/api/currency-settings");
      if (response.ok) {
        const data = await response.json();
        setExchangeRates(data.exchangeRates || {});
        setSupportedCurrencies(data.supportedCurrencies || ["PKR"]);
        setActiveCurrencies(data.supportedCurrencies || ["PKR"]); // Only supported currencies are active
        setLastUpdated(data.lastUpdated ? new Date(data.lastUpdated) : null);
      }
    } catch (error) {
      console.error("Failed to fetch currency rates:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize currency settings
  useEffect(() => {
    fetchRates();
  }, [fetchRates]);

 // Set currency from user preferences once data is loaded
useEffect(() => {
  if (!loading && !initialized && activeCurrencies.length > 0) {
    if (dbUser?.preferred_currency && activeCurrencies.includes(dbUser.preferred_currency)) {
      setSelectedCurrencyState(dbUser.preferred_currency);
    } else if (!activeCurrencies.includes(selectedCurrency)) {
      // If current selected currency is not in active list, reset to PKR or first active
      setSelectedCurrencyState(activeCurrencies.includes("PKR") ? "PKR" : activeCurrencies[0]);
    }
    setInitialized(true);
  }
}, [loading, initialized, dbUser, activeCurrencies, selectedCurrency]);

// Watch for dbUser changes and update currency
useEffect(() => {
  if (dbUser?.preferred_currency && activeCurrencies.includes(dbUser.preferred_currency)) {
    setSelectedCurrencyState(dbUser.preferred_currency);
  }
}, [dbUser?.preferred_currency, activeCurrencies]);
  // Update currency and save to user preferences
  const setSelectedCurrency = useCallback(
    async (currency: string): Promise<void> => {
      // Validate currency is in active list
      if (!activeCurrencies.includes(currency)) {
        console.error(`Currency ${currency} is not in the active currencies list`);
        return;
      }

      // Update local state immediately for responsiveness
      setSelectedCurrencyState(currency);

      // If user is authenticated, save preference to backend
      if (firebaseUser && updateUserProfile) {
        try {
          const result = await updateUserProfile({
            preferred_currency: currency,
          });

          if (!result.success) {
            console.error("Failed to save currency preference:", result.error);
            // Optionally revert on failure
            // setSelectedCurrencyState(dbUser?.preferred_currency || "USD");
          }
        } catch (error) {
          console.error("Error saving currency preference:", error);
        }
      } else {
        // For non-authenticated users, save to localStorage
        try {
          localStorage.setItem("preferred_currency", currency);
        } catch (error) {
          console.error("Failed to save to localStorage:", error);
        }
      }
    },
    [activeCurrencies, firebaseUser, updateUserProfile]
  );

  // Load from localStorage for non-authenticated users
  useEffect(() => {
    if (!firebaseUser && !loading && initialized) {
      try {
        const savedCurrency = localStorage.getItem("preferred_currency");
        if (savedCurrency && activeCurrencies.includes(savedCurrency)) {
          setSelectedCurrencyState(savedCurrency);
        }
      } catch (error) {
        console.error("Failed to load from localStorage:", error);
      }
    }
  }, [firebaseUser, loading, initialized, activeCurrencies]);

  // Convert price from one currency to another
  const convertPrice = useCallback(
    (price: number, from: string = "PKR"): number => {
      if (!price || !exchangeRates || Object.keys(exchangeRates).length === 0) {
        return price;
      }

      if (selectedCurrency === from) {
        return price;
      }

      const fromRate = exchangeRates[from] || 1;
      const toRate = exchangeRates[selectedCurrency] || 1;

      return (price / fromRate) * toRate;
    },
    [selectedCurrency, exchangeRates]
  );

  // Format price with currency symbol
  const formatPrice = useCallback(
    (price: number, from: string = "PKR"): string => {
      const converted = convertPrice(price, from);
      return `${selectedCurrency} ${converted.toFixed(2)}`;
    },
    [selectedCurrency, convertPrice]
  );

  // Refresh rates manually
  const refreshRates = useCallback(async () => {
    setLoading(true);
    await fetchRates();
  }, [fetchRates]);

  const value: CurrencyContextType = {
    selectedCurrency,
    exchangeRates,
    supportedCurrencies,
    activeCurrencies,
    lastUpdated,
    loading,
    setSelectedCurrency,
    convertPrice,
    formatPrice,
    refreshRates,
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within CurrencyProvider");
  }
  return context;
}