import { useState, useEffect, useCallback } from 'react';

// Common currencies with symbols
export const CURRENCIES: Record<string, { name: string; symbol: string }> = {
  USD: { name: 'US Dollar', symbol: '$' },
  EUR: { name: 'Euro', symbol: '€' },
  GBP: { name: 'British Pound', symbol: '£' },
  JPY: { name: 'Japanese Yen', symbol: '¥' },
  CAD: { name: 'Canadian Dollar', symbol: 'C$' },
  AUD: { name: 'Australian Dollar', symbol: 'A$' },
  CHF: { name: 'Swiss Franc', symbol: 'Fr' },
  CNY: { name: 'Chinese Yuan', symbol: '¥' },
  INR: { name: 'Indian Rupee', symbol: '₹' },
  MXN: { name: 'Mexican Peso', symbol: '$' },
  SGD: { name: 'Singapore Dollar', symbol: 'S$' },
  HKD: { name: 'Hong Kong Dollar', symbol: 'HK$' },
  NOK: { name: 'Norwegian Krone', symbol: 'kr' },
  SEK: { name: 'Swedish Krona', symbol: 'kr' },
  DKK: { name: 'Danish Krone', symbol: 'kr' },
  NZD: { name: 'New Zealand Dollar', symbol: 'NZ$' },
  ZAR: { name: 'South African Rand', symbol: 'R' },
  BRL: { name: 'Brazilian Real', symbol: 'R$' },
  KRW: { name: 'South Korean Won', symbol: '₩' },
  THB: { name: 'Thai Baht', symbol: '฿' },
  PHP: { name: 'Philippine Peso', symbol: '₱' },
  IDR: { name: 'Indonesian Rupiah', symbol: 'Rp' },
  MYR: { name: 'Malaysian Ringgit', symbol: 'RM' },
  VND: { name: 'Vietnamese Dong', symbol: '₫' },
  AED: { name: 'UAE Dirham', symbol: 'د.إ' },
  TRY: { name: 'Turkish Lira', symbol: '₺' },
  PLN: { name: 'Polish Zloty', symbol: 'zł' },
  CZK: { name: 'Czech Koruna', symbol: 'Kč' },
  HUF: { name: 'Hungarian Forint', symbol: 'Ft' },
};

interface StoredRates {
  base: string;
  rates: Record<string, number>;
  timestamp: number;
}

const CACHE_KEY = 'currency_rates_cache';
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

// Fallback rates (approximate, for offline usage)
const FALLBACK_RATES: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 149.5,
  CAD: 1.36,
  AUD: 1.53,
  CHF: 0.88,
  CNY: 7.24,
  INR: 83.12,
  MXN: 17.15,
  SGD: 1.34,
  HKD: 7.82,
  NOK: 10.65,
  SEK: 10.42,
  DKK: 6.87,
  NZD: 1.64,
  ZAR: 18.65,
  BRL: 4.97,
  KRW: 1315,
  THB: 35.5,
  PHP: 55.8,
  IDR: 15650,
  MYR: 4.72,
  VND: 24500,
  AED: 3.67,
  TRY: 32.1,
  PLN: 3.98,
  CZK: 23.2,
  HUF: 358,
};

export function useCurrencyRates() {
  const [rates, setRates] = useState<Record<string, number>>(FALLBACK_RATES);
  const [baseCurrency, setBaseCurrency] = useState('USD');
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isOfflineRates, setIsOfflineRates] = useState(true);

  // Load cached rates on mount
  useEffect(() => {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        const parsed: StoredRates = JSON.parse(cached);
        const age = Date.now() - parsed.timestamp;
        if (age < CACHE_DURATION) {
          setRates(parsed.rates);
          setBaseCurrency(parsed.base);
          setLastUpdated(new Date(parsed.timestamp));
          setIsOfflineRates(false);
        }
      } catch (e) {
        console.warn('Failed to parse cached rates:', e);
      }
    }
  }, []);

  const fetchRates = useCallback(async (base: string = 'USD') => {
    setIsLoading(true);
    try {
      // Using the free frankfurter.app API (no API key required)
      const response = await fetch(
        `https://api.frankfurter.app/latest?from=${base}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch rates');
      }

      const data = await response.json();
      const newRates = { [base]: 1, ...data.rates };
      
      // Cache the rates
      const toStore: StoredRates = {
        base,
        rates: newRates,
        timestamp: Date.now(),
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(toStore));

      setRates(newRates);
      setBaseCurrency(base);
      setLastUpdated(new Date());
      setIsOfflineRates(false);
    } catch (error) {
      console.warn('Failed to fetch exchange rates, using fallback:', error);
      // Keep using fallback/cached rates
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch rates on mount if cache is stale
  useEffect(() => {
    const cached = localStorage.getItem(CACHE_KEY);
    let shouldFetch = true;
    
    if (cached) {
      try {
        const parsed: StoredRates = JSON.parse(cached);
        const age = Date.now() - parsed.timestamp;
        shouldFetch = age >= CACHE_DURATION;
      } catch (e) {
        // Will fetch
      }
    }
    
    if (shouldFetch) {
      fetchRates();
    }
  }, [fetchRates]);

  const convert = useCallback(
    (amount: number, from: string, to: string): number => {
      if (from === to) return amount;
      
      // Convert to USD first, then to target currency
      const fromRate = rates[from] || 1;
      const toRate = rates[to] || 1;
      
      // If base is USD: fromRate is how many FROM per USD
      // So to convert FROM to USD: amount / fromRate
      // Then to convert USD to TO: (amount / fromRate) * toRate
      const inBase = amount / fromRate;
      return inBase * toRate;
    },
    [rates]
  );

  const getRate = useCallback(
    (from: string, to: string): number => {
      if (from === to) return 1;
      const fromRate = rates[from] || 1;
      const toRate = rates[to] || 1;
      return toRate / fromRate;
    },
    [rates]
  );

  const formatCurrency = useCallback(
    (amount: number, currency: string): string => {
      const info = CURRENCIES[currency];
      const symbol = info?.symbol || currency;
      return `${symbol}${amount.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    },
    []
  );

  return {
    rates,
    baseCurrency,
    isLoading,
    lastUpdated,
    isOfflineRates,
    fetchRates,
    convert,
    getRate,
    formatCurrency,
  };
}
